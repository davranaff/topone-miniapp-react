import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, Clock3, PlayCircle } from "lucide-react";
import { coursesApi } from "@/features/courses/api/courses.api";
import { normalizeMediaUrl } from "@/features/home/lib/home.helpers";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { StatCardsRow } from "@/shared/ui/stat-card";
import { GlassCard } from "@/shared/ui/glass-card";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { Badge } from "@/shared/ui/badge";
import { SubscriptionRequiredState } from "@/shared/ui/subscription-required-state";
import { hasApiStatus } from "@/shared/api/error-helpers";
import type { Course } from "@/entities/course/types";

type CoursesCatalog = {
  categories: Awaited<ReturnType<typeof coursesApi.categories>>;
  courses: Course[];
  overview: {
    completed: number;
    inProgress: number;
    notStarted: number;
    progress: number;
  };
};

const catalogQueryKey = ["courses", "catalog"] as const;

const CourseGridCard = ({
  course,
  openLabel,
  lockedLabel,
}: {
  course: Course;
  openLabel: string;
  lockedLabel: string;
}) => {
  const imageUrl = normalizeMediaUrl(course.coverUrl ?? course.image);
  const progress = course.progress ?? 0;

  return (
    <Link to={`/courses/${course.id}/lessons`} className="block">
      <div className="relative h-[336px] overflow-hidden rounded-[1.75rem] border border-white/10 shadow-card">
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
            <Badge variant={course.isLocked ? "muted" : "gold"} size="md">
              {course.isLocked ? lockedLabel : openLabel}
            </Badge>
            {course.duration && (
              <div className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[11px] font-semibold text-white/85 backdrop-blur-sm">
                {course.duration}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <h3 className="line-clamp-2 text-[1.1rem] font-bold leading-tight text-white">
                {course.title}
              </h3>
              <p className="line-clamp-2 text-sm leading-5 text-white/80">
                {course.subtitle}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-3 backdrop-blur-sm">
              <ProgressBar
                value={progress}
                max={100}
                size="xs"
                showLabel
                label="Progress"
                trackClassName="bg-white/15"
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const CoursesPage = () => {
  const { t } = useTranslation("courses");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const catalog = useQuery<CoursesCatalog>({
    queryKey: catalogQueryKey,
    queryFn: async () => {
      const [categories, coursesPage] = await Promise.all([
        coursesApi.categories(),
        coursesApi.list({ page: 1, size: 100 }),
      ]);

      const statsResults = await Promise.allSettled(
        coursesPage.items.map((course) => coursesApi.stats(course.id)),
      );

      const courses = coursesPage.items.map((course, index) => {
        const stats = statsResults[index];

        if (stats?.status !== "fulfilled") {
          return {
            ...course,
            progress: course.progress ?? 0,
          };
        }

        return {
          ...course,
          progress: stats.value.overallProgressPercentage,
          lessonsCount: stats.value.totalLessons,
        };
      });

      const overview = statsResults.reduce(
        (acc, result) => {
          if (result.status !== "fulfilled") {
            return acc;
          }

          acc.completed += result.value.completedLessons;
          acc.inProgress += result.value.inProgressLessons;
          acc.notStarted += result.value.notStartedLessons;
          acc.progress.push(result.value.overallProgressPercentage);
          return acc;
        },
        {
          completed: 0,
          inProgress: 0,
          notStarted: 0,
          progress: [] as number[],
        },
      );

      return {
        categories,
        courses,
        overview: {
          completed: overview.completed,
          inProgress: overview.inProgress,
          notStarted: overview.notStarted,
          progress:
            overview.progress.length > 0
              ? Math.round(
                  overview.progress.reduce((sum, item) => sum + item, 0) / overview.progress.length,
                )
              : 0,
        },
      };
    },
  });

  const activeCategoryId = selectedCategoryId || catalog.data?.categories[0]?.id || "";

  const visibleCourses = useMemo(() => {
    if (!catalog.data) {
      return [] as Course[];
    }

    if (!activeCategoryId) {
      return catalog.data.courses;
    }

    return catalog.data.courses.filter((course) => course.categoryId === activeCategoryId);
  }, [activeCategoryId, catalog.data]);

  return (
    <MobileScreen className="space-y-4">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {catalog.isLoading && (
        <>
          <StatCardsRow
            stats={[
              { label: t("completed"), value: 0, icon: <CheckCircle2 className="h-4 w-4" /> },
              { label: t("inProgress"), value: 0, icon: <PlayCircle className="h-4 w-4" /> },
              { label: t("notStarted"), value: 0, icon: <Clock3 className="h-4 w-4" /> },
            ]}
            columns={3}
          />
          <Skeleton className="h-[116px] rounded-[1.5rem]" />
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-24 rounded-full" />
            ))}
          </div>
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[336px] rounded-[1.75rem]" />
            ))}
          </div>
        </>
      )}

      {catalog.isError && hasApiStatus(catalog.error, 403) && (
        <SubscriptionRequiredState
          title={t("subscriptionTitle")}
          description={t("subscriptionDescription")}
        />
      )}

      {catalog.isError && !hasApiStatus(catalog.error, 403) && (
        <ErrorState variant="network" onRetry={() => catalog.refetch()} />
      )}

      {!catalog.isLoading && !catalog.isError && catalog.data && (
        <>
          <StatCardsRow
            stats={[
              {
                label: t("completed"),
                value: catalog.data.overview.completed,
                icon: <CheckCircle2 className="h-4 w-4" />,
              },
              {
                label: t("inProgress"),
                value: catalog.data.overview.inProgress,
                icon: <PlayCircle className="h-4 w-4" />,
              },
              {
                label: t("notStarted"),
                value: catalog.data.overview.notStarted,
                icon: <Clock3 className="h-4 w-4" />,
              },
            ]}
            columns={3}
          />

          <GlassCard className="space-y-3 rounded-[1.5rem]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-t-primary">{t("overallProgress")}</p>
                <p className="text-xs text-t-muted">{t("continuePath")}</p>
              </div>
            </div>

            <ProgressBar
              value={catalog.data.overview.progress}
              max={100}
              showLabel
              label={t("overallProgress")}
            />
          </GlassCard>

          {catalog.data.categories.length > 0 && (
            <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
              <div className="flex gap-2 pb-1">
                {catalog.data.categories.map((category) => {
                  const active = category.id === activeCategoryId;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(category.id)}
                      className={[
                        "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                        active
                          ? "border-gold/40 bg-gold/10 text-gold"
                          : "border-border/50 bg-elevated text-t-secondary",
                      ].join(" ")}
                    >
                      {category.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {visibleCourses.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-8 w-8" />}
              title={t("empty")}
              description={t("emptyDescription")}
            />
          ) : (
            <MobileScreenSection className="grid gap-4">
              {visibleCourses.map((course) => (
                <CourseGridCard
                  key={course.id}
                  course={course}
                  openLabel={t("openCourse")}
                  lockedLabel={t("lockedCourse")}
                />
              ))}
            </MobileScreenSection>
          )}
        </>
      )}
    </MobileScreen>
  );
};
