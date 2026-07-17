import { Injectable, UnauthorizedException, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import axios from "axios";
import * as crypto from "crypto";

import { User, UserDocument } from "../schemas/user.schema";
import { Workspace, WorkspaceDocument } from "../schemas/workspace.schema";
import { WorkspaceMember, WorkspaceMemberDocument } from "../schemas/workspace-member.schema";
import { Authority, AuthorityDocument } from "../schemas/authority.schema";
import { Notification, NotificationDocument } from "../schemas/notification.schema";
import { AuditLog, AuditLogDocument } from "../schemas/audit-log.schema";
import { RedisService } from "../redis/redis.service";
import { encrypt } from "../utils/crypto";

const GOV_API_BASE = "https://api.hisobot.gov.uz";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Workspace.name) private workspaceModel: Model<WorkspaceDocument>,
    @InjectModel(WorkspaceMember.name) private memberModel: Model<WorkspaceMemberDocument>,
    @InjectModel(Authority.name) private authorityModel: Model<AuthorityDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
    private redisService: RedisService
  ) {}

  async login(username: string, password: string, clientIp: string, userAgent: string) {
    try {
      // 4. Temporary debugging:
      console.log(`[DEBUG AUTH] Login request received. Username: "${username || 'undefined'}" (Length: ${username?.length || 0})`);
      console.log(`[DEBUG AUTH] Password length: ${password ? password.length : 0}`);

      // 1. Authenticate with official government API
      let response;
      try {
        response = await axios.post(`${GOV_API_BASE}/integration/auth/login`, {
          username,
          password,
        });
      } catch (postError: any) {
        console.error("[DEBUG AUTH] Government API Login request failed.");
        if (postError.response) {
          console.error(`[DEBUG AUTH] Response status: ${postError.response.status}`);
          console.error(`[DEBUG AUTH] Response data:`, JSON.stringify(postError.response.data));
          
          throw new UnauthorizedException({
            success: false,
            message: "Government API authentication failed",
            reason: postError.response.data?.message || "Invalid integration credentials"
          });
        }
        console.error(`[DEBUG AUTH] Connection error: ${postError.message}`);
        throw new UnauthorizedException({
          success: false,
          message: "Government API authentication failed",
          reason: `Could not connect to government portal: ${postError.message}`
        });
      }

      const tokens = response.data; // access_token, refresh_token, etc.

      // 1. Log login response keys and details (without logging full sensitive tokens)
      console.log("[DEBUG AUTH] Government Login Response Keys:", Object.keys(tokens || {}));
      console.log("[DEBUG AUTH] Government Login Response typeof:", typeof tokens);

      // Try multiple possible token keys:
      let accessToken = tokens?.access_token || tokens?.token || tokens?.jwt || tokens?.data?.access_token;
      
      // If the response is wrapped inside a data/resource property
      if (!accessToken && tokens?.data) {
        accessToken = tokens.data.access_token || tokens.data.token || tokens.data.jwt;
      }

      // Log metadata of the extracted token safely:
      console.log("[DEBUG AUTH] Token Metadata:");
      console.log(`  - Exists: ${!!accessToken}`);
      console.log(`  - Type: ${typeof accessToken}`);
      if (accessToken && typeof accessToken === "string") {
        console.log(`  - Length: ${accessToken.length}`);
        console.log(`  - First 10 chars: "${accessToken.substring(0, 10)}"`);
        console.log(`  - JWT segments: ${accessToken.split(".").length}`);
      }

      // 5. Add token presence and segment validation
      if (!accessToken) {
        throw new UnauthorizedException({
          success: false,
          message: "Government API identity check failed",
          reason: "Access token is missing from the government login response"
        });
      }

      if (typeof accessToken !== "string") {
        throw new UnauthorizedException({
          success: false,
          message: "Government API identity check failed",
          reason: "Access token returned by government login is not a string type"
        });
      }

      if (accessToken.split(".").length !== 3) {
        throw new UnauthorizedException({
          success: false,
          message: "Government API identity check failed",
          reason: `Invalid JWT format. Token contains ${accessToken.split(".").length} segments, expected 3.`
        });
      }

      // 2. Fetch authenticated identity details from /integration/v2/users/me
      let meResponse;
      try {
        meResponse = await axios.get(`${GOV_API_BASE}/integration/v2/users/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (meError: any) {
        console.error("[DEBUG AUTH] Fetching identity details failed.");
        if (meError.response) {
          console.error(`[DEBUG AUTH] Response status: ${meError.response.status}`);
          console.error(`[DEBUG AUTH] Response data:`, JSON.stringify(meError.response.data));
          
          throw new UnauthorizedException({
            success: false,
            message: "Government API identity check failed",
            reason: meError.response.data?.message || "Unable to fetch identity info"
          });
        }
        console.error(`[DEBUG AUTH] Connection error: ${meError.message}`);
        throw new UnauthorizedException({
          success: false,
          message: "Government API identity check failed",
          reason: `Could not fetch identity context: ${meError.message}`
        });
      }

      // Safe response logging
      console.log(`[DEBUG AUTH] /users/me Response status: ${meResponse.status}`);
      console.log("[DEBUG AUTH] /users/me Response root keys:", Object.keys(meResponse.data || {}));

      // Extract meData from the envelope or use it directly
      const meData = meResponse.data?.data || meResponse.data;
      
      console.log("[DEBUG AUTH] /users/me Unpacked data keys:", Object.keys(meData || {}));

      const govUser = meData?.user;
      if (!govUser) {
        throw new UnauthorizedException({
          success: false,
          message: "Government API identity check failed",
          reason: "User identity block is missing from the government response payload"
        });
      }

      const govProfile = govUser.profile;
      if (!govProfile) {
        throw new UnauthorizedException({
          success: false,
          message: "Government API identity check failed",
          reason: "User profile block is missing from the government user details payload"
        });
      }

      // 3. Upsert User in MongoDB by PIN
      let user = await this.userModel.findOne({ pin: govUser.pin });
      if (!user) {
        user = new this.userModel({
          pin: govUser.pin,
          fullname: govProfile.fullname,
          firstname: govProfile.firstname,
          surname: govProfile.surname,
          middlename: govProfile.middlename || "",
          username,
          passport: govProfile.passport,
          profileData: govProfile,
        });
        await user.save();
      } else {
        user.fullname = govProfile.fullname;
        user.firstname = govProfile.firstname;
        user.surname = govProfile.surname;
        user.middlename = govProfile.middlename || "";
        user.profileData = govProfile;
        await user.save();
      }

      // 4. Load or create default Workspace
      let membership = await this.memberModel.findOne({ userId: user._id });
      let workspace: WorkspaceDocument | null = null;
      let role = "Admin";

      if (!membership) {
        // Create default workspace
        const workspaceName = meData.juridical?.name 
          ? `${meData.juridical.name} Workspace`
          : `${govProfile.fullname}'s Workspace`;

        workspace = new this.workspaceModel({
          name: workspaceName,
          ownerId: user._id,
        });
        await workspace.save();

        // Create membership
        membership = new this.memberModel({
          workspaceId: workspace._id,
          userId: user._id,
          role: "Admin",
        });
        await membership.save();

        // Create initial workspace notification in MongoDB
        const initialNotification = new this.notificationModel({
          workspaceId: workspace._id,
          type: "token_expired",
          title: "Tashkilot ulandi",
          message: `${workspaceName} portali integratsiyasi muvaffaqiyatli bog'landi va ma'lumotlar sinxronizatsiya qilindi.`,
          read: false,
        });
        await initialNotification.save();

        // Create initial audit log in MongoDB
        const initialAuditLog = new this.auditLogModel({
          workspaceId: workspace._id,
          userId: user._id,
          action: "workspace_created",
          details: { name: workspaceName, tin: meData.juridical?.tin },
          userIp: clientIp,
          userAgent,
        });
        await initialAuditLog.save();
      } else {
        workspace = await this.workspaceModel.findById(membership.workspaceId);
        role = membership.role;
      }

      if (!workspace) {
        throw new UnauthorizedException("Workspace context not found.");
      }

      // 5. Store / Encrypt government credentials under this workspace
      // Every user connection registers their active Authority STIR
      if (meData.juridical) {
        const encryptedPass = encrypt(password);
        await this.authorityModel.findOneAndUpdate(
          { workspaceId: workspace._id, tin: meData.juridical.tin },
          {
            code: meData.authority?.code || "HISOBOT",
            title: meData.authority?.title || { uz: meData.juridical.name, ru: meData.juridical.name },
            connectionStatus: "connected",
            encryptedCredentials: encryptedPass,
            credentialUsername: username,
            lastSyncAt: new Date(),
          },
          { upsert: true, new: true }
        );
      }

      // 6. Generate secure session key
      const sessionToken = crypto.randomBytes(32).toString("hex");

      // 7. Store session payload in Redis cache
      const sessionData = {
        user: {
          id: user._id,
          pin: user.pin,
          fullname: user.fullname,
          username: user.username,
        },
        workspaceId: workspace._id.toString(),
        role,
        govAccessToken: accessToken,
        govRefreshToken: tokens.refresh_token || tokens.data?.refresh_token || tokens.refreshToken || "",
        // Store juridical org data for the Organizations page
        juridical: meData.juridical
          ? {
              name: meData.juridical.name || "",
              tin: meData.juridical.tin || null,
              uuid: meData.juridical.uuid || "",
            }
          : null,
        userType: meData.credential?.user_type || "basic",
      };

      // Session TTL is set to refresh token expiry or default to 30 days
      const ttl = tokens?.refresh_expires_in || 2592000;
      await this.redisService.set(`session:${sessionToken}`, JSON.stringify(sessionData), ttl);

      // Create login audit log
      const loginAuditLog = new this.auditLogModel({
        workspaceId: workspace._id,
        userId: user._id,
        action: "login",
        details: { username },
        userIp: clientIp,
        userAgent,
      });
      await loginAuditLog.save();

      return {
        sessionToken,
        user: sessionData.user,
        workspace: {
          id: workspace._id.toString(),
          name: workspace.name,
        },
        role,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error("[DEBUG AUTH] Login service failure:", error);
      throw new InternalServerErrorException({
        success: false,
        message: "Authentication service failed. Please try again.",
        reason: error instanceof Error ? error.message : "Internal auth logic error"
      });
    }
  }

  async demoLogin() {
    // Generate a demo session without calling government API
    const sessionToken = crypto.randomBytes(32).toString("hex");

    const demoSessionData = {
      user: {
        id: "65df3e481b7a2d3e4b789012",
        pin: "00000000000000",
        fullname: "Demo Foydalanuvchi",
        username: "demo_user",
      },
      workspaceId: "65df3e481b7a2d3e4b789013",
      role: "Admin",
      govAccessToken: "demo-token",
      govRefreshToken: "demo-refresh-token",
      juridical: {
        name: "Demo MChJ",
        tin: 123456789,
        uuid: "demo-uuid-000",
      },
      userType: "juridical",
      isDemo: true,
    };

    // Store demo session for 24 hours
    await this.redisService.set(`session:${sessionToken}`, JSON.stringify(demoSessionData), 86400);

    return {
      sessionToken,
      user: demoSessionData.user,
      workspace: {
        id: demoSessionData.workspaceId,
        name: "Demo Ish Maydoni",
      },
      role: "Admin",
    };
  }

  async logout(sessionToken: string) {
    if (sessionToken) {
      await this.redisService.del(`session:${sessionToken}`);
    }
    return { success: true };
  }

  async getSession(sessionToken: string) {
    const data = await this.redisService.get(`session:${sessionToken}`);
    if (!data) return null;
    return JSON.parse(data);
  }
}
