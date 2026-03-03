import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import { mapTokens } from "@/features/auth/utils/auth-mappers";
import type { TelegramAuthPayload, Tokens } from "@/features/auth/types/auth.types";

export const telegramAuthApi = {
  async authenticate(payload: TelegramAuthPayload): Promise<Tokens> {
    const response = await apiClient.post(
      endpoints.auth.telegramAuth,
      payload,
      { skipAuth: true },
    );

    return mapTokens((response.data?.data ?? response.data) as Record<string, unknown>);
  },
};
