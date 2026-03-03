import { useQuery } from "@tanstack/react-query";
import { lessonsApi } from "@/features/lessons/api/lessons.api";

export const useLessonsByCourse = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ["lessons", "course", courseId],
    queryFn: () => lessonsApi.byCourse(courseId!),
    enabled: !!courseId,
  });
};
