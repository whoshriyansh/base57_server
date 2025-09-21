import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secretKey = process.env.JWT_SECRET || "yoursupersecretkey";

interface UserPayload {
  id: string;
  email?: string;
  username?: string;
}

export function generateAccessToken(payload: UserPayload): string {
  return jwt.sign(payload, secretKey, { expiresIn: "7d" });
}
