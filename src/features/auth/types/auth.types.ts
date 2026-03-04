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
  referralCode?: string;
  timezone: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type TelegramAuthPayload = {
  initData: string;
};

export type TelegramLoginRequestPayload = {
  phoneNumber: string;
};

export type TelegramLoginRequestResult = {
  botUrl: string;
  expiresAt?: string;
};

export type TelegramCodeVerificationPayload = {
  phoneNumber: string;
  code: string;
};

export type TelegramCodeVerificationResult = {
  tokens: Tokens;
  user?: SessionUser;
};

export type SubscriptionStatus = {
  subscribed: boolean;
  isPremium: boolean;
  status?: string;
  purchaseDate?: string;
  subscriptionEndDate?: string;
  lastPurchaseTime?: string;
  amount?: number;
  currency?: string;
  currencySymbol?: string;
  paymentMethod?: string;
  autoRenew?: boolean;
  hasNextSubscription?: boolean;
  planId?: string;
  planName?: string;
  planIsTrial?: boolean;
  planPrice?: number;
  durationMonths?: number;
};
