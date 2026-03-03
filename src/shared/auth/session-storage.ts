import { STORAGE_KEYS } from "@/shared/config/constants";
import type { SessionUser } from "@/features/auth/types/auth.types";

export const sessionStorage = {
  getUser(): SessionUser | null {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = window.localStorage.getItem(STORAGE_KEYS.sessionUser);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as SessionUser;
    } catch {
      return null;
    }
  },
  setUser(user: SessionUser) {
    window.localStorage.setItem(STORAGE_KEYS.sessionUser, JSON.stringify(user));
  },
  clear() {
    window.localStorage.removeItem(STORAGE_KEYS.sessionUser);
  },
};
