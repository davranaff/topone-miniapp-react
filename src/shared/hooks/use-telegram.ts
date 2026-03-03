import { useContext } from "react";
import { TelegramContext } from "@/shared/telegram/telegram-context";

export const useTelegram = () => {
  const adapter = useContext(TelegramContext);

  if (!adapter) {
    throw new Error("useTelegram must be used inside TelegramProvider");
  }

  return adapter;
};
