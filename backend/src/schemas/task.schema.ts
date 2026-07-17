import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, unique: true, index: true })
  govTaskId: number; // Government Task ID

  @Prop({ type: Types.ObjectId, ref: "Workspace", required: true, index: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Authority", required: true, index: true })
  authorityId: Types.ObjectId;

  @Prop({ required: true })
  reportId: number;

  @Prop({ required: true })
  reportCode: string;

  @Prop({ required: true })
  reportVersionId: number;

  @Prop({ required: true })
  reportVersionCode: string;

  @Prop({ required: true, index: true, enum: ["draft", "submitted", "processing", "rejected", "archived"] })
  status: string;

  @Prop({ type: Object, required: true })
  title: Record<string, string>;

  @Prop({ type: Object, required: true })
  shortTitle: Record<string, string>;

  @Prop()
  currentNodeId: number;

  @Prop()
  currentNodeCode: string;

  @Prop()
  previousNodeId: number;

  @Prop()
  previousNodeCode: string;

  @Prop()
  ownerPin: string;

  @Prop()
  ownerTin: string;

  @Prop({ type: Object })
  formData: Record<string, any>; // Locally autosaved step inputs mapping field code -> value

  @Prop({ type: Array })
  nodesData: any[]; // Cached dynamic steps structure from government API (nodes[], actions[], fields[])

  @Prop()
  submittedAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
