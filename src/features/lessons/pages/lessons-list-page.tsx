import { useParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, Lock, PlayCircle, FileText, HelpCircle } from "lucide-react";
import { useLessonsByCourse } from "@/features/lessons/hooks/use-lessons-by-course";
import { useCourseDetail } from "@/features/courses/hooks/use-course-detail";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { EmptyState } from "@/shared/ui/empty-state";
import { cn } from "@/shared/lib/cn";
import type { Lesson } from "@/entities/lesson/types";

const typeIcon: Record<Lesson["type"], typeof PlayCircle> = {
  video: PlayCircle,
  text:  FileText,
  quiz:  HelpCircle,
};

const LessonRow = ({ lesson, courseId }: { lesson: Lesson; courseId: string }) => {
  const Icon = typeIcon[lesson.type];

  const inner = (
    <GlassCard
      interactive={!lesson.isLocked}
      goldBorder={lesson.isCompleted}
      className={lesson.isLocked ? "opacity-60" : ""}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
            lesson.isCompleted
              ? "border-gold/30 bg-gold/10 text-gold"
              : lesson.isLocked
              ? "border-border/40 bg-elevated text-t-muted"
              : "border-border/60 bg-elevated text-t-secondary",
          )}
        >
          {lesson.isLocked
            ? <Lock className="h-4 w-4" />
            : lesson.isCompleted
            ? <CheckCircle2 className="h-4 w-4" />
            : <Icon className="h-4 w-4" />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-t-primary">
            <span className="shrink-0 text-xs text-t-muted">{lesson.order}.</span>
            {lesson.title}
          </p>
          {lesson.duration && (
            <p className="mt-0.5 text-xs text-t-muted">{lesson.duration}</p>
          )}
        </div>
      </div>
    </GlassCard>
  );

  if (lesson.isLocked) return <div key={lesson.id}>{inner}</div>;

  return (
    <Link key={lesson.id} to={`/courses/${courseId}/lessons/${lesson.id}`}>
      {inner}
    </Link>
  );
};

export const LessonsListPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = useCourseDetail(courseId);
  const lessons = useLessonsByCourse(courseId);

  const isLoading = course.isLoading || lessons.isLoading;

  if (isLoading) {
    return (
      <MobileScreen>
        <div className="h-8 w-1/2 rounded-xl bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
        <MobileScreenSection className="mt-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
        </MobileScreenSection>
      </MobileScreen>
    );
  }

  if (lessons.isError) {
    return (
      <MobileScreen>
        <ErrorState variant="network" onRetry={() => lessons.refetch()} />
      </MobileScreen>
    );
  }

  const title = course.data?.title ?? "Darslar";
  const items = lessons.data ?? [];

  return (
    <MobileScreen>
      <PageHeader title={title} subtitle={`${items.length} ta dars`} backButton />

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<PlayCircle className="h-8 w-8" />}
            title="Darslar topilmadi"
            description="Bu kurs uchun hali darslar qo'shilmagan."
          />
        </div>
      ) : (
        <MobileScreenSection className="mt-4">
          {items.map((lesson) => (
            <LessonRow key={lesson.id} lesson={lesson} courseId={courseId!} />
          ))}
        </MobileScreenSection>
      )}
    </MobileScreen>
  );
};
