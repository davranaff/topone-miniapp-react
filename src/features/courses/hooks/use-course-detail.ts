import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import { coursesApi } from "@/features/courses/api/courses.api";

export const useCourseDetail = (courseId?: string) => {
  return useQuery({
    queryKey: queryKeys.courses.detail(courseId ?? ""),
    queryFn: () => coursesApi.detail(courseId ?? ""),
    enabled: Boolean(courseId),
  });
};
