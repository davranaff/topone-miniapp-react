import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import type { Lesson } from "@/entities/lesson/types";

const mapLesson = (raw: Record<string, unknown>): Lesson => ({
  id: String(raw.id ?? ""),
  courseId: String(raw.course_id ?? raw.courseId ?? ""),
  title: String(raw.title ?? ""),
  description: raw.description ? String(raw.description) : undefined,
  order: Number(raw.order ?? raw.sort_order ?? 0),
  duration: raw.duration ? String(raw.duration) : undefined,
  videoUrl: raw.video_url ? String(raw.video_url) : undefined,
  muxPlaybackId: raw.mux_playback_id ? String(raw.mux_playback_id) : undefined,
  isLocked: Boolean(raw.is_locked ?? raw.isLocked ?? false),
  isCompleted: Boolean(raw.is_completed ?? raw.isCompleted ?? false),
  type: (raw.type as Lesson["type"]) ?? "video",
});

export const lessonsApi = {
  async byCourse(courseId: string): Promise<Lesson[]> {
    const response = await apiClient.get(endpoints.lessons.byCourse(courseId));
    const payload = response.data?.data ?? response.data;
    const items = Array.isArray(payload) ? payload : (payload?.items ?? []);
    return (items as Array<Record<string, unknown>>).map(mapLesson);
  },

  async detail(lessonId: string): Promise<Lesson> {
    const response = await apiClient.get(endpoints.lessons.detail(lessonId));
    return mapLesson(response.data?.data ?? response.data);
  },
};
