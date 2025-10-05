import type { Request, Response } from "express";
import { type IUser } from "../models/User.model.js";
import { Task } from "../models/Task.model.js";
import { successResponse, errorResponse } from "../utils/response.js";
import {
  createTaskSchema,
  editTaskSchema,
  type EditTaskInput,
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

    const { name, hours, totalHours, deadline, priority, category, completed } =
      parsed.data as CreateTaskInput;

    const newTask = await Task.create({
      createdBy: user._id,
      name,
      hours,
      totalHours,
      deadline: deadline ? new Date(deadline) : undefined,
      priority: new mongoose.Types.ObjectId(priority),
      category: category.map((c) => new mongoose.Types.ObjectId(c)),
      completed,
    });

    const responseTask = {
      ...(newTask.toObject() as any),
      deadline: newTask.deadline
        ? format(new Date(newTask.deadline), "yyyy-MM-dd")
        : null,
    };

    return successResponse(res, "Task created successfully", responseTask, 201);
  } catch (error: any) {
    return errorResponse(res, "Internal Server Error", {}, 500);
  }
};

export const editTask = async (req: Request, res: Response) => {
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

    const parsed = createTaskSchema.safeParse(req.body);

    if (!parsed.success) {
      return errorResponse(
        res,
        "Invalid Format",
        { message: parsed.error.message },
        400
      );
    }

    const { hours, totalHours } = parsed.data as EditTaskInput;

    if (!hours && !totalHours) {
      return errorResponse(
        res,
        "Invalid Format",
        { message: "No fields to update" },
        400
      );
    }

    const calculatehoursLeft =
      totalHours instanceof Date && hours instanceof Date
        ? new Date(totalHours.getTime() - hours.getTime())
        : hours;

    const task = await Task.findOneAndUpdate(
      { _id: id, createdBy: user._id },
      { hours: calculatehoursLeft },
      { new: true }
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
  } catch (error) {
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
      .populate("category", "name emoji")
      .lean();

    if (!task) {
      return errorResponse(
        res,
        "Task not found or unauthorized",
        { message: "You cannot edit this task" },
        404
      );
    }

    const responseTask = {
      ...task,
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

    const tasks = (await (Task as any)
      .find(query)
      .populate("priority", "name color")
      .populate("category", "name emoji")
      .lean()) as any[];

    if (!tasks || tasks.length === 0) {
      return successResponse(res, "No tasks found", [], 200);
    }

    const formattedTasks = tasks.map((task) => ({
      ...task,
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

    const task = (await (Task as any)
      .findOne({ _id: id, createdBy: user._id })
      .populate("priority", "name color")
      .populate("category", "name emoji")
      .lean()) as any;

    if (!task) {
      return errorResponse(
        res,
        "Task not found",
        { message: "The requested task does not exist" },
        404
      );
    }

    const responseTask = {
      ...task,
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
      .populate("category", "name emoji")
      .lean();

    if (!task) {
      return errorResponse(
        res,
        "Task not found or unauthorized",
        { message: "You cannot delete this task" },
        404
      );
    }

    const responseTask = {
      ...task,
      deadline: task.deadline
        ? format(new Date(task.deadline), "yyyy-MM-dd")
        : null,
    };

    return successResponse(res, "Task deleted successfully", responseTask, 200);
  } catch (error: any) {
    return errorResponse(res, "Internal Server Error", {}, 500);
  }
};
