import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import { buildQueryString } from "@/shared/lib/url";
import type { ReferralStats, ReferralHistoryItem, ReferralLevel } from "@/entities/referral/types";

const toRecord = (value: unknown): Record<string, unknown> => {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
};

const extractPayload = (value: unknown) => {
  const root = toRecord(value);
  return toRecord(root.data ?? root);
};

const extractItems = (value: unknown): Array<Record<string, unknown>> => {
  if (Array.isArray(value)) {
    return value.map(toRecord);
  }

  const root = toRecord(value);
  if (Array.isArray(root.data)) {
    return (root.data as unknown[]).map(toRecord);
  }
  if (Array.isArray(root.items)) {
    return (root.items as unknown[]).map(toRecord);
  }

  const payload = extractPayload(value);
  const nestedData = payload.data;

  if (Array.isArray(nestedData)) {
    return nestedData.map(toRecord);
  }

  if (Array.isArray(payload.items)) {
    return (payload.items as unknown[]).map(toRecord);
  }

  return [];
};

const mapStats = (r: Record<string, unknown>): ReferralStats => ({
  totalReferrals: Number(r.total_referrals ?? r.totalReferrals ?? 0),
  activeReferrals: Number(r.active_referrals ?? r.activeReferrals ?? 0),
  totalEarnings: Number(
    r.total_earnings ??
      r.totalEarnings ??
      r.total_commission_earned ??
      r.totalCommissionEarned ??
      0,
  ),
  availableBalance: Number(
    r.available_balance ??
      r.availableBalance ??
      r.approved_amount ??
      r.approvedAmount ??
      r.pending_rewards ??
      r.pendingRewards ??
      0,
  ),
  referralCode: String(r.referral_code ?? r.referralCode ?? ""),
  referralUrl: String(r.referral_url ?? r.referralUrl ?? ""),
});

const mapHistoryItem = (r: Record<string, unknown>): ReferralHistoryItem => {
  const user = toRecord(r.user ?? r.referred_user ?? r.referred);
  const status = String(r.status ?? "").toLowerCase();
  const isActiveFromStatus =
    status.includes("active") || status.includes("approved") || status.includes("complete");

  return {
    id: String(r.id ?? ""),
    username: String(r.username ?? user.username ?? ""),
    joinedAt: String(r.joined_at ?? r.joinedAt ?? r.created_at ?? ""),
    isActive: Boolean(r.is_active ?? r.isActive ?? isActiveFromStatus),
    earnedAmount: Number(
      r.earned_amount ??
        r.earnedAmount ??
        r.commission_earned ??
        r.commissionEarned ??
        0,
    ),
  };
};

const mapLevel = (r: Record<string, unknown>): ReferralLevel => ({
  id: String(r.id ?? ""),
  level: Number(r.level ?? 0),
  name: String(r.name ?? ""),
  minReferrals: Number(r.min_referrals ?? r.minReferrals ?? 0),
  rewardPercentage: Number(
    r.reward_percentage ??
      r.rewardPercentage ??
      r.commission_percentage ??
      r.commissionPercentage ??
      0,
  ),
  isUnlocked: Boolean(r.is_unlocked ?? r.isUnlocked ?? false),
});

export const referralsApi = {
  async getStats(): Promise<ReferralStats> {
    const res = await apiClient.get(endpoints.referrals.stats);
    const data = extractPayload(res.data);
    const stats = mapStats(data);
    const fallbackUrl = stats.referralCode
      ? `https://t.me/TopOneBot?start=${stats.referralCode}`
      : "";

    return {
      ...stats,
      referralUrl: stats.referralUrl || fallbackUrl,
    };
  },

  async getHistory(): Promise<ReferralHistoryItem[]> {
    const res = await apiClient.get(
      `${endpoints.referrals.history}${buildQueryString({ page: 1, size: 100 })}`,
    );
    return extractItems(res.data).map(mapHistoryItem);
  },

  async getLevels(): Promise<ReferralLevel[]> {
    const res = await apiClient.get(
      `${endpoints.referrals.levels}${buildQueryString({ page: 1, size: 100 })}`,
    );
    return extractItems(res.data).map(mapLevel);
  },
};
