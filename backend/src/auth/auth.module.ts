import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { User, UserSchema } from "../schemas/user.schema";
import { Workspace, WorkspaceSchema } from "../schemas/workspace.schema";
import { WorkspaceMember, WorkspaceMemberSchema } from "../schemas/workspace-member.schema";
import { Authority, AuthoritySchema } from "../schemas/authority.schema";

import { Notification, NotificationSchema } from "../schemas/notification.schema";
import { AuditLog, AuditLogSchema } from "../schemas/audit-log.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: WorkspaceMember.name, schema: WorkspaceMemberSchema },
      { name: Authority.name, schema: AuthoritySchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
