import { useParams } from "react-router-dom";
import { Badge } from "@/shared/ui/badge";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { useCourseDetail } from "@/features/courses/hooks/use-course-detail";

export const CourseDetailPage = () => {
  const { courseId } = useParams();
  const course = useCourseDetail(courseId);

  if (course.isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!course.data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={course.data.title} subtitle={course.data.subtitle} />
      <section className="rounded-lg border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-wrap gap-3">
          <Badge>{course.data.duration || "Self-paced"}</Badge>
          <Badge className={course.data.isLocked ? "border-error/30 bg-error/10 text-error" : ""}>
            {course.data.isLocked ? "Locked" : "Open"}
          </Badge>
        </div>
        <p className="mt-4 text-sm text-muted">
          Seed-модуль курса уже подключён к реальному endpoint `/api/v1/courses/:courseId`, поэтому сюда можно без перестройки добавлять lessons, stats и actions.
        </p>
        {course.data.skills.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {course.data.skills.map((skill) => (
              <Badge key={skill.id}>{skill.title}</Badge>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
};
