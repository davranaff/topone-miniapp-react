import { useQuery } from "@tanstack/react-query";
import { leaderboardApi } from "@/features/leaderboard/api/leaderboard.api";
import type { LeaderboardType } from "@/entities/leaderboard/types";

export const leaderboardKeys = {
  all: ["leaderboard"] as const,
  list: (type: LeaderboardType) => [...leaderboardKeys.all, type] as const,
  myPosition: (type: LeaderboardType) => [...leaderboardKeys.all, type, "position"] as const,
};

export const useLeaderboard = (type: LeaderboardType) => {
  return useQuery({
    queryKey: leaderboardKeys.list(type),
    queryFn: () => leaderboardApi.getLeaderboard(type),
    staleTime: 60_000,
  });
};

export const useMyPosition = (type: LeaderboardType) => {
  return useQuery({
    queryKey: leaderboardKeys.myPosition(type),
    queryFn: () => leaderboardApi.getMyPosition(type),
    staleTime: 60_000,
  });
};
