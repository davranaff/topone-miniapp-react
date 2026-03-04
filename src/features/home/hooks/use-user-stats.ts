import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";

export type UserStats = {
  xp: number;
  coins: number;
  level: number;
  streak: number;
};

const toNumber = (...values: unknown[]) => {
  for (const value of values) {
    if (value == null) {
      continue;
    }

    const parsed = typeof value === "number" ? value : Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
};

const mapStats = (raw: Record<string, unknown>): UserStats => ({
  xp: toNumber(raw.xp, raw.total_xp, raw.stars),
  coins: toNumber(raw.coins, raw.total_coins),
  level: toNumber(raw.level, raw.current_level),
  streak: toNumber(raw.streak, raw.current_streak, raw.daily_streak_count),
});

export const useUserStats = () => {
  return useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.leaderboard.myStats);
      const data = res.data?.data ?? res.data;
      return mapStats(data as Record<string, unknown>);
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
};
