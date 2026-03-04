import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  HelpCircle,
  Lock,
  Sparkles,
  PlayCircle,
  TrendingUp,
} from "lucide-react";
import { coursesApi } from "@/features/courses/api/courses.api";
import { lessonsApi } from "@/features/lessons/api/lessons.api";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Skeleton, SkeletonCard } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { EmptyState } from "@/shared/ui/empty-state";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { StatCardsRow } from "@/shared/ui/stat-card";
import { SubscriptionRequiredState } from "@/shared/ui/subscription-required-state";
import { hasApiStatus } from "@/shared/api/error-helpers";
import { cn } from "@/shared/lib/cn";
import { normalizeMediaUrl } from "@/features/home/lib/home.helpers";
import type { Lesson } from "@/entities/lesson/types";
import type { Course } from "@/entities/course/types";

const typeIcon: Record<Lesson["type"], typeof PlayCircle> = {
  video: PlayCircle,
  text: FileText,
  quiz: HelpCircle,
};

const CoursePickerCard = ({ course }: { course: Course }) => {
  const { t } = useTranslation("courses");
  const imageUrl = normalizeMediaUrl(course.coverUrl ?? course.image);
  const lessonsCount = course.lessonsCount ?? course.skills.length;

  return (
    <Link to={`/courses/${course.id}/lessons`} className="block">
      <div className="relative h-[240px] overflow-hidden rounded-[1.9rem] border border-white/10 shadow-[0_22px_60px_rgba(0,0,0,0.4)]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: imageUrl
              ? `url(${imageUrl})`
              : "linear-gradient(135deg, rgba(212,160,23,0.32) 0%, rgba(15,23,42,0.92) 100%)",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/42 to-black/10" />
        <div className="relative flex h-full flex-col justify-between p-5">
          <div className="flex items-start justify-between gap-3">
            <span className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm",
              course.isLocked ? "liquid-glass-chip text-white" : "liquid-glass-state-gold text-gold",
            )}>
              {course.isLocked ? t("lockedCourse") : t("openCourse")}
            </span>
            <span className="liquid-glass-chip rounded-full px-3 py-1 text-[11px] font-semibold text-white/85">
              {lessonsCount} dars
            </span>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <h2 className="line-clamp-2 text-[1.35rem] font-extrabold tracking-[-0.03em] text-white">{course.title}</h2>
              <p className="line-clamp-2 text-sm text-white/80">{course.subtitle}</p>
            </div>

            <div className="liquid-glass-surface flex items-center justify-between rounded-[1.35rem] px-4 py-3 text-white">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-gold">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">O'quv yo'li</p>
                  <p className="truncate text-[11px] text-white/68">{course.duration || "Moslashuvchan format"}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-white/72" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const LessonRow = ({
  lesson,
  courseId,
  isPending,
  index,
  isLast,
  onOpen,
}: {
  lesson: Lesson;
  courseId: string;
  isPending: boolean;
  index: number;
  isLast: boolean;
  onOpen: (lesson: Lesson) => void;
}) => {
  const Icon = typeIcon[lesson.type];
  const isBlocked = lesson.isLocked || !lesson.isOpen;
  const progressValue = lesson.userProgress?.progressPercentage ?? 0;
  const isCompleted = lesson.isCompleted || lesson.userProgress?.status === "COMPLETED";
  const statusLabel = isBlocked ? "Yopiq" : isCompleted ? "Tugallangan" : progressValue > 0 ? "Davom etmoqda" : "Yangi";
  const statusClass = isBlocked
    ? "liquid-glass-chip text-white"
    : isCompleted
      ? "liquid-glass-state-success text-white"
      : progressValue > 0
        ? "liquid-glass-state-gold text-gold"
        : "liquid-glass-chip text-white";

  return (
    <div className="relative pl-8">
      {!isLast && (
        <div className="absolute left-[0.95rem] top-11 bottom-[-1.15rem] w-px bg-[linear-gradient(180deg,rgba(255,226,163,0.26),rgba(255,255,255,0.04))]" />
      )}
      <div className="absolute left-0 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[rgba(255,255,255,0.05)] text-[11px] font-bold text-white/82 shadow-[0_10px_22px_rgba(0,0,0,0.18)] backdrop-blur-xl">
        {String(index + 1).padStart(2, "0")}
      </div>
      <button
        type="button"
        disabled={isBlocked || isPending}
        onClick={() => onOpen(lesson)}
        className={cn("block w-full rounded-[1.65rem] text-left", isBlocked && "cursor-default")}
      >
        <GlassCard
          goldBorder={Boolean(isCompleted)}
          className={cn("rounded-[1.65rem] border-white/10", isBlocked && "opacity-60")}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.15rem] border",
                isCompleted
                  ? "border-gold/30 bg-gold/10 text-gold"
                  : isBlocked
                    ? "border-border/40 bg-elevated text-t-muted"
                    : "border-white/10 bg-white/5 text-t-secondary",
              )}
            >
              {isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current/20 border-t-current" />
              ) : isBlocked ? (
                <Lock className="h-4 w-4" />
              ) : isCompleted ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-t-primary">{lesson.title}</p>
                  <p className="mt-1 text-xs text-t-muted">
                    {isBlocked ? "Oldingi darslarni yakunlang" : lesson.description || "Darsni davom ettirish mumkin"}
                  </p>
                </div>
                <span className={cn("rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]", statusClass)}>
                  {statusLabel}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="liquid-glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium text-white/86">
                  <Icon className="h-3.5 w-3.5" />
                  {lesson.type === "video" ? "Video" : lesson.type === "text" ? "Matn" : "Quiz"}
                </span>
                {lesson.duration && (
                  <span className="liquid-glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium text-white/74">
                    <Clock3 className="h-3.5 w-3.5" />
                    {lesson.duration}
                  </span>
                )}
                {courseId && !isBlocked && lesson.userProgress?.currentTimeSeconds ? (
                  <span className="liquid-glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium text-white/74">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {Math.floor(lesson.userProgress.currentTimeSeconds / 60)} daqiqa
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {!isBlocked && progressValue > 0 && !isCompleted && (
            <div className="mt-4 rounded-[1.25rem] bg-black/15 p-3">
              <ProgressBar value={progressValue} max={100} label="Progress" showLabel />
            </div>
          )}
        </GlassCard>
      </button>
    </div>
  );
};

export const LessonsListPage = () => {
  const { t } = useTranslation("courses");
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pendingLessonId, setPendingLessonId] = useState<string | null>(null);

  const coursesPicker = useQuery({
    queryKey: ["lessons", "course-picker"],
    queryFn: () => coursesApi.list({ page: 1, size: 100 }),
    enabled: !courseId,
  });

  const courseContent = useQuery({
    queryKey: ["lessons", "course-content", courseId],
    queryFn: async () => {
      const [course, lessons, progressStats] = await Promise.all([
        coursesApi.detail(courseId!),
        lessonsApi.byCourse(courseId!),
        lessonsApi.progressStats(courseId!),
      ]);

      return { course, lessons, progressStats };
    },
    enabled: Boolean(courseId),
  });

  const openLessonMutation = useMutation({
    mutationFn: async (lesson: Lesson) => {
      if (!courseId || lesson.userProgress) {
        return null;
      }

      return lessonsApi.createProgress({
        lessonId: lesson.id,
        courseId,
      });
    },
    onSettled: () => {
      setPendingLessonId(null);
    },
    onSuccess: async (_, lesson) => {
      await queryClient.invalidateQueries({ queryKey: ["lessons", "course-content", courseId] });
      navigate(`/courses/${courseId}/lessons/${lesson.id}`);
    },
  });

  const handleOpenLesson = (lesson: Lesson) => {
    if (!courseId || lesson.isLocked || !lesson.isOpen) {
      return;
    }

    setPendingLessonId(lesson.id);

    if (lesson.userProgress) {
      navigate(`/courses/${courseId}/lessons/${lesson.id}`);
      return;
    }

    void openLessonMutation.mutate(lesson);
  };

  if (!courseId) {
    return (
      <MobileScreen className="space-y-4">
        <PageHeader title={t("lessonsTitle")} subtitle={t("lessonsSelectCourse")} />

        {coursesPicker.isLoading && (
          <MobileScreenSection>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[220px] rounded-[1.5rem]" />
            ))}
          </MobileScreenSection>
        )}

        {coursesPicker.isError && hasApiStatus(coursesPicker.error, 403) && (
          <SubscriptionRequiredState
            title={t("subscriptionTitle")}
            description={t("subscriptionDescription")}
          />
        )}

        {coursesPicker.isError && !hasApiStatus(coursesPicker.error, 403) && (
          <ErrorState variant="network" onRetry={() => coursesPicker.refetch()} />
        )}

        {!coursesPicker.isLoading && !coursesPicker.isError && (
          coursesPicker.data?.items.length ? (
            <MobileScreenSection>
              {[...coursesPicker.data.items]
                .sort((left, right) => Number(left.isLocked) - Number(right.isLocked))
                .map((course) => (
                <CoursePickerCard key={course.id} course={course} />
                ))}
            </MobileScreenSection>
          ) : (
            <EmptyState
              icon={<BookOpen className="h-8 w-8" />}
              title={t("empty")}
              description={t("emptyDescription")}
            />
          )
        )}
      </MobileScreen>
    );
  }

  if (courseContent.isLoading) {
    return (
      <MobileScreen className="space-y-4">
        <div className="h-8 w-1/2 rounded-xl bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
        <StatCardsRow
          stats={[
            { label: t("completed"), value: 0, icon: <CheckCircle2 className="h-4 w-4" /> },
            { label: t("inProgress"), value: 0, icon: <PlayCircle className="h-4 w-4" /> },
            { label: t("notStarted"), value: 0, icon: <Clock3 className="h-4 w-4" /> },
          ]}
          columns={3}
        />
        <Skeleton className="h-[116px] rounded-[1.5rem]" />
        <MobileScreenSection>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </MobileScreenSection>
      </MobileScreen>
    );
  }

  if (courseContent.isError && hasApiStatus(courseContent.error, 403)) {
    return (
      <MobileScreen>
        <PageHeader title={t("lessonsTitle")} subtitle={t("subscriptionTitle")} backButton />
        <SubscriptionRequiredState
          title={t("subscriptionTitle")}
          description={t("subscriptionDescription")}
        />
      </MobileScreen>
    );
  }

  if (courseContent.isError || !courseContent.data) {
    return (
      <MobileScreen>
        <ErrorState variant="network" onRetry={() => courseContent.refetch()} />
      </MobileScreen>
    );
  }

  const { course, lessons, progressStats } = courseContent.data;
  const inProgressLessons = Math.max(progressStats.lessonsWithProgress - progressStats.lessonsCompleted, 0);
  const notStartedLessons = Math.max(progressStats.totalLessons - progressStats.lessonsWithProgress, 0);
  const courseImageUrl = normalizeMediaUrl(course.coverUrl ?? course.image);

  return (
    <MobileScreen className="space-y-4">
      <PageHeader title={course.title} subtitle={t("lessonsSubtitle")} backButton />

      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.34)]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: courseImageUrl
              ? `linear-gradient(180deg, rgba(9,11,15,0.12) 0%, rgba(9,11,15,0.74) 100%), url(${courseImageUrl})`
              : "linear-gradient(135deg, rgba(212,160,23,0.26) 0%, rgba(15,23,42,0.92) 100%)",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/34 to-transparent" />

        <div className="relative flex min-h-[220px] flex-col justify-between p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="liquid-glass-state-gold rounded-full px-3 py-1 text-[11px] font-semibold text-gold">
              {lessons.length} dars
            </span>
            {course.duration && (
              <span className="liquid-glass-chip rounded-full px-3 py-1 text-[11px] font-semibold text-white/82">
                {course.duration}
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-[1.4rem] font-extrabold tracking-[-0.03em] text-white">{course.title}</h2>
              <p className="max-w-[92%] text-sm leading-6 text-white/78">{course.subtitle || t("continuePath")}</p>
            </div>

            <div className="liquid-glass-surface rounded-[1.45rem] p-4 text-white">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-gold">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Kurs bo'yicha umumiy progress</p>
                  <p className="text-[11px] text-white/68">Har bir dars shu yo'ldagi keyingi bosqich</p>
                </div>
              </div>
              <ProgressBar
                value={progressStats.overallProgressPercentage}
                max={100}
                showLabel
                label={t("overallProgress")}
              />
            </div>
          </div>
        </div>
      </div>

      <StatCardsRow
        stats={[
          {
            label: t("completed"),
            value: progressStats.lessonsCompleted,
            icon: <CheckCircle2 className="h-4 w-4" />,
          },
          {
            label: t("inProgress"),
            value: inProgressLessons,
            icon: <PlayCircle className="h-4 w-4" />,
          },
          {
            label: t("notStarted"),
            value: notStartedLessons,
            icon: <Clock3 className="h-4 w-4" />,
          },
        ]}
        columns={3}
      />

      <GlassCard className="space-y-4 rounded-[1.7rem]">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[1.25rem] bg-gold/10 text-gold">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-t-primary">Darslar yo'l xaritasi</p>
            <p className="mt-1 text-xs leading-5 text-t-muted">
              Ketma-ketlik saqlanadi: yopiq darslar faqat oldingi bosqich tugagandan keyin ochiladi.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="liquid-glass-surface-muted rounded-[1.15rem] px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-t-muted">Format</p>
            <p className="mt-1 text-sm font-semibold text-t-primary">Video, matn, quiz</p>
          </div>
          <div className="liquid-glass-surface-muted rounded-[1.15rem] px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-t-muted">Tempo</p>
            <p className="mt-1 text-sm font-semibold text-t-primary">{course.duration || "Flexible"}</p>
          </div>
        </div>
      </GlassCard>

      {lessons.length === 0 ? (
        <EmptyState
          icon={<PlayCircle className="h-8 w-8" />}
          title={t("lessonsEmpty")}
          description={t("emptyDescription")}
        />
      ) : (
        <MobileScreenSection>
          {lessons.map((lesson, index) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              courseId={courseId}
              isPending={pendingLessonId === lesson.id}
              index={index}
              isLast={index === lessons.length - 1}
              onOpen={handleOpenLesson}
            />
          ))}
        </MobileScreenSection>
      )}
    </MobileScreen>
  );
};
