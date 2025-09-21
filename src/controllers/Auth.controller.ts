import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.model.js";
import { generateAccessToken } from "../utils/jwt.js";
import { successResponse, errorResponse } from "../utils/response.js";
import {
  registerSchema,
  type RegisterInput,
} from "../schema/RegisterSchema.js";
import { loginSchema, type LoginInput } from "../schema/LoginSchema.js";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, "Validation error", parsed.error.format(), 400);
    }
    const { username, email, password } = parsed.data as RegisterInput;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, "Email already registered", {}, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = generateAccessToken({
      id: newUser._id.toString(),
    });

    return successResponse(
      res,
      "User registered successfully",
      {
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
      },
      201
    );
  } catch (error: any) {
    return errorResponse(
      res,
      "Registration failed",
      { error: error.message },
      500
    );
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, "Validation error", parsed.error.format(), 400);
    }
    const { email, password } = parsed.data as LoginInput;

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, "Invalid email or password", {}, 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, "Invalid email or password", {}, 401);
    }

    const token = generateAccessToken({
      id: user._id.toString(),
    });

    return successResponse(res, "Login successful", {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error: any) {
    return errorResponse(res, "Login failed", { error: error.message }, 500);
  }
};
