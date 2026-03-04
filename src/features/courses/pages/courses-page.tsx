import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, Clock3, PlayCircle } from "lucide-react";
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
import {
  coursesCatalogQueryKey,
  getCoursesCatalog,
  type CoursesCatalog,
} from "@/features/courses/lib/catalog-query";

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
    <Link to={`/courses/${course.id}/lessons`} className="group block">
      <div className="relative aspect-[5/6] overflow-hidden rounded-[2rem] shadow-[0_24px_60px_rgba(0,0,0,0.42)] transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_32px_82px_rgba(0,0,0,0.5)]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: imageUrl
              ? `linear-gradient(180deg, rgba(9,11,15,0.04) 0%, rgba(9,11,15,0.38) 100%), url(${imageUrl})`
              : "linear-gradient(135deg, rgba(212,160,23,0.28) 0%, rgba(15,23,42,0.9) 100%)",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent_30%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/94 via-black/34 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent)]" />

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
            <div className="max-w-[85%] space-y-1.5">
              <h3 className="font-course line-clamp-2 text-[1.28rem] font-extrabold leading-tight tracking-[-0.03em] text-white">
                {course.title}
              </h3>
              <p className="line-clamp-2 text-[0.95rem] leading-5 text-white/72">
                {course.subtitle}
              </p>
            </div>

            <div className="rounded-[1.35rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.11),rgba(255,255,255,0.04))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
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
    queryKey: coursesCatalogQueryKey,
    queryFn: getCoursesCatalog,
  });

  const activeCategoryId = selectedCategoryId || catalog.data?.categories[0]?.id || "";

  const visibleCourses = useMemo(() => {
    if (!catalog.data) {
      return [] as Course[];
    }

    if (!activeCategoryId) {
      return catalog.data.courses;
    }

    return catalog.data.courses
      .filter((course) => course.categoryId === activeCategoryId)
      .sort((left, right) => {
        if (left.isLocked !== right.isLocked) {
          return Number(left.isLocked) - Number(right.isLocked);
        }

        return (right.progress ?? 0) - (left.progress ?? 0);
      });
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
              <Skeleton key={index} className="aspect-[5/6] rounded-[1.75rem]" />
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

          <GlassCard className="space-y-3 rounded-[1.7rem]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1.15rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,226,163,0.14),rgba(255,255,255,0.03))] text-gold">
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
                        "font-display rounded-full px-4 py-2 text-sm font-bold tracking-[-0.02em] transition-all",
                        active
                          ? "bg-[linear-gradient(135deg,rgba(255,255,255,0.15),rgba(236,192,89,0.16))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/10"
                          : "bg-white/5 text-white/56 ring-1 ring-white/8 hover:bg-white/8 hover:text-white/78",
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
