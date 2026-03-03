import { Link } from "react-router-dom";
import { Lock, BookOpen } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { GlassCard } from "@/shared/ui/glass-card";
import type { Course } from "@/entities/course/types";

export const CourseCard = ({ course }: { course: Course }) => {
  const progress = course.progress ?? 0;

  return (
    <Link to={`/courses/${course.id}`}>
      <GlassCard interactive goldBorder={!course.isLocked && progress > 0}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-elevated">
            {course.isLocked
              ? <Lock className="h-4 w-4 text-t-muted" />
              : <BookOpen className="h-4 w-4 text-gold" />}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-t-primary">{course.title}</h3>
            <p className="mt-0.5 line-clamp-2 text-xs text-t-muted">{course.subtitle}</p>
          </div>
          <Badge variant={course.isLocked ? "muted" : "gold"} size="sm">
            {course.isLocked ? "Закрыт" : "Открыт"}
          </Badge>
        </div>

        {progress > 0 && (
          <div className="mt-3">
            <ProgressBar value={progress} max={100} size="xs" showLabel label="Прогресс" />
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-t-muted">
          <span>{course.duration || "В своём темпе"}</span>
          <span>{course.skills?.length ?? 0} навыков</span>
        </div>
      </GlassCard>
    </Link>
  );
};
