import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ReportDraftDocument = ReportDraft & Document;

@Schema({ _id: false })
class AuditHistoryItem {
  @Prop({ required: true })
  action: string;

  @Prop()
  comment?: string;

  @Prop({ required: true })
  userFullname: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

@Schema({ timestamps: true })
export class ReportDraft {
  @Prop({ type: Types.ObjectId, ref: "Workspace", required: true, index: true })
  workspaceId: Types.ObjectId;

  @Prop({ required: true })
  reportId: number;

  @Prop({ required: true })
  reportType: string;

  @Prop({ required: true, index: true })
  period: string;

  @Prop({
    required: true,
    enum: ["draft", "approved", "rejected", "submitted"],
    default: "draft",
    index: true,
  })
  status: string;

  @Prop({ default: "AI" })
  generatedBy: string;

  @Prop({ type: Object, default: {} })
  data: Record<string, any>; // maps field code/id -> calculated value

  @Prop({ default: 100 })
  confidenceScore: number;

  @Prop({ type: Object, default: {} })
  explanations: Record<string, string>; // maps field code/id -> reasoning text

  @Prop({ required: true, index: true })
  govTaskId: number;

  @Prop()
  rejectionReason?: string;

  @Prop({ type: [AuditHistoryItem], default: [] })
  history: AuditHistoryItem[];
}

export const ReportDraftSchema = SchemaFactory.createForClass(ReportDraft);
