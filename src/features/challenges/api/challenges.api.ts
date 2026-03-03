import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import { buildQueryString } from "@/shared/lib/url";
import type { Paginated } from "@/shared/types/pagination";
import type { Challenge } from "@/entities/challenge/types";

const mapChallenge = (raw: Record<string, unknown>): Challenge => ({
  id: String(raw.id ?? ""),
  title: String(raw.title ?? ""),
  description: String(raw.description ?? ""),
  difficulty: (raw.difficulty as Challenge["difficulty"]) ?? "medium",
  xpReward: Number(raw.xp_reward ?? raw.xpReward ?? 0),
  coinReward: raw.coin_reward != null ? Number(raw.coin_reward) : undefined,
  durationDays: raw.duration_days != null ? Number(raw.duration_days) : undefined,
  isLocked: Boolean(raw.is_locked ?? raw.isLocked ?? false),
  isCompleted: Boolean(raw.is_completed ?? raw.isCompleted ?? false),
  isStarted: Boolean(raw.is_started ?? raw.isStarted ?? false),
  progress: raw.progress != null ? Number(raw.progress) : undefined,
  categoryId: raw.category_id ? String(raw.category_id) : undefined,
  coverUrl: raw.cover_url ? String(raw.cover_url) : undefined,
});

export const challengesApi = {
  async list(params: { page?: number; size?: number } = {}): Promise<Paginated<Challenge>> {
    const response = await apiClient.get(
      `/api/v1/challenges${buildQueryString({ page: params.page ?? 1, size: params.size ?? 20 })}`,
    );
    const payload = response.data?.data ?? response.data;
    const items = (payload?.items as Array<Record<string, unknown>> ?? []).map(mapChallenge);
    return {
      items,
      total: Number(payload?.total ?? items.length),
      page: Number(payload?.page ?? 1),
      size: Number(payload?.size ?? (items.length || 1)),
      pages: Number(payload?.pages ?? 1),
    };
  },

  async detail(challengeId: string): Promise<Challenge> {
    const response = await apiClient.get(`/api/v1/challenges/${challengeId}`);
    return mapChallenge(response.data?.data ?? response.data);
  },

  async start(challengeId: string): Promise<void> {
    await apiClient.post(`/api/v1/challenges/${challengeId}/start`);
  },
};
