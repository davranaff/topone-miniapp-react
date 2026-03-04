import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "@/shared/auth/token-storage";
import { refreshAccessToken } from "@/shared/api/auth-refresh-queue";
import { endpoints } from "@/shared/api/endpoints";
import { ApiError } from "@/shared/api/api-error";

type RetryableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipAuth?: boolean;
};

const PUBLIC_ENDPOINTS = new Set<string>([
  endpoints.auth.login,
  endpoints.auth.register,
  endpoints.auth.forgotPassword,
  endpoints.auth.refresh,
  endpoints.auth.requestLoginByPhone,
  endpoints.auth.verifyLoginCode,
  endpoints.auth.telegramAuth,
]);

export const attachInterceptors = (client: AxiosInstance) => {
  client.interceptors.request.use((config: RetryableConfig) => {
    if (config.skipAuth || PUBLIC_ENDPOINTS.has(config.url ?? "")) {
      return config;
    }

    const tokens = tokenStorage.getTokens();
    if (tokens?.accessToken) {
      config.headers.set("Authorization", `Bearer ${tokens.accessToken}`);
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ detail?: string; message?: string }>) => {
      const originalRequest = error.config as RetryableConfig | undefined;
      const statusCode = error.response?.status;

      if (!originalRequest) {
        throw new ApiError("Network request failed", statusCode, error.response?.data);
      }

      if (
        statusCode === 401 &&
        !originalRequest._retry &&
        !PUBLIC_ENDPOINTS.has(originalRequest.url ?? "") &&
        !originalRequest.skipAuth
      ) {
        originalRequest._retry = true;

        const tokens = await refreshAccessToken();
        originalRequest.headers.set("Authorization", `Bearer ${tokens.accessToken}`);

        return client(originalRequest);
      }

      const message =
        error.response?.data?.message ??
        error.response?.data?.detail ??
        error.message ??
        "Request failed";

      throw new ApiError(message, statusCode, error.response?.data);
    },
  );
};
