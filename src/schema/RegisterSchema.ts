import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(5, { message: "Username is too short" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
