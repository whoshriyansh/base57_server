import { Document, Schema, Types, model } from "mongoose";

export interface ITask extends Document {
  _id: Types.ObjectId;
  createdBy: Types.ObjectId;
  name: string;
  dateTime: Date;
  deadline: Date;
  priority: string[];
  category: string[];
  completed: boolean;
}

const TaskSchema = new Schema<ITask>(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    deadline: {
      type: Date,
    },
    priority: {
      type: [String],
      enum: ["low", "medium", "high"],
      default: ["medium"],
    },
    category: {
      type: [String],
      default: [],
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Task = model<ITask>("Task", TaskSchema);
