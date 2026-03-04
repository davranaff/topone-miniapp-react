import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  disableTelegramAuthFallback,
  enableTelegramAuthFallback,
  isTelegramAuthFallbackEnabled,
} from "@/features/auth/utils/telegram-fallback";
import { useShallow } from "zustand/react/shallow";

const TELEGRAM_GUEST_REDIRECT_PATHS = new Set([
  "/login",
  "/login-form",
  "/register",
  "/forgot-password",
]);

export const PublicRoute = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { isBootstrapped, status, isTelegram } = useAuthStore(
    useShallow((state) => ({
      isBootstrapped: state.isBootstrapped,
      status: state.status,
      isTelegram: state.isTelegram,
    })),
  );

  if (isBootstrapped && status === "authenticated") {
    disableTelegramAuthFallback();
    return <Navigate to="/home" replace />;
  }

  if (isBootstrapped && status !== "authenticated" && isTelegram) {
    const params = new URLSearchParams(location.search);
    const hasFallbackFlag = params.has("fallback");
    const fallbackEnabled = hasFallbackFlag || isTelegramAuthFallbackEnabled();

    if (hasFallbackFlag) {
      enableTelegramAuthFallback();
    }

    if (TELEGRAM_GUEST_REDIRECT_PATHS.has(location.pathname) && !fallbackEnabled) {
      return <Navigate to="/telegram/init" replace />;
    }
  }

  return children;
};
