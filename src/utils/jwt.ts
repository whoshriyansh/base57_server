import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { Request, Response, NextFunction } from "express";
import { User } from "../models/User.model.js";

dotenv.config();

const secretKey = process.env.JWT_SECRET || "yoursupersecretkey";

interface UserPayload {
  id: string;
}
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Invalid Authorization header format" });
  }

  const token = authHeader.substring(7);

  try {
    const verifiedToken = jwt.verify(token, secretKey) as UserPayload;

    const user = await User.findById(verifiedToken.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export function generateAccessToken(payload: UserPayload): string {
  return jwt.sign(payload, secretKey, { expiresIn: "7d" });
}
