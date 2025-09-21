import type { Request, Response } from "express";
import { type IUser } from "../models/User.model.js";
import { Task } from "../models/Task.model.js";
import { successResponse, errorResponse } from "../utils/response.js";
import {
  createTaskSchema,
  type CreateTaskInput,
} from "../schema/TaskSchema.js";
import mongoose from "mongoose";

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
      dateTime,
      deadline,
      priority,
      category,
      completed,
    });

    return successResponse(res, "Task created successfully", newTask, 201);
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

    const task = await Task.findOneAndUpdate(
      { _id: id, createdBy: user._id },
      req.body,
      { new: true, runValidators: true } // ensures validation rules are applied
    );

    if (!task) {
      return errorResponse(
        res,
        "Task not found or unauthorized",
        { message: "You cannot edit this task" },
        404
      );
    }

    return successResponse(res, "Task updated successfully", task, 200);
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
    const tasks = await Task.find({ createdBy: user._id });

    if (!tasks || tasks.length === 0) {
      return successResponse(res, "No tasks found", [], 200);
    }

    return successResponse(res, "Tasks fetched successfully", tasks, 200);
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

    const task = await Task.findOne({ _id: id, createdBy: user._id });

    if (!task) {
      return errorResponse(
        res,
        "Task not found",
        { message: "The requested task does not exist" },
        404
      );
    }

    return successResponse(res, "Task fetched successfully", task, 200);
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

    const task = await Task.findOneAndDelete({ _id: id, createdBy: user._id });

    if (!task) {
      return errorResponse(
        res,
        "Task not found or unauthorized",
        { message: "You cannot delete this task" },
        404
      );
    }

    return successResponse(res, "Task deleted successfully", task, 200);
  } catch (error: any) {
    return errorResponse(res, "Internal Server Error", {}, 500);
  }
};

export const addTaskCategory = async (req: Request, res: Response) => {
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
    const { id, category } = req.body;

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

    const task = await Task.findOneAndUpdate(
      { _id: id, createdBy: user._id },
      { $addToSet: { category: category } }, // prevents duplicate category
      { new: true }
    );

    if (!task) {
      return errorResponse(res, "Task not found or unauthorized", {}, 404);
    }

    return successResponse(res, "Category added successfully", task, 200);
  } catch (error: any) {
    return errorResponse(res, "Internal Server Error", {}, 500);
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
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
    const { id, category } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: id, createdBy: user._id },
      { $pull: { category: category } }, // removes category
      { new: true }
    );

    if (!task) {
      return errorResponse(res, "Task not found or unauthorized", {}, 404);
    }

    return successResponse(res, "Category deleted successfully", task, 200);
  } catch (error: any) {
    return errorResponse(res, "Internal Server Error", {}, 500);
  }
};
