import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import type { Lesson } from "@/entities/lesson/types";

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

const mapLesson = (raw: Record<string, unknown>): Lesson => {
  const userProgress =
    raw.user_progress && typeof raw.user_progress === "object"
      ? raw.user_progress as Record<string, unknown>
      : undefined;
  const progress = Number(userProgress?.progress_percentage ?? 0);

  return {
    id: String(raw.id ?? ""),
    courseId: String(raw.course_id ?? raw.courseId ?? ""),
    title: String(raw.title ?? ""),
    description: raw.description ? String(raw.description) : undefined,
    order: Number(raw.order_index ?? raw.order ?? raw.sort_order ?? 0),
    duration: raw.duration ? String(raw.duration) : undefined,
    videoUrl: raw.video_url ? String(raw.video_url) : undefined,
    muxPlaybackId: raw.mux_playback_id ? String(raw.mux_playback_id) : undefined,
    isLocked: Boolean(raw.is_locked ?? raw.isLocked ?? false),
    isCompleted:
      Boolean(raw.is_completed ?? raw.isCompleted) ||
      Number.isFinite(progress) && progress >= 100,
    type: mapLessonType(raw),
  };
};

export type LessonProgressStats = {
  totalLessons: number;
  lessonsWithProgress: number;
  lessonsCompleted: number;
  overallProgressPercentage: number;
};

export const lessonsApi = {
  async byCourse(courseId: string): Promise<Lesson[]> {
    const response = await apiClient.get(endpoints.lessons.byCourse(courseId));
    const payload = response.data?.data ?? response.data;
    const items = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
          ? payload.items
          : [];
    return (items as Array<Record<string, unknown>>).map(mapLesson);
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
};
