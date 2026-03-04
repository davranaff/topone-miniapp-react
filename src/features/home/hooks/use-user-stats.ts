import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import { ApiError } from "@/shared/api/api-error";
import { useAuthStore } from "@/features/auth/store/auth.store";

export type UserStats = {
  xp: number;
  coins: number;
  level: number;
  streak: number;
};

const asRecord = (value: unknown): Record<string, unknown> | null => {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
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

const mapStats = (raw: Record<string, unknown>): UserStats => {
  const xp = asRecord(raw.xp);
  const coins = asRecord(raw.coins);
  const level = asRecord(raw.level);
  const streak = asRecord(raw.daily_streak);

  return {
    xp: toNumber(
      xp?.total,
      xp?.total_xp,
      raw.total_xp,
      raw.xp,
      raw.stars,
    ),
    coins: toNumber(
      coins?.total,
      coins?.total_coins,
      raw.total_coins,
      raw.coins,
    ),
    level: toNumber(
      level?.current,
      level?.current_level,
      level?.level,
      raw.level,
      raw.current_level,
    ),
    streak: toNumber(
      streak?.current_streak,
      streak?.streak_count,
      raw.current_streak,
      raw.daily_streak_count,
      raw.streak,
    ),
  };
};

const EMPTY_STATS: UserStats = {
  xp: 0,
  coins: 0,
  level: 0,
  streak: 0,
};

export const useUserStats = () => {
  const status = useAuthStore((state) => state.status);
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);

  return useQuery({
    queryKey: ["user-stats"],
    enabled: isBootstrapped && status === "authenticated",
    queryFn: async () => {
      try {
        const res = await apiClient.get(endpoints.leaderboard.myStats);
        const data = (res.data?.data ?? res.data) as Record<string, unknown>;
        return mapStats(data);
      } catch (error) {
        if (error instanceof ApiError && error.statusCode === 403) {
          return EMPTY_STATS;
        }

        throw error;
      }
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
    retry: 1,
  });
};
