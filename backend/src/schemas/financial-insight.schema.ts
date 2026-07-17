import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type FinancialInsightDocument = FinancialInsight & Document;

@Schema({ timestamps: true })
export class FinancialInsight {
  @Prop({ type: Types.ObjectId, ref: "Workspace", required: true, index: true })
  workspaceId: Types.ObjectId;

  @Prop({ required: true, enum: ["warning", "info", "success", "tip"] })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ["high", "medium", "low"], default: "medium" })
  priority: string;
}

export const FinancialInsightSchema = SchemaFactory.createForClass(FinancialInsight);
