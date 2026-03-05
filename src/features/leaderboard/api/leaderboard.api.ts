import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import { buildQueryString } from "@/shared/lib/url";
import type {
  LeaderboardEntry,
  LeaderboardMyPosition,
  LeaderboardPage,
  LeaderboardType,
} from "@/entities/leaderboard/types";

const PAGE_SIZE = 20;

const toRecord = (value: unknown): Record<string, unknown> => {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
};

const toNumber = (value: unknown): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const extractItems = (value: unknown): Array<Record<string, unknown>> => {
  const root = toRecord(value);

  if (Array.isArray(root.data)) {
    return (root.data as unknown[]).map(toRecord);
  }
  if (Array.isArray(root.items)) {
    return (root.items as unknown[]).map(toRecord);
  }
  if (Array.isArray(root.leaderboard)) {
    return (root.leaderboard as unknown[]).map(toRecord);
  }

  const nested = toRecord(root.data);
  if (Array.isArray(nested.data)) {
    return (nested.data as unknown[]).map(toRecord);
  }
  if (Array.isArray(nested.items)) {
    return (nested.items as unknown[]).map(toRecord);
  }
  if (Array.isArray(nested.leaderboard)) {
    return (nested.leaderboard as unknown[]).map(toRecord);
  }

  return [];
};

const extractPayload = (value: unknown): Record<string, unknown> => {
  const root = toRecord(value);
  if (Object.keys(root).length === 0) return {};

  const nested = toRecord(root.data);
  return Object.keys(nested).length > 0 ? nested : root;
};

const extractPagination = (value: unknown): Record<string, unknown> => {
  const root = toRecord(value);
  const rootPagination = toRecord(root.pagination);
  if (Object.keys(rootPagination).length > 0) {
    return rootPagination;
  }

  const nested = toRecord(root.data);
  return toRecord(nested.pagination);
};

const getEntryValue = (type: LeaderboardType, raw: Record<string, unknown>): number => {
  if (type === "xp") {
    return toNumber(raw.total_xp ?? raw.xp ?? raw.value);
  }
  return toNumber(raw.total_referrals ?? raw.referrals ?? raw.referrals_count ?? raw.value);
};

const mapEntry = (type: LeaderboardType, raw: Record<string, unknown>): LeaderboardEntry => {
  const user = toRecord(raw.user);
  const rank = Math.max(0, Math.trunc(toNumber(raw.rank ?? raw.position)));
  const fallbackId = rank > 0 ? String(rank) : "";
  const userId = String(user.id ?? raw.user_id ?? raw.userId ?? raw.id ?? fallbackId);
  const firstName = String(user.first_name ?? raw.first_name ?? "").trim();
  const lastName = String(user.last_name ?? raw.last_name ?? "").trim();
  const username = String(user.username ?? raw.username ?? "").trim();
  const displayUsername = username || [firstName, lastName].filter(Boolean).join(" ") || "User";

  return {
    userId,
    username: displayUsername,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    avatarUrl: String(user.avatar_url ?? user.avatar ?? raw.avatar_url ?? raw.avatar ?? "").trim() || undefined,
    rank,
    value: Math.max(0, Math.trunc(getEntryValue(type, raw))),
    isCurrentUser: Boolean(raw.is_current_user ?? raw.isCurrentUser ?? false),
  };
};

const ENDPOINT_MAP: Record<LeaderboardType, string> = {
  xp: endpoints.leaderboard.xp,
  referrals: endpoints.leaderboard.referrals,
};

const MY_POSITION_ENDPOINT_MAP: Record<LeaderboardType, string> = {
  xp: endpoints.leaderboard.myPosition.xp,
  referrals: endpoints.leaderboard.myPosition.referrals,
};

export const leaderboardApi = {
  async getLeaderboardPage(
    type: LeaderboardType,
    page = 1,
    size = PAGE_SIZE,
  ): Promise<LeaderboardPage> {
    const res = await apiClient.get(
      `${ENDPOINT_MAP[type]}${buildQueryString({ page, size })}`,
    );

    const entries = extractItems(res.data)
      .map((item) => mapEntry(type, item))
      .filter((item) => item.rank > 0);

    const pagination = extractPagination(res.data);
    const apiPage = Math.max(
      1,
      Math.trunc(toNumber(pagination.page ?? pagination.current_page ?? page)),
    );
    const apiSize = Math.max(
      1,
      Math.trunc(toNumber(pagination.size ?? pagination.per_page ?? size)),
    );
    const apiPages = Math.max(
      1,
      Math.trunc(toNumber(pagination.pages ?? pagination.total_pages ?? apiPage)),
    );
    const apiTotal = Math.max(
      entries.length,
      Math.trunc(toNumber(pagination.total ?? pagination.total_items ?? entries.length)),
    );

    return {
      items: entries,
      page: apiPage,
      size: apiSize,
      pages: apiPages,
      total: apiTotal,
    };
  },

  async getMyPosition(type: LeaderboardType): Promise<LeaderboardMyPosition> {
    const res = await apiClient.get(MY_POSITION_ENDPOINT_MAP[type]);
    const payload = extractPayload(res.data);
    const rankValue = toNumber(payload.rank ?? payload.position ?? payload.rank_position);
    const rank = rankValue > 0 ? Math.trunc(rankValue) : null;
    const value = type === "xp"
      ? toNumber(payload.total_xp ?? payload.xp ?? payload.value)
      : toNumber(payload.total_referrals ?? payload.referrals ?? payload.referrals_count ?? payload.value);
    const totalUsers = Math.max(0, Math.trunc(toNumber(payload.total_users ?? payload.users_total)));

    return {
      rank,
      value: Math.max(0, Math.trunc(value)),
      totalUsers,
    };
  },
};
