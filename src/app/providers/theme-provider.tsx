import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { STORAGE_KEYS } from "@/shared/config/constants";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  economyMode: boolean;
  setEconomyMode: (v: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    const stored = window.localStorage.getItem(STORAGE_KEYS.theme);
    return stored === "light" ? "light" : "dark";
  });

  const [economyMode, setEconomyMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("topone.economy-mode") === "1";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (economyMode) {
      root.classList.add("economy");
    } else {
      root.classList.remove("economy");
    }
    window.localStorage.setItem("topone.economy-mode", economyMode ? "1" : "0");
  }, [economyMode]);

  const value = useMemo(
    () => ({ theme, setTheme, economyMode, setEconomyMode }),
    [theme, economyMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
};
