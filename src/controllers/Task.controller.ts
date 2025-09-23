import type { Request, Response } from "express";
import { type IUser } from "../models/User.model.js";
import { Task } from "../models/Task.model.js";
import { successResponse, errorResponse } from "../utils/response.js";
import {
  createTaskSchema,
  type CreateTaskInput,
} from "../schema/TaskSchema.js";
import mongoose from "mongoose";
import { format } from "date-fns";

export const createTask = async (req: Request, res: Response) => {
  const user = req.user as IUser;

  console.log("This os the user in the Task Creation", user);

  if (!user) {
    return errorResponse(
      res,
      "Unauthorized",
      { message: "Please try to Login Again" },
      401
    );
  }

  try {
    const parsed = createTaskSchema.safeParse(req.body);

    if (!parsed.success) {
      return errorResponse(
        res,
        "Invalid Format",
        {
          message: parsed.error.message,
        },
        400
      );
    }

    const { name, dateTime, deadline, priority, category, completed } =
      parsed.data as CreateTaskInput;

    const newTask = await Task.create({
      createdBy: user._id,
      name,
      dateTime: new Date(dateTime),
      deadline: deadline ? new Date(deadline) : undefined,
      priority: new mongoose.Types.ObjectId(priority),
      category: category.map((c) => new mongoose.Types.ObjectId(c)),
      completed,
    });

    const responseTask = {
      ...newTask.toObject(),
      dateTime: format(new Date(newTask.dateTime), "yyyy-MM-dd"),
      deadline: newTask.deadline
        ? format(new Date(newTask.deadline), "yyyy-MM-dd")
        : null,
    };

    return successResponse(res, "Task created successfully", responseTask, 201);
  } catch (error: any) {
    return errorResponse(res, "Internal Server Error", {}, 500);
  }
};

export const editTaskById = async (req: Request, res: Response) => {
  const user = req.user as IUser | undefined;
  if (!user) {
    return errorResponse(
      res,
      "Unauthorized",
      { message: "Please login again" },
      401
    );
  }

  try {
    const { id } = req.params;

    if (!id) {
      return errorResponse(
        res,
        "Task ID is required",
        { message: "No task ID was provided" },
        400
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(
        res,
        "Invalid Task ID",
        { message: "The provided task ID is not valid" },
        400
      );
    }

    const updateData = { ...req.body };

    if (updateData.priority) {
      updateData.priority = new mongoose.Types.ObjectId(updateData.priority);
    }

    if (updateData.category) {
      updateData.category = updateData.category.map(
        (c: string) => new mongoose.Types.ObjectId(c)
      );
    }

    if (updateData.dateTime) {
      updateData.dateTime = new Date(updateData.dateTime);
    }

    if (updateData.deadline) {
      updateData.deadline = new Date(updateData.deadline);
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, createdBy: user._id },
      updateData,
      { new: true, runValidators: true }
    )
      .populate("priority", "name color")
      .populate("category", "name emoji");

    if (!task) {
      return errorResponse(
        res,
        "Task not found or unauthorized",
        { message: "You cannot edit this task" },
        404
      );
    }

    const responseTask = {
      ...task.toObject(),
      dateTime: format(new Date(task.dateTime), "yyyy-MM-dd"),
      deadline: task.deadline
        ? format(new Date(task.deadline), "yyyy-MM-dd")
        : null,
    };

    return successResponse(res, "Task updated successfully", responseTask, 200);
  } catch (error: any) {
    return errorResponse(res, "Internal Server Error", {}, 500);
  }
};

export const getAllTask = async (req: Request, res: Response) => {
  const user = req.user as IUser | undefined;
  if (!user) {
    return errorResponse(
      res,
      "Unauthorized",
      { message: "Please login again" },
      401
    );
  }

  try {
    const { category, priority, deadline } = req.query;

    const query: any = { createdBy: user._id };

    if (category) {
      query.category = new mongoose.Types.ObjectId(category as string);
    }

    if (priority) {
      query.priority = new mongoose.Types.ObjectId(priority as string);
    }

    if (deadline) {
      const date = new Date(deadline as string);
      query.dateTime = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lte: new Date(date.setHours(23, 59, 59, 999)),
      };
    }

    const tasks = await Task.find(query)
      .populate("priority", "name color")
      .populate("category", "name emoji");

    if (!tasks || tasks.length === 0) {
      return successResponse(res, "No tasks found", [], 200);
    }

    const formattedTasks = tasks.map((task) => ({
      ...task.toObject(),
      dateTime: format(new Date(task.dateTime), "yyyy-MM-dd"),
      deadline: task.deadline
        ? format(new Date(task.deadline), "yyyy-MM-dd")
        : null,
    }));

    return successResponse(
      res,
      "Tasks fetched successfully",
      formattedTasks,
      200
    );
  } catch (error: any) {
    return errorResponse(res, "Internal Server Error", {}, 500);
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  const user = req.user as IUser | undefined;
  if (!user) {
    return errorResponse(
      res,
      "Unauthorized",
      { message: "Please login again" },
      401
    );
  }

  try {
    const { id } = req.params;

    if (!id) {
      return errorResponse(
        res,
        "Task ID is required",
        { message: "No task ID was provided" },
        400
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(
        res,
        "Invalid Task ID",
        { message: "The provided task ID is not valid" },
        400
      );
    }

    const task = await Task.findOne({ _id: id, createdBy: user._id })
      .populate("priority", "name color")
      .populate("category", "name emoji");

    if (!task) {
      return errorResponse(
        res,
        "Task not found",
        { message: "The requested task does not exist" },
        404
      );
    }

    const responseTask = {
      ...task.toObject(),
      dateTime: format(new Date(task.dateTime), "yyyy-MM-dd"),
      deadline: task.deadline
        ? format(new Date(task.deadline), "yyyy-MM-dd")
        : null,
    };

    return successResponse(res, "Task fetched successfully", responseTask, 200);
  } catch (error: any) {
    return errorResponse(res, "Internal Server Error", {}, 500);
  }
};

export const deleteTaskById = async (req: Request, res: Response) => {
  const user = req.user as IUser | undefined;
  if (!user) {
    return errorResponse(
      res,
      "Unauthorized",
      { message: "Please login again" },
      401
    );
  }

  try {
    const { id } = req.params;

    if (!id) {
      return errorResponse(
        res,
        "Task ID is required",
        { message: "No task ID was provided" },
        400
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(
        res,
        "Invalid Task ID",
        { message: "The provided task ID is not valid" },
        400
      );
    }

    const task = await Task.findOneAndDelete({ _id: id, createdBy: user._id })
      .populate("priority", "name color")
      .populate("category", "name emoji");

    if (!task) {
      return errorResponse(
        res,
        "Task not found or unauthorized",
        { message: "You cannot delete this task" },
        404
      );
    }

    const responseTask = {
      ...task.toObject(),
      dateTime: format(new Date(task.dateTime), "yyyy-MM-dd"),
      deadline: task.deadline
        ? format(new Date(task.deadline), "yyyy-MM-dd")
        : null,
    };

    return successResponse(res, "Task deleted successfully", responseTask, 200);
  } catch (error: any) {
    return errorResponse(res, "Internal Server Error", {}, 500);
  }
};
