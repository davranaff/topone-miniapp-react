import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import { buildQueryString } from "@/shared/lib/url";
import type { Paginated } from "@/shared/types/pagination";
import type {
  Challenge,
  ChallengeAdditionalResource,
  ChallengeCategory,
  ChallengeCommunityStats,
  ChallengeOverallStats,
  ChallengeProgress,
  ChallengeRewards,
  ChallengeTypeCode,
} from "@/entities/challenge/types";
import { isAxiosError } from "axios";

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

const toTypeCode = (value?: string): ChallengeTypeCode => {
  const normalized = value?.toLowerCase() ?? "";

  if (
    normalized.includes("daily") ||
    normalized.includes("kundalik") ||
    normalized.includes("kunlik") ||
    normalized.includes("kun") ||
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

const resolveTypeCode = (...candidates: Array<string | undefined>): ChallengeTypeCode => {
  for (const candidate of candidates) {
    const resolved = toTypeCode(candidate);

    if (resolved !== "other") {
      return resolved;
    }
  }

  return "other";
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : String(item ?? "").trim()))
      .filter(Boolean);
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map((item) => (typeof item === "string" ? item.trim() : String(item ?? "").trim()))
      .filter(Boolean);
  }

  return [];
};

const mapAdditionalResource = (value: unknown): ChallengeAdditionalResource | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const resource = value as Record<string, unknown>;

  return {
    id: String(resource.id ?? ""),
    title: String(resource.name ?? resource.title ?? ""),
    description: resource.description ? String(resource.description) : undefined,
    category: resource.category ? String(resource.category) : undefined,
    type: resource.type ? String(resource.type) : undefined,
    url: String(resource.url ?? ""),
    author: resource.author ? String(resource.author) : undefined,
  };
};

const mapProgress = (value: unknown): ChallengeProgress | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const progress = value as Record<string, unknown>;

  return {
    id: String(progress.id ?? ""),
    challengeId: String(progress.challenge_id ?? progress.challengeId ?? ""),
    userId: String(progress.user_id ?? progress.userId ?? ""),
    status: String(progress.status ?? ""),
    progress: Number(progress.progress_percentage ?? progress.progress ?? 0),
    startedAt: progress.started_at ? String(progress.started_at) : undefined,
    completedAt: progress.completed_at ? String(progress.completed_at) : undefined,
    result: progress.result ? String(progress.result) : undefined,
    notes: progress.notes ? String(progress.notes) : undefined,
  };
};

const mapSubchallengeProgress = (value: unknown): Challenge["subchallengeProgress"] => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const progress = value as Record<string, unknown>;
  const totalCount = Number(progress.total_count ?? progress.total ?? progress.count ?? 0);
  const completedCount = Number(progress.completed_count ?? progress.completed ?? 0);
  const failedCount = Number(progress.failed_count ?? progress.failed ?? 0);
  const pendingCount = Math.max(
    0,
    Number(progress.pending_count ?? progress.pending ?? totalCount - completedCount - failedCount),
  );

  return {
    completedCount,
    failedCount,
    pendingCount,
    totalCount,
    percentage: progress.percentage != null ? Number(progress.percentage) : undefined,
  };
};

const mapChallenge = (raw: Record<string, unknown>): Challenge => {
  const type =
    raw.challenge_type && typeof raw.challenge_type === "object"
      ? (raw.challenge_type as Record<string, unknown>)
      : raw.type && typeof raw.type === "object"
        ? (raw.type as Record<string, unknown>)
        : undefined;
  const difficulty =
    raw.challenge_difficulty && typeof raw.challenge_difficulty === "object"
      ? (raw.challenge_difficulty as Record<string, unknown>)
      : raw.difficulty && typeof raw.difficulty === "object"
        ? (raw.difficulty as Record<string, unknown>)
        : undefined;
  const status =
    raw.challenge_status && typeof raw.challenge_status === "object"
      ? (raw.challenge_status as Record<string, unknown>)
      : raw.status && typeof raw.status === "object"
        ? (raw.status as Record<string, unknown>)
        : undefined;

  const userProgress = mapProgress(raw.user_progress);
  const difficultyLabel = difficulty?.title ? String(difficulty.title) : undefined;
  const statusLabel = status?.title ? String(status.title) : undefined;
  const progress = userProgress?.progress ?? (raw.progress != null ? Number(raw.progress) : undefined);
  const statusCode = userProgress?.status ?? (status?.code ? String(status.code) : undefined);
  const normalizedStatus = statusCode?.toLowerCase() ?? "";
  const isCompleted =
    normalizedStatus.includes("completed") ||
    normalizedStatus.includes("tugall") ||
    Boolean(raw.is_completed ?? raw.isCompleted) ||
    statusLabel?.toLowerCase().includes("tugall") ||
    statusLabel?.toLowerCase().includes("completed") ||
    false;
  const isStarted = userProgress != null
    ? normalizedStatus !== "not_started"
    : Boolean(raw.is_started ?? raw.isStarted ?? ((progress ?? 0) > 0));
  const howItWorks = toStringArray(raw.how_it_works);
  const checkmark = toStringArray(raw.checkmark);
  const additionalResources = Array.isArray(raw.additional_resources)
    ? raw.additional_resources
        .map(mapAdditionalResource)
        .filter((item): item is ChallengeAdditionalResource => item != null)
    : undefined;

  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    description: String(raw.description ?? ""),
    difficulty: toDifficulty(
      difficultyLabel ?? (typeof raw.difficulty === "string" ? raw.difficulty : undefined),
    ),
    difficultyLabel,
    xpReward: Number(raw.points ?? raw.xp_reward ?? raw.xpReward ?? 0),
    coinReward:
      raw.coin_reward != null
        ? Number(raw.coin_reward)
        : raw.awards && typeof raw.awards === "object"
          ? Number((raw.awards as Record<string, unknown>).coin ?? 0)
          : undefined,
    durationDays:
      type?.active_days != null
        ? Number(type.active_days)
        : raw.duration_days != null
          ? Number(raw.duration_days)
          : undefined,
    isLocked: Boolean(status?.is_locked ?? raw.is_locked ?? raw.isLocked ?? false),
    isCompleted,
    isStarted,
    hasUserProgress: userProgress != null,
    progress,
    progressId: userProgress?.id,
    progressStatus: userProgress?.status,
    progressResult: userProgress?.result,
    progressNotes: userProgress?.notes,
    progressCompletedAt: userProgress?.completedAt,
    categoryId: raw.category_id ? String(raw.category_id) : undefined,
    coverUrl: raw.background_image
      ? String(raw.background_image)
      : raw.cover_url
        ? String(raw.cover_url)
        : undefined,
    bgGradient: raw.bg_gradient ? String(raw.bg_gradient) : undefined,
    typeId: type?.id ? String(type.id) : undefined,
    typeLabel: type?.title ? String(type.title) : undefined,
    typeCode: resolveTypeCode(
      type?.code ? String(type.code) : undefined,
      type?.slug ? String(type.slug) : undefined,
      type?.name ? String(type.name) : undefined,
      type?.title ? String(type.title) : undefined,
      raw.type_code ? String(raw.type_code) : undefined,
      raw.type ? String(raw.type) : undefined,
    ),
    statusLabel,
    statusCode,
    icon: raw.icon ? String(raw.icon) : undefined,
    unlockDay: raw.unlock_day != null ? Number(raw.unlock_day) : undefined,
    howItWorks: howItWorks.length ? howItWorks : undefined,
    checkmark: checkmark.length ? checkmark : undefined,
    additionalResources: additionalResources?.length ? additionalResources : undefined,
    subchallengeProgress: mapSubchallengeProgress(raw.subchallenges_progress),
  };
};

const mapCategory = (raw: Record<string, unknown>): ChallengeCategory => {
  const type =
    raw.challenge_type && typeof raw.challenge_type === "object"
      ? (raw.challenge_type as Record<string, unknown>)
      : raw.type && typeof raw.type === "object"
        ? (raw.type as Record<string, unknown>)
        : raw;
  const title = String(type.title ?? raw.title ?? "");

  return {
    id: String(raw.id ?? type.id ?? title),
    typeId: String(type.id ?? raw.type_id ?? raw.id ?? title),
    title,
    count: Number(raw.challenges_count ?? raw.count ?? 0),
    activeDays: type.active_days != null ? Number(type.active_days) : undefined,
    typeCode: resolveTypeCode(
      type.code ? String(type.code) : undefined,
      type.slug ? String(type.slug) : undefined,
      type.name ? String(type.name) : undefined,
      title,
      raw.type_code ? String(raw.type_code) : undefined,
      raw.type ? String(raw.type) : undefined,
    ),
  };
};

const mapPaginated = <T>(
  payload: Record<string, unknown>,
  mapper: (item: Record<string, unknown>) => T,
): Paginated<T> => {
  const pagination =
    payload.pagination && typeof payload.pagination === "object"
      ? (payload.pagination as Record<string, unknown>)
      : undefined;
  const source = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload.items)
      ? payload.items
      : [];
  const items = (source as Array<Record<string, unknown>>).map(mapper);

  return {
    items,
    total: Number(pagination?.total ?? payload.total ?? items.length),
    page: Number(pagination?.page ?? payload.page ?? 1),
    size: Number(pagination?.size ?? payload.size ?? (items.length || 1)),
    pages: Number(pagination?.pages ?? payload.pages ?? 1),
  };
};

const unwrapDataObject = (responseData: unknown): Record<string, unknown> => {
  if (responseData && typeof responseData === "object") {
    const payload = responseData as Record<string, unknown>;
    if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
      return payload.data as Record<string, unknown>;
    }

    return payload;
  }

  return {};
};

export const challengesApi = {
  async list(params: {
    page?: number;
    size?: number;
    typeId?: string;
    includeCompleted?: boolean;
  } = {}): Promise<Paginated<Challenge>> {
    const response = await apiClient.get(
      `${endpoints.challenges.list}${buildQueryString({
        page: params.page ?? 1,
        size: params.size ?? 20,
        type_id: params.typeId,
        include_completed: params.includeCompleted ? "true" : undefined,
      })}`,
    );

    return mapPaginated(response.data as Record<string, unknown>, mapChallenge);
  },

  async categories(params: { page?: number; size?: number } = {}): Promise<Paginated<ChallengeCategory>> {
    const response = await apiClient.get(
      `${endpoints.challenges.categories}${buildQueryString({
        page: params.page ?? 1,
        size: params.size ?? 20,
      })}`,
    );

    return mapPaginated(response.data as Record<string, unknown>, mapCategory);
  },

  async overallStats(): Promise<ChallengeOverallStats> {
    const response = await apiClient.get(endpoints.challenges.stats);
    const data = unwrapDataObject(response.data);

    return {
      total: Number(data.total ?? data.total_challenges ?? 0),
      inProgress: Number(data.in_progress ?? data.inProgress ?? 0),
      completed: Number(data.completed ?? 0),
      failed: Number(data.failed ?? 0),
    };
  },

  async detailStats(challengeId: string): Promise<ChallengeCommunityStats> {
    const response = await apiClient.get(endpoints.challenges.detailStats(challengeId));
    const data = unwrapDataObject(response.data);

    return {
      totalUsers: Number(data.total_users ?? data.totalUsers ?? 0),
      inProgress: Number(data.in_progress ?? data.inProgress ?? 0),
      completed: Number(data.completed ?? 0),
      failed: Number(data.failed ?? 0),
    };
  },

  async rewards(challengeId: string): Promise<ChallengeRewards> {
    const response = await apiClient.get(endpoints.challenges.rewards(challengeId));
    const data = unwrapDataObject(response.data);

    return {
      xp: Number(data.xp ?? 0),
      coin: Number(data.coin ?? 0),
    };
  },

  async detail(challengeId: string): Promise<Challenge> {
    const response = await apiClient.get(endpoints.challenges.detail(challengeId));
    return mapChallenge(unwrapDataObject(response.data));
  },

  async subchallenges(
    challengeId: string,
    params: { page?: number; size?: number } = {},
  ): Promise<Paginated<Challenge>> {
    const response = await apiClient.get(
      `${endpoints.challenges.subchallenges(challengeId)}${buildQueryString({
        page: params.page ?? 1,
        size: params.size ?? 20,
      })}`,
    );

    return mapPaginated(response.data as Record<string, unknown>, mapChallenge);
  },

  async createProgress(challengeId: string): Promise<ChallengeProgress> {
    try {
      const response = await apiClient.post(endpoints.challenges.progressCreate, {
        challenge_id: challengeId,
      });
      return mapProgress(unwrapDataObject(response.data)) ?? {
        id: "",
        challengeId,
        userId: "",
        status: "IN_PROGRESS",
        progress: 0,
      };
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 400) {
        const detail = error.response.data?.detail;
        const message = error.response.data?.message;
        const normalized = `${detail ?? ""} ${message ?? ""}`.toLowerCase();

        if (normalized.includes("already exists")) {
          const response = await apiClient.get(endpoints.challenges.progressByChallenge(challengeId));
          return mapProgress(unwrapDataObject(response.data)) ?? {
            id: "",
            challengeId,
            userId: "",
            status: "IN_PROGRESS",
            progress: 0,
          };
        }
      }

      throw error;
    }
  },

  async updateProgress(
    progressId: string,
    payload: {
      result?: string;
      notes?: string;
    },
  ): Promise<ChallengeProgress> {
    const response = await apiClient.put(endpoints.challenges.progressUpdate(progressId), payload);
    return mapProgress(unwrapDataObject(response.data)) ?? {
      id: progressId,
      challengeId: "",
      userId: "",
      status: "",
      progress: 0,
    };
  },
};
