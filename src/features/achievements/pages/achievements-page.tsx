import { useState } from "react";
import { Trophy, Star, CircleDollarSign, Gift } from "lucide-react";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { EmptyState } from "@/shared/ui/empty-state";
import { useMyAchievements, useClaimAchievement } from "@/features/achievements/hooks/use-achievements";
import type { UserAchievement } from "@/entities/achievement/types";
import { cn } from "@/shared/lib/cn";

type Tab = "all" | "earned" | "locked";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "Barchasi" },
  { id: "earned", label: "Olindi" },
  { id: "locked", label: "Yopiq" },
];

const AchievementCard = ({ item }: { item: UserAchievement }) => {
  const claim = useClaimAchievement();
  const canClaim = item.isEarned && !item.isClaimed;

  return (
    <GlassCard
      goldBorder={canClaim}
      className={cn(item.isLocked && "opacity-60")}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-2xl",
          item.isEarned
            ? "border-gold/40 bg-gold/10"
            : "border-border/40 bg-elevated",
        )}>
          {item.isLocked ? "🔒" : (item.iconKey ?? "🏆")}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-bold text-t-primary">{item.title}</p>
            {item.isClaimed && <Badge variant="success" size="sm">Olindi</Badge>}
            {canClaim && <Badge variant="gold" size="sm">Claim!</Badge>}
          </div>
          <p className="mt-0.5 text-xs text-t-muted line-clamp-2">{item.description}</p>
          
          {!item.isLocked && (
            <>
              <div className="mt-2">
                <ProgressBar value={item.progress} size="sm" />
                <p className="mt-1 text-2xs text-t-muted">
                  {item.currentValue} / {item.targetValue}
                </p>
              </div>
              
              <div className="mt-2 flex items-center gap-3 text-xs text-t-secondary">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-gold" />
                  {item.rewardXp}
                </span>
                <span className="flex items-center gap-1">
                  <CircleDollarSign className="h-3 w-3 text-info" />
                  {item.rewardCoins}
                </span>
              </div>

              {canClaim && (
                <Button
                  fullWidth
                  size="sm"
                  className="mt-3"
                  loading={claim.isPending}
                  onClick={() => claim.mutate(item.id)}
                >
                  <Gift className="h-3.5 w-3.5" />
                  Mukofotni olish
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export const AchievementsPage = () => {
  const [tab, setTab] = useState<Tab>("all");
  const achievements = useMyAchievements();

  if (achievements.isLoading) {
    return (
      <MobileScreen className="space-y-4 lg:space-y-5">
        <div className="h-8 w-1/3 rounded-xl bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
        <MobileScreenSection className="mt-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </MobileScreenSection>
      </MobileScreen>
    );
  }

  if (achievements.isError) {
    return (
      <MobileScreen className="space-y-4 lg:space-y-5">
        <ErrorState variant="network" onRetry={() => achievements.refetch()} />
      </MobileScreen>
    );
  }

  const allItems = achievements.data ?? [];
  const filtered = allItems.filter((a) => {
    if (tab === "earned") return a.isEarned;
    if (tab === "locked") return a.isLocked;
    return true;
  });

  return (
    <MobileScreen className="space-y-4 lg:space-y-5">
      <PageHeader title="Yutuqlar" subtitle="Topshiriqlarni bajaring va mukofot oling" backButton />

      {/* Tabs */}
      <div className="desktop-chip-row mt-3 flex gap-2 lg:pb-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "liquid-glass-surface-interactive flex-1 rounded-xl border py-2 text-xs font-semibold transition-all",
              tab === t.id
                ? "liquid-glass-button-chip-active text-gold"
                : "liquid-glass-button-chip text-t-muted hover:border-gold/20",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<Trophy className="h-8 w-8" />}
            title={tab === "earned" ? "Hali yutuq yo'q" : "Yutuqlar topilmadi"}
            description={tab === "earned" ? "Topshiriqlarni bajaring va yutuqlarga erishing." : "Bu kategoriyada yutuqlar mavjud emas."}
          />
        </div>
      ) : (
        <MobileScreenSection className="mt-4 desktop-cards-grid">
          {filtered.map((item) => (
            <AchievementCard key={item.id} item={item} />
          ))}
        </MobileScreenSection>
      )}
    </MobileScreen>
  );
};
