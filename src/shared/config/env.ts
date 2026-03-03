import { z } from "zod";

export const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_APP_ENV: z.enum(["local", "development", "staging", "production"]),
  VITE_TELEGRAM_BOT_NAME: z.string().optional(),
  VITE_ENABLE_QUERY_DEVTOOLS: z.enum(["true", "false"]).optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

const isTest = import.meta.env.MODE === "test";

export const env = envSchema.parse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? (isTest ? "http://localhost:3000" : undefined),
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV ?? (isTest ? "local" : undefined),
  VITE_TELEGRAM_BOT_NAME: import.meta.env.VITE_TELEGRAM_BOT_NAME,
  VITE_ENABLE_QUERY_DEVTOOLS: import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS,
});
