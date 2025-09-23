import type { Request, Response } from "express";
import { Category, type ICategory } from "../models/Category.model.js";
import { successResponse, errorResponse } from "../utils/response.js";
import {
  createCategoryScheme,
  type CreateCategoryInput,
} from "../schema/CategorySchema.js";
import mongoose from "mongoose";

export const getCategories = async (req: Request, res: Response) => {
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
    const categories = await Category.find({ createdBy: user._id });

    if (!categories || categories.length === 0) {
      return successResponse(res, "No categories found", [], 200);
    }

    return successResponse(
      res,
      "Priority created successfully",
      categories,
      201
    );
  } catch (error) {}
  return errorResponse(res, "Internal Server Error", {}, 500);
};

export const createCategory = async (req: Request, res: Response) => {
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
    const parsed = createCategoryScheme.safeParse(req.body);

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

    const { name, emoji } = parsed.data as CreateCategoryInput;

    const existing = await Category.findOne({ createdBy: user._id, name });

    if (existing) {
      return errorResponse(res, "Category already exists", {}, 400);
    }

    const newCategory = await Category.create({
      createdBy: user._id,
      name,
      emoji,
    });

    return successResponse(
      res,
      "Category created successfully",
      newCategory,
      201
    );
  } catch (err: any) {
    return errorResponse(res, "Internal Server Error", {}, 500);
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
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
        "Category ID is Required",
        { message: "No Category ID was provided" },
        400
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(
        res,
        "Invalid Category ID",
        { message: "The provided category ID is not valid" },
        400
      );
    }

    const category = await Category.findOneAndDelete({
      _id: id,
      createdBy: user._id,
    });
    if (!category) {
      return errorResponse(res, "Category not found or unauthorized", {}, 404);
    }

    return successResponse(res, "Category deleted successfully", category, 200);
  } catch (err: any) {
    return errorResponse(res, "Internal Server Error", {}, 500);
  }
};
