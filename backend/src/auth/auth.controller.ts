import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
} from "@nestjs/common";
import type { Response, Request } from "express";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Workspace, WorkspaceDocument } from "../schemas/workspace.schema";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectModel(Workspace.name) private workspaceModel: Model<WorkspaceDocument>
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: Record<string, string>,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Headers("user-agent") userAgent: string
  ) {
    const { username, password } = body;
    const clientIp = req.ip || req.socket.remoteAddress || "127.0.0.1";

    const result = await this.authService.login(username, password, clientIp, userAgent);

    // Set secure HttpOnly cookie containing session token
    res.cookie("soliqly_session", result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/",
    });

    return {
      success: true,
      user: result.user,
      workspace: result.workspace,
      role: result.role,
    };
  }

  @Post("demo-login")
  @HttpCode(HttpStatus.OK)
  async demoLogin(
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.demoLogin();

    // Set demo session cookie
    res.cookie("soliqly_session", result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
    });

    return {
      success: true,
      user: result.user,
      workspace: result.workspace,
      role: result.role,
    };
  }

  @Post("logout")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ) {
    await this.authService.logout(req.sessionToken);

    // Clear session cookie
    res.clearCookie("soliqly_session", {
      path: "/",
    });

    return { success: true };
  }

  @Get("me")
  @UseGuards(AuthGuard)
  async me(@Req() req: any) {
    // Fetch real workspace details from database
    let workspace: any = { id: req.workspaceId, name: "Ish maydoni" };
    try {
      const ws: any = await this.workspaceModel.findById(req.workspaceId).lean();
      if (ws) {
        workspace = {
          id: ws._id.toString(),
          name: ws.name || "Ish maydoni",
          tin: ws.tin,
          createdAt: ws.createdAt,
          updatedAt: ws.updatedAt,
        };
      }
    } catch (_) {}

    return {
      user: {
        ...req.user,
        username: req.user?.username || req.user?.pin || "",
        role: req.workspaceRole,
      },
      workspaceId: req.workspaceId,
      role: req.workspaceRole,
      workspace,
    };
  }
}
