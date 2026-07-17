import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: "Workspace", required: true, index: true })
  workspaceId: Types.ObjectId;

  @Prop({ required: true, index: true })
  date: Date;

  @Prop({ required: true })
  description: string;

  @Prop()
  originalDescription: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, index: true, enum: ["income", "expense"] })
  type: string;

  @Prop({ default: "Uncategorized", index: true })
  category: string;

  @Prop({ default: "exempt", index: true })
  taxCategory: string; // 'turnover_taxable', 'vat_deductible', 'non_deductible_expense', 'exempt'

  @Prop({ default: 100 })
  confidenceScore: number;

  @Prop({ type: Object })
  rawData: Record<string, any>;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
