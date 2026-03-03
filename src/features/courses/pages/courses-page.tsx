import { useTranslation } from "react-i18next";
import { useCoursesList } from "@/features/courses/hooks/use-courses-list";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { CourseCard } from "@/widgets/course/course-card";
import { BookOpen } from "lucide-react";

export const CoursesPage = () => {
  const { t } = useTranslation("courses");
  const courses = useCoursesList({ page: 1, size: 20 });

  return (
    <MobileScreen>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {courses.isLoading && (
        <MobileScreenSection className="mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </MobileScreenSection>
      )}

      {courses.isError && (
        <div className="mt-6">
          <ErrorState variant="network" onRetry={() => courses.refetch()} />
        </div>
      )}

      {!courses.isLoading && !courses.isError && !courses.data?.items.length && (
        <div className="mt-10">
          <EmptyState
            icon={<BookOpen className="h-8 w-8" />}
            title="Kurslar topilmadi"
            description="Hozircha hech qanday kurs mavjud emas."
          />
        </div>
      )}

      {!!courses.data?.items.length && (
        <MobileScreenSection className="mt-4">
          {courses.data.items.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </MobileScreenSection>
      )}
    </MobileScreen>
  );
};
