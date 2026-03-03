import { z } from "zod";

export const profileSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  phoneNumber: z.string().min(7),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  timezone: z.string().min(2),
});

export type ProfileSchema = z.infer<typeof profileSchema>;
