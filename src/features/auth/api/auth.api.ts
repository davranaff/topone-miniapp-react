import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import { ApiError } from "@/shared/api/api-error";
import { mapUserToSession, mapTokens } from "@/features/auth/utils/auth-mappers";
import type {
  ForgotPasswordPayload,
  LoginCredentials,
  RegisterPayload,
  SessionUser,
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
    const response = await apiClient.post(
      endpoints.auth.register,
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
  async getCurrentUser(): Promise<SessionUser> {
    const response = await apiClient.get(endpoints.auth.me);
    return mapUserToSession(unwrap<Record<string, unknown>>(response.data));
  },
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get(endpoints.auth.me);
    return mapApiUser(unwrap<Record<string, unknown>>(response.data));
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
  ensureTokens(tokens: Tokens) {
    if (!tokens.accessToken || !tokens.refreshToken) {
      throw new ApiError("Authentication response did not include tokens");
    }
  },
};
