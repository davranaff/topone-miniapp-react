import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3, "Kamida 3 ta belgi kiriting"),
  password: z.string().min(6, "Kamida 6 ta belgi kiriting"),
});

export type LoginSchema = z.infer<typeof loginSchema>;
