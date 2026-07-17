import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Read session token from cookie (e.g. soliqly_session) or Authorization header
    let sessionToken = request.cookies?.["soliqly_session"];
    
    if (!sessionToken && request.headers.cookie) {
      try {
        const cookies = request.headers.cookie.split(";").reduce((acc, cookie) => {
          const parts = cookie.split("=");
          const key = parts[0]?.trim();
          const value = parts.slice(1).join("=").trim();
          if (key) {
            acc[key] = value ? decodeURIComponent(value) : "";
          }
          return acc;
        }, {} as Record<string, string>);
        sessionToken = cookies["soliqly_session"];
      } catch (e) {
        // Fallback gracefully on parsing error
      }
    }
    
    if (!sessionToken && request.headers.authorization) {
      const parts = request.headers.authorization.split(" ");
      if (parts[0] === "Bearer" && parts[1]) {
        sessionToken = parts[1];
      }
    }

    if (!sessionToken) {
      throw new UnauthorizedException("Session token is missing. Please connect to your government account.");
    }

    // Lookup session in Redis
    const sessionDataStr = await this.redisService.get(`session:${sessionToken}`);
    if (!sessionDataStr) {
      throw new UnauthorizedException("Session is invalid or has expired. Please re-authenticate.");
    }

    try {
      const session = JSON.parse(sessionDataStr);
      
      // Attach auth context to request object
      request.user = session.user;
      request.workspaceId = session.workspaceId;
      request.workspaceRole = session.role;
      request.govAccessToken = session.govAccessToken;
      request.govRefreshToken = session.govRefreshToken;
      request.sessionToken = sessionToken;
      request.juridical = session.juridical || null;
      request.userType = session.userType || "basic";
      
      return true;
    } catch (e) {
      throw new UnauthorizedException("Session context corrupt. Please re-authenticate.");
    }
  }
}
