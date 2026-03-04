import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import { buildQueryString } from "@/shared/lib/url";
import type {
  ReferralCheckoutItem,
  ReferralCheckoutList,
  ReferralCheckoutRequest,
  ReferralHistoryItem,
  ReferralLevel,
  ReferralStats,
} from "@/entities/referral/types";

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
  pendingReferrals: Number(r.pending_referrals ?? r.pendingReferrals ?? 0),
  activeReferrals: Number(r.active_referrals ?? r.activeReferrals ?? 0),
  totalCommissionEarned: Number(
    r.total_commission_earned ??
      r.totalCommissionEarned ??
      r.total_earnings ??
      r.totalEarnings ??
      0,
  ),
  approvedAmount: Number(
    r.approved_amount ??
      r.approvedAmount ??
      r.withdrawn_amount ??
      r.withdrawnAmount ??
      0,
  ),
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
  currentLevelName: String(
    toRecord(r.current_level ?? r.currentLevel).name ??
      toRecord(r.current_level ?? r.currentLevel).title ??
      "",
  ) || undefined,
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

const mapCheckoutStatus = (statusRaw: unknown): ReferralCheckoutItem["status"] => {
  const status = String(statusRaw ?? "").trim().toLowerCase();
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  return "pending";
};

const mapCheckoutItem = (r: Record<string, unknown>): ReferralCheckoutItem => ({
  id: String(r.id ?? ""),
  cardNumber: String(r.card_number ?? r.cardNumber ?? ""),
  cardOwnerFirstName: String(r.card_owner_first_name ?? r.cardOwnerFirstName ?? ""),
  cardOwnerLastName: String(r.card_owner_last_name ?? r.cardOwnerLastName ?? ""),
  amount: Number(r.amount ?? 0),
  status: mapCheckoutStatus(r.status),
  createdAt: r.created_at ? String(r.created_at) : undefined,
});

export const referralsApi = {
  async getStats(): Promise<ReferralStats> {
    const res = await apiClient.get(endpoints.referrals.stats);
    const data = extractPayload(res.data);
    const statsBase = mapStats(data);
    const totalCommissionEarned = Number.isFinite(statsBase.totalCommissionEarned)
      ? statsBase.totalCommissionEarned
      : 0;
    const approvedAmount = Number.isFinite(statsBase.approvedAmount)
      ? statsBase.approvedAmount
      : 0;
    const fallbackAvailable = Math.max(0, totalCommissionEarned - approvedAmount);
    const stats: ReferralStats = {
      ...statsBase,
      availableBalance:
        Number.isFinite(statsBase.availableBalance) && statsBase.availableBalance > 0
          ? statsBase.availableBalance
          : fallbackAvailable,
      totalEarnings:
        Number.isFinite(statsBase.totalEarnings) && statsBase.totalEarnings > 0
          ? statsBase.totalEarnings
          : totalCommissionEarned,
    };
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

  async createCheckoutReferral(input: ReferralCheckoutRequest): Promise<ReferralCheckoutItem> {
    const res = await apiClient.post(endpoints.referrals.checkoutCreate, {
      card_number: input.cardNumber.replace(/\s+/g, ""),
      card_owner_first_name: input.cardOwnerFirstName.trim(),
      card_owner_last_name: input.cardOwnerLastName.trim(),
      amount: input.amount,
    });

    const payload = extractPayload(res.data);
    const raw = Object.keys(payload).length > 0 ? payload : toRecord(res.data);
    return mapCheckoutItem(raw);
  },

  async getMyCheckoutReferrals(params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<ReferralCheckoutList> {
    const page = params?.page ?? 1;
    const size = params?.size ?? 10;
    const status = params?.status?.trim();

    const query = buildQueryString({
      page,
      size,
      ...(status ? { status: status.toLowerCase() } : {}),
    });

    const res = await apiClient.get(`${endpoints.referrals.checkoutMine}${query}`);
    const root = toRecord(res.data);
    const pagination = toRecord(root.pagination);
    const items = extractItems(res.data).map(mapCheckoutItem);
    const currentPage = Number(pagination.page ?? page);
    const pages = Number(pagination.pages ?? 1);
    const total = Number(pagination.total ?? items.length);

    return {
      items,
      page: Number.isFinite(currentPage) ? currentPage : 1,
      pages: Number.isFinite(pages) ? pages : 1,
      total: Number.isFinite(total) ? total : items.length,
      hasMore: currentPage < pages,
    };
  },

  async deleteCheckoutReferral(referralId: string): Promise<void> {
    const id = encodeURIComponent(referralId);
    await apiClient.delete(`${endpoints.referrals.checkoutCreate}/${id}`);
  },
};
