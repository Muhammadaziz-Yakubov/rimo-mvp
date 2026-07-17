import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { Notification, NotificationDocument } from "./schemas/notification.schema";
import { ApiLog, ApiLogDocument } from "./schemas/api-log.schema";
import { AuditLog, AuditLogDocument } from "./schemas/audit-log.schema";
import { Task, TaskDocument } from "./schemas/task.schema";
import { Authority, AuthorityDocument } from "./schemas/authority.schema";

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(ApiLog.name) private apiLogModel: Model<ApiLogDocument>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Authority.name) private authorityModel: Model<AuthorityDocument>
  ) {}

  getHello(): string {
    return "Soliqly API gateway is active and fully running.";
  }

  async getNotifications(workspaceId: string) {
    return this.notificationModel
      .find({ workspaceId: new Types.ObjectId(workspaceId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getApiActivity(workspaceId: string) {
    return this.apiLogModel
      .find({ workspaceId })
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();
  }

  async getAuditLogs(workspaceId: string) {
    return this.auditLogModel
      .find({ workspaceId: new Types.ObjectId(workspaceId) })
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();
  }

  async getAnalytics(workspaceId: string) {
    const tasks = await this.taskModel.find({ workspaceId: new Types.ObjectId(workspaceId) }).exec();
    
    const active = tasks.filter((t) => t.status === "processing" || t.status === "submitted").length;
    const drafts = tasks.filter((t) => t.status === "draft").length;
    const attention = tasks.filter((t) => t.status === "rejected").length;

    // Build monthly filing history for chart plotting
    const monthsUz = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
    const monthlyHistory = monthsUz.map((m) => ({ month: m, count: 0 }));

    tasks.forEach((t: any) => {
      if (t.createdAt) {
        const monthIndex = new Date(t.createdAt).getMonth();
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyHistory[monthIndex].count += 1;
        }
      }
    });

    return {
      stats: {
        active,
        drafts,
        deadlines: 0, // Computed dynamically based on authority expiration dates
        attention,
      },
      tasksCount: tasks.length,
      tasksByStatus: {
        draft: drafts,
        submitted: tasks.filter((t) => t.status === "submitted").length,
        processing: tasks.filter((t) => t.status === "processing").length,
        rejected: attention,
      },
      monthlyHistory,
    };
  }
  async getOrganizations(workspaceId: string, juridical: any, userType: string) {
    // Return the authority records tied to this workspace.
    // Each Authority record in MongoDB represents one connected legal entity (juridical).
    const authorities = await this.authorityModel
      .find({ workspaceId: new Types.ObjectId(workspaceId) })   // Must use ObjectId for correct matching
      .sort({ lastSyncAt: -1 })
      .exec();

    // If there are DB records, return them enriched with live session juridical data
    if (authorities.length > 0) {
      return authorities.map((a: any) => ({
        id: a._id.toString(),
        name: a.title?.uz || a.title?.ru || a.credentialUsername || "",
        tin: a.tin || null,
        userType: userType || "juridical",
        status: a.connectionStatus || "disconnected",
        credentialUsername: a.credentialUsername || "",
        code: a.code || "",
        lastSyncAt: a.lastSyncAt || null,
        // Supplement with live juridical name from session (use == for number/string tin comparison)
        // eslint-disable-next-line eqeqeq
        ...(juridical && a.tin == juridical.tin
          ? {
              name: juridical.name || a.title?.uz || a.credentialUsername || "",
              tin: juridical.tin,
            }
          : {}),
      }));
    }

    // Fallback: no DB records yet but we have live juridical data from session
    // This happens on first login before any Authority doc is upserted (race condition)
    if (juridical) {
      return [
        {
          id: "session",
          name: juridical.name || "",
          tin: juridical.tin || null,
          userType: userType || "juridical",
          status: "connected",
          credentialUsername: "",
          code: "",
          lastSyncAt: null,
        },
      ];
    }

    return [];
  }
}
