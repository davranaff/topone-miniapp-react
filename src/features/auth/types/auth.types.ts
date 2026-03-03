import type { UserProfile } from "@/entities/user/types";

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type SessionUser = Pick<
  UserProfile,
  "id" | "email" | "username" | "phoneNumber" | "firstName" | "lastName" | "avatarUrl" | "roles"
>;

export type SessionStatus = "idle" | "loading" | "authenticated" | "anonymous";

export type AuthState = {
  status: SessionStatus;
  user: SessionUser | null;
  tokens: Tokens | null;
  isTelegram: boolean;
  isBootstrapped: boolean;
  error: string | null;
};

export type LoginCredentials = {
  username: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  timezone: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type TelegramAuthPayload = {
  initData: string;
};
