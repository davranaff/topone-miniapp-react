import { TELEGRAM_DEFAULT_TOP_INSET } from "@/shared/config/constants";
import type { TelegramAdapter, TelegramInsets } from "@/shared/telegram/telegram-types";

export class TelegramWebAppAdapter implements TelegramAdapter {
  private get webApp() {
    return window.Telegram?.WebApp;
  }

  isAvailable() {
    return Boolean(this.webApp);
  }

  ready() {
    this.webApp?.ready();
  }

  expand() {
    this.webApp?.expand();
  }

  getInitData() {
    return this.webApp?.initData ?? null;
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
