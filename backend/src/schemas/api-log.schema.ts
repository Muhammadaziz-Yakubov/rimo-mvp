import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ApiLogDocument = ApiLog & Document;

@Schema({ timestamps: true })
export class ApiLog {
  @Prop({ type: Types.ObjectId, ref: "Workspace", index: true })
  workspaceId: Types.ObjectId;

  @Prop({ required: true })
  method: string;

  @Prop({ required: true, index: true })
  endpoint: string;

  @Prop({ required: true })
  duration: number; // in milliseconds

  @Prop({ required: true, index: true })
  statusCode: number;

  @Prop({ type: Object })
  requestHeaders: Record<string, any>;

  @Prop({ type: String })
  requestPayload: string;

  @Prop({ type: Object })
  responseHeaders: Record<string, any>;

  @Prop({ type: String })
  responsePayload: string;
}

export const ApiLogSchema = SchemaFactory.createForClass(ApiLog);
// Automatically expire logs after 30 days to optimize MongoDB space
ApiLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
