import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type WorkspaceMemberDocument = WorkspaceMember & Document;

@Schema({ timestamps: true })
export class WorkspaceMember {
  @Prop({ type: Types.ObjectId, ref: "Workspace", required: true, index: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ["Admin", "Accountant", "Viewer"] })
  role: string;
}

export const WorkspaceMemberSchema = SchemaFactory.createForClass(WorkspaceMember);
// Compound index to guarantee uniqueness of user membership in workspace
WorkspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });
