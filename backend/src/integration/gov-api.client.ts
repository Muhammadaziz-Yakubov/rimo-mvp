import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { RedisService } from "../redis/redis.service";
import { ApiLog } from "../schemas/api-log.schema";
import { Authority } from "../schemas/authority.schema";
import { decrypt } from "../utils/crypto";

const GOV_API_BASE = "https://api.hisobot.gov.uz";

@Injectable()
export class GovApiClient {
  private axiosInstance: AxiosInstance;

  constructor(
    @InjectModel(ApiLog.name) private apiLogModel: Model<ApiLog>,
    @InjectModel(Authority.name) private authorityModel: Model<Authority>,
    private redisService: RedisService
  ) {
    this.axiosInstance = axios.create({
      baseURL: GOV_API_BASE,
      timeout: 30000, // 30s timeout
    });
  }

  // Check Circuit Breaker state in Redis
  private async checkCircuitBreaker(): Promise<boolean> {
    const state = await this.redisService.get("circuit_breaker:state") || "closed";
    if (state === "open") {
      const openTime = await this.redisService.get("circuit_breaker:open_time");
      if (openTime && Date.now() - parseInt(openTime) < 30000) {
        // Failing fast if within 30s cooldown
        return false;
      }
      // Cooldown expired, transition to half-open
      await this.redisService.set("circuit_breaker:state", "half-open");
    }
    return true;
  }

  private async reportFailure() {
    const failures = await this.redisService.getClient().incr("circuit_breaker:failures");
    if (failures === 1) {
      await this.redisService.getClient().expire("circuit_breaker:failures", 60);
    }
    if (failures >= 5) {
      await this.redisService.set("circuit_breaker:state", "open");
      await this.redisService.set("circuit_breaker:open_time", Date.now().toString());
      console.warn("Circuit Breaker OPENED for Government API due to 5 consecutive failures.");
    }
  }

  private async reportSuccess() {
    await this.redisService.del("circuit_breaker:failures");
    await this.redisService.set("circuit_breaker:state", "closed");
  }

  // Execute request with token injection, request logging, and auto-refresh lock logic
  async request(
    config: AxiosRequestConfig,
    sessionToken: string,
    workspaceId: string
  ): Promise<any> {
    const isHealthy = await this.checkCircuitBreaker();
    if (!isHealthy) {
      throw new HttpException(
        "Government API is currently unresponsive. System is in fail-fast fallback state.",
        HttpStatus.BAD_GATEWAY
      );
    }

    const sessionKey = `session:${sessionToken}`;
    const sessionStr = await this.redisService.get(sessionKey);
    if (!sessionStr) {
      throw new HttpException("Session expired.", HttpStatus.UNAUTHORIZED);
    }

    let session = JSON.parse(sessionStr);

    const executeRequest = async (token: string) => {
      const start = Date.now();
      const finalHeaders = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };

      try {
        const res = await this.axiosInstance.request({
          ...config,
          headers: finalHeaders,
        });

        const duration = Date.now() - start;
        await this.logApiCall(config, res.status, res.data, duration, workspaceId);
        await this.reportSuccess();
        
        // Unpack standard government API response envelope if present
        const payload = res.data;
        if (payload && typeof payload === "object" && payload.success === true && payload.data !== undefined) {
          return payload.data;
        }
        return payload;
      } catch (err: any) {
        const duration = Date.now() - start;
        const status = err.response ? err.response.status : 0;
        const responseData = err.response ? err.response.data : err.message;
        
        await this.logApiCall(config, status, responseData, duration, workspaceId);
        await this.reportFailure();
        throw err;
      }
    };

    try {
      return await executeRequest(session.govAccessToken);
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        // Attempt token refresh with Redis synchronization lock
        const refreshedToken = await this.acquireRefreshLockAndExecute(sessionToken, session);
        if (refreshedToken) {
          // Retry request with rotated token
          return await executeRequest(refreshedToken);
        }
      }
      
      throw new HttpException(
        error.response?.data?.message || "Government API error occurred.",
        error.response?.status || HttpStatus.BAD_GATEWAY
      );
    }
  }

  // Acquire Redis lock, rotate credentials, save session, return new accessToken
  private async acquireRefreshLockAndExecute(sessionToken: string, session: any): Promise<string | null> {
    const lockKey = `refresh_lock:${sessionToken}`;
    const acquired = await this.redisService.getClient().set(lockKey, "locked", "EX", 10, "NX"); // 10s lease
    
    if (!acquired) {
      // Parallel request failed to get lock, poll and wait for rotated token
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 500));
        const updatedSessionStr = await this.redisService.get(`session:${sessionToken}`);
        if (updatedSessionStr) {
          const updatedSession = JSON.parse(updatedSessionStr);
          if (updatedSession.govAccessToken !== session.govAccessToken) {
            return updatedSession.govAccessToken;
          }
        }
      }
      return null;
    }

    try {
      console.log(`Rotating tokens for session ${sessionToken}`);
      const refreshResponse = await axios.post(`${GOV_API_BASE}/integration/v2/auth/refresh`, {
        refresh_token: session.govRefreshToken,
      });

      const responseData = refreshResponse.data;
      const tokens = responseData?.data || responseData;
      
      // Update session in Redis
      session.govAccessToken = tokens.access_token || tokens.token;
      session.govRefreshToken = tokens.refresh_token;
      
      const ttl = tokens.refresh_expires_in || 2592000;
      await this.redisService.set(`session:${sessionToken}`, JSON.stringify(session), ttl);
      
      return tokens.access_token;
    } catch (refreshError: any) {
      console.error("Token rotation failed:", refreshError.message);
      // Attempt recovery using stored encrypted authority credentials in DB
      return await this.recoverSessionWithStoredCredentials(sessionToken, session);
    } finally {
      await this.redisService.del(lockKey);
    }
  }

  // Recovery flow: Decrypt stored credentials and log in again
  private async recoverSessionWithStoredCredentials(sessionToken: string, session: any): Promise<string | null> {
    try {
      // Find connected authority credentials in workspace
      const authority = await this.authorityModel.findOne({
        workspaceId: session.workspaceId,
        connectionStatus: "connected",
      });

      if (!authority) return null;

      const password = decrypt(authority.encryptedCredentials);
      const username = authority.credentialUsername;

      console.log(`Attempting re-login recovery for workspace ${session.workspaceId}`);
      const loginResponse = await axios.post(`${GOV_API_BASE}/integration/auth/login`, {
        username,
        password,
      });

      const responseData = loginResponse.data;
      const tokens = responseData?.data || responseData;
      
      session.govAccessToken = tokens.access_token || tokens.token;
      session.govRefreshToken = tokens.refresh_token;

      const ttl = tokens.refresh_expires_in || 2592000;
      await this.redisService.set(`session:${sessionToken}`, JSON.stringify(session), ttl);
      
      return tokens.access_token;
    } catch (e) {
      console.error("Re-login recovery flow failed:", e.message);
      return null;
    }
  }

  // MongoDB payload logging helper
  private async logApiCall(
    config: AxiosRequestConfig,
    statusCode: number,
    responsePayload: any,
    duration: number,
    workspaceId: string
  ) {
    try {
      const log = new this.apiLogModel({
        workspaceId,
        method: config.method?.toUpperCase() || "GET",
        endpoint: config.url || "",
        duration,
        statusCode,
        requestHeaders: config.headers,
        requestPayload: config.data ? JSON.stringify(config.data) : "",
        responseHeaders: {},
        responsePayload: typeof responsePayload === "string" ? responsePayload : JSON.stringify(responsePayload),
      });
      await log.save();
    } catch (err) {
      console.error("Failed to write API Log to MongoDB:", err.message);
    }
  }
}
