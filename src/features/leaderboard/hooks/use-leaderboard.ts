import { useQuery } from "@tanstack/react-query";
import { leaderboardApi } from "@/features/leaderboard/api/leaderboard.api";
import type { LeaderboardType } from "@/entities/leaderboard/types";

export const leaderboardKeys = {
  all: ["leaderboard"] as const,
  list: (type: LeaderboardType) => [...leaderboardKeys.all, type] as const,
};

export const useLeaderboard = (type: LeaderboardType) => {
  return useQuery({
    queryKey: leaderboardKeys.list(type),
    queryFn: () => leaderboardApi.getLeaderboard(type),
    staleTime: 60_000,
  });
};
