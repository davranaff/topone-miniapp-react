import type { ApiResponse } from "@/shared/types/api";

export type ApiEnvelope<T> = ApiResponse<T>;

export type ApiRequestConfig = {
  skipAuth?: boolean;
};
