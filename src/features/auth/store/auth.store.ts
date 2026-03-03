import { create } from "zustand";
import type { AuthState, SessionUser, Tokens } from "@/features/auth/types/auth.types";

type AuthActions = {
  beginBootstrap: () => void;
  finishBootstrap: () => void;
  setSession: (payload: { user: SessionUser; tokens: Tokens }) => void;
  setAnonymous: () => void;
  updateTokens: (tokens: Tokens) => void;
  clearSession: () => void;
  setIsTelegram: (value: boolean) => void;
  setError: (value: string | null) => void;
};

const initialState: AuthState = {
  status: "idle",
  user: null,
  tokens: null,
  isTelegram: false,
  isBootstrapped: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  ...initialState,
  beginBootstrap: () => set((state) => ({ ...state, status: "loading", error: null })),
  finishBootstrap: () => set((state) => ({ ...state, isBootstrapped: true })),
  setSession: ({ user, tokens }) =>
    set((state) => ({
      ...state,
      status: "authenticated",
      user,
      tokens,
      error: null,
      isBootstrapped: true,
    })),
  setAnonymous: () =>
    set((state) => ({
      ...state,
      status: "anonymous",
      user: null,
      tokens: null,
      error: null,
      isBootstrapped: true,
    })),
  updateTokens: (tokens) => set((state) => ({ ...state, tokens })),
  clearSession: () =>
    set((state) => ({
      ...state,
      status: "anonymous",
      user: null,
      tokens: null,
      error: null,
      isBootstrapped: true,
    })),
  setIsTelegram: (value) => set((state) => ({ ...state, isTelegram: value })),
  setError: (value) => set((state) => ({ ...state, error: value })),
}));
