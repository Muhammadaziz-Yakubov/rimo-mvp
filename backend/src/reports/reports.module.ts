import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ReportsService } from "./reports.service";
import { ReportsController } from "./reports.controller";
import { Task, TaskSchema } from "../schemas/task.schema";
import { TaskLog, TaskLogSchema } from "../schemas/task-log.schema";
import { ReportDraft, ReportDraftSchema } from "../schemas/report-draft.schema";
import { AuditLog, AuditLogSchema } from "../schemas/audit-log.schema";
import { Transaction, TransactionSchema } from "../schemas/transaction.schema";
import { WorkflowModule } from "../workflow/workflow.module";
import { FinancialsModule } from "../financials/financials.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: TaskLog.name, schema: TaskLogSchema },
      { name: ReportDraft.name, schema: ReportDraftSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    WorkflowModule,
    FinancialsModule,
  ],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
