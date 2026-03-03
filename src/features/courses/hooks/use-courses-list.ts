import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import { coursesApi } from "@/features/courses/api/courses.api";
import type { CourseFilters } from "@/features/courses/types/course-filters";

export const useCoursesList = (filters: CourseFilters) => {
  return useQuery({
    queryKey: queryKeys.courses.list(filters),
    queryFn: () => coursesApi.list(filters),
  });
};
