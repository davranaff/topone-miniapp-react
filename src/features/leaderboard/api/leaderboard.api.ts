import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import type { LeaderboardEntry, LeaderboardType } from "@/entities/leaderboard/types";

const mapEntry = (r: Record<string, unknown>): LeaderboardEntry => ({
  userId: String(r.user_id ?? r.userId ?? r.id ?? ""),
  username: String(r.username ?? ""),
  firstName: r.first_name ? String(r.first_name) : undefined,
  lastName: r.last_name ? String(r.last_name) : undefined,
  avatarUrl: r.avatar_url ? String(r.avatar_url) : undefined,
  rank: Number(r.rank ?? r.position ?? 0),
  value: Number(r.value ?? r.xp ?? r.coins ?? r.referrals ?? 0),
  isCurrentUser: Boolean(r.is_current_user ?? r.isCurrentUser ?? false),
});

const ENDPOINT_MAP: Record<LeaderboardType, string> = {
  xp: endpoints.leaderboard.xp,
  coins: endpoints.leaderboard.coins,
  referrals: endpoints.leaderboard.referrals,
};

export const leaderboardApi = {
  async getLeaderboard(type: LeaderboardType): Promise<LeaderboardEntry[]> {
    const res = await apiClient.get(ENDPOINT_MAP[type]);
    const payload = res.data?.data ?? res.data;
    const items = Array.isArray(payload) ? payload : (payload?.items ?? payload?.leaderboard ?? []);
    return (items as Array<Record<string, unknown>>).map(mapEntry);
  },

  async getMyPosition(type: LeaderboardType): Promise<LeaderboardEntry | null> {
    try {
      const res = await apiClient.get(endpoints.leaderboard.myPositionXp);
      const data = res.data?.data ?? res.data;
      if (!data) return null;
      return mapEntry(data as Record<string, unknown>);
    } catch {
      return null;
    }
  },
};
