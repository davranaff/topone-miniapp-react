import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import type { Achievement, UserAchievement } from "@/entities/achievement/types";

const mapAchievement = (r: Record<string, unknown>): Achievement => ({
  id: String(r.id ?? ""),
  title: String(r.title ?? r.name ?? ""),
  description: String(r.description ?? ""),
  iconKey: r.icon_key ? String(r.icon_key) : undefined,
  category: String(r.category ?? "general"),
  targetValue: Number(r.target_value ?? r.targetValue ?? 1),
  rewardXp: Number(r.reward_xp ?? r.rewardXp ?? 0),
  rewardCoins: Number(r.reward_coins ?? r.rewardCoins ?? 0),
  isLocked: Boolean(r.is_locked ?? false),
});

const mapUserAchievement = (r: Record<string, unknown>): UserAchievement => ({
  ...mapAchievement(r),
  currentValue: Number(r.current_value ?? r.currentValue ?? 0),
  progress: Number(r.progress ?? 0),
  isEarned: Boolean(r.is_earned ?? r.isEarned ?? false),
  isClaimed: Boolean(r.is_claimed ?? r.isClaimed ?? false),
  earnedAt: r.earned_at ? String(r.earned_at) : undefined,
  claimedAt: r.claimed_at ? String(r.claimed_at) : undefined,
});

export const achievementsApi = {
  async getCatalog(): Promise<Achievement[]> {
    const res = await apiClient.get(endpoints.achievements.catalog);
    const payload = res.data?.data ?? res.data;
    const items = Array.isArray(payload) ? payload : (payload?.items ?? []);
    return (items as Array<Record<string, unknown>>).map(mapAchievement);
  },

  async getMyAchievements(): Promise<UserAchievement[]> {
    const res = await apiClient.get(endpoints.achievements.my);
    const payload = res.data?.data ?? res.data;
    const items = Array.isArray(payload) ? payload : (payload?.items ?? []);
    return (items as Array<Record<string, unknown>>).map(mapUserAchievement);
  },

  async getEarned(): Promise<UserAchievement[]> {
    const res = await apiClient.get(endpoints.achievements.earned);
    const payload = res.data?.data ?? res.data;
    const items = Array.isArray(payload) ? payload : (payload?.items ?? []);
    return (items as Array<Record<string, unknown>>).map(mapUserAchievement);
  },

  async claimAchievement(id: string): Promise<void> {
    await apiClient.post(endpoints.achievements.claim(id));
  },
};
