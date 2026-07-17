import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type WorkspaceDocument = Workspace & Document;

@Schema({ timestamps: true })
export class Workspace {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  ownerId: Types.ObjectId;
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
