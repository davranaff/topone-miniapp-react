import { useCallback } from "react";
import { authApi } from "@/features/auth/api/auth.api";
import { tokenStorage } from "@/shared/auth/token-storage";
import { sessionStorage } from "@/shared/auth/session-storage";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useTelegram } from "@/shared/hooks/use-telegram";

export const useAuthBootstrap = () => {
  const telegram = useTelegram();

  return useCallback(async () => {
    const store = useAuthStore.getState();
    store.beginBootstrap();
    store.setIsTelegram(telegram.isAvailable());

    const tokens = tokenStorage.getTokens();
    const cachedUser = sessionStorage.getUser();

    if (!tokens) {
      store.setAnonymous();
      store.finishBootstrap();
      return;
    }

    if (cachedUser) {
      store.setSession({ user: cachedUser, tokens });
      store.beginBootstrap();
    }

    try {
      const user = await authApi.getCurrentUser();
      sessionStorage.setUser(user);
      store.setSession({ user, tokens });
    } catch {
      tokenStorage.clear();
      sessionStorage.clear();
      store.setAnonymous();
    } finally {
      store.finishBootstrap();
    }
  }, [telegram]);
};
