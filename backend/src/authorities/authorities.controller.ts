import { Controller, Get, Post, Param, Req, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { AuthoritiesService } from "./authorities.service";
import { AuthGuard } from "../auth/auth.guard";

@Controller("authorities")
@UseGuards(AuthGuard)
export class AuthoritiesController {
  constructor(private authoritiesService: AuthoritiesService) {}

  @Get()
  async list(@Req() req: any) {
    return this.authoritiesService.list(req.workspaceId);
  }

  @Get(":id")
  async getDetails(@Param("id") id: string, @Req() req: any) {
    return this.authoritiesService.getDetails(id, req.workspaceId);
  }

  @Post(":id/sync")
  @HttpCode(HttpStatus.OK)
  async sync(@Param("id") id: string, @Req() req: any) {
    return this.authoritiesService.sync(id, req.sessionToken, req.workspaceId);
  }
}
