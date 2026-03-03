import type { TelegramAdapter } from "@/shared/telegram/telegram-types";
import { TelegramBrowserAdapter } from "@/shared/telegram/telegram-browser-adapter";
import { TelegramWebAppAdapter } from "@/shared/telegram/telegram-webapp-adapter";
import { isTelegramRuntime } from "@/shared/config/runtime";

export const createTelegramAdapter = (): TelegramAdapter => {
  if (isTelegramRuntime()) {
    return new TelegramWebAppAdapter();
  }

  return new TelegramBrowserAdapter();
};
