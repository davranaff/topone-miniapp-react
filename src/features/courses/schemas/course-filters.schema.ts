import { z } from "zod";

export const courseFiltersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  size: z.coerce.number().min(1).max(50).default(12),
  categoryId: z.string().optional(),
});
