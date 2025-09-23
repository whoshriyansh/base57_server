import { z } from "zod";

export const createCategoryScheme = z.object({
  name: z.string().min(1, { message: "Category name is required" }),
  emoji: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategoryScheme>;
