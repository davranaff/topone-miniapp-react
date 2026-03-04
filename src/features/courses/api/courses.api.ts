import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import { buildQueryString } from "@/shared/lib/url";
import type { Paginated } from "@/shared/types/pagination";
import { mapApiCourse } from "@/entities/course/model";
import type { Course } from "@/entities/course/types";
import type { CourseFilters } from "@/features/courses/types/course-filters";

const unwrap = <T>(payload: { data?: T } | T): T => {
  return ((payload as { data?: T }).data ?? payload) as T;
};

const parsePaginatedCourses = (payload: Record<string, unknown>): Paginated<Course> => {
  const itemsSource = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload.items)
      ? payload.items
      : [];
  const pagination =
    payload.pagination && typeof payload.pagination === "object"
      ? payload.pagination as Record<string, unknown>
      : undefined;
  const items = (itemsSource as Array<Record<string, unknown>>).map(mapApiCourse);

  return {
    items,
    total: Number(pagination?.total ?? payload.total ?? items.length),
    page: Number(pagination?.page ?? payload.page ?? 1),
    size: Number(pagination?.size ?? payload.size ?? (items.length || 1)),
    pages: Number(pagination?.pages ?? payload.pages ?? 1),
  };
};

export type CourseCategory = {
  id: string;
  title: string;
  orderIndex: number;
  courseCount: number;
};

export type CourseStats = {
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  notStartedLessons: number;
  overallProgressPercentage: number;
};

const mapCategory = (raw: Record<string, unknown>): CourseCategory => ({
  id: String(raw.id ?? ""),
  title: String(raw.title ?? ""),
  orderIndex: Number(raw.order_index ?? 0),
  courseCount: Number(raw.course_count ?? 0),
});

const mapCourseStats = (raw: Record<string, unknown>): CourseStats => ({
  totalLessons: Number(raw.total_lessons ?? 0),
  completedLessons: Number(raw.completed_lessons ?? 0),
  inProgressLessons: Number(raw.in_progress_lessons ?? 0),
  notStartedLessons: Number(raw.not_started_lessons ?? 0),
  overallProgressPercentage: Number(raw.overall_progress_percentage ?? 0),
});

export const coursesApi = {
  async list(filters: CourseFilters): Promise<Paginated<Course>> {
    const response = await apiClient.get(
      `${endpoints.courses.list}${buildQueryString({
        page: filters.page ?? 1,
        size: filters.size ?? 12,
        category_id: filters.categoryId,
      })}`,
    );

    return parsePaginatedCourses(response.data as Record<string, unknown>);
  },
  async categories(params: { page?: number; size?: number } = {}): Promise<CourseCategory[]> {
    const response = await apiClient.get(
      `${endpoints.courses.categories}${buildQueryString({
        page: params.page ?? 1,
        size: params.size ?? 50,
      })}`,
    );
    const payload = response.data as Record<string, unknown>;
    const items = Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.items)
        ? payload.items
        : [];

    return (items as Array<Record<string, unknown>>)
      .map(mapCategory)
      .sort((left, right) => left.orderIndex - right.orderIndex);
  },
  async stats(courseId: string): Promise<CourseStats> {
    const response = await apiClient.get(endpoints.courses.stats(courseId));
    return mapCourseStats(unwrap<Record<string, unknown>>(response.data));
  },
  async detail(courseId: string): Promise<Course> {
    const response = await apiClient.get(endpoints.courses.detail(courseId));
    return mapApiCourse(unwrap<Record<string, unknown>>(response.data));
  },
};
