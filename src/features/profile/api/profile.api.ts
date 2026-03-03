import { authApi } from "@/features/auth/api/auth.api";

export const profileApi = {
  getMe: authApi.getProfile,
  updateMe: authApi.updateProfile,
};
