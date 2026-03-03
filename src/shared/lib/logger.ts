export const logger = {
  info: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.info("[TopOne]", ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.warn("[TopOne]", ...args);
    }
  },
  error: (...args: unknown[]) => {
    console.error("[TopOne]", ...args);
  },
};
