import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AppService } from "./app.service";
import { AuthGuard } from "./auth/auth.guard";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("notifications")
  @UseGuards(AuthGuard)
  async getNotifications(@Req() req: any) {
    return this.appService.getNotifications(req.workspaceId);
  }

  @Get("api-activity")
  @UseGuards(AuthGuard)
  async getApiActivity(@Req() req: any) {
    return this.appService.getApiActivity(req.workspaceId);
  }

  @Get("audit-logs")
  @UseGuards(AuthGuard)
  async getAuditLogs(@Req() req: any) {
    return this.appService.getAuditLogs(req.workspaceId);
  }

  @Get("analytics")
  @UseGuards(AuthGuard)
  async getAnalytics(@Req() req: any) {
    return this.appService.getAnalytics(req.workspaceId);
  }

  @Get("organizations")
  @UseGuards(AuthGuard)
  async getOrganizations(@Req() req: any) {
    return this.appService.getOrganizations(req.workspaceId, req.juridical, req.userType);
  }

  @Get("users/me")
  @UseGuards(AuthGuard)
  async getMe(@Req() req: any) {
    return {
      user: req.user,
      workspaceId: req.workspaceId,
      role: req.workspaceRole,
      juridical: req.juridical,
      userType: req.userType,
    };
  }
}
