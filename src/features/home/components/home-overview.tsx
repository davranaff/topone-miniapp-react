import { Link } from "react-router-dom";
import { ChevronRight, Swords, BookOpen, LayoutGrid } from "lucide-react";
import { useHomeFeed } from "@/features/home/hooks/use-home-feed";
import { useUserStats } from "@/features/home/hooks/use-user-stats";
import { useUnreadCount } from "@/features/notifications/hooks/use-notifications";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { SectionTitle } from "@/shared/ui/section-title";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { Button } from "@/shared/ui/button";
import { GlassCard } from "@/shared/ui/glass-card";
import { CourseCard } from "@/widgets/course/course-card";
import { MiniAppCard } from "@/widgets/mini-apps/mini-app-card";
import { ProfileSummaryCard } from "@/widgets/profile/profile-summary-card";
import { TopActionCluster } from "@/widgets/navigation/top-action-cluster";

export const HomeOverview = () => {
  const feed = useHomeFeed();
  const stats = useUserStats();
  const unread = useUnreadCount();

  if (feed.isLoading) {
    return (
      <MobileScreen>
        <div className="flex items-center justify-between py-3">
          <div className="h-7 w-24 rounded-lg bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
          <div className="flex gap-2">
            <div className="h-8 w-16 rounded-lg bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
            <div className="h-8 w-8 rounded-xl bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
          </div>
        </div>
        <div className="mt-4 space-y-4">
          <div className="h-16 w-full rounded-2xl bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </MobileScreen>
    );
  }

  if (feed.isError) {
    return (
      <MobileScreen>
        <ErrorState variant="network" onRetry={() => feed.refetch()} />
      </MobileScreen>
    );
  }

  if (!feed.data) return null;

  const { profile, courses, miniApps } = feed.data;

  return (
    <MobileScreen>
      {/* ---- Header row ---- */}
      <div className="flex items-center justify-between py-3">
        <div className="space-y-0.5">
          <p className="text-xs text-t-muted">Assalomu alaykum,</p>
          <p className="text-base font-bold text-t-primary leading-none">
            {profile.firstName || profile.username}
          </p>
        </div>
        <TopActionCluster
          coins={stats.data?.coins}
          stars={stats.data?.xp}
          unreadNotifications={unread.data ?? 0}
        />
      </div>

      <div className="mt-3 space-y-5">
        {/* ---- Profile card ---- */}
        <ProfileSummaryCard profile={profile} />

        {/* ---- Quick actions ---- */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { to: "/courses", icon: BookOpen, label: "Kurslar" },
            { to: "/challenges", icon: Swords, label: "Челленж" },
            { to: "/mini-apps", icon: LayoutGrid, label: "Mini App" },
          ].map((item) => (
            <Link key={item.to} to={item.to}>
              <GlassCard padding="sm" interactive className="flex flex-col items-center gap-1.5 py-3">
                <item.icon className="h-5 w-5 text-gold" />
                <span className="text-2xs font-medium text-t-secondary">{item.label}</span>
              </GlassCard>
            </Link>
          ))}
        </div>

        {/* ---- Courses ---- */}
        {courses.length > 0 && (
          <MobileScreenSection>
            <SectionTitle
              title="Kurslar"
              action={
                <Button asChild variant="ghost" size="xs">
                  <Link to="/courses">
                    Hammasi <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              }
            />
            <div className="space-y-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </MobileScreenSection>
        )}

        {/* ---- Mini-apps ---- */}
        {miniApps.length > 0 && (
          <MobileScreenSection>
            <SectionTitle
              title="Mini Ilovalar"
              action={
                <Button asChild variant="ghost" size="xs">
                  <Link to="/mini-apps">
                    Hammasi <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              }
            />
            <div className="space-y-3">
              {miniApps.map((app) => (
                <MiniAppCard key={app.id} app={app} />
              ))}
            </div>
          </MobileScreenSection>
        )}
      </div>
    </MobileScreen>
  );
};
