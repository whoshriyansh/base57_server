import { z } from "zod";

const colorEnum = z.enum([
  "#f74242",
  "#1cfbad",
  "#1a8afa",
  "#f8f8f8",
  "#d27cf7",
  "#fa9828",
  "#f7d61b",
  "#f750b7",
]);

export const createPriorityScheme = z.object({
  name: z.string().min(1, { message: "Priority name is required" }),
  color: colorEnum.default("#f74242").optional(),
});

export type CreatePriorityInput = z.infer<typeof createPriorityScheme>;
