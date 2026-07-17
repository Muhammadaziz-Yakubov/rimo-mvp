import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: "Workspace", required: true, index: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, index: true })
  action: string; // login, logout, submit, download, delete, create, edit

  @Prop({ type: Object })
  details: Record<string, any>;

  @Prop({ required: true })
  userIp: string;

  @Prop({ required: true })
  userAgent: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
