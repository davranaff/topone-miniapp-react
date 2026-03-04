export const runtime = {
  isBrowser: typeof window !== "undefined",
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};

export const isTelegramRuntime = (): boolean => {
  if (!runtime.isBrowser) {
    return false;
  }

  const initData = window.Telegram?.WebApp?.initData;
  return typeof initData === "string" && initData.trim().length > 0;
};
