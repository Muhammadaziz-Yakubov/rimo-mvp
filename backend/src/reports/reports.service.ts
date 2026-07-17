import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Task, TaskDocument } from "../schemas/task.schema";
import { TaskLog, TaskLogDocument } from "../schemas/task-log.schema";
import { ReportDraft, ReportDraftDocument } from "../schemas/report-draft.schema";
import { AuditLog, AuditLogDocument } from "../schemas/audit-log.schema";
import { Transaction, TransactionDocument } from "../schemas/transaction.schema";
import { GovApiClient } from "../integration/gov-api.client";
import { WorkflowService } from "../workflow/workflow.service";
import { GroqService } from "../financials/groq.service";

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(TaskLog.name) private taskLogModel: Model<TaskLogDocument>,
    @InjectModel(ReportDraft.name) private reportDraftModel: Model<ReportDraftDocument>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    private govApiClient: GovApiClient,
    private workflowService: WorkflowService,
    private groqService: GroqService
  ) {}

  // List all filings tasks in this workspace
  async listTasks(workspaceId: string, status?: string) {
    const filter: any = { workspaceId: new Types.ObjectId(workspaceId) };
    if (status) {
      filter.status = status;
    }
    return this.taskModel.find(filter).sort({ updatedAt: -1 }).exec();
  }

  // Get details of a single filing task (handles both MongoDB ObjectId and govTaskId)
  async getTask(id: string, workspaceId: string) {
    const query: any = { workspaceId: new Types.ObjectId(workspaceId) };
    if (/^\d+$/.test(id)) {
      query.govTaskId = parseInt(id);
    } else if (Types.ObjectId.isValid(id)) {
      query._id = new Types.ObjectId(id);
    } else {
      throw new NotFoundException("Invalid task identifier.");
    }

    const task = await this.taskModel.findOne(query).exec();

    if (!task) {
      throw new NotFoundException("Tax report task not found.");
    }

    return task;
  }

  // Pull / Sync list of submissions from Government integration
  async syncTasks(sessionToken: string, workspaceId: string) {
    try {
      const govTasks = await this.govApiClient.request(
        {
          method: "GET",
          url: "/integration/v2/tasks",
        },
        sessionToken,
        workspaceId
      );

      // Upsert tasks in MongoDB
      for (const t of govTasks) {
        await this.taskModel.updateOne(
          { govTaskId: t.id, workspaceId: new Types.ObjectId(workspaceId) },
          {
            reportId: t.report_id,
            reportCode: t.report_code,
            reportVersionId: t.report_version_id,
            reportVersionCode: t.report_version_code,
            status: t.status === "completed" ? "submitted" : t.status,
            title: t.title || { uz: "Soliq hisoboti" },
            shortTitle: t.short_title || { uz: "Hisobot" },
            currentNodeId: t.current_node_id,
            currentNodeCode: t.current_node_code,
            previousNodeId: t.previous_node_id,
            previousNodeCode: t.previous_node_code,
            ownerPin: t.owner_pin,
            ownerTin: t.owner_tin,
            submittedAt: t.submitted_at ? new Date(t.submitted_at) : undefined,
          },
          { upsert: true }
        );
      }

      return this.listTasks(workspaceId);
    } catch (e) {
      console.error("Failed to sync tasks from government:", e.message);
      return this.listTasks(workspaceId);
    }
  }

  // List available report types
  async getAvailableReportTypes(sessionToken: string, workspaceId: string) {
    return this.govApiClient.request(
      {
        method: "GET",
        url: "/integration/v2/reports",
      },
      sessionToken,
      workspaceId
    );
  }

  // List available reporting authorities
  async getIntegrationAuthorities(sessionToken: string, workspaceId: string) {
    return this.govApiClient.request(
      {
        method: "GET",
        url: "/integration/v2/authorities",
      },
      sessionToken,
      workspaceId
    );
  }

  // ------------------------------------------------------------------------
  // AI REPORT WORKFLOW LAYER
  // ------------------------------------------------------------------------

  // Helper to parse period strings into Start/End date bounds
  private parsePeriod(period: string) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (period.startsWith("Q")) {
      const q = parseInt(period[1]);
      const y = parseInt(period.substring(3));
      startDate = new Date(y, (q - 1) * 3, 1);
      endDate = new Date(y, q * 3, 0, 23, 59, 59, 999);
    } else if (period.startsWith("YEAR-")) {
      const y = parseInt(period.substring(5));
      startDate = new Date(y, 0, 1);
      endDate = new Date(y, 12, 0, 23, 59, 59, 999);
    } else if (period.includes("-")) {
      const parts = period.split("-");
      const y = parseInt(parts[0]);
      const m = parseInt(parts[1]) - 1;
      startDate = new Date(y, m, 1);
      endDate = new Date(y, m + 1, 0, 23, 59, 59, 999);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    return { startDate, endDate };
  }

  // Generate Report draft using AI Analysis
  async generateAiReport(workspaceId: string, reportId: number, period: string, sessionToken: string) {
    // 1. Fetch transactions for period
    const { startDate, endDate } = this.parsePeriod(period);
    const transactions = await this.transactionModel.find({
      workspaceId: new Types.ObjectId(workspaceId),
      date: { $gte: startDate, $lte: endDate },
    }).exec();

    // 2. Compute transactions statistics
    let revenue = 0;
    let expenses = 0;
    transactions.forEach((tx) => {
      if (tx.type === "income") {
        revenue += tx.amount;
      } else if (tx.type === "expense") {
        expenses += tx.amount;
      }
    });
    const estimatedTax = revenue > 1000000000
      ? (revenue * 0.12) + (Math.max(0, revenue - expenses) * 0.15) // General: QQS 12% + Profit 15%
      : revenue * 0.04; // Turnover: 4%
    const stats = { revenue, expenses, estimatedTax };

    // 3. Get or create gov draft task to retrieve nodes/fields layout
    const govTask = await this.workflowService.getOrCreateDraft(reportId, sessionToken, workspaceId);
    const stepsData = await this.workflowService.getTaskSteps(govTask.govTaskId, sessionToken, workspaceId);

    // Extract dynamic form fields definitions
    const fields: any[] = [];
    const reportType = govTask.title?.uz || "Soliq hisoboti";
    if (stepsData && Array.isArray(stepsData.nodes)) {
      stepsData.nodes.forEach((node: any) => {
        if (node.actions) {
          node.actions.forEach((act: any) => {
            if (act.fields) {
              act.fields.forEach((f: any) => {
                fields.push(f);
              });
            }
          });
        }
      });
    }

    // 4. Run GROQ analysis
    const aiResults = await this.groqService.generateReportData(
      reportType,
      period,
      stats,
      transactions,
      fields
    );

    // 5. Save/Update ReportDraft
    let draft = await this.reportDraftModel.findOne({
      workspaceId: new Types.ObjectId(workspaceId),
      reportId,
      period,
    });

    if (!draft) {
      draft = new this.reportDraftModel({
        workspaceId: new Types.ObjectId(workspaceId),
        reportId,
        reportType,
        period,
        govTaskId: govTask.govTaskId,
      });
    }

    draft.data = aiResults.data;
    draft.confidenceScore = aiResults.confidenceScore;
    draft.explanations = aiResults.explanations;
    draft.status = "draft";
    draft.history.push({
      action: "generated",
      comment: "AI report prepared successfully from transactions.",
      userFullname: "Rimo AI",
      timestamp: new Date(),
    });

    await draft.save();
    return draft;
  }

  // Get details of a single AI report draft
  async getAiDraft(id: string, workspaceId: string) {
    const draft = await this.reportDraftModel.findOne({
      _id: new Types.ObjectId(id),
      workspaceId: new Types.ObjectId(workspaceId),
    }).exec();

    if (!draft) {
      throw new NotFoundException("AI hisobot loyihasi topilmadi.");
    }
    return draft;
  }

  // List AI generated drafts
  async listAiDrafts(workspaceId: string) {
    return this.reportDraftModel.find({
      workspaceId: new Types.ObjectId(workspaceId),
    }).sort({ updatedAt: -1 }).exec();
  }

  // Approve AI report draft
  async approveAiDraft(id: string, workspaceId: string, userFullname: string, userId: string) {
    const draft = await this.getAiDraft(id, workspaceId);
    draft.status = "approved";
    draft.history.push({
      action: "approved",
      comment: "Approved by user.",
      userFullname,
      timestamp: new Date(),
    });
    await draft.save();

    // Log audit
    const auditLog = new this.auditLogModel({
      workspaceId: new Types.ObjectId(workspaceId),
      userId: new Types.ObjectId(userId),
      action: "report_approved",
      details: { draftId: draft._id, reportType: draft.reportType, period: draft.period },
      timestamp: new Date(),
    });
    await auditLog.save();

    return draft;
  }

  // Reject AI draft and trigger Correction Loop
  async rejectAiDraft(
    id: string,
    workspaceId: string,
    reason: string,
    sessionToken: string,
    userFullname: string,
    userId: string
  ) {
    const draft = await this.getAiDraft(id, workspaceId);
    draft.status = "rejected";
    draft.rejectionReason = reason;
    draft.history.push({
      action: "rejected",
      comment: reason,
      userFullname,
      timestamp: new Date(),
    });
    await draft.save();

    // Log rejection audit
    const rejectAudit = new this.auditLogModel({
      workspaceId: new Types.ObjectId(workspaceId),
      userId: new Types.ObjectId(userId),
      action: "report_rejected",
      details: { draftId: draft._id, reason },
      timestamp: new Date(),
    });
    await rejectAudit.save();

    // CORRECTION LOOP PIPELINE
    // 1. Fetch transactions context
    const { startDate, endDate } = this.parsePeriod(draft.period);
    const transactions = await this.transactionModel.find({
      workspaceId: new Types.ObjectId(workspaceId),
      date: { $gte: startDate, $lte: endDate },
    }).exec();

    // 2. Fetch government steps structure to get dynamic layout fields
    const stepsData = await this.workflowService.getTaskSteps(draft.govTaskId, sessionToken, workspaceId);
    const fields: any[] = [];
    if (stepsData && Array.isArray(stepsData.nodes)) {
      stepsData.nodes.forEach((node: any) => {
        if (node.actions) {
          node.actions.forEach((act: any) => {
            if (act.fields) {
              act.fields.forEach((f: any) => {
                fields.push(f);
              });
            }
          });
        }
      });
    }

    // 3. Compute stats
    let revenue = 0;
    let expenses = 0;
    transactions.forEach((tx) => {
      if (tx.type === "income") {
        revenue += tx.amount;
      } else if (tx.type === "expense") {
        expenses += tx.amount;
      }
    });
    const estimatedTax = revenue > 1000000000 ? (revenue * 0.12) + (Math.max(0, revenue - expenses) * 0.15) : revenue * 0.04;
    const stats = { revenue, expenses, estimatedTax };

    // 4. Run Correction prompt via GROQ
    const correctedResults = await this.groqService.correctReportData(
      draft.reportType,
      draft.period,
      draft.data,
      draft.explanations,
      reason,
      stats,
      transactions,
      fields
    );

    // 5. Update draft with corrected values and reset status to draft
    draft.data = correctedResults.data;
    draft.confidenceScore = correctedResults.confidenceScore;
    draft.explanations = correctedResults.explanations;
    draft.status = "draft";
    draft.history.push({
      action: "corrected",
      comment: "AI correction values regenerated successfully.",
      userFullname: "Rimo AI",
      timestamp: new Date(),
    });

    await draft.save();

    // Log correction audit
    const correctAudit = new this.auditLogModel({
      workspaceId: new Types.ObjectId(workspaceId),
      userId: new Types.ObjectId(userId),
      action: "report_corrected_by_ai",
      details: { draftId: draft._id },
      timestamp: new Date(),
    });
    await correctAudit.save();

    return draft;
  }

  // Submit approved draft directly to government integration
  async submitApprovedReport(
    id: string,
    workspaceId: string,
    sessionToken: string,
    userFullname: string,
    userId: string,
    clientIp: string,
    userAgent: string
  ) {
    const draft = await this.getAiDraft(id, workspaceId);
    if (draft.status !== "approved") {
      throw new BadRequestException("Hisobot tasdiqlanmagan. Yuborishdan oldin tasdiqlang.");
    }

    // 1. Fetch nodes data layout
    const stepsData = await this.workflowService.getTaskSteps(draft.govTaskId, sessionToken, workspaceId);
    if (!stepsData || !Array.isArray(stepsData.nodes)) {
      throw new BadRequestException("Hukumat formalar shakli yuklanmadi.");
    }

    // 2. Populate nodes structure with AI generated values
    const nodes = stepsData.nodes.map((node: any) => {
      const actions = (node.actions || []).map((action: any) => {
        const fields = (action.fields || []).map((field: any) => {
          // If AI filled this field code, overwrite value
          if (draft.data && draft.data[field.code] !== undefined) {
            field.value = draft.data[field.code];
          }
          return field;
        });
        return {
          ...action,
          fields,
        };
      });
      return {
        ...node,
        actions,
      };
    });

    // 3. Dispatch to submitAllSteps pipeline
    await this.workflowService.submitAllSteps(
      draft.govTaskId,
      { nodes },
      sessionToken,
      workspaceId,
      clientIp,
      userAgent,
      userFullname,
      userId
    );

    // 4. Set draft as submitted
    draft.status = "submitted";
    draft.history.push({
      action: "submitted",
      comment: "Submitted successfully to Government API.",
      userFullname,
      timestamp: new Date(),
    });
    await draft.save();

    return { success: true, govTaskId: draft.govTaskId };
  }
}
