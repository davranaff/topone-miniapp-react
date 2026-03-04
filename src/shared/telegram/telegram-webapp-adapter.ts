import { TELEGRAM_DEFAULT_TOP_INSET } from "@/shared/config/constants";
import type { TelegramAdapter, TelegramInsets } from "@/shared/telegram/telegram-types";

export class TelegramWebAppAdapter implements TelegramAdapter {
  private get webApp() {
    return window.Telegram?.WebApp;
  }

  isAvailable() {
    const initData = this.webApp?.initData;
    return typeof initData === "string" && initData.trim().length > 0;
  }

  ready() {
    this.webApp?.ready();
  }

  expand() {
    this.webApp?.expand();
  }

  requestFullscreen() {
    this.webApp?.requestFullscreen?.();
  }

  getInitData() {
    const initData = this.webApp?.initData;
    return initData && initData.trim().length > 0 ? initData : null;
  }

  getSafeAreaInsets(): TelegramInsets {
    const insets = this.webApp?.contentSafeAreaInset ?? this.webApp?.safeAreaInset;

    if (!insets) {
      return { top: TELEGRAM_DEFAULT_TOP_INSET, right: 0, bottom: 0, left: 0 };
    }

    return {
      top: insets.top || TELEGRAM_DEFAULT_TOP_INSET,
      right: insets.right ?? 0,
      bottom: insets.bottom ?? 0,
      left: insets.left ?? 0,
    };
  }

  getViewportHeight() {
    const height = this.webApp?.viewportStableHeight ?? this.webApp?.viewportHeight;

    if (typeof height !== "number" || Number.isNaN(height) || height <= 0) {
      return null;
    }

    return height;
  }

  onViewportChanged(callback: () => void) {
    this.webApp?.onEvent?.("viewportChanged", callback);

    return () => {
      this.webApp?.offEvent?.("viewportChanged", callback);
    };
  }

  disableVerticalSwipes() {
    this.webApp?.disableVerticalSwipes?.();
  }

  enableClosingConfirmation(enabled: boolean) {
    if (enabled) {
      this.webApp?.enableClosingConfirmation?.();
      return;
    }

    this.webApp?.disableClosingConfirmation?.();
  }
}
