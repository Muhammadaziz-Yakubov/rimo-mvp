import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { WorkflowService } from "./workflow.service";
import { WorkflowController } from "./workflow.controller";
import { Task, TaskSchema } from "../schemas/task.schema";
import { TaskLog, TaskLogSchema } from "../schemas/task-log.schema";
import { Authority, AuthoritySchema } from "../schemas/authority.schema";

import { Notification, NotificationSchema } from "../schemas/notification.schema";
import { AuditLog, AuditLogSchema } from "../schemas/audit-log.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: TaskLog.name, schema: TaskLogSchema },
      { name: Authority.name, schema: AuthoritySchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  providers: [WorkflowService],
  controllers: [WorkflowController],
  exports: [WorkflowService],
})
export class WorkflowModule {}
