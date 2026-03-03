import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";

export type UserStats = {
  xp: number;
  coins: number;
  level: number;
  streak: number;
};

const mapStats = (raw: Record<string, unknown>): UserStats => ({
  xp: Number(raw.xp ?? raw.total_xp ?? raw.stars ?? 0),
  coins: Number(raw.coins ?? raw.total_coins ?? 0),
  level: Number(raw.level ?? raw.current_level ?? 0),
  streak: Number(raw.streak ?? raw.current_streak ?? 0),
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
