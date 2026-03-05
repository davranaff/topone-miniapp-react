import { useParams, useNavigate, Link } from "react-router-dom";
import { Clock, BookOpen, Lock, ChevronRight, PlayCircle } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { GlassCard } from "@/shared/ui/glass-card";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { Button } from "@/shared/ui/button";
import { SubscriptionRequiredState } from "@/shared/ui/subscription-required-state";
import { hasApiStatus } from "@/shared/api/error-helpers";
import { useCourseDetail } from "@/features/courses/hooks/use-course-detail";

export const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = useCourseDetail(courseId);

  if (course.isLoading) {
    return (
      <MobileScreen className="space-y-4 lg:space-y-5">
        <div className="space-y-4 pt-2">
          <div className="h-8 w-2/3 rounded-xl bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
          <div className="h-4 w-full rounded-lg bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </MobileScreen>
    );
  }

  if (course.isError && hasApiStatus(course.error, 403)) {
    return (
      <MobileScreen className="space-y-4 lg:space-y-5">
        <PageHeader title="Kurs" backButton />
        <SubscriptionRequiredState />
      </MobileScreen>
    );
  }

  if (course.isError || !course.data) {
    return (
      <MobileScreen className="space-y-4 lg:space-y-5">
        <ErrorState variant="not-found" onRetry={() => navigate(-1)} retryLabel="Назад" />
      </MobileScreen>
    );
  }

  const { data } = course;
  const progress = data.progress ?? 0;

  return (
    <MobileScreen className="space-y-4 lg:space-y-5">
      <PageHeader
        title={data.title}
        subtitle={data.subtitle}
        backButton
        actions={
          <Badge variant={data.isLocked ? "muted" : "gold"} size="sm">
            {data.isLocked ? "Закрыт" : "Открыт"}
          </Badge>
        }
      />

      <div className="mt-4 desktop-main-aside">
        <div className="space-y-4">
          {/* --- Meta info --- */}
          <GlassCard>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-t-secondary">
                <Clock className="h-4 w-4 text-gold" />
                <span>{data.duration || "Самостоятельно"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-t-secondary">
                <BookOpen className="h-4 w-4 text-gold" />
                <span>{data.lessonsCount ?? data.skills.length} уроков</span>
              </div>
            </div>

            {progress > 0 && (
              <div className="mt-3">
                <ProgressBar value={progress} max={100} showLabel label="Прогресс курса" />
              </div>
            )}
          </GlassCard>

          {/* --- Skills --- */}
          {data.skills.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-t-muted">Навыки</p>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill) => (
                  <Badge key={skill.id} variant="outline" size="sm">{skill.title}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* --- CTA --- */}
          {!data.isLocked && (
            <Button
              fullWidth
              variant="primary"
              onClick={() => navigate(`/courses/${courseId}/lessons`)}
            >
              <PlayCircle className="h-4 w-4" />
              {progress > 0 ? "Продолжить" : "Начать курс"}
            </Button>
          )}

          {data.isLocked && (
            <GlassCard className="border-gold/20 bg-gold/5">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="text-sm font-semibold text-t-primary">Курс закрыт</p>
                  <p className="text-xs text-t-muted">Оформите подписку для доступа</p>
                </div>
                <Link to="/subscription" className="ml-auto">
                  <ChevronRight className="h-4 w-4 text-gold" />
                </Link>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </MobileScreen>
  );
};
