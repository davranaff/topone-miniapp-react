import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCoursesList } from "@/features/courses/hooks/use-courses-list";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { CourseCard } from "@/widgets/course/course-card";
import { CoursesEmptyState } from "@/features/courses/components/courses-empty-state";

export const CoursesPage = () => {
  const { t } = useTranslation("courses");
  const courses = useCoursesList({ page: 1, size: 12 });

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      {courses.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64" />
          ))}
        </div>
      ) : null}
      {!courses.isLoading && !courses.data?.items.length ? <CoursesEmptyState /> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.data?.items.map((course) => (
          <Link key={course.id} to={`/courses/${course.id}`}>
            <CourseCard course={course} />
          </Link>
        ))}
      </div>
    </div>
  );
};
