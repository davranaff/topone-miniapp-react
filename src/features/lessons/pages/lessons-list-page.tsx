import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  HelpCircle,
  Lock,
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

  return (
    <Link to={`/courses/${course.id}/lessons`} className="block">
      <div className="relative h-[220px] overflow-hidden rounded-[1.5rem] border border-white/10 shadow-card">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-5">
          <div className="flex items-start justify-between gap-3">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                course.isLocked ? "bg-white/15 text-white" : "bg-gold/90 text-black",
              )}
            >
              {course.isLocked ? t("lockedCourse") : t("openCourse")}
            </span>
            {course.duration && (
              <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[11px] font-semibold text-white/85">
                {course.duration}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="line-clamp-2 text-xl font-bold text-white">{course.title}</h2>
            <p className="line-clamp-2 text-sm text-white/80">{course.subtitle}</p>
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
  onOpen,
}: {
  lesson: Lesson;
  courseId: string;
  isPending: boolean;
  onOpen: (lesson: Lesson) => void;
}) => {
  const Icon = typeIcon[lesson.type];
  const isBlocked = lesson.isLocked || !lesson.isOpen;
  const progressValue = lesson.userProgress?.progressPercentage ?? 0;
  const isCompleted = lesson.isCompleted || lesson.userProgress?.status === "COMPLETED";

  return (
    <button
      type="button"
      disabled={isBlocked || isPending}
      onClick={() => onOpen(lesson)}
      className={cn("block w-full text-left", isBlocked && "cursor-default")}
    >
      <GlassCard
        interactive={!isBlocked && !isPending}
        goldBorder={Boolean(isCompleted)}
        className={cn("rounded-[1.35rem]", isBlocked && "opacity-60")}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
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
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-t-primary">
                <span className="mr-1.5 text-xs text-t-muted">{lesson.order}.</span>
                {lesson.title}
              </p>
              {isCompleted && <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">Done</span>}
            </div>
            <p className="mt-0.5 truncate text-xs text-t-muted">
              {isBlocked
                ? "Oldingi darslarni yakunlang"
                : lesson.duration || "Darsni davom ettirish mumkin"}
            </p>
          </div>
        </div>

        {!isBlocked && progressValue > 0 && !isCompleted && (
          <div className="mt-4">
            <ProgressBar value={progressValue} max={100} label="Progress" showLabel />
          </div>
        )}

        {courseId && !isBlocked && lesson.userProgress?.currentTimeSeconds ? (
          <p className="mt-3 text-[11px] text-t-muted">
            Oxirgi nuqta: {Math.floor(lesson.userProgress.currentTimeSeconds / 60)} daqiqa
          </p>
        ) : null}
      </GlassCard>
    </button>
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
              {coursesPicker.data.items.map((course) => (
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

  return (
    <MobileScreen className="space-y-4">
      <PageHeader title={course.title} subtitle={t("lessonsSubtitle")} backButton />

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

      <GlassCard className="space-y-3 rounded-[1.5rem]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/10 text-gold">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-t-primary">{t("overallProgress")}</p>
            <p className="text-xs text-t-muted">{course.subtitle || t("continuePath")}</p>
          </div>
        </div>

        <ProgressBar
          value={progressStats.overallProgressPercentage}
          max={100}
          showLabel
          label={t("overallProgress")}
        />
      </GlassCard>

      {lessons.length === 0 ? (
        <EmptyState
          icon={<PlayCircle className="h-8 w-8" />}
          title={t("lessonsEmpty")}
          description={t("emptyDescription")}
        />
      ) : (
        <MobileScreenSection>
          {lessons.map((lesson) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              courseId={courseId}
              isPending={pendingLessonId === lesson.id}
              onOpen={handleOpenLesson}
            />
          ))}
        </MobileScreenSection>
      )}
    </MobileScreen>
  );
};
