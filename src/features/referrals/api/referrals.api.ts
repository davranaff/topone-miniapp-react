import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import type { ReferralStats, ReferralHistoryItem, ReferralLevel } from "@/entities/referral/types";

const mapStats = (r: Record<string, unknown>): ReferralStats => ({
  totalReferrals: Number(r.total_referrals ?? r.totalReferrals ?? 0),
  activeReferrals: Number(r.active_referrals ?? r.activeReferrals ?? 0),
  totalEarnings: Number(r.total_earnings ?? r.totalEarnings ?? 0),
  availableBalance: Number(r.available_balance ?? r.availableBalance ?? 0),
  referralCode: String(r.referral_code ?? r.referralCode ?? ""),
  referralUrl: String(r.referral_url ?? r.referralUrl ?? ""),
});

const mapHistoryItem = (r: Record<string, unknown>): ReferralHistoryItem => {
  const user = r.user as Record<string, unknown> | undefined;
  return {
    id: String(r.id ?? ""),
    username: String(r.username ?? user?.username ?? ""),
    joinedAt: String(r.joined_at ?? r.joinedAt ?? r.created_at ?? ""),
    isActive: Boolean(r.is_active ?? r.isActive ?? true),
    earnedAmount: Number(r.earned_amount ?? r.earnedAmount ?? 0),
  };
};

const mapLevel = (r: Record<string, unknown>): ReferralLevel => ({
  id: String(r.id ?? ""),
  level: Number(r.level ?? 0),
  name: String(r.name ?? ""),
  minReferrals: Number(r.min_referrals ?? r.minReferrals ?? 0),
  rewardPercentage: Number(r.reward_percentage ?? r.rewardPercentage ?? 0),
  isUnlocked: Boolean(r.is_unlocked ?? r.isUnlocked ?? false),
});

export const referralsApi = {
  async getStats(): Promise<ReferralStats> {
    const res = await apiClient.get(endpoints.referrals.stats);
    const data = res.data?.data ?? res.data;
    return mapStats(data as Record<string, unknown>);
  },

  async getHistory(): Promise<ReferralHistoryItem[]> {
    const res = await apiClient.get(endpoints.referrals.history);
    const payload = res.data?.data ?? res.data;
    const items = Array.isArray(payload) ? payload : (payload?.items ?? []);
    return (items as Array<Record<string, unknown>>).map(mapHistoryItem);
  },

  async getLevels(): Promise<ReferralLevel[]> {
    const res = await apiClient.get(endpoints.referrals.levels);
    const payload = res.data?.data ?? res.data;
    const items = Array.isArray(payload) ? payload : (payload?.items ?? []);
    return (items as Array<Record<string, unknown>>).map(mapLevel);
  },
};
