import { useEffect, useMemo, type ReactNode } from "react";
import { createTelegramAdapter } from "@/shared/telegram/telegram-adapter";
import { TelegramContext } from "@/shared/telegram/telegram-context";
import { useAuthStore } from "@/features/auth/store/auth.store";

export const TelegramProvider = ({ children }: { children: ReactNode }) => {
  const adapter = useMemo(() => createTelegramAdapter(), []);

  useEffect(() => {
    useAuthStore.getState().setIsTelegram(adapter.isAvailable());

    if (adapter.isAvailable()) {
      adapter.ready();
      adapter.expand();
      adapter.disableVerticalSwipes();
    }
  }, [adapter]);

  return <TelegramContext.Provider value={adapter}>{children}</TelegramContext.Provider>;
};
