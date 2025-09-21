import { Schema, model, Document, Types } from "mongoose";

export interface ICategory extends Document {
  _id: Types.ObjectId;
  createdBy: Types.ObjectId;
  name: string;
  emoji?: string;
}

const CategorySchema = new Schema<ICategory>(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    emoji: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Category = model<ICategory>("Category", CategorySchema);
