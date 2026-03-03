import { useCallback } from "react";
import { queryClient } from "@/shared/api/query-client";
import { tokenStorage } from "@/shared/auth/token-storage";
import { sessionStorage } from "@/shared/auth/session-storage";
import { authEvents, AUTH_EVENTS } from "@/shared/auth/auth-events";
import { useAuthStore } from "@/features/auth/store/auth.store";

export const useLogout = () => {
  return useCallback(async () => {
    tokenStorage.clear();
    sessionStorage.clear();
    useAuthStore.getState().clearSession();
    authEvents.emit(AUTH_EVENTS.loggedOut);
    await queryClient.clear();
  }, []);
};
