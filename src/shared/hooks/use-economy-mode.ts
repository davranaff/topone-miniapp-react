import { useTheme } from "@/app/providers/theme-provider";

export const useEconomyMode = () => {
  const { economyMode, setEconomyMode } = useTheme();
  return { economyMode, setEconomyMode, toggle: () => setEconomyMode(!economyMode) };
};
