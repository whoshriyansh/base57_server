import { z } from "zod";

export const createTaskSchema = z.object({
  name: z.string().min(1, { message: "Task name is required" }),
  hours: z.coerce.date().optional(),
  totalHours: z.coerce.date().optional(),
  deadline: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date format for deadline",
    }),
  priority: z.string().optional(),
  category: z.array(z.string()).optional().default([]),
  completed: z.boolean().optional().default(false),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const editTaskSchema = z.object({
  hours: z.coerce.date().optional(),
  totalHours: z.coerce.date().optional(),
});

export type EditTaskInput = z.infer<typeof editTaskSchema>;
