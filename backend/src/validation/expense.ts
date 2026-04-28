import { z } from "zod";

export const expenseCreateSchema = z.object({
  amount: z.string().min(1),
  category: z.string().min(1).max(50),
  description: z.string().min(1).max(200),
  date: z.string().datetime()
});