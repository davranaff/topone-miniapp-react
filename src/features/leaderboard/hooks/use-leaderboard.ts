import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { leaderboardApi } from "@/features/leaderboard/api/leaderboard.api";
import type { LeaderboardPage, LeaderboardType } from "@/entities/leaderboard/types";

export const leaderboardKeys = {
  all: ["leaderboard"] as const,
  list: (type: LeaderboardType) => [...leaderboardKeys.all, "list", type] as const,
  myPosition: (type: LeaderboardType) => [...leaderboardKeys.all, "my-position", type] as const,
};

export const useLeaderboard = (
  type: LeaderboardType,
): UseInfiniteQueryResult<InfiniteData<LeaderboardPage>, Error> => {
  return useInfiniteQuery<LeaderboardPage, Error>({
    queryKey: leaderboardKeys.list(type),
    queryFn: ({ pageParam }) => leaderboardApi.getLeaderboardPage(type, Number(pageParam ?? 1)),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined
    ),
    staleTime: 60_000,
  });
};

export const useMyLeaderboardPosition = (type: LeaderboardType) => {
  return useQuery({
    queryKey: leaderboardKeys.myPosition(type),
    queryFn: () => leaderboardApi.getMyPosition(type),
    staleTime: 60_000,
  });
};
