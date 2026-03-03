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
  const items = (payload.items as Array<Record<string, unknown>> | undefined)?.map(mapApiCourse) ?? [];

  return {
    items,
    total: Number(payload.total ?? items.length),
    page: Number(payload.page ?? 1),
    size: Number(payload.size ?? (items.length || 1)),
    pages: Number(payload.pages ?? 1),
  };
};

export const coursesApi = {
  async list(filters: CourseFilters): Promise<Paginated<Course>> {
    const response = await apiClient.get(
      `${endpoints.courses.list}${buildQueryString({
        page: filters.page ?? 1,
        size: filters.size ?? 12,
        category_id: filters.categoryId,
      })}`,
    );

    return parsePaginatedCourses(unwrap<Record<string, unknown>>(response.data));
  },
  async detail(courseId: string): Promise<Course> {
    const response = await apiClient.get(endpoints.courses.detail(courseId));
    return mapApiCourse(unwrap<Record<string, unknown>>(response.data));
  },
};
