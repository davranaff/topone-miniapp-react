import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth.api";
import { tokenStorage } from "@/shared/auth/token-storage";
import { sessionStorage } from "@/shared/auth/session-storage";
import { useAuthStore } from "@/features/auth/store/auth.store";

export const useLogin = () => {
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (tokens) => {
      authApi.ensureTokens(tokens);
      tokenStorage.setTokens(tokens);
      const user = await authApi.getCurrentUser();
      sessionStorage.setUser(user);
      useAuthStore.getState().setSession({ user, tokens });
    },
  });
};
