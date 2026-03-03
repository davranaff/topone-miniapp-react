import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email("Введите корректный email"),
    username: z.string().min(3, "Минимум 3 символа"),
    password: z.string().min(8, "Минимум 8 символов"),
    confirmPassword: z.string().min(8, "Подтвердите пароль"),
    phoneNumber: z.string().min(7, "Введите телефон"),
    firstName: z.string().min(2, "Введите имя"),
    lastName: z.string().min(2, "Введите фамилию"),
    timezone: z.string().min(2, "Укажите часовой пояс"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
