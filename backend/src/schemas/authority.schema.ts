import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type AuthorityDocument = Authority & Document;

@Schema({ timestamps: true })
export class Authority {
  @Prop({ type: Types.ObjectId, ref: "Workspace", required: true, index: true })
  workspaceId: Types.ObjectId;

  @Prop({ required: true, index: true })
  tin: number; // STIR / TIN of juridical entity or authority

  @Prop({ required: true })
  code: string; // Government code identifier

  @Prop({ type: Object, required: true })
  title: Record<string, string>; // Multi-lingual titles (uz, ru, en)

  @Prop()
  iconUrl: string;

  @Prop({ required: true, default: "disconnected", enum: ["connected", "syncing", "error", "disconnected"] })
  connectionStatus: string;

  @Prop({ required: true })
  encryptedCredentials: string; // AES-256-GCM encrypted government API password

  @Prop({ required: true })
  credentialUsername: string; // Government API login username

  @Prop()
  lastSyncAt: Date;
}

export const AuthoritySchema = SchemaFactory.createForClass(Authority);
AuthoritySchema.index({ workspaceId: 1, tin: 1 }, { unique: true });
