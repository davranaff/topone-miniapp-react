import { useState } from "react";
import { Trophy, Star, CircleDollarSign, Users, Crown } from "lucide-react";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Avatar } from "@/shared/ui/avatar";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { EmptyState } from "@/shared/ui/empty-state";
import { useLeaderboard } from "@/features/leaderboard/hooks/use-leaderboard";
import type { LeaderboardType, LeaderboardEntry } from "@/entities/leaderboard/types";
import { cn } from "@/shared/lib/cn";

const TABS: { id: LeaderboardType; label: string; icon: typeof Star }[] = [
  { id: "xp", label: "XP", icon: Star },
  { id: "coins", label: "Coins", icon: CircleDollarSign },
  { id: "referrals", label: "Referallar", icon: Users },
];

const PodiumCard = ({ entry, position }: { entry: LeaderboardEntry; position: 1 | 2 | 3 }) => {
  const heights = { 1: "h-24", 2: "h-20", 3: "h-16" };
  const colors = {
    1: "border-gold/40 bg-gold/10",
    2: "border-border/60 bg-elevated",
    3: "border-border/40 bg-surface",
  };

  return (
    <div className={cn("flex flex-col items-center", position === 1 ? "order-2" : position === 2 ? "order-1" : "order-3")}>
      <Avatar
        src={entry.avatarUrl}
        fallback={entry.username}
        size={position === 1 ? "lg" : "md"}
        gold={position === 1}
      />
      <p className="mt-1 text-xs font-semibold text-t-primary truncate max-w-20">
        {entry.firstName || entry.username}
      </p>
      <div className={cn("mt-2 flex w-16 flex-col items-center justify-end rounded-t-xl border-t border-x", colors[position], heights[position])}>
        <div className="mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold">
          {position}
        </div>
        <p className="mb-1 text-sm font-bold text-t-primary tabular-nums">{entry.value.toLocaleString()}</p>
      </div>
    </div>
  );
};

const LeaderboardRow = ({ entry, type }: { entry: LeaderboardEntry; type: LeaderboardType }) => (
  <GlassCard
    goldBorder={entry.isCurrentUser}
    className={cn(entry.isCurrentUser && "ring-1 ring-gold/20")}
  >
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-elevated text-xs font-bold text-t-muted">
        {entry.rank}
      </div>
      <Avatar src={entry.avatarUrl} fallback={entry.username} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-t-primary">
          {entry.firstName || entry.username}
          {entry.isCurrentUser && <span className="ml-1 text-xs text-gold">(Siz)</span>}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {type === "xp" && <Star className="h-3.5 w-3.5 text-gold" />}
        {type === "coins" && <CircleDollarSign className="h-3.5 w-3.5 text-info" />}
        {type === "referrals" && <Users className="h-3.5 w-3.5 text-t-muted" />}
        <span className="text-sm font-bold text-t-primary tabular-nums">{entry.value.toLocaleString()}</span>
      </div>
    </div>
  </GlassCard>
);

export const LeaderboardPage = () => {
  const [type, setType] = useState<LeaderboardType>("xp");
  const leaderboard = useLeaderboard(type);

  if (leaderboard.isLoading) {
    return (
      <MobileScreen>
        <div className="h-8 w-1/3 rounded-xl bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
        <div className="mt-6 h-32 rounded-xl bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
        <MobileScreenSection className="mt-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
        </MobileScreenSection>
      </MobileScreen>
    );
  }

  if (leaderboard.isError) {
    return (
      <MobileScreen>
        <ErrorState variant="network" onRetry={() => leaderboard.refetch()} />
      </MobileScreen>
    );
  }

  const items = leaderboard.data ?? [];
  const top3 = items.slice(0, 3);
  const rest = items.slice(3);
  const myPosition = items.find((entry) => entry.isCurrentUser);

  return (
    <MobileScreen>
      <PageHeader title="Liderlar" subtitle="Top foydalanuvchilar reytingi" backButton />

      {/* Tabs */}
      <div className="mt-3 flex gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={cn(
                "liquid-glass-surface-interactive flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition-all",
                type === t.id
                  ? "liquid-glass-button-chip-active text-gold"
                  : "liquid-glass-button-chip text-t-muted hover:border-gold/20",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<Trophy className="h-8 w-8" />}
            title="Reyting tez kunda"
            description="Leaderboard tizimi ishlab chiqilmoqda."
          />
        </div>
      ) : (
        <>
          {/* Podium */}
          {top3.length > 0 && (
            <div className="mt-6 flex items-end justify-center gap-2 pb-4">
              {top3.map((entry, i) => (
                <PodiumCard key={entry.userId} entry={entry} position={(i + 1) as 1 | 2 | 3} />
              ))}
            </div>
          )}

          {/* My position card */}
          {myPosition && myPosition.rank > 3 && (
            <GlassCard goldBorder className="mt-4">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-gold" />
                <p className="text-sm font-semibold text-t-primary">Sizning o'rningiz:</p>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-lg font-bold text-gold">#{myPosition.rank}</span>
                  <span className="text-sm text-t-muted">({myPosition.value.toLocaleString()})</span>
                </div>
              </div>
            </GlassCard>
          )}

          {/* List */}
          {rest.length > 0 && (
            <MobileScreenSection className="mt-4">
              {rest.map((entry) => (
                <LeaderboardRow key={entry.userId} entry={entry} type={type} />
              ))}
            </MobileScreenSection>
          )}
        </>
      )}
    </MobileScreen>
  );
};
