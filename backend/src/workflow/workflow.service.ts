import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { GovApiClient } from "../integration/gov-api.client";
import { Task, TaskDocument } from "../schemas/task.schema";
import { TaskLog, TaskLogDocument } from "../schemas/task-log.schema";
import { Authority, AuthorityDocument } from "../schemas/authority.schema";
import { Notification, NotificationDocument } from "../schemas/notification.schema";
import { AuditLog, AuditLogDocument } from "../schemas/audit-log.schema";

@Injectable()
export class WorkflowService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(TaskLog.name) private taskLogModel: Model<TaskLogDocument>,
    @InjectModel(Authority.name) private authorityModel: Model<AuthorityDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
    private govApiClient: GovApiClient
  ) {}

  // 1. Get or Create Draft Task on the government API
  async getOrCreateDraft(reportId: number, sessionToken: string, workspaceId: string) {
    try {
      const data = await this.govApiClient.request(
        {
          method: "GET",
          url: `/integration/v2/reports/${reportId}/get-draft-task`,
        },
        sessionToken,
        workspaceId
      );

      // Save/update Task status in MongoDB
      // Use Types.ObjectId for workspaceId to match the schema field type
      let authority = await this.authorityModel.findOne({
        workspaceId: new Types.ObjectId(workspaceId),
        tin: data.owner_tin,
      });

      if (!authority) {
        // Fallback: loose TIN comparison (handles number vs string mismatch)
        const allAuthorities = await this.authorityModel.find({
          workspaceId: new Types.ObjectId(workspaceId),
        });
        // eslint-disable-next-line eqeqeq
        authority = allAuthorities.find((a) => a.tin == data.owner_tin) || null;
      }

      if (!authority) {
        throw new HttpException(
          "Authority context not connected in Soliqly. Please sync your connected authority in Settings first.",
          HttpStatus.BAD_REQUEST
        );
      }

      let task = await this.taskModel.findOne({ govTaskId: data.id });
      if (!task) {
        task = new this.taskModel({
          govTaskId: data.id,
          workspaceId,
          authorityId: authority._id,
          reportId: data.report_id,
          reportCode: data.report_code,
          reportVersionId: data.report_version_id,
          reportVersionCode: data.report_version_code,
          status: "draft",
          title: data.title || { uz: "Yangi hisobot", ru: "Новый отчет" },
          shortTitle: data.short_title || { uz: "Yangi hisobot", ru: "Новый отчет" },
          currentNodeId: data.current_node_id,
          currentNodeCode: data.current_node_code,
          previousNodeId: data.previous_node_id,
          previousNodeCode: data.previous_node_code,
          ownerPin: data.owner_pin,
          ownerTin: data.owner_tin,
          formData: {},
        });
        await task.save();
      } else {
        task.currentNodeId = data.current_node_id;
        task.currentNodeCode = data.current_node_code;
        await task.save();
      }

      return task;
    } catch (e) {
      console.error("Failed to initialize draft task on gov server:", e.message);
      throw e;
    }
  }

  // 2. Fetch steps from government API and transform into Soliqly unified dynamic form schema
  async getTaskSteps(govTaskId: number, sessionToken: string, workspaceId: string) {
    try {
      const data = await this.govApiClient.request(
        {
          method: "GET",
          url: `/integration/v2/tasks/${govTaskId}/all-steps`,
        },
        sessionToken,
        workspaceId
      );

      // Transform raw government schemas (nodes, actions, fields) to clean layout fields
      const nodes = data.nodes || [];
      const transformedNodes = nodes.map((node: any) => {
        const actions = node.actions || [];
        const transformedActions = actions.map((action: any) => {
          const fields = action.fields || [];
          const transformedFields = fields.map((field: any) => {
            // Parse options config
            let parsedOptions = [];
            if (field.options) {
              try {
                parsedOptions = JSON.parse(field.options);
              } catch (e) {
                // fall back to raw or split strings
                if (typeof field.options === "string") {
                  parsedOptions = field.options.split(",").map((o: string) => ({ label: o.trim(), value: o.trim() }));
                }
              }
            }

            // Parse validation rules
            let validationRules: any = null;
            if (field.rules) {
              try {
                validationRules = JSON.parse(field.rules);
              } catch (e) {
                validationRules = { raw: field.rules };
              }
            }

            return {
              id: field.id,
              code: field.code,
              type: field.type, // Label, InputString, Select, DatePicker, VerifyWithEds, etc.
              title: field.title,
              placeholder: field.placeholder,
              defaultValue: field.default_value,
              value: field.value || "",
              isRequired: !!field.is_required,
              isDisabled: !!field.is_disabled,
              isHidden: !!field.is_hidden,
              colspan: field.colspan || 12,
              rowspan: field.rowspan || 1,
              coordinateX: field.coordinate_x,
              coordinateY: field.coordinate_y,
              options: parsedOptions,
              rules: validationRules,
              taxonomyCode: field.taxonomy_code,
              taxonomyData: field.taxonomy_data,
            };
          });

          return {
            id: action.id,
            code: action.code,
            type: action.type, // action, form, table, repeatable_table
            order: action.order,
            title: action.title,
            shortTitle: action.short_title,
            fields: transformedFields,
          };
        });

        return {
          id: node.id,
          code: node.code,
          title: node.title,
          shortTitle: node.short_title,
          actions: transformedActions,
          groupNumber: node.group_number,
          order: node.order,
          type: node.type,
        };
      });

      // Cache dynamic steps inside Task document in MongoDB for offline access/circuit breaker fallback
      await this.taskModel.updateOne({ govTaskId }, { nodesData: transformedNodes });

      return {
        govTaskId,
        nodes: transformedNodes,
      };
    } catch (e) {
      console.error("Failed to load and transform workflow steps:", e.message);
      // Fallback: Read cached structure from DB if government API fails (Circuit Breaker active)
      const task = await this.taskModel.findOne({ govTaskId });
      if (task && task.nodesData) {
        return {
          govTaskId,
          nodes: task.nodesData,
          isCachedFallback: true,
        };
      }
      throw e;
    }
  }

  // 3. Save progress locally (autosave to MongoDB Task.formData)
  async saveProgress(govTaskId: number, formData: Record<string, any>, workspaceId: string) {
    const task = await this.taskModel.findOneAndUpdate(
      { govTaskId, workspaceId },
      { formData, status: "draft" },
      { new: true }
    );
    if (!task) {
      throw new HttpException("Task draft not found.", HttpStatus.NOT_FOUND);
    }
    return { success: true, updatedTask: task };
  }

  // 4. Submit Current Node Step (Advances task workflow node-by-node)
  async submitCurrentNode(
    govTaskId: number,
    payload: { action_id: number; actions: any[] },
    sessionToken: string,
    workspaceId: string,
    clientIp: string,
    userAgent: string,
    userFullname: string,
    userId: string
  ) {
    try {
      const data = await this.govApiClient.request(
        {
          method: "POST",
          url: `/integration/v2/tasks/${govTaskId}/submit-current-node`,
          data: payload,
        },
        sessionToken,
        workspaceId
      );

      // Save submission log snapshot to MongoDB
      const log = new this.taskLogModel({
        workspaceId,
        govTaskId,
        nodeFromId: payload.action_id,
        nodeToId: data.next_node_id,
        nodeType: "step",
        statusFrom: "draft",
        statusTo: data.status,
        userFullname,
        userIp: clientIp,
        userAgent,
        payloadSnapshot: payload.actions,
        responseSnapshot: data,
      });
      await log.save();

      // Update task node progress status in DB
      const isCompleted = data.status === "completed";
      await this.taskModel.updateOne(
        { govTaskId, workspaceId },
        {
          status: isCompleted ? "submitted" : "draft",
          currentNodeId: data.next_node_id,
          submittedAt: isCompleted ? new Date() : undefined,
        }
      );

      // Create audit log
      const auditLog = new this.auditLogModel({
        workspaceId: new Types.ObjectId(workspaceId),
        userId: new Types.ObjectId(userId),
        action: "submit",
        details: { govTaskId, stepId: payload.action_id, nextNodeId: data.next_node_id, status: data.status },
        userIp: clientIp,
        userAgent,
      });
      await auditLog.save();

      // Create notification if completed
      if (isCompleted) {
        const notif = new this.notificationModel({
          workspaceId: new Types.ObjectId(workspaceId),
          type: "submission_success",
          title: "Hisobot topshirildi",
          message: `Hisobot (ID: ${govTaskId}) muvaffaqiyatli topshirildi va hisobot jurnali yangilandi.`,
          read: false,
        });
        await notif.save();
      }

      return data;
    } catch (e) {
      console.error("Step submission failed:", e.message);
      // Create failure audit log
      try {
        const errLog = new this.auditLogModel({
          workspaceId: new Types.ObjectId(workspaceId),
          userId: new Types.ObjectId(userId),
          action: "submit_failed",
          details: { govTaskId, error: e.message },
          userIp: clientIp,
          userAgent,
        });
        await errLog.save();
      } catch (err) {}
      throw e;
    }
  }

  // 5. Submit All Steps (Sends full compiled values)
  async submitAllSteps(
    govTaskId: number,
    payload: { nodes: any[] },
    sessionToken: string,
    workspaceId: string,
    clientIp: string,
    userAgent: string,
    userFullname: string,
    userId: string
  ) {
    try {
      const data = await this.govApiClient.request(
        {
          method: "POST",
          url: `/integration/v2/tasks/${govTaskId}/submit-all-steps`,
          data: payload,
        },
        sessionToken,
        workspaceId
      );

      // Save complete submission log trace
      const log = new this.taskLogModel({
        workspaceId,
        govTaskId,
        nodeFromId: 0,
        nodeToId: data.next_node_id,
        nodeType: "group",
        statusFrom: "draft",
        statusTo: data.status,
        userFullname,
        userIp: clientIp,
        userAgent,
        payloadSnapshot: payload.nodes,
        responseSnapshot: data,
      });
      await log.save();

      // Set Task as submitted in DB
      await this.taskModel.updateOne(
        { govTaskId, workspaceId },
        {
          status: "submitted",
          submittedAt: new Date(),
        }
      );

      // Create audit log
      const auditLog = new this.auditLogModel({
        workspaceId: new Types.ObjectId(workspaceId),
        userId: new Types.ObjectId(userId),
        action: "submit",
        details: { govTaskId, type: "all_steps", status: data.status },
        userIp: clientIp,
        userAgent,
      });
      await auditLog.save();

      // Create notification
      const notif = new this.notificationModel({
        workspaceId: new Types.ObjectId(workspaceId),
        type: "submission_success",
        title: "Hisobot topshirildi",
        message: `Hisobot (ID: ${govTaskId}) muvaffaqiyatli topshirildi va hisobot jurnali yangilandi.`,
        read: false,
      });
      await notif.save();

      return data;
    } catch (e) {
      console.error("All steps submission failed:", e.message);
      // Create failure audit log
      try {
        const errLog = new this.auditLogModel({
          workspaceId: new Types.ObjectId(workspaceId),
          userId: new Types.ObjectId(userId),
          action: "submit_failed",
          details: { govTaskId, error: e.message },
          userIp: clientIp,
          userAgent,
        });
        await errLog.save();
      } catch (err) {}
      throw e;
    }
  }

  // 6. Get Structured Flow (audit trace / submitted history)
  async getTaskFlow(govTaskId: number, sessionToken: string, workspaceId: string) {
    return this.govApiClient.request(
      {
        method: "GET",
        url: `/integration/v2/tasks/${govTaskId}/flow-structured`,
      },
      sessionToken,
      workspaceId
    );
  }
}
