import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  pin: string; // Government user PIN

  @Prop({ required: true })
  fullname: string;

  @Prop({ required: true })
  firstname: string;

  @Prop({ required: true })
  surname: string;

  @Prop()
  middlename: string;

  @Prop({ required: true, unique: true })
  username: string; // Government integration username

  @Prop({ required: true })
  passport: string;

  @Prop({ type: Object })
  profileData: Record<string, any>; // Cache of user.Profile from government
}

export const UserSchema = SchemaFactory.createForClass(User);
