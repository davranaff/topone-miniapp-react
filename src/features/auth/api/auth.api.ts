import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import { ApiError } from "@/shared/api/api-error";
import { mapUserToSession, mapTokens } from "@/features/auth/utils/auth-mappers";
import type {
  ForgotPasswordPayload,
  LoginCredentials,
  RegisterPayload,
  SessionUser,
  SubscriptionStatus,
  TelegramCodeVerificationPayload,
  TelegramCodeVerificationResult,
  TelegramLoginRequestPayload,
  TelegramLoginRequestResult,
  Tokens,
} from "@/features/auth/types/auth.types";
import type { UserProfile } from "@/entities/user/types";
import { mapApiUser } from "@/entities/user/model";

const unwrap = <T>(payload: { data?: T } | T): T => {
  return ((payload as { data?: T }).data ?? payload) as T;
};

export const authApi = {
  async login(payload: LoginCredentials): Promise<Tokens> {
    const response = await apiClient.post(endpoints.auth.login, payload, { skipAuth: true });
    return mapTokens(unwrap<Record<string, unknown>>(response.data));
  },
  async register(payload: RegisterPayload): Promise<UserProfile> {
    const referralSuffix = payload.referralCode?.trim()
      ? `?referral=${encodeURIComponent(payload.referralCode.trim())}`
      : "";
    const response = await apiClient.post(
      `${endpoints.auth.register}${referralSuffix}`,
      {
        email: payload.email,
        username: payload.username,
        password: payload.password,
        confirm_password: payload.confirmPassword,
        phone_number: payload.phoneNumber,
        first_name: payload.firstName,
        last_name: payload.lastName,
        timezone: payload.timezone,
      },
      { skipAuth: true },
    );

    return mapApiUser(unwrap<Record<string, unknown>>(response.data));
  },
  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    await apiClient.post(endpoints.auth.forgotPassword, payload, { skipAuth: true });
  },
  async requestTelegramLogin(
    payload: TelegramLoginRequestPayload,
  ): Promise<TelegramLoginRequestResult> {
    const response = await apiClient.post(
      endpoints.auth.requestLoginByPhone,
      { phone_number: payload.phoneNumber },
      { skipAuth: true },
    );

    const data = unwrap<Record<string, unknown>>(response.data);
    const botUrl = String(data.bot_url ?? "");

    if (!botUrl) {
      throw new ApiError("Telegram bot URL was not returned");
    }

    return {
      botUrl,
      expiresAt: data.expires_at ? String(data.expires_at) : undefined,
    };
  },
  async verifyTelegramCode(
    payload: TelegramCodeVerificationPayload,
  ): Promise<TelegramCodeVerificationResult> {
    const response = await apiClient.post(
      endpoints.auth.verifyLoginCode,
      {
        phone_number: payload.phoneNumber,
        code: payload.code,
      },
      { skipAuth: true },
    );

    const data = unwrap<Record<string, unknown>>(response.data);
    const user = data.user && typeof data.user === "object"
      ? mapUserToSession(data.user as Record<string, unknown>)
      : undefined;

    return {
      tokens: mapTokens(data),
      user,
    };
  },
  async getCurrentUser(): Promise<SessionUser> {
    const response = await apiClient.get(endpoints.auth.me);
    return mapUserToSession(unwrap<Record<string, unknown>>(response.data));
  },
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get(endpoints.auth.me);
    return mapApiUser(unwrap<Record<string, unknown>>(response.data));
  },
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await apiClient.get(endpoints.auth.subscriptionStatus);
    const data = unwrap<Record<string, unknown>>(response.data);
    const plan = data.plan && typeof data.plan === "object"
      ? (data.plan as Record<string, unknown>)
      : undefined;

    return {
      subscribed: Boolean(data.subscribed),
      isPremium: Boolean(data.is_premium ?? data.isPremium),
      status: data.status ? String(data.status) : undefined,
      purchaseDate: data.purchase_date ? String(data.purchase_date) : undefined,
      subscriptionEndDate: data.subscription_end_date
        ? String(data.subscription_end_date)
        : undefined,
      lastPurchaseTime: data.last_purchase_time
        ? String(data.last_purchase_time)
        : undefined,
      amount: typeof data.amount === "number"
        ? data.amount
        : Number(data.amount ?? 0),
      currency: data.currency ? String(data.currency) : undefined,
      currencySymbol: data.currency_symbol ? String(data.currency_symbol) : undefined,
      paymentMethod: data.payment_method ? String(data.payment_method) : undefined,
      autoRenew: typeof data.auto_renew === "boolean" ? data.auto_renew : undefined,
      hasNextSubscription: typeof data.has_next_subscription === "boolean"
        ? data.has_next_subscription
        : undefined,
      durationMonths: typeof data.duration_months === "number"
        ? data.duration_months
        : Number(data.duration_months ?? 0),
      planId: plan?.id ? String(plan.id) : undefined,
      planName: plan?.name ? String(plan.name) : undefined,
      planIsTrial: typeof plan?.is_trial === "boolean"
        ? plan.is_trial
        : typeof plan?.isTrial === "boolean"
          ? plan.isTrial
          : undefined,
      planPrice: typeof plan?.price === "number"
        ? plan.price
        : Number(plan?.price ?? 0),
    };
  },
  async updateProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
    const response = await apiClient.patch(endpoints.profile.me, {
      email: payload.email,
      username: payload.username,
      phone_number: payload.phoneNumber,
      first_name: payload.firstName,
      last_name: payload.lastName,
      timezone: payload.timezone,
    });

    return mapApiUser(unwrap<Record<string, unknown>>(response.data));
  },
  async telegramWebAppAuth(initData: string): Promise<Tokens> {
    const response = await apiClient.post(
      endpoints.auth.telegramAuth,
      { initData },
      { skipAuth: true },
    );
    return mapTokens(unwrap<Record<string, unknown>>(response.data));
  },
  ensureTokens(tokens: Tokens) {
    if (!tokens.accessToken || !tokens.refreshToken) {
      throw new ApiError("Authentication response did not include tokens");
    }
  },
};
