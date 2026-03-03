import { STORAGE_KEYS } from "@/shared/config/constants";

export type StoredTokens = {
  accessToken: string;
  refreshToken: string;
};

export const tokenStorage = {
  getTokens(): StoredTokens | null {
    if (typeof window === "undefined") {
      return null;
    }

    const accessToken = window.localStorage.getItem(STORAGE_KEYS.accessToken);
    const refreshToken = window.localStorage.getItem(STORAGE_KEYS.refreshToken);

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  },
  setTokens(tokens: StoredTokens) {
    window.localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
    window.localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
  },
  clear() {
    window.localStorage.removeItem(STORAGE_KEYS.accessToken);
    window.localStorage.removeItem(STORAGE_KEYS.refreshToken);
  },
};
