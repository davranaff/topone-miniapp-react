import { ApiError } from "@/shared/api/api-error";

export const hasApiStatus = (error: unknown, statusCode: number) =>
  error instanceof ApiError && error.statusCode === statusCode;
