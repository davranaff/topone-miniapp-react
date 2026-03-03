import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3, "Введите логин или email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export type LoginSchema = z.infer<typeof loginSchema>;
