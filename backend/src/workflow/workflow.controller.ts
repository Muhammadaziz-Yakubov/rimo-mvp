import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
} from "@nestjs/common";
import { WorkflowService } from "./workflow.service";
import { AuthGuard } from "../auth/auth.guard";
import { Request } from "express";

@Controller()
@UseGuards(AuthGuard)
export class WorkflowController {
  constructor(private workflowService: WorkflowService) {}

  @Get("tasks/:id/steps")
  async getTaskSteps(@Param("id") id: string, @Req() req: any) {
    const govTaskId = parseInt(id);
    return this.workflowService.getTaskSteps(govTaskId, req.sessionToken, req.workspaceId);
  }

  @Post("reports/:id/get-draft-task")
  @HttpCode(HttpStatus.OK)
  async getOrCreateDraft(@Param("id") id: string, @Req() req: any) {
    const reportId = parseInt(id);
    return this.workflowService.getOrCreateDraft(reportId, req.sessionToken, req.workspaceId);
  }

  @Post("tasks/:id/save")
  @HttpCode(HttpStatus.OK)
  async saveProgress(
    @Param("id") id: string,
    @Body() body: { formData: Record<string, any> },
    @Req() req: any
  ) {
    const govTaskId = parseInt(id);
    return this.workflowService.saveProgress(govTaskId, body.formData, req.workspaceId);
  }

  @Post("tasks/:id/submit-current-node")
  @HttpCode(HttpStatus.OK)
  async submitCurrentNode(
    @Param("id") id: string,
    @Body() payload: { action_id: number; actions: any[] },
    @Req() req: any,
    @Headers("user-agent") userAgent: string
  ) {
    const govTaskId = parseInt(id);
    const clientIp = req.ip || req.socket.remoteAddress || "127.0.0.1";
    const userFullname = req.user.fullname;

    return this.workflowService.submitCurrentNode(
      govTaskId,
      payload,
      req.sessionToken,
      req.workspaceId,
      clientIp,
      userAgent,
      userFullname,
      req.user.id
    );
  }

  @Post("tasks/:id/submit-all-steps")
  @HttpCode(HttpStatus.OK)
  async submitAllSteps(
    @Param("id") id: string,
    @Body() payload: { nodes: any[] },
    @Req() req: any,
    @Headers("user-agent") userAgent: string
  ) {
    const govTaskId = parseInt(id);
    const clientIp = req.ip || req.socket.remoteAddress || "127.0.0.1";
    const userFullname = req.user.fullname;

    return this.workflowService.submitAllSteps(
      govTaskId,
      payload,
      req.sessionToken,
      req.workspaceId,
      clientIp,
      userAgent,
      userFullname,
      req.user.id
    );
  }

  @Get("tasks/:id/flow")
  async getTaskFlow(@Param("id") id: string, @Req() req: any) {
    const govTaskId = parseInt(id);
    return this.workflowService.getTaskFlow(govTaskId, req.sessionToken, req.workspaceId);
  }
}
