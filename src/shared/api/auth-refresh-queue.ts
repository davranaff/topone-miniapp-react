import axios from "axios";
import { endpoints } from "@/shared/api/endpoints";
import { env } from "@/shared/config/env";
import { tokenStorage } from "@/shared/auth/token-storage";
import { sessionStorage } from "@/shared/auth/session-storage";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { authEvents, AUTH_EVENTS } from "@/shared/auth/auth-events";
import type { Tokens } from "@/features/auth/types/auth.types";
import { ApiError } from "@/shared/api/api-error";

let refreshPromise: Promise<Tokens> | null = null;

const refreshClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
});

const normalizeTokens = (payload: unknown): Tokens => {
  const source = payload as { access_token?: string; refresh_token?: string; accessToken?: string; refreshToken?: string };
  const accessToken = source.access_token ?? source.accessToken;
  const refreshToken = source.refresh_token ?? source.refreshToken;

  if (!accessToken || !refreshToken) {
    throw new ApiError("Invalid refresh response");
  }

  return { accessToken, refreshToken };
};

export const refreshAccessToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const tokens = tokenStorage.getTokens();
    if (!tokens?.refreshToken) {
      throw new ApiError("No refresh token");
    }

    const response = await refreshClient.post(endpoints.auth.refresh, undefined, {
      headers: {
        refresh_token: tokens.refreshToken,
      },
    });

    const nextTokens = normalizeTokens((response.data?.data ?? response.data) as unknown);
    tokenStorage.setTokens(nextTokens);
    useAuthStore.getState().updateTokens(nextTokens);

    const user = useAuthStore.getState().user;
    if (user) {
      sessionStorage.setUser(user);
    }

    return nextTokens;
  })()
    .catch((error: unknown) => {
      tokenStorage.clear();
      sessionStorage.clear();
      useAuthStore.getState().clearSession();
      authEvents.emit(AUTH_EVENTS.sessionExpired);
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};
