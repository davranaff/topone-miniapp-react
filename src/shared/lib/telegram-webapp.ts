import type { TelegramAdapter } from "@/shared/telegram/telegram-types";

export const TELEGRAM_LOGIN_CODE_LENGTH = 6;

const PHONE_PATTERN = /^\+\d{7,15}$/;

export const normalizePhoneNumber = (value: string) => {
  const trimmed = value.trim();
  const digitsWithOptionalPlus = trimmed.replaceAll(/[^\d+]/g, "");

  if (!digitsWithOptionalPlus) {
    return "+";
  }

  const digitsOnly = digitsWithOptionalPlus.replaceAll("+", "");
  return `+${digitsOnly}`;
};

export const isValidPhoneNumber = (value: string) => {
  return PHONE_PATTERN.test(normalizePhoneNumber(value));
};

export const buildTelegramVerificationPath = (phoneNumber: string, botUrl?: string) => {
  const params = new URLSearchParams({
    phone: normalizePhoneNumber(phoneNumber),
  });

  if (botUrl) {
    params.set("bot", botUrl);
  }

  return `/telegram-code-verification?${params.toString()}`;
};

export const openTelegramLink = (url: string) => {
  if (typeof window === "undefined") {
    return false;
  }

  const popup = window.open(url, "_blank", "noopener,noreferrer");

  if (popup) {
    popup.opener = null;
    return true;
  }

  return false;
};

export const getTelegramLoginPath = (isTelegramRuntime: boolean) => {
  return isTelegramRuntime ? "/telegram/init" : "/telegram-login";
};

export const getTelegramInitDataWithRetry = async (
  telegram: Pick<TelegramAdapter, "getInitData">,
  attempts = 5,
) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const initData = telegram.getInitData();

    if (initData) {
      return initData;
    }

    if (attempt < attempts - 1) {
      await new Promise((resolve) => globalThis.setTimeout(resolve, 200 * (attempt + 1)));
    }
  }

  return null;
};
