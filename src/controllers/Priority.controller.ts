import type { Request, Response } from "express";
import { Priority, type IPriority } from "../models/Priority.model.js";
import { successResponse, errorResponse } from "../utils/response.js";
import {
  createPriorityScheme,
  type CreatePriorityInput,
} from "../schema/PriorityScheme.js";
import mongoose from "mongoose";

export const createPriortity = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return errorResponse(
      res,
      "Unauthorized",
      { message: "Login required" },
      401
    );
  }

  try {
    const parsed = createPriorityScheme.safeParse(req.body);

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

    const { name, color } = parsed.data as CreatePriorityInput;

    const existingPriority = await Priority.findOne({
      createdBy: user._id,
      name,
    });

    if (existingPriority) {
      return errorResponse(res, "Priority already exists", {}, 400);
    }

    const newPriority = await Priority.create({
      createdBy: user._id,
      name,
      color,
    });

    return successResponse(
      res,
      "Priority created successfully",
      newPriority,
      201
    );
  } catch (error) {}
  return errorResponse(res, "Internal Server Error", {}, 500);
};

export const deletePriority = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return errorResponse(
      res,
      "Unauthorized",
      { message: "Login required" },
      401
    );
  }

  try {
    const { id } = req.params;

    if (!id) {
      return errorResponse(
        res,
        "Priority ID is required",
        { message: "No priority ID was provided" },
        400
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(
        res,
        "Invalid Priority ID",
        { message: "The provided priority ID is not valid" },
        400
      );
    }

    const priority = await Priority.findOneAndDelete({
      _id: id,
      createdBy: user._id,
    });
    if (!priority) {
      return errorResponse(res, "Priority not found", {}, 404);
    }

    return successResponse(res, "Priority deleted successfully", priority, 200);
  } catch (error: any) {
    return errorResponse(res, "Internal Server Error", {}, 500);
  }
};
