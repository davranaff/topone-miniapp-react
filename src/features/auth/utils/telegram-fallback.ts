const TELEGRAM_AUTH_FALLBACK_KEY = "tg_auth_fallback";

const canUseSessionStorage = () => {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
};

export const enableTelegramAuthFallback = () => {
  if (!canUseSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.setItem(TELEGRAM_AUTH_FALLBACK_KEY, "1");
  } catch {
    // ignore storage failures in restricted runtimes
  }
};

export const disableTelegramAuthFallback = () => {
  if (!canUseSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.removeItem(TELEGRAM_AUTH_FALLBACK_KEY);
  } catch {
    // ignore storage failures in restricted runtimes
  }
};

export const isTelegramAuthFallbackEnabled = () => {
  if (!canUseSessionStorage()) {
    return false;
  }

  try {
    return window.sessionStorage.getItem(TELEGRAM_AUTH_FALLBACK_KEY) === "1";
  } catch {
    return false;
  }
};
