import { UserMe } from "./api.types";

export type Role = "Admin" | "Accountant" | "Viewer";

export interface Workspace {
  id: string;
  name: string;
  ownerId?: string;
  tin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Organization {
  id: string;
  name: string;
  tin: number | null;
  userType: string;       // "juridical" | "basic" | "authority"
  status: string;         // "connected" | "disconnected" | "syncing" | "error"
  credentialUsername: string;
  code: string;
  lastSyncAt: string | null;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: Role;
  user?: {
    fullname: string;
    pin: string;
    username: string;
  };
}

export type AuthorityStatus = "connected" | "syncing" | "error" | "disconnected";

export type ReportStatus = "draft" | "submitted" | "processing" | "rejected" | "archived";

export type NotificationType =
  | "deadline_approaching"
  | "api_disconnected"
  | "token_expired"
  | "submission_success"
  | "submission_failed"
  | "government_maintenance";

export interface Notification {
  id: string;
  workspaceId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  workspaceId: string;
  userId: string;
  action: string; // login, logout, submit, download, etc.
  details: Record<string, any>;
  userIp: string;
  userAgent: string;
  createdAt: string;
}

export interface ApiActivityEntry {
  id: string;
  workspaceId: string;
  method: string;
  endpoint: string;
  duration: number; // ms
  statusCode: number;
  requestPayload?: string;
  responsePayload?: string;
  createdAt: string;
}

export type SubmissionStep =
  | "connecting"
  | "authenticating"
  | "creating_draft"
  | "uploading_fields"
  | "validating"
  | "submitting"
  | "completed";
