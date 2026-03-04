import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import { buildQueryString } from "@/shared/lib/url";
import type { LevelItem } from "@/entities/levels/types";

const asRecord = (value: unknown): Record<string, unknown> => {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
};

const toLevelItem = (raw: Record<string, unknown>): LevelItem => {
  return {
    level: Number(raw.level ?? 0),
    title: String(raw.title ?? ""),
    minXp: Number(raw.min_xp ?? raw.minXp ?? 0),
    maxXp: Number(raw.max_xp ?? raw.maxXp ?? 0),
    coinBonus: Number(raw.coin_bonus ?? raw.coinBonus ?? 0),
    badgeUrl: raw.badge_url ? String(raw.badge_url) : undefined,
    perks: asRecord(raw.perks),
  };
};

export const levelsApi = {
  async getAllLevels(params?: { page?: number; size?: number }): Promise<LevelItem[]> {
    const page = params?.page ?? 1;
    const size = params?.size ?? 100;
    const query = buildQueryString({ page, size });
    const response = await apiClient.get(`${endpoints.levels.list}${query}`);
    const root = asRecord(response.data);
    const payload = asRecord(root.data ?? root);
    const levels = Array.isArray(payload.levels)
      ? (payload.levels as unknown[])
      : Array.isArray(payload.data)
        ? (payload.data as unknown[])
        : [];

    return levels.map((item) => toLevelItem(asRecord(item)));
  },
};
