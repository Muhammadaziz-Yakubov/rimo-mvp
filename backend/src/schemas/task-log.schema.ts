import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type TaskLogDocument = TaskLog & Document;

@Schema({ timestamps: true })
export class TaskLog {
  @Prop({ type: Types.ObjectId, ref: "Workspace", required: true, index: true })
  workspaceId: Types.ObjectId;

  @Prop({ required: true, index: true })
  govTaskId: number;

  @Prop({ required: true })
  nodeFromId: number;

  @Prop({ required: true })
  nodeToId: number;

  @Prop({ required: true })
  nodeType: string;

  @Prop({ required: true })
  statusFrom: string;

  @Prop({ required: true })
  statusTo: string;

  @Prop()
  userFullname: string;

  @Prop()
  userIp: string;

  @Prop()
  userAgent: string;

  @Prop({ type: Object })
  payloadSnapshot: Record<string, any>; // snapshot of filled inputs submitted at this node

  @Prop({ type: Object })
  responseSnapshot: Record<string, any>; // snapshot of government validation response
}

export const TaskLogSchema = SchemaFactory.createForClass(TaskLog);
