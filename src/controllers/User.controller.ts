// controllers/User.controller.ts (extend existing or new, assuming extending the file with register and login)
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User, type IUser } from "../models/User.model.js";
import { successResponse, errorResponse } from "../utils/response.js";
import {
  updateUserSchema,
  type UpdateUserInput,
} from "../schema/UpdateUserSchema.js";
import { Task } from "../models/Task.model.js";
import { Category } from "../models/Category.model.js";
import { Priority } from "../models/Priority.model.js";

export const updateUser = async (req: Request, res: Response) => {
  const user = req.user as IUser;

  if (!user) {
    return errorResponse(
      res,
      "Unauthorized",
      { message: "Please login again" },
      401
    );
  }

  try {
    const parsed = updateUserSchema.safeParse(req.body);

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

    const { username, email, password } = parsed.data as UpdateUserInput;

    const updateData: Partial<IUser> = {};

    if (username) {
      const existingUsername = await User.findOne({ username });
      if (
        existingUsername &&
        existingUsername._id.toString() !== user._id.toString()
      ) {
        return errorResponse(res, "Username already taken", {}, 400);
      }
      updateData.username = username;
    }

    if (email) {
      const existingEmail = await User.findOne({ email });
      if (
        existingEmail &&
        existingEmail._id.toString() !== user._id.toString()
      ) {
        return errorResponse(res, "Email already registered", {}, 400);
      }
      updateData.email = email;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse(res, "No fields to update", {}, 400);
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return errorResponse(res, "User not found", {}, 404);
    }

    return successResponse(
      res,
      "User updated successfully",
      {
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
        },
      },
      200
    );
  } catch (error: any) {
    return errorResponse(res, "Internal Server Error", {}, 500);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const user = req.user as IUser;

  if (!user) {
    return errorResponse(
      res,
      "Unauthorized",
      { message: "Please login again" },
      401
    );
  }

  try {
    // Delete associated tasks
    await Task.deleteMany({ createdBy: user._id });

    // Delete associated categories
    await Category.deleteMany({ createdBy: user._id });

    // Delete associated priorities
    await Priority.deleteMany({ createdBy: user._id });

    // Delete user
    const deletedUser = await User.findByIdAndDelete(user._id);

    if (!deletedUser) {
      return errorResponse(res, "User not found", {}, 404);
    }

    return successResponse(res, "User account deleted successfully", {}, 200);
  } catch (error: any) {
    return errorResponse(res, "Internal Server Error", {}, 500);
  }
};
