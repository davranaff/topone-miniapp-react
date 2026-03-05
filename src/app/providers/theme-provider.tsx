import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { STORAGE_KEYS } from "@/shared/config/constants";

type ThemeMode = "light" | "dark";
type ThemePreferences = {
  theme: ThemeMode;
  glassEffectEnabled: boolean;
  economyMode: boolean;
};

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  glassEffectEnabled: boolean;
  setGlassEffectEnabled: (v: boolean) => void;
  economyMode: boolean;
  setEconomyMode: (v: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const DEFAULT_THEME_PREFERENCES: ThemePreferences = {
  theme: "dark",
  glassEffectEnabled: true,
  economyMode: false,
};

const readThemePreferences = (): ThemePreferences => {
  if (typeof window === "undefined") {
    return DEFAULT_THEME_PREFERENCES;
  }

  return {
    theme: "dark",
    economyMode: window.localStorage.getItem(STORAGE_KEYS.economyMode) === "1",
    glassEffectEnabled: window.localStorage.getItem(STORAGE_KEYS.glassEffect) !== "0",
  };
};

const applyThemePreferences = (root: HTMLElement, preferences: ThemePreferences) => {
  root.dataset.theme = "dark";
  root.dataset.glass = preferences.glassEffectEnabled ? "on" : "off";
  root.classList.toggle("economy-mode", preferences.economyMode);
  root.classList.toggle("glass-off", !preferences.glassEffectEnabled);
};

const persistThemePreferences = (preferences: ThemePreferences) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.theme, "dark");
  window.localStorage.setItem(STORAGE_KEYS.economyMode, preferences.economyMode ? "1" : "0");
  window.localStorage.setItem(STORAGE_KEYS.glassEffect, preferences.glassEffectEnabled ? "1" : "0");
};

const initialThemePreferences = (() => {
  const preferences = readThemePreferences();

  if (typeof document !== "undefined") {
    applyThemePreferences(document.documentElement, preferences);
  }

  return preferences;
})();

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme: ThemeMode = "dark";
  const setTheme = useCallback((nextTheme: ThemeMode) => {
    void nextTheme;
    // Theme switching is temporarily disabled. App runs in dark mode only.
  }, []);
  const [economyMode, setEconomyMode] = useState<boolean>(initialThemePreferences.economyMode);
  const [glassEffectEnabled, setGlassEffectEnabled] = useState<boolean>(initialThemePreferences.glassEffectEnabled);

  useEffect(() => {
    const preferences = { theme: "dark" as ThemeMode, economyMode, glassEffectEnabled };
    applyThemePreferences(document.documentElement, preferences);
    persistThemePreferences(preferences);
  }, [economyMode, glassEffectEnabled]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      glassEffectEnabled,
      setGlassEffectEnabled,
      economyMode,
      setEconomyMode,
    }),
    [theme, setTheme, glassEffectEnabled, economyMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
};
