import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  CircleDollarSign,
  Eye,
  Flame,
  Star,
  Trophy,
} from "lucide-react";
import { useProfile } from "@/features/profile/hooks/use-profile";
import { useMyAchievements } from "@/features/achievements/hooks/use-achievements";
import { useUserStats } from "@/features/home/hooks/use-user-stats";
import { useUnreadCount } from "@/features/notifications/hooks/use-notifications";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { Avatar } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { GlassCard } from "@/shared/ui/glass-card";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { StatCardsRow } from "@/shared/ui/stat-card";
import { cn } from "@/shared/lib/cn";
import { TopActionCluster } from "@/widgets/navigation/top-action-cluster";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const profile = useProfile();
  const stats = useUserStats();
  const unread = useUnreadCount();
  const achievements = useMyAchievements();

  if (profile.isLoading) {
    return (
      <MobileScreen>
        <PageHeader title="Profil" subtitle="..." />
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="h-20 w-20 rounded-full bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
          <div className="h-5 w-32 rounded-lg bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
        </div>
        <SkeletonCard />
        <SkeletonCard />
      </MobileScreen>
    );
  }

  if (!profile.data) return null;

  const { data } = profile;
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ") || data.username;
  const membershipTier = (data.subscriptionType?.trim() || (data.hasActiveSubscription ? "PREMIUM" : "FREE")).toUpperCase();
  const roleLabel = (data.roles[0] ?? "BEGINNER").toUpperCase();
  const coins = stats.isError ? 0 : (stats.data?.coins ?? 0);
  const xp = stats.isError ? 0 : (stats.data?.xp ?? 0);
  const streak = stats.isError ? 0 : (stats.data?.streak ?? 0);
  const level = stats.isError ? 0 : (stats.data?.level ?? 0);
  const isStatsLoading = stats.isLoading && !stats.data;
  const achievementsPreview = (achievements.data ?? []).slice(0, 4);

  return (
    <MobileScreen className="space-y-4 lg:space-y-5">
      <PageHeader
        title="Profil"
        subtitle={membershipTier}
        actions={
          <TopActionCluster
            coins={coins}
            stars={xp}
            unreadNotifications={unread.data ?? 0}
          />
        }
      />

      <div className="flex items-center gap-4 px-1 xl:gap-6">
        <Avatar src={data.avatarUrl} fallback={fullName} size="xl" gold={data.hasActiveSubscription} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-[2rem] font-black tracking-[-0.03em] text-t-primary xl:text-[2.4rem]">{fullName}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate("/levels")}
              className="rounded-full"
            >
              <Badge variant="info" size="md" className="uppercase">
                {level > 0 ? `${roleLabel} • LVL ${level}` : roleLabel}
              </Badge>
            </button>
            <Badge
              variant={data.hasActiveSubscription ? "success" : "outline"}
              size="md"
              className={cn("uppercase", !data.hasActiveSubscription && "text-t-secondary")}
            >
              {membershipTier}
            </Badge>
          </div>
        </div>
      </div>

      <StatCardsRow
        columns={3}
        className="gap-2.5"
        stats={[
          {
            label: "Ballar",
            value: isStatsLoading ? "..." : coins,
            icon: <CircleDollarSign className="h-4 w-4" />,
            highlight: true,
            className: "rounded-[1.45rem]",
          },
          {
            label: "Topilgan",
            value: isStatsLoading ? "..." : xp,
            icon: <Star className="h-4 w-4" />,
            className: "rounded-[1.45rem]",
          },
          {
            label: "Streak",
            value: isStatsLoading ? "..." : streak,
            icon: <Flame className="h-4 w-4" />,
            className: "rounded-[1.45rem]",
          },
        ]}
      />

      <div className="inline-flex rounded-full border border-border/55 p-1">
        <button
          type="button"
          onClick={() => setIsPreviewMode(false)}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-semibold tracking-[0.12em]",
            !isPreviewMode ? "bg-gold/18 text-gold" : "text-t-secondary",
          )}
        >
          PROFILE
        </button>
        <button
          type="button"
          onClick={() => setIsPreviewMode(true)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.12em]",
            isPreviewMode ? "bg-gold/18 text-gold" : "text-t-secondary",
          )}
        >
          <Eye className="h-3.5 w-3.5" />
          PREVIEW
        </button>
      </div>

      {isPreviewMode ? (
        <GlassCard className="rounded-[1.45rem] border-gold/25 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-t-muted">Public preview</p>
          <div className="mt-4 flex items-center gap-4">
            <Avatar src={data.avatarUrl} fallback={fullName} size="lg" gold={data.hasActiveSubscription} />
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-t-primary">{fullName}</p>
              <p className="truncate text-sm text-t-secondary">@{data.username}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-gold">{membershipTier}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-[1rem] border border-border/45 px-3 py-2 text-center">
              <p className="text-xs uppercase tracking-[0.1em] text-t-muted">Coins</p>
              <p className="mt-1 text-base font-bold text-t-primary">{coins}</p>
            </div>
            <div className="rounded-[1rem] border border-border/45 px-3 py-2 text-center">
              <p className="text-xs uppercase tracking-[0.1em] text-t-muted">XP</p>
              <p className="mt-1 text-base font-bold text-t-primary">{xp}</p>
            </div>
            <div className="rounded-[1rem] border border-border/45 px-3 py-2 text-center">
              <p className="text-xs uppercase tracking-[0.1em] text-t-muted">Streak</p>
              <p className="mt-1 text-base font-bold text-t-primary">{streak}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-t-muted">Bu rejimda profilingiz foydalanuvchi ko'rinishida ko'rsatiladi.</p>
        </GlassCard>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate("/leaderboard?type=xp")}
              className="liquid-glass-surface-interactive flex items-center justify-center gap-2 rounded-[1.1rem] border border-border/50 px-3 py-2.5 text-sm font-semibold text-t-primary"
            >
              <Star className="h-4 w-4 text-gold" />
              XP Reyting
            </button>
            <button
              type="button"
              onClick={() => navigate("/leaderboard?type=referrals")}
              className="liquid-glass-surface-interactive flex items-center justify-center gap-2 rounded-[1.1rem] border border-border/50 px-3 py-2.5 text-sm font-semibold text-t-primary"
            >
              <Trophy className="h-4 w-4 text-gold" />
              Referral Reyting
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate("/subscription")}
            className="liquid-glass-surface-interactive flex w-full items-center gap-3 rounded-[1.35rem] border border-gold/35 bg-gold/10 px-4 py-4 text-left transition-all active:scale-99 xl:max-w-[32rem]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.95rem] border border-gold/35 bg-gold/15 text-gold">
              <Trophy className="h-5 w-5" />
            </span>
            <span className="flex-1 text-lg font-semibold text-t-primary">Obuna rejalari</span>
            <ChevronRight className="h-4 w-4 text-t-muted" />
          </button>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[1.9rem] font-bold tracking-[-0.03em] text-t-primary">Yutuqlar</h2>
              <button
                type="button"
                onClick={() => navigate("/achievements")}
                className="text-sm font-medium text-gold transition hover:text-gold/80"
              >
                Barchasini ko'rish
              </button>
            </div>

            {achievements.isLoading ? (
              <SkeletonCard className="h-28 rounded-[1.45rem]" />
            ) : achievementsPreview.length === 0 ? (
              <GlassCard className="flex h-28 items-center justify-center rounded-[1.45rem]">
                <p className="text-xl text-t-muted">Hali yutuqlar yo'q</p>
              </GlassCard>
            ) : (
              <>
                <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none] xl:hidden">
                  <div className="flex gap-2 pb-1">
                    {achievementsPreview.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigate("/achievements")}
                        className="liquid-glass-surface-interactive flex h-24 w-[5.1rem] shrink-0 flex-col items-center justify-center rounded-[1rem] border border-border/45 px-2 text-center transition-all active:scale-95"
                      >
                        <span className="text-lg">{item.iconKey ?? "🏆"}</span>
                        <span className="mt-1 line-clamp-2 text-2xs font-semibold text-t-secondary">
                          {item.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="hidden xl:grid xl:grid-cols-4 xl:gap-3">
                  {achievementsPreview.map((item) => (
                    <button
                      key={`desktop-${item.id}`}
                      type="button"
                      onClick={() => navigate("/achievements")}
                      className="liquid-glass-surface-interactive flex h-28 flex-col items-center justify-center rounded-[1rem] border border-border/45 px-3 text-center transition-all active:scale-95"
                    >
                      <span className="text-xl">{item.iconKey ?? "🏆"}</span>
                      <span className="mt-2 line-clamp-2 text-xs font-semibold text-t-secondary">
                        {item.title}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>
        </>
      )}
    </MobileScreen>
  );
};
