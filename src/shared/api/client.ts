import axios from "axios";
import { env } from "@/shared/config/env";
import { attachInterceptors } from "@/shared/api/interceptors";

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

attachInterceptors(apiClient);
