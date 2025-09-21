import { z } from "zod";

export const createCategoryScheme = z.object({
  name: z.string().min(1, { message: "Category name is required" }),
  emoji: z
    .string()
    .min(1, { message: "1 Emoji Atleast" })
    .max(1, { message: "Only 1 Emoji Allowed" })
    .optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategoryScheme>;
