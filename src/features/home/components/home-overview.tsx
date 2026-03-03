import { useTranslation } from "react-i18next";
import { useHomeFeed } from "@/features/home/hooks/use-home-feed";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { CourseCard } from "@/widgets/course/course-card";
import { MiniAppCard } from "@/widgets/mini-apps/mini-app-card";
import { ProfileSummaryCard } from "@/widgets/profile/profile-summary-card";

export const HomeOverview = () => {
  const { t } = useTranslation("home");
  const feed = useHomeFeed();

  if (feed.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!feed.data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("welcome")} />
      <ProfileSummaryCard profile={feed.data.profile} />
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("courses")}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {feed.data.courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("miniApps")}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {feed.data.miniApps.map((app) => (
            <MiniAppCard key={app.id} app={app} />
          ))}
        </div>
      </section>
    </div>
  );
};
