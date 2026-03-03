import { createContext } from "react";
import type { TelegramAdapter } from "@/shared/telegram/telegram-types";

export const TelegramContext = createContext<TelegramAdapter | null>(null);
