import { AxiosError } from "axios";
import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import { buildQueryString } from "@/shared/lib/url";
import type { Paginated } from "@/shared/types/pagination";
import type {
  Lesson,
  LessonProgress,
  LessonQuizSummary,
  LessonResource,
} from "@/entities/lesson/types";

const toBoolean = (value: unknown, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }
  return fallback;
};

const toOptionalString = (value: unknown) => {
  if (value == null) return undefined;
  const normalized = String(value).trim();
  if (!normalized || normalized.toLowerCase() === "null") return undefined;
  return normalized;
};

const mapLessonType = (raw: Record<string, unknown>): Lesson["type"] => {
  const type =
    raw.lesson_type && typeof raw.lesson_type === "object"
      ? String((raw.lesson_type as { title?: string }).title ?? "").toLowerCase()
      : String(raw.type ?? "").toLowerCase();

  if (type.includes("quiz") || type.includes("test")) {
    return "quiz";
  }

  if (type.includes("text") || type.includes("matn")) {
    return "text";
  }

  return "video";
};

const mapLessonProgress = (raw: Record<string, unknown>): LessonProgress => ({
  id: String(raw.id ?? ""),
  lessonId: String(raw.lesson_id ?? raw.lessonId ?? ""),
  status: String(raw.status ?? "NOT_STARTED"),
  progressPercentage: Number(raw.progress_percentage ?? raw.progressPercentage ?? 0),
  currentTimeSeconds: Number(raw.current_time_seconds ?? raw.currentTimeSeconds ?? 0),
  totalDurationSeconds: Number(raw.total_duration_seconds ?? raw.totalDurationSeconds ?? 0),
  watchTimeSeconds: Number(raw.watch_time_seconds ?? raw.watchTimeSeconds ?? 0),
  lastWatchedAt: toOptionalString(raw.last_watched_at ?? raw.lastWatchedAt),
  startedAt: toOptionalString(raw.started_at ?? raw.startedAt),
  completedAt: toOptionalString(raw.completed_at ?? raw.completedAt),
  completionCount: Number(raw.completion_count ?? raw.completionCount ?? 0),
  notes: toOptionalString(raw.notes),
});

const mapLessonResource = (raw: Record<string, unknown>): LessonResource => ({
  id: String(raw.id ?? ""),
  name: String(raw.name ?? raw.title ?? ""),
  description: toOptionalString(raw.description),
  category: toOptionalString(raw.category),
  type: toOptionalString(raw.type),
  url: String(raw.url ?? raw.file_url ?? ""),
  author: toOptionalString(raw.author),
  tags: Array.isArray(raw.tags) ? raw.tags.map((item) => String(item)) : [],
  language: toOptionalString(raw.language),
  isFeatured: toBoolean(raw.is_featured ?? raw.isFeatured),
  isActive: toBoolean(raw.is_active ?? raw.isActive, true),
  viewCount: Number(raw.view_count ?? raw.viewCount ?? 0),
  rating: toOptionalString(raw.rating),
});

const mapQuizSummary = (raw: Record<string, unknown>): LessonQuizSummary => ({
  id: String(raw.id ?? raw.quiz_id ?? ""),
  title: String(raw.title ?? raw.name ?? ""),
  description: toOptionalString(raw.description),
  lessonId: toOptionalString(raw.lesson_id ?? raw.lessonId),
  questionCount: Number(raw.question_count ?? raw.questions_count ?? raw.questionCount ?? 0),
  isActive: toBoolean(raw.is_active ?? raw.isActive ?? raw.active, true),
  type: toOptionalString(raw.type ?? raw.kind),
  orderIndex:
    raw.order_index != null || raw.orderIndex != null
      ? Number(raw.order_index ?? raw.orderIndex)
      : undefined,
  timeLimitSeconds:
    raw.time_limit_seconds != null ? Number(raw.time_limit_seconds) : undefined,
  isCompleted: toBoolean(raw.is_completed ?? raw.isCompleted),
  attemptsCount: Number(raw.attempts_count ?? raw.attemptsCount ?? 0),
  maxAttempts: Number(raw.max_attempts ?? raw.maxAttempts ?? 3),
  passingScorePercent: Number(raw.passing_score_percent ?? raw.passingScorePercent ?? 70),
});

const mapLesson = (raw: Record<string, unknown>): Lesson => {
  const userProgress =
    raw.user_progress && typeof raw.user_progress === "object"
      ? mapLessonProgress(raw.user_progress as Record<string, unknown>)
      : undefined;
  const progress = Number(userProgress?.progressPercentage ?? 0);

  return {
    id: String(raw.id ?? ""),
    courseId: String(raw.course_id ?? raw.courseId ?? ""),
    title: String(raw.title ?? ""),
    description: toOptionalString(raw.description),
    order: Number(raw.order_index ?? raw.order ?? raw.sort_order ?? 0),
    duration: toOptionalString(raw.duration),
    videoUrl: toOptionalString(raw.video_url),
    muxPlaybackId: toOptionalString(raw.mux_playback_id),
    isLocked: toBoolean(raw.is_locked ?? raw.isLocked),
    isOpen: toBoolean(raw.is_open ?? raw.isOpen, true),
    isCompleted:
      toBoolean(raw.is_completed ?? raw.isCompleted) ||
      (Number.isFinite(progress) && progress >= 100) ||
      userProgress?.status === "COMPLETED",
    type: mapLessonType(raw),
    keyPoints: Array.isArray(raw.key_points) ? raw.key_points.map((item) => String(item)) : [],
    resources: Array.isArray(raw.additional_resources)
      ? raw.additional_resources.map((item) => mapLessonResource(item as Record<string, unknown>))
      : [],
    userProgress,
    authorId: toOptionalString(
      raw.author_id ?? raw.created_by ?? raw.mentor_id ?? raw.instructor_id ?? raw.teacher_id,
    ),
    authorName: toOptionalString(
      raw.author_name ?? raw.author ?? raw.mentor_name ?? raw.instructor_name ?? raw.teacher_name,
    ),
  };
};

const extractListPayload = (payload: unknown) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const objectPayload = payload as Record<string, unknown>;
    if (Array.isArray(objectPayload.data)) return objectPayload.data;
    if (Array.isArray(objectPayload.items)) return objectPayload.items;
    if (Array.isArray(objectPayload.quizzes)) return objectPayload.quizzes;
  }

  return [];
};

const mapPaginatedLessons = (payload: unknown): Paginated<Lesson> => {
  const root =
    payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};

  const nestedData =
    root.data && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : null;

  const source = extractListPayload(payload);
  const items = source.map((item) => mapLesson(item as Record<string, unknown>));

  const pagination =
    (nestedData?.pagination && typeof nestedData.pagination === "object"
      ? (nestedData.pagination as Record<string, unknown>)
      : null) ??
    (root.pagination && typeof root.pagination === "object"
      ? (root.pagination as Record<string, unknown>)
      : null);

  const page = Number(pagination?.page ?? root.page ?? 1);
  const pages = Number(pagination?.pages ?? root.pages ?? 1);
  const size = Number(pagination?.size ?? root.size ?? (items.length || 1));
  const total = Number(pagination?.total ?? root.total ?? items.length);

  return {
    items,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pages: Number.isFinite(pages) && pages > 0 ? pages : 1,
    size: Number.isFinite(size) && size > 0 ? size : Math.max(1, items.length),
    total: Number.isFinite(total) && total >= 0 ? total : items.length,
  };
};

const isAlreadyExistsError = (error: unknown) => {
  if (!(error instanceof AxiosError)) {
    return false;
  }

  const detail = String((error.response?.data as { detail?: unknown } | undefined)?.detail ?? "").toLowerCase();
  return error.response?.status === 400 && (
    detail.includes("already exists") || detail.includes("already_exist")
  );
};

export type LessonProgressStats = {
  totalLessons: number;
  lessonsWithProgress: number;
  lessonsCompleted: number;
  overallProgressPercentage: number;
};

export const lessonsApi = {
  mapLesson,
  mapLessonProgress,

  async listByCourse(
    courseId: string,
    params: {
      page?: number;
      size?: number;
    } = {},
  ): Promise<Paginated<Lesson>> {
    const response = await apiClient.get(
      `${endpoints.lessons.byCourse(courseId)}${buildQueryString({
        page: params.page ?? 1,
        size: params.size ?? 20,
      })}`,
    );
    return mapPaginatedLessons(response.data);
  },

  async byCourse(courseId: string): Promise<Lesson[]> {
    const response = await apiClient.get(endpoints.lessons.byCourse(courseId));
    const payload = response.data?.data ?? response.data;
    return extractListPayload(payload).map((item) => mapLesson(item as Record<string, unknown>));
  },

  async progressStats(courseId: string): Promise<LessonProgressStats> {
    const response = await apiClient.get(endpoints.lessons.progressStats(courseId));
    const data = response.data?.data ?? response.data;

    return {
      totalLessons: Number(data?.total_lessons ?? 0),
      lessonsWithProgress: Number(data?.lessons_with_progress ?? 0),
      lessonsCompleted: Number(data?.lessons_completed ?? 0),
      overallProgressPercentage: Number(data?.overall_progress_percentage ?? 0),
    };
  },

  async detail(lessonId: string): Promise<Lesson> {
    const response = await apiClient.get(endpoints.lessons.detail(lessonId));
    return mapLesson(response.data?.data ?? response.data);
  },

  async progressByLesson(lessonId: string): Promise<LessonProgress> {
    const response = await apiClient.get(endpoints.lessons.progressByLesson(lessonId));
    return mapLessonProgress(response.data?.data ?? response.data);
  },

  async createProgress(input: {
    lessonId: string;
    courseId: string;
    currentTimeSeconds?: number;
    watchTimeSeconds?: number;
    completionCount?: number;
  }): Promise<LessonProgress> {
    try {
      const response = await apiClient.post(endpoints.lessons.progressCreate, {
        lesson_id: input.lessonId,
        course_id: input.courseId,
        current_time_seconds: input.currentTimeSeconds ?? 0,
        watch_time_seconds: input.watchTimeSeconds ?? 0,
        completion_count: input.completionCount ?? 0,
      });

      return mapLessonProgress(response.data?.data ?? response.data);
    } catch (error) {
      if (isAlreadyExistsError(error)) {
        return lessonsApi.progressByLesson(input.lessonId);
      }

      throw error;
    }
  },

  async updateProgress(
    lessonProgressId: string,
    input: {
      currentTimeSeconds?: number;
      watchTimeSeconds?: number;
      lastWatchedAt?: string;
      completionCount?: number;
      notes?: string;
    },
  ): Promise<LessonProgress> {
    const response = await apiClient.put(endpoints.lessons.progressUpdate(lessonProgressId), {
      current_time_seconds: input.currentTimeSeconds,
      watch_time_seconds: input.watchTimeSeconds,
      last_watched_at: input.lastWatchedAt,
      completion_count: input.completionCount,
      notes: input.notes,
    });

    return mapLessonProgress(response.data?.data ?? response.data);
  },

  async complete(lessonId: string): Promise<LessonProgress> {
    const response = await apiClient.put(endpoints.lessons.complete(lessonId));
    return mapLessonProgress(response.data?.data ?? response.data);
  },

  async quizzesByLesson(lessonId: string): Promise<LessonQuizSummary[]> {
    const response = await apiClient.get(endpoints.quiz.byLesson(lessonId));
    const payload = response.data?.data ?? response.data;
    return extractListPayload(payload).map((item) => mapQuizSummary(item as Record<string, unknown>));
  },
};
