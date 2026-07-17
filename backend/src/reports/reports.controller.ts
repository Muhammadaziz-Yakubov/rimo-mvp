import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
} from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { AuthGuard } from "../auth/auth.guard";

@Controller()
@UseGuards(AuthGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get("tasks")
  async listTasks(@Query("status") status: string, @Req() req: any) {
    return this.reportsService.listTasks(req.workspaceId, status);
  }

  @Post("tasks/sync")
  @HttpCode(HttpStatus.OK)
  async syncTasks(@Req() req: any) {
    return this.reportsService.syncTasks(req.sessionToken, req.workspaceId);
  }

  @Get("tasks/:id")
  async getTask(@Param("id") id: string, @Req() req: any) {
    return this.reportsService.getTask(id, req.workspaceId);
  }

  @Get("reports")
  async getAvailableReports(@Req() req: any) {
    return this.reportsService.getAvailableReportTypes(req.sessionToken, req.workspaceId);
  }

  @Get("integration/authorities")
  async getIntegrationAuthorities(@Req() req: any) {
    return this.reportsService.getIntegrationAuthorities(req.sessionToken, req.workspaceId);
  }

  // ------------------------------------------------------------------------
  // AI REPORT CONTROLLER PIPELINES
  // ------------------------------------------------------------------------

  @Post("reports/ai-generate")
  @HttpCode(HttpStatus.OK)
  async generateAiReport(
    @Body() body: { reportId: number; period: string },
    @Req() req: any
  ) {
    return this.reportsService.generateAiReport(
      req.workspaceId,
      body.reportId,
      body.period,
      req.sessionToken
    );
  }

  @Get("reports/ai-drafts")
  async listAiDrafts(@Req() req: any) {
    return this.reportsService.listAiDrafts(req.workspaceId);
  }

  @Get("reports/ai-drafts/:id")
  async getAiDraft(@Param("id") id: string, @Req() req: any) {
    return this.reportsService.getAiDraft(id, req.workspaceId);
  }

  @Post("reports/ai-drafts/:id/approve")
  @HttpCode(HttpStatus.OK)
  async approveAiDraft(@Param("id") id: string, @Req() req: any) {
    return this.reportsService.approveAiDraft(
      id,
      req.workspaceId,
      req.user.fullname,
      req.user.id
    );
  }

  @Post("reports/ai-drafts/:id/reject")
  @HttpCode(HttpStatus.OK)
  async rejectAiDraft(
    @Param("id") id: string,
    @Body() body: { reason: string },
    @Req() req: any
  ) {
    return this.reportsService.rejectAiDraft(
      id,
      req.workspaceId,
      body.reason,
      req.sessionToken,
      req.user.fullname,
      req.user.id
    );
  }

  @Post("reports/ai-drafts/:id/submit")
  @HttpCode(HttpStatus.OK)
  async submitApprovedReport(
    @Param("id") id: string,
    @Req() req: any,
    @Headers("user-agent") userAgent: string
  ) {
    const clientIp = req.ip || req.socket.remoteAddress || "127.0.0.1";
    return this.reportsService.submitApprovedReport(
      id,
      req.workspaceId,
      req.sessionToken,
      req.user.fullname,
      req.user.id,
      clientIp,
      userAgent
    );
  }
}
