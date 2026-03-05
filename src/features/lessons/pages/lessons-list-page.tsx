import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  HelpCircle,
  Lock,
  Star,
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
import { InfiniteScrollLoader } from "@/shared/ui/infinite-scroll-loader";
import { hasApiStatus } from "@/shared/api/error-helpers";
import { cn } from "@/shared/lib/cn";
import { normalizeMediaUrl } from "@/features/home/lib/home.helpers";
import type { Lesson } from "@/entities/lesson/types";
import type { Course } from "@/entities/course/types";
import { useInfiniteScrollTrigger } from "@/shared/hooks/use-infinite-scroll-trigger";

const typeIcon: Record<Lesson["type"], typeof PlayCircle> = {
  video: PlayCircle,
  text: FileText,
  quiz: HelpCircle,
};
const LESSONS_PAGE_SIZE = 12;

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
                  <Star className="h-4 w-4" />
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
  const displayProgressValue = isCompleted ? Math.max(progressValue, 100) : progressValue;
  const statusLabel = isBlocked ? "Yopiq" : isCompleted ? "Tugallangan" : progressValue > 0 ? "Davom etmoqda" : "Yangi";
  const statusClass = isBlocked
    ? "liquid-glass-chip text-white"
    : isCompleted
      ? "liquid-glass-state-success text-white"
      : progressValue > 0
        ? "liquid-glass-state-gold text-gold"
        : "liquid-glass-chip text-white";

  return (
    <div className="relative pl-7 sm:pl-8">
      {!isLast && (
        <div className="absolute left-[0.9rem] top-10 bottom-[-1rem] w-px bg-[linear-gradient(180deg,rgba(255,226,163,0.26),rgba(255,255,255,0.04))] sm:left-[0.95rem] sm:top-11 sm:bottom-[-1.15rem]" />
      )}
      <div className="absolute left-0 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[rgba(255,255,255,0.05)] text-[10px] font-bold text-white/82 shadow-[0_10px_22px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:top-5 sm:h-8 sm:w-8 sm:text-[11px]">
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
          className={cn("rounded-[1.4rem] border-white/10 sm:rounded-[1.65rem]", isBlocked && "opacity-60")}
        >
          <div className="flex items-start gap-3 sm:gap-3.5">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border sm:h-12 sm:w-12 sm:rounded-[1.15rem]",
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
                  <p className="truncate text-sm font-semibold text-t-primary sm:text-[0.96rem]">{lesson.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-t-muted sm:text-[0.83rem]">
                    {isBlocked ? "Oldingi darslarni yakunlang" : lesson.description || "Darsni davom ettirish mumkin"}
                  </p>
                </div>
                <span className={cn("rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]", statusClass)}>
                  {statusLabel}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-2.5">
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

          {!isBlocked && (
            <div className="mt-4 rounded-[1.15rem] bg-black/15 p-2.5 sm:rounded-[1.25rem] sm:p-3">
              <ProgressBar value={displayProgressValue} max={100} label="Progress" showLabel />
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

  const courseMeta = useQuery({
    queryKey: ["lessons", "course-meta", courseId],
    queryFn: async () => {
      const [course, progressStats] = await Promise.all([
        coursesApi.detail(courseId!),
        lessonsApi.progressStats(courseId!),
      ]);

      return { course, progressStats };
    },
    enabled: Boolean(courseId),
  });
  const lessonsQuery = useInfiniteQuery({
    queryKey: ["lessons", "course-content", courseId],
    queryFn: ({ pageParam = 1 }) =>
      lessonsApi.listByCourse(courseId!, {
        page: Number(pageParam),
        size: LESSONS_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
    enabled: Boolean(courseId),
  });
  const {
    hasNextPage: hasNextLessonsPage,
    isFetchingNextPage: isFetchingNextLessonsPage,
    fetchNextPage: fetchNextLessonsPage,
  } = lessonsQuery;
  const lessons = useMemo(() => {
    const pages = lessonsQuery.data?.pages ?? [];
    const flattened = pages.flatMap((page) => page.items);
    const seen = new Set<string>();

    return flattened.filter((lesson) => {
      if (seen.has(lesson.id)) {
        return false;
      }
      seen.add(lesson.id);
      return true;
    });
  }, [lessonsQuery.data]);
  const loadMoreRef = useInfiniteScrollTrigger({
    hasNextPage: hasNextLessonsPage,
    isFetchingNextPage: isFetchingNextLessonsPage,
    onLoadMore: () => fetchNextLessonsPage(),
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["lessons", "course-content", courseId] }),
        queryClient.invalidateQueries({ queryKey: ["lessons", "course-meta", courseId] }),
      ]);
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
      <MobileScreen className="space-y-4 lg:space-y-5">
        <PageHeader title={t("lessonsTitle")} subtitle={t("lessonsSelectCourse")} />

        {coursesPicker.isLoading && (
          <MobileScreenSection className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
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
            <MobileScreenSection className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
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

  const hasLoadedLessons = (lessonsQuery.data?.pages[0]?.items.length ?? 0) > 0;
  const isInitialContentLoading = courseMeta.isLoading || lessonsQuery.isLoading;
  const hasSubscriptionError =
    hasApiStatus(courseMeta.error, 403) || hasApiStatus(lessonsQuery.error, 403);

  if (isInitialContentLoading) {
    return (
      <MobileScreen className="space-y-4 lg:space-y-5">
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
        <MobileScreenSection className="desktop-cards-grid">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </MobileScreenSection>
      </MobileScreen>
    );
  }

  if (hasSubscriptionError) {
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

  if ((courseMeta.isError || !courseMeta.data) && !hasSubscriptionError) {
    return (
      <MobileScreen>
        <ErrorState variant="network" onRetry={() => courseMeta.refetch()} />
      </MobileScreen>
    );
  }

  if (lessonsQuery.isError && !hasLoadedLessons && !hasSubscriptionError) {
    return (
      <MobileScreen>
        <ErrorState variant="network" onRetry={() => lessonsQuery.refetch()} />
      </MobileScreen>
    );
  }

  const courseMetaData = courseMeta.data;
  if (!courseMetaData) {
    return (
      <MobileScreen>
        <ErrorState variant="network" onRetry={() => courseMeta.refetch()} />
      </MobileScreen>
    );
  }

  const { course, progressStats } = courseMetaData;
  const inProgressLessons = Math.max(progressStats.lessonsWithProgress - progressStats.lessonsCompleted, 0);
  const notStartedLessons = Math.max(progressStats.totalLessons - progressStats.lessonsWithProgress, 0);
  const courseImageUrl = normalizeMediaUrl(course.coverUrl ?? course.image);

  return (
    <MobileScreen className="space-y-4 lg:space-y-5">
      <PageHeader title={course.title} subtitle={t("lessonsSubtitle")} backButton />

      <div className="mx-auto w-full max-w-[74rem] space-y-4 lg:space-y-5">
        <div className="relative overflow-hidden rounded-[1.55rem] shadow-[0_24px_56px_rgba(0,0,0,0.4)] sm:rounded-[2rem] sm:shadow-[0_26px_70px_rgba(0,0,0,0.46)]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: courseImageUrl
                ? `linear-gradient(180deg, rgba(3,4,6,0.5) 0%, rgba(5,6,9,0.88) 55%, rgba(2,2,2,0.95) 100%), url(${courseImageUrl})`
                : "linear-gradient(135deg, rgba(212,160,23,0.26) 0%, rgba(15,23,42,0.92) 100%)",
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/58 to-black/24" />

          <div className="relative flex min-h-[210px] flex-col justify-between p-4 sm:min-h-[236px] sm:p-6 lg:min-h-[268px] lg:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="liquid-glass-state-gold rounded-full px-3 py-1 text-[11px] font-semibold text-gold">
                {(progressStats.totalLessons || lessons.length)} dars
              </span>
              {course.duration && (
                <span className="liquid-glass-chip rounded-full px-3 py-1 text-[11px] font-semibold text-white/82">
                  {course.duration}
                </span>
              )}
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <h2 className="text-[1.15rem] font-extrabold tracking-[-0.03em] text-white sm:text-[1.4rem] lg:text-[1.55rem]">
                  {course.title}
                </h2>
                <p className="max-w-[96%] text-sm leading-5 text-white/76 sm:max-w-[88%] sm:leading-6 lg:max-w-[72%]">
                  {course.subtitle || t("continuePath")}
                </p>
              </div>

              <div className="liquid-glass-surface rounded-[1.2rem] p-3 text-white sm:rounded-[1.45rem] sm:p-4 lg:p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-gold sm:h-10 sm:w-10">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
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
          className="grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3"
        />

        {lessons.length === 0 ? (
          <EmptyState
            icon={<PlayCircle className="h-8 w-8" />}
            title={t("lessonsEmpty")}
            description={t("emptyDescription")}
          />
        ) : (
          <MobileScreenSection className="space-y-3.5 sm:space-y-4">
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

            {lessonsQuery.isError && hasLoadedLessons ? (
              <ErrorState variant="network" onRetry={() => lessonsQuery.refetch()} />
            ) : null}

            <InfiniteScrollLoader
              sentinelRef={loadMoreRef}
              hasNextPage={hasNextLessonsPage}
              isFetchingNextPage={isFetchingNextLessonsPage}
            />
          </MobileScreenSection>
        )}
      </div>
    </MobileScreen>
  );
};
