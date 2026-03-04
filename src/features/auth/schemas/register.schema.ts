import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email("Email noto'g'ri"),
    username: z.string().min(3, "Kamida 3 ta belgi"),
    password: z.string().min(8, "Kamida 8 ta belgi"),
    confirmPassword: z.string().min(8, "Parolni tasdiqlang"),
    phoneNumber: z.string().min(7, "Telefon raqamini kiriting"),
    firstName: z.string().min(2, "Ismni kiriting"),
    lastName: z.string().min(2, "Familiyani kiriting"),
    referralCode: z.string().optional(),
    timezone: z.string().min(2, "Vaqt zonasini kiriting"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Parollar mos kelmadi",
    path: ["confirmPassword"],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
