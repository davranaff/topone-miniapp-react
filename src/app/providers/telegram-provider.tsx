import { useEffect, useMemo, type ReactNode } from "react";
import { createTelegramAdapter } from "@/shared/telegram/telegram-adapter";
import { TelegramContext } from "@/shared/telegram/telegram-context";
import { useAuthStore } from "@/features/auth/store/auth.store";

export const TelegramProvider = ({ children }: { children: ReactNode }) => {
  const adapter = useMemo(() => createTelegramAdapter(), []);

  useEffect(() => {
    const isTelegramRuntime = adapter.isAvailable();
    const root = document.documentElement;

    useAuthStore.getState().setIsTelegram(isTelegramRuntime);

    const resetCssVars = () => {
      root.removeAttribute("data-telegram-runtime");
      root.style.removeProperty("--tg-safe-top");
      root.style.removeProperty("--tg-safe-right");
      root.style.removeProperty("--tg-safe-bottom");
      root.style.removeProperty("--tg-safe-left");
      root.style.removeProperty("--tg-viewport-height");
    };

    const applyTelegramViewport = () => {
      const insets = adapter.getSafeAreaInsets();
      const viewportHeight = adapter.getViewportHeight?.();

      root.setAttribute("data-telegram-runtime", "true");
      root.style.setProperty("--tg-safe-top", `${Math.max(0, Math.round(insets.top))}px`);
      root.style.setProperty("--tg-safe-right", `${Math.max(0, Math.round(insets.right))}px`);
      root.style.setProperty("--tg-safe-bottom", `${Math.max(0, Math.round(insets.bottom))}px`);
      root.style.setProperty("--tg-safe-left", `${Math.max(0, Math.round(insets.left))}px`);
      root.style.setProperty("--tg-viewport-height", `${Math.max(0, Math.round(viewportHeight ?? window.innerHeight))}px`);
    };

    if (!isTelegramRuntime) {
      resetCssVars();
      return;
    }

    adapter.ready();
    adapter.expand();
    adapter.requestFullscreen?.();
    adapter.disableVerticalSwipes();
    applyTelegramViewport();

    const unsubscribeViewport = adapter.onViewportChanged?.(applyTelegramViewport);
    const resyncTimers = [
      window.setTimeout(applyTelegramViewport, 120),
      window.setTimeout(applyTelegramViewport, 420),
      window.setTimeout(applyTelegramViewport, 1200),
    ];

    window.addEventListener("resize", applyTelegramViewport);

    return () => {
      unsubscribeViewport?.();
      window.removeEventListener("resize", applyTelegramViewport);
      resyncTimers.forEach((timerId) => window.clearTimeout(timerId));
      resetCssVars();
    };
  }, [adapter]);

  return <TelegramContext.Provider value={adapter}>{children}</TelegramContext.Provider>;
};
