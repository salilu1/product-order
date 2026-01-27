import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  categoryId: z.string().uuid(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updateProductSchema = createProductSchema.partial();
