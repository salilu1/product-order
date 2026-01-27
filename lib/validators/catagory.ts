import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();
