import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Sparkles,
  Clock3,
  Lock,
  Trophy,
  BookOpen,
} from "lucide-react";
import { useHomeFeed } from "@/features/home/hooks/use-home-feed";
import { useUserStats } from "@/features/home/hooks/use-user-stats";
import { useUnreadCount } from "@/features/notifications/hooks/use-notifications";
import {
  formatCountdown,
  getRemainingCountdown,
  normalizeMediaUrl,
} from "@/features/home/lib/home.helpers";
import type { HomeAnnouncement } from "@/features/home/types/home.types";
import type { SubscriptionStatus } from "@/features/auth/types/auth.types";
import type { Challenge } from "@/entities/challenge/types";
import type { Course } from "@/entities/course/types";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { SectionTitle } from "@/shared/ui/section-title";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { Button } from "@/shared/ui/button";
import { GlassCard } from "@/shared/ui/glass-card";
import { FeaturedCarousel } from "@/shared/ui/featured-carousel";
import { PageHeader } from "@/shared/ui/page-header";
import { EmptyState } from "@/shared/ui/empty-state";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/cn";
import { TopActionCluster } from "@/widgets/navigation/top-action-cluster";

type StaticChallengeCard = {
  id: string;
  title: string;
  description: string;
  reward: string;
  typeLabel: string;
  statusLabel: string;
};

const ANNOUNCEMENT_GRADIENTS = [
  "linear-gradient(135deg, rgba(99,102,241,0.92) 0%, rgba(168,85,247,0.88) 100%)",
  "linear-gradient(135deg, rgba(212,160,23,0.92) 0%, rgba(139,105,20,0.88) 100%)",
  "linear-gradient(135deg, rgba(16,185,129,0.92) 0%, rgba(6,182,212,0.88) 100%)",
  "linear-gradient(135deg, rgba(139,92,246,0.92) 0%, rgba(236,72,153,0.88) 100%)",
];

const getChallengeTypeLabel = (challenge: Challenge, t: (key: string) => string) => {
  if (challenge.typeLabel) {
    return challenge.typeLabel;
  }

  switch (challenge.typeCode) {
    case "daily":
      return t("challengeTypeDaily");
    case "weekly":
      return t("challengeTypeWeekly");
    case "monthly":
      return t("challengeTypeMonthly");
    default:
      return t("challengeTypeOther");
  }
};

const getChallengeStatusLabel = (challenge: Challenge, t: (key: string) => string) => {
  if (challenge.statusLabel) {
    return challenge.statusLabel;
  }

  if (challenge.isCompleted) {
    return t("challengeStatusActive");
  }

  return challenge.isStarted ? t("challengeStatusActive") : t("challengeStatusPending");
};

const getChallengeReward = (challenge: Challenge) => {
  if (challenge.coinReward && challenge.coinReward > 0) {
    return `${challenge.coinReward} Coin`;
  }

  return `${challenge.xpReward} XP`;
};

const HomeAnnouncementCard = ({
  announcement,
  index,
  onOpen,
}: {
  announcement: HomeAnnouncement;
  index: number;
  onOpen: () => void;
}) => {
  const imageUrl = normalizeMediaUrl(announcement.imageUrl);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group block w-full text-left"
      aria-label={announcement.title}
    >
      <div className="relative min-h-[190px] overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_26px_70px_rgba(0,0,0,0.42)] transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_32px_84px_rgba(0,0,0,0.52)]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: imageUrl
              ? `linear-gradient(180deg, rgba(9,11,15,0.08) 0%, rgba(9,11,15,0.64) 100%), url(${imageUrl})`
              : ANNOUNCEMENT_GRADIENTS[index % ANNOUNCEMENT_GRADIENTS.length],
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_28%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent)]" />

        <div className="relative flex min-h-[180px] flex-col justify-end gap-2 p-5">
          <h2 className="max-w-[90%] text-xl font-bold leading-tight text-white">
            {announcement.title}
          </h2>
          {announcement.description && (
            <p className="line-clamp-2 max-w-[88%] text-sm leading-5 text-white/85">
              {announcement.description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};

const HomeMiniAppsRow = ({
  title,
  subtitle,
  onTap,
}: {
  title: string;
  subtitle: string;
  onTap: () => void;
}) => (
  <button type="button" className="group block w-full text-left" onClick={onTap}>
    <GlassCard
      interactive
      className="flex items-center gap-4 rounded-[1.55rem] border-white/10 px-4 py-4"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.15rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,226,163,0.14),rgba(255,255,255,0.03))] text-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-t-primary">{title}</p>
        <p className="mt-0.5 truncate text-xs text-white/54">{subtitle}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-t-muted transition-transform duration-300 group-hover:translate-x-0.5" />
    </GlassCard>
  </button>
);

const FeaturedCourseCard = ({ course }: { course: Course }) => {
  const { t } = useTranslation("home");
  const imageUrl = normalizeMediaUrl(course.coverUrl ?? course.image);
  const progress = course.progress ?? 0;

  return (
    <Link
      to={`/courses/${course.id}/lessons`}
      className="group block w-[304px] shrink-0 snap-start"
    >
      <div className="relative h-[338px] overflow-hidden rounded-[2rem] shadow-[0_24px_60px_rgba(0,0,0,0.42)] transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_32px_82px_rgba(0,0,0,0.5)]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: imageUrl
              ? `linear-gradient(180deg, rgba(9,11,15,0.05) 0%, rgba(9,11,15,0.38) 100%), url(${imageUrl})`
              : "linear-gradient(135deg, rgba(212,160,23,0.32) 0%, rgba(15,23,42,0.92) 100%)",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_26%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent)]" />

        <div className="relative flex h-full flex-col justify-between p-5">
          <div className="flex items-start justify-between gap-3">
            <Badge variant={course.isLocked ? "muted" : "gold"} size="md">
              {course.isLocked ? t("courseLocked") : t("courseOpen")}
            </Badge>
            {course.duration && (
              <div className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[11px] font-semibold text-white/85 backdrop-blur-sm">
                {course.duration}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="max-w-[85%] space-y-1.5">
              <h3 className="font-course line-clamp-2 text-[1.25rem] font-extrabold leading-tight tracking-[-0.03em] text-white">
                {course.title}
              </h3>
              <p className="line-clamp-2 text-[0.95rem] leading-5 text-white/72">
                {course.subtitle}
              </p>
            </div>

            {progress > 0 && (
              <div className="rounded-[1.35rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.11),rgba(255,255,255,0.04))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                <ProgressBar
                  value={progress}
                  max={100}
                  size="xs"
                  showLabel
                  label={t("challengeProgress")}
                  className="text-white"
                  trackClassName="bg-white/15"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

const HomeChallengeCard = ({
  challenge,
  typeLabel,
  statusLabel,
}: {
  challenge: Challenge;
  typeLabel: string;
  statusLabel: string;
}) => {
  const { t } = useTranslation("home");
  const imageUrl = normalizeMediaUrl(challenge.coverUrl);
  const progress = challenge.progress ?? 0;
  const completed = Boolean(challenge.isCompleted);

  return (
    <Link
      to={`/challenges/${challenge.id}`}
      className="group block w-[304px] shrink-0 snap-start"
    >
      <div className="relative h-[188px] overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_26px_70px_rgba(0,0,0,0.42)] transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_34px_86px_rgba(0,0,0,0.5)]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: imageUrl
              ? `url(${imageUrl})`
              : completed
                ? "linear-gradient(135deg, rgba(16,185,129,0.88) 0%, rgba(15,118,110,0.94) 100%)"
                : challenge.isStarted
                  ? "linear-gradient(135deg, rgba(212,160,23,0.92) 0%, rgba(139,105,20,0.94) 100%)"
                  : "linear-gradient(135deg, rgba(71,85,105,0.92) 0%, rgba(39,39,42,0.94) 100%)",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent)]" />

        <div className="relative flex h-full flex-col justify-between p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Badge variant="solid" size="sm" className="bg-white/15 text-white backdrop-blur-sm">
                {typeLabel}
              </Badge>
              <Badge
                variant="solid"
                size="sm"
                className={cn(
                  "backdrop-blur-sm",
                  completed && "bg-success/85 text-white",
                  !completed && challenge.isStarted && "bg-gold/85 text-black",
                  !completed && !challenge.isStarted && "bg-white/15 text-white",
                )}
              >
                {statusLabel}
              </Badge>
            </div>

            <div className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
              {getChallengeReward(challenge)}
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <h3 className="line-clamp-2 text-lg font-bold leading-tight text-white">
                {challenge.title}
              </h3>
              <p className="line-clamp-2 text-sm leading-5 text-white/80">
                {challenge.description}
              </p>
            </div>

            {progress > 0 && (
              <div className="rounded-[1.35rem] border border-white/10 bg-black/25 p-3.5 backdrop-blur-md">
                <ProgressBar
                  value={progress}
                  max={100}
                  size="xs"
                  showLabel
                  label={t("challengeProgress")}
                  trackClassName="bg-white/15"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

const StaticSubscriptionChallengeCard = ({
  challenge,
}: {
  challenge: StaticChallengeCard;
}) => {
  const { t } = useTranslation("home");

  return (
    <Link to="/subscription" className="block w-[296px] shrink-0 snap-start">
      <div className="relative h-[188px] overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_26px_70px_rgba(0,0,0,0.42)]">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(100,116,139,0.96)_0%,rgba(63,63,70,0.96)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />

        <div className="relative flex h-full flex-col justify-between p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="solid" size="sm" className="bg-white/15 text-white backdrop-blur-sm">
                {challenge.typeLabel}
              </Badge>
              <Badge variant="solid" size="sm" className="bg-white/15 text-white backdrop-blur-sm">
                {challenge.statusLabel}
              </Badge>
            </div>
            <Badge size="sm" className="border-transparent bg-gold text-black">
              PRO
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <h3 className="line-clamp-2 text-lg font-bold leading-tight text-white">
                {challenge.title}
              </h3>
              <p className="line-clamp-2 text-sm leading-5 text-white/80">
                {challenge.description}
              </p>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-3.5 py-2.5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                <Lock className="h-4 w-4 text-gold" />
                <span>{t("challengeLocked")}</span>
              </div>
              <span className="text-xs font-semibold text-white/80">{challenge.reward}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const StaticSubscriptionCourseCard = ({ index }: { index: number }) => {
  const gradients = [
    "linear-gradient(135deg, rgba(88,96,112,0.96) 0%, rgba(38,38,42,0.98) 100%)",
    "linear-gradient(135deg, rgba(117,97,56,0.94) 0%, rgba(41,33,18,0.98) 100%)",
    "linear-gradient(135deg, rgba(76,90,122,0.95) 0%, rgba(27,31,40,0.98) 100%)",
  ];

  return (
    <Link to="/subscription" className="block w-[304px] shrink-0 snap-start">
      <div className="relative h-[338px] overflow-hidden rounded-[2rem] shadow-[0_24px_60px_rgba(0,0,0,0.42)]">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: gradients[index % gradients.length] }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_28%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/40 to-transparent" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        <div className="relative flex h-full flex-col justify-between p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70">
              <Lock className="h-4 w-4" />
            </div>
            <Badge size="sm" className="border-transparent bg-gold text-black">
              PRO
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-6 w-3/4 rounded-full bg-white/15 backdrop-blur-sm" />
              <div className="h-4 w-1/2 rounded-full bg-white/10 backdrop-blur-sm" />
            </div>

            <div className="rounded-[1.35rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
              <div className="h-2.5 w-full rounded-full bg-white/10" />
              <div className="mt-3 flex items-center justify-between">
                <div className="h-3 w-24 rounded-full bg-white/12" />
                <div className="h-3 w-10 rounded-full bg-white/12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const ChallengeTimerCard = ({
  isActive,
  purchaseStatus,
}: {
  isActive: boolean;
  purchaseStatus?: SubscriptionStatus;
}) => {
  const [remaining, setRemaining] = useState(() => getRemainingCountdown(new Date(), purchaseStatus));

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const sync = () => {
      setRemaining(getRemainingCountdown(new Date(), purchaseStatus));
    };

    sync();
    const timer = window.setInterval(sync, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isActive, purchaseStatus]);

  if (!isActive) {
    return null;
  }

  const [hours, minutes, seconds] = formatCountdown(remaining);

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-card px-5 py-4 shadow-card">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,160,23,0.18),transparent_58%),linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]" />
      <div className="relative flex items-center justify-center gap-3">
        <Clock3 className="h-6 w-6 shrink-0 text-t-primary" />
        <div className="flex items-center text-[2.3rem] font-bold leading-none tracking-[0.18em] text-t-primary">
          <span className="font-mono tabular-nums">{hours}</span>
          <span className="px-1 tracking-normal">:</span>
          <span className="font-mono tabular-nums">{minutes}</span>
          <span className="px-1 tracking-normal">:</span>
          <span className="font-mono tabular-nums">{seconds}</span>
        </div>
      </div>
    </div>
  );
};

const HomeLoadingState = ({
  title,
  subtitle,
  coins,
  xp,
  unread,
}: {
  title: string;
  subtitle: string;
  coins?: number;
  xp?: number;
  unread?: number;
}) => (
  <MobileScreen className="space-y-4">
    <PageHeader
      title={title}
      subtitle={subtitle}
      titleSize="lg"
      actions={<TopActionCluster coins={coins} stars={xp} unreadNotifications={unread ?? 0} />}
    />

    <Skeleton className="h-[180px] rounded-[1.75rem]" />
    <Skeleton className="h-[68px] rounded-[1.25rem]" />

    <MobileScreenSection>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40 rounded-xl" />
        <Skeleton className="h-5 w-24 rounded-xl" />
      </div>
      <div className="-mx-4 flex gap-3 overflow-hidden px-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-[336px] w-[296px] shrink-0 rounded-[1.75rem]" />
        ))}
      </div>
    </MobileScreenSection>

    <MobileScreenSection>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40 rounded-xl" />
        <Skeleton className="h-5 w-24 rounded-xl" />
      </div>
      <Skeleton className="h-[82px] rounded-[1.5rem]" />
      <div className="-mx-4 flex gap-3 overflow-hidden px-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-[176px] w-[296px] shrink-0 rounded-[1.75rem]" />
        ))}
      </div>
    </MobileScreenSection>
  </MobileScreen>
);

export const HomeOverview = () => {
  const { t } = useTranslation("home");
  const navigate = useNavigate();
  const feed = useHomeFeed();
  const stats = useUserStats();
  const unread = useUnreadCount();
  const [showMiniAppsToast, setShowMiniAppsToast] = useState(false);

  const staticChallenges = useMemo<StaticChallengeCard[]>(
    () => [
      {
        id: "static-daily-1",
        title: t("challengePlaceholder1Title"),
        description: t("challengePlaceholder1Description"),
        reward: t("challengePlaceholder1Reward"),
        typeLabel: t("challengeTypeDaily"),
        statusLabel: t("challengeStatusActive"),
      },
      {
        id: "static-daily-2",
        title: t("challengePlaceholder2Title"),
        description: t("challengePlaceholder2Description"),
        reward: t("challengePlaceholder2Reward"),
        typeLabel: t("challengeTypeDaily"),
        statusLabel: t("challengeStatusActive"),
      },
      {
        id: "static-daily-3",
        title: t("challengePlaceholder3Title"),
        description: t("challengePlaceholder3Description"),
        reward: t("challengePlaceholder3Reward"),
        typeLabel: t("challengeTypeDaily"),
        statusLabel: t("challengeStatusActive"),
      },
      {
        id: "static-weekly-1",
        title: t("challengePlaceholder4Title"),
        description: t("challengePlaceholder4Description"),
        reward: t("challengePlaceholder4Reward"),
        typeLabel: t("challengeTypeWeekly"),
        statusLabel: t("challengeStatusActive"),
      },
      {
        id: "static-monthly-1",
        title: t("challengePlaceholder5Title"),
        description: t("challengePlaceholder5Description"),
        reward: t("challengePlaceholder5Reward"),
        typeLabel: t("challengeTypeMonthly"),
        statusLabel: t("challengeStatusActive"),
      },
      {
        id: "static-daily-4",
        title: t("challengePlaceholder6Title"),
        description: t("challengePlaceholder6Description"),
        reward: t("challengePlaceholder6Reward"),
        typeLabel: t("challengeTypeDaily"),
        statusLabel: t("challengeStatusPending"),
      },
    ],
    [t],
  );

  useEffect(() => {
    if (!showMiniAppsToast) {
      return;
    }

    const timer = window.setTimeout(() => setShowMiniAppsToast(false), 2000);
    return () => window.clearTimeout(timer);
  }, [showMiniAppsToast]);

  if (feed.isLoading) {
    return (
      <HomeLoadingState
        title={t("title")}
        subtitle={t("subtitle")}
        coins={stats.data?.coins}
        xp={stats.data?.xp}
        unread={unread.data}
      />
    );
  }

  if (feed.isError) {
    return (
      <MobileScreen>
        <ErrorState variant="network" onRetry={() => feed.refetch()} />
      </MobileScreen>
    );
  }

  if (!feed.data) {
    return null;
  }

  const { announcements, courses, courseAccess, challenges, challengeAccess, subscriptionStatus } = feed.data;

  return (
    <MobileScreen className="space-y-4">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        titleSize="lg"
        actions={
          <TopActionCluster
            coins={stats.data?.coins}
            stars={stats.data?.xp}
            unreadNotifications={unread.data ?? 0}
          />
        }
      />

      {announcements.length > 0 && (
        <FeaturedCarousel
          autoPlay
          items={announcements.map((announcement, index) => ({
            id: announcement.id,
            content: (
              <HomeAnnouncementCard
                announcement={announcement}
                index={index}
                onOpen={() => {
                  if (announcement.actionType === "feedback") {
                    const params = new URLSearchParams({
                      announcementId: announcement.id,
                      title: announcement.title,
                    });

                    navigate(`/feedback?${params.toString()}`, {
                      state: { announcement },
                    });
                    return;
                  }

                  if (announcement.actionUrl) {
                    navigate(
                      `/webview?url=${encodeURIComponent(announcement.actionUrl)}&title=${encodeURIComponent(announcement.title)}`,
                    );
                  }
                }}
              />
            ),
          }))}
        />
      )}

      <HomeMiniAppsRow
        title={t("miniApps")}
        subtitle={t("miniAppsComingSoon")}
        onTap={() => setShowMiniAppsToast(true)}
      />

      <MobileScreenSection>
        <SectionTitle
          title={t("recommendedCourses")}
          action={
            <Button asChild variant="ghost" size="xs">
              <Link to="/courses">
                {t("viewAll")} <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        />

        {courseAccess === "denied" ? (
          <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
            <div className="flex snap-x gap-3.5 pb-1">
              {Array.from({ length: 3 }).map((_, index) => (
                <StaticSubscriptionCourseCard key={`static-course-${index}`} index={index} />
              ))}
            </div>
          </div>
        ) : courses.length > 0 ? (
          <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
            <div className="flex snap-x gap-3.5 pb-1">
              {courses.map((course) => (
                <FeaturedCourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<BookOpen className="h-7 w-7" />}
            title={t("emptyCoursesTitle")}
            description={t("emptyCoursesDescription")}
            action={{
              label: t("emptyCoursesCta"),
              onClick: () => navigate("/courses"),
            }}
          />
        )}
      </MobileScreenSection>

      <MobileScreenSection>
        <SectionTitle
          title={t("currentChallenges")}
          action={
            <Button asChild variant="ghost" size="xs">
              <Link to="/challenges">
                {t("viewAll")} <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        />

        {challengeAccess === "granted" && (
          <ChallengeTimerCard
            isActive={challenges.length > 0}
            purchaseStatus={subscriptionStatus}
          />
        )}

        {challengeAccess === "denied" ? (
          <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
            <div className="flex snap-x gap-3.5 pb-1">
              {staticChallenges.map((challenge) => (
                <StaticSubscriptionChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </div>
        ) : challenges.length > 0 ? (
          <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
            <div className="flex snap-x gap-3.5 pb-1">
              {challenges.map((challenge) => (
                <HomeChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  typeLabel={getChallengeTypeLabel(challenge, t)}
                  statusLabel={getChallengeStatusLabel(challenge, t)}
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<Trophy className="h-7 w-7" />}
            title={t("emptyChallengesTitle")}
            description={t("emptyChallengesDescription")}
            action={{
              label: t("emptyChallengesCta"),
              onClick: () => navigate("/challenges"),
            }}
          />
        )}
      </MobileScreenSection>

      {showMiniAppsToast && (
        <div
          aria-live="polite"
          className="fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-50"
        >
          <GlassCard className="flex items-center gap-3 border-gold/20 bg-card/95 px-4 py-3 shadow-glow backdrop-blur-xl">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gold/10 text-gold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-t-primary">{t("miniApps")}</p>
              <p className="text-xs text-t-muted">{t("miniAppsComingSoonSnackbar")}</p>
            </div>
          </GlassCard>
        </div>
      )}
    </MobileScreen>
  );
};
