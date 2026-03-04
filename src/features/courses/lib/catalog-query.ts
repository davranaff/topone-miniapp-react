import { coursesApi } from "@/features/courses/api/courses.api";
import type { Course } from "@/entities/course/types";

export type CoursesCatalog = {
  categories: Awaited<ReturnType<typeof coursesApi.categories>>;
  courses: Course[];
  overview: {
    completed: number;
    inProgress: number;
    notStarted: number;
    progress: number;
  };
};

export const coursesCatalogQueryKey = ["courses", "catalog"] as const;

export const getCoursesCatalog = async (): Promise<CoursesCatalog> => {
  const [categories, coursesPage] = await Promise.all([
    coursesApi.categories(),
    coursesApi.list({ page: 1, size: 100 }),
  ]);

  const statsResults = await Promise.allSettled(
    coursesPage.items.map((course) => coursesApi.stats(course.id)),
  );

  const courses = coursesPage.items.map((course, index) => {
    const stats = statsResults[index];

    if (stats?.status !== "fulfilled") {
      return {
        ...course,
        progress: course.progress ?? 0,
      };
    }

    return {
      ...course,
      progress: stats.value.overallProgressPercentage,
      lessonsCount: stats.value.totalLessons,
    };
  });

  const overview = statsResults.reduce(
    (acc, result) => {
      if (result.status !== "fulfilled") {
        return acc;
      }

      acc.completed += result.value.completedLessons;
      acc.inProgress += result.value.inProgressLessons;
      acc.notStarted += result.value.notStartedLessons;
      acc.progress.push(result.value.overallProgressPercentage);
      return acc;
    },
    {
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      progress: [] as number[],
    },
  );

  return {
    categories,
    courses,
    overview: {
      completed: overview.completed,
      inProgress: overview.inProgress,
      notStarted: overview.notStarted,
      progress:
        overview.progress.length > 0
          ? Math.round(overview.progress.reduce((sum, item) => sum + item, 0) / overview.progress.length)
          : 0,
    },
  };
};
