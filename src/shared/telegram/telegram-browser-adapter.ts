import type { TelegramAdapter, TelegramInsets } from "@/shared/telegram/telegram-types";

const zeroInsets: TelegramInsets = { top: 0, right: 0, bottom: 0, left: 0 };

export class TelegramBrowserAdapter implements TelegramAdapter {
  isAvailable() {
    return false;
  }

  ready() {}

  expand() {}

  getInitData() {
    return null;
  }

  getSafeAreaInsets() {
    return zeroInsets;
  }

  disableVerticalSwipes() {}

  enableClosingConfirmation(_: boolean) {}
}
