import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import { buildQueryString } from "@/shared/lib/url";
import type { Paginated } from "@/shared/types/pagination";
import type { Challenge } from "@/entities/challenge/types";

const toDifficulty = (value?: string): Challenge["difficulty"] => {
  const normalized = value?.toLowerCase() ?? "";

  if (normalized.includes("easy") || normalized.includes("oson") || normalized.includes("лег")) {
    return "easy";
  }

  if (normalized.includes("hard") || normalized.includes("qiyin") || normalized.includes("слож")) {
    return "hard";
  }

  return "medium";
};

const toTypeCode = (value?: string): Challenge["typeCode"] => {
  const normalized = value?.toLowerCase() ?? "";

  if (
    normalized.includes("daily") ||
    normalized.includes("kundalik") ||
    normalized.includes("ежедн")
  ) {
    return "daily";
  }

  if (
    normalized.includes("weekly") ||
    normalized.includes("hafta") ||
    normalized.includes("еженед")
  ) {
    return "weekly";
  }

  if (
    normalized.includes("monthly") ||
    normalized.includes("oylik") ||
    normalized.includes("ежемес")
  ) {
    return "monthly";
  }

  return "other";
};

const mapSubchallengeProgress = (value: unknown): Challenge["subchallengeProgress"] => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const progress = value as Record<string, unknown>;

  return {
    completedCount: Number(progress.completed_count ?? progress.completed ?? 0),
    failedCount: Number(progress.failed_count ?? progress.failed ?? 0),
    pendingCount: Number(progress.pending_count ?? progress.pending ?? 0),
    totalCount: Number(progress.total_count ?? progress.total ?? 0),
  };
};

const mapChallenge = (raw: Record<string, unknown>): Challenge => {
  const type =
    raw.challenge_type && typeof raw.challenge_type === "object"
      ? raw.challenge_type as Record<string, unknown>
      : raw.type && typeof raw.type === "object"
        ? raw.type as Record<string, unknown>
        : undefined;
  const difficulty =
    raw.challenge_difficulty && typeof raw.challenge_difficulty === "object"
      ? raw.challenge_difficulty as Record<string, unknown>
      : raw.difficulty && typeof raw.difficulty === "object"
        ? raw.difficulty as Record<string, unknown>
        : undefined;
  const status =
    raw.challenge_status && typeof raw.challenge_status === "object"
      ? raw.challenge_status as Record<string, unknown>
      : raw.status && typeof raw.status === "object"
        ? raw.status as Record<string, unknown>
        : undefined;
  const userProgress =
    raw.user_progress && typeof raw.user_progress === "object"
      ? raw.user_progress as Record<string, unknown>
      : undefined;
  const difficultyLabel = difficulty?.title ? String(difficulty.title) : undefined;
  const statusLabel = status?.title ? String(status.title) : undefined;
  const progress = userProgress?.progress_percentage != null
    ? Number(userProgress.progress_percentage)
    : raw.progress != null
      ? Number(raw.progress)
      : undefined;
  const statusCode = userProgress?.status ? String(userProgress.status) : undefined;
  const isCompleted = statusCode === "completed"
    || Boolean(raw.is_completed ?? raw.isCompleted)
    || statusLabel?.toLowerCase().includes("tugall")
    || statusLabel?.toLowerCase().includes("completed")
    || false;
  const isStarted = statusCode != null
    ? statusCode !== "not_started"
    : Boolean(raw.is_started ?? raw.isStarted ?? ((progress ?? 0) > 0));

  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    description: String(raw.description ?? ""),
    difficulty: toDifficulty(difficultyLabel ?? (typeof raw.difficulty === "string" ? raw.difficulty : undefined)),
    difficultyLabel,
    xpReward: Number(raw.points ?? raw.xp_reward ?? raw.xpReward ?? 0),
    coinReward: raw.coin_reward != null ? Number(raw.coin_reward) : undefined,
    durationDays:
      type?.active_days != null
        ? Number(type.active_days)
        : raw.duration_days != null
          ? Number(raw.duration_days)
          : undefined,
    isLocked: Boolean(status?.is_locked ?? raw.is_locked ?? raw.isLocked ?? false),
    isCompleted,
    isStarted,
    progress,
    categoryId: raw.category_id ? String(raw.category_id) : undefined,
    coverUrl: raw.background_image
      ? String(raw.background_image)
      : raw.cover_url
        ? String(raw.cover_url)
        : undefined,
    typeLabel: type?.title ? String(type.title) : undefined,
    typeCode: toTypeCode(type?.title ? String(type.title) : undefined),
    statusLabel,
    statusCode,
    icon: raw.icon ? String(raw.icon) : undefined,
    unlockDay: raw.unlock_day != null ? Number(raw.unlock_day) : undefined,
    subchallengeProgress: mapSubchallengeProgress(raw.subchallenges_progress),
  };
};

export const challengesApi = {
  async list(params: { page?: number; size?: number } = {}): Promise<Paginated<Challenge>> {
    const response = await apiClient.get(
      `${endpoints.challenges.list}${buildQueryString({ page: params.page ?? 1, size: params.size ?? 20 })}`,
    );
    const payload = response.data as Record<string, unknown>;
    const pagination =
      payload?.pagination && typeof payload.pagination === "object"
        ? payload.pagination as Record<string, unknown>
        : undefined;
    const source = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.items)
        ? payload.items
        : [];
    const items = (source as Array<Record<string, unknown>>).map(mapChallenge);
    return {
      items,
      total: Number(pagination?.total ?? payload?.total ?? items.length),
      page: Number(pagination?.page ?? payload?.page ?? 1),
      size: Number(pagination?.size ?? payload?.size ?? (items.length || 1)),
      pages: Number(pagination?.pages ?? payload?.pages ?? 1),
    };
  },

  async detail(challengeId: string): Promise<Challenge> {
    const response = await apiClient.get(endpoints.challenges.detail(challengeId));
    return mapChallenge(response.data?.data ?? response.data);
  },

  async start(challengeId: string): Promise<void> {
    await apiClient.post(endpoints.challenges.start(challengeId));
  },
};
