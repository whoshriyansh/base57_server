import { Schema, model, Document, Types } from "mongoose";

export interface IPriority extends Document {
  _id: Types.ObjectId;
  createdBy: Types.ObjectId;
  name: string;
  color?: string[];
}

const PrioritySchema = new Schema<IPriority>(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    color: {
      type: [String],
      enum: [
        "#f74242",
        "#1cfbad",
        "#1a8afa",
        "#f8f8f8",
        "#d27cf7",
        "#fa9828",
        "#f7d61b",
        "#f750b7",
      ],
      default: ["#f74242"],
    },
  },
  { timestamps: true }
);

export const Priority = model<IPriority>("Priority", PrioritySchema);
