import { Schema, model, Document, Types } from "mongoose";
import { type ICategory } from "./Category.model.js";
import { type IPriority } from "./Priority.model.js";

export interface ITask extends Document {
  createdBy: Types.ObjectId;
  name: string;
  hours?: Date;
  totalHours?: Date;
  deadline?: Date;
  priority: Types.ObjectId | IPriority;
  category: Types.ObjectId[] | ICategory[];
  completed: boolean;
}

const TaskSchema = new Schema<ITask>(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    hours: { type: Date },
    totalHours: { type: Date },
    deadline: { type: Date },
    priority: { type: Schema.Types.ObjectId, ref: "Priority" },
    category: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Task = model<ITask>("Task", TaskSchema);
