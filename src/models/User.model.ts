import { Document, Schema, Types, model } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  isFromGoogle: boolean;
  googleId?: string;
  avatar?: string;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    isFromGoogle: { type: Boolean, default: false },
    googleId: { type: String, index: true },
    avatar: { type: String },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", UserSchema);
