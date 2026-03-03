import { Badge } from "@/shared/ui/badge";
import type { Course } from "@/entities/course/types";

export const CourseCard = ({ course }: { course: Course }) => {
  return (
    <article className="group rounded-[1.5rem] border border-border bg-surface p-5 shadow-card transition hover:-translate-y-1 hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-text">{course.title}</h3>
          <p className="line-clamp-2 text-sm text-muted">{course.subtitle}</p>
        </div>
        <Badge className={course.isLocked ? "border-error/30 bg-error/10 text-error" : ""}>
          {course.isLocked ? "Locked" : "Open"}
        </Badge>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-muted">
        <span>{course.duration || "Self-paced"}</span>
        <span>{course.skills.length} skills</span>
      </div>
    </article>
  );
};
