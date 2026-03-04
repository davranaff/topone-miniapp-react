import { Crown, Star, Trophy, Users, type LucideIcon } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Avatar } from "@/shared/ui/avatar";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { EmptyState } from "@/shared/ui/empty-state";
import {
  useLeaderboard,
  useMyLeaderboardPosition,
} from "@/features/leaderboard/hooks/use-leaderboard";
import type {
  LeaderboardEntry,
  LeaderboardType,
} from "@/entities/leaderboard/types";
import { cn } from "@/shared/lib/cn";

const TABS: Array<{ id: LeaderboardType; label: string; icon: LucideIcon }> = [
  { id: "xp", label: "XP", icon: Star },
  { id: "referrals", label: "Referral", icon: Users },
];

const parseLeaderboardType = (
  typeParam: string | null,
  tabParam: string | null,
): LeaderboardType => {
  const normalizedType = typeParam?.trim().toLowerCase();
  if (normalizedType === "referrals" || normalizedType === "referral") {
    return "referrals";
  }
  if (normalizedType === "xp") {
    return "xp";
  }

  return tabParam === "1" ? "referrals" : "xp";
};

const formatNumber = (value: number): string => {
  const safe = Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
  return safe.toLocaleString();
};

const getValueLabel = (type: LeaderboardType): string => {
  return type === "xp" ? "XP" : "referal";
};

const getTitleByType = (type: LeaderboardType): string => {
  return type === "xp"
    ? "XP bo'yicha top foydalanuvchilar"
    : "Referral bo'yicha top foydalanuvchilar";
};

const getDisplayName = (entry: LeaderboardEntry): string => {
  const name = [entry.firstName, entry.lastName].filter(Boolean).join(" ").trim();
  return name || entry.username || "User";
};

const PodiumCard = ({
  entry,
  position,
  type,
}: {
  entry: LeaderboardEntry;
  position: 1 | 2 | 3;
  type: LeaderboardType;
}) => {
  const heights = {
    1: "h-[7.7rem]",
    2: "h-[6.4rem]",
    3: "h-[5.2rem]",
  };
  const valueIcon = type === "xp" ? Star : Users;
  const ValueIcon = valueIcon;

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center",
        position === 1 ? "order-2" : position === 2 ? "order-1" : "order-3",
      )}
    >
      <Avatar src={entry.avatarUrl} fallback={getDisplayName(entry)} size={position === 1 ? "lg" : "md"} gold={position === 1} />
      <p className="mt-2 max-w-20 truncate text-xs font-semibold text-t-primary">
        {getDisplayName(entry)}
      </p>
      <div
        className={cn(
          "mt-2 flex w-[5.2rem] flex-col items-center justify-end rounded-t-2xl border border-border/55 bg-elevated/80",
          heights[position],
        )}
      >
        <div className="mb-2 flex h-6 w-6 items-center justify-center rounded-full border border-gold/30 bg-gold/20 text-xs font-bold text-gold">
          {position}
        </div>
        <div className="mb-2 flex items-center gap-1 text-xs font-bold text-t-primary">
          <ValueIcon className="h-3.5 w-3.5 text-gold" />
          <span>{formatNumber(entry.value)}</span>
        </div>
      </div>
    </div>
  );
};

const LeaderboardRow = ({
  entry,
  type,
}: {
  entry: LeaderboardEntry;
  type: LeaderboardType;
}) => {
  const ValueIcon = type === "xp" ? Star : Users;
  return (
    <GlassCard goldBorder={entry.isCurrentUser} className={cn(entry.isCurrentUser && "ring-1 ring-gold/20")} radius="xl">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-elevated text-xs font-bold text-t-muted">
          {entry.rank}
        </div>
        <Avatar src={entry.avatarUrl} fallback={getDisplayName(entry)} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-t-primary">
            {getDisplayName(entry)}
            {entry.isCurrentUser && <span className="ml-1 text-xs text-gold">(Siz)</span>}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ValueIcon className="h-3.5 w-3.5 text-gold" />
          <span className="text-sm font-bold text-t-primary">{formatNumber(entry.value)}</span>
        </div>
      </div>
    </GlassCard>
  );
};

export const LeaderboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = parseLeaderboardType(searchParams.get("type"), searchParams.get("tab"));
  const leaderboard = useLeaderboard(type);
  const myPosition = useMyLeaderboardPosition(type);

  const updateType = (nextType: LeaderboardType) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("type", nextType);
    if (nextType === "referrals") {
      nextParams.set("tab", "1");
    } else {
      nextParams.delete("tab");
    }
    setSearchParams(nextParams, { replace: true });
  };

  const sortedItems = [...(leaderboard.data ?? [])].sort((left, right) => {
    if (left.rank !== right.rank) {
      return left.rank - right.rank;
    }
    return right.value - left.value;
  });
  const myRank = myPosition.data?.rank ?? null;
  const items = sortedItems.map((entry) => ({
    ...entry,
    isCurrentUser: myRank != null ? entry.rank === myRank : Boolean(entry.isCurrentUser),
  }));
  const topThree = items.slice(0, 3);
  const rest = items.slice(3);
  const myRow = items.find((entry) => entry.isCurrentUser);
  const showLoading = leaderboard.isLoading && !leaderboard.data;
  const headerRank = myPosition.data?.rank ?? myRow?.rank ?? null;
  const headerValue = myPosition.data?.value ?? myRow?.value ?? 0;
  const headerTotalUsers = myPosition.data?.totalUsers ?? 0;
  const headerIcon = type === "xp" ? Trophy : Users;
  const HeaderIcon = headerIcon;

  return (
    <MobileScreen>
      <PageHeader title="Reyting" subtitle={getTitleByType(type)} backButton />

      <div className="mt-2 flex gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => updateType(tab.id)}
              className={cn(
                "liquid-glass-surface-interactive flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition-all",
                tab.id === type
                  ? "liquid-glass-button-chip-active text-gold"
                  : "liquid-glass-button-chip text-t-muted hover:border-gold/20",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <GlassCard className="mt-3" radius="2xl">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gold/35 bg-gold/15 text-gold">
            <HeaderIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-t-muted">Sizning o'rningiz</p>
            <p className="mt-0.5 text-2xl font-black leading-tight text-t-primary">
              {headerRank ? `#${headerRank}` : "—"}
            </p>
            <p className="text-sm text-t-muted">
              {formatNumber(headerValue)} {getValueLabel(type)}
              {headerTotalUsers > 0 && <span className="ml-1">/ {headerTotalUsers} foydalanuvchi</span>}
            </p>
          </div>
        </div>
      </GlassCard>

      {showLoading && (
        <>
          <div className="mt-6 flex items-end justify-center gap-2 pb-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-20 rounded-2xl bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]",
                  index === 1 ? "h-40" : index === 0 ? "h-32" : "h-28",
                )}
              />
            ))}
          </div>
          <MobileScreenSection className="mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </MobileScreenSection>
        </>
      )}

      {!showLoading && leaderboard.isError && (
        <ErrorState
          variant="network"
          onRetry={() => {
            void leaderboard.refetch();
            void myPosition.refetch();
          }}
        />
      )}

      {!showLoading && !leaderboard.isError && items.length === 0 && (
        <div className="mt-10">
          <EmptyState
            icon={<Trophy className="h-8 w-8" />}
            title="Hozircha reyting bo'sh"
            description="Ma'lumotlar paydo bo'lishi bilan bu yerda ko'rsatiladi."
          />
        </div>
      )}

      {!showLoading && !leaderboard.isError && items.length > 0 && (
        <>
          {topThree.length > 0 && (
            <div className="mt-6 flex items-end justify-center gap-2 pb-3">
              {topThree.map((entry, index) => (
                <PodiumCard
                  key={`${entry.userId}-${entry.rank}`}
                  entry={entry}
                  position={(index + 1) as 1 | 2 | 3}
                  type={type}
                />
              ))}
            </div>
          )}

          {myRank != null && !myRow && (
            <GlassCard goldBorder className="mt-4" radius="2xl">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-gold" />
                <p className="text-sm font-semibold text-t-primary">Sizning natijangiz</p>
                <div className="ml-auto text-right">
                  <p className="text-lg font-bold text-gold">#{myRank}</p>
                  <p className="text-xs text-t-muted">
                    {formatNumber(headerValue)} {getValueLabel(type)}
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

          {rest.length > 0 && (
            <MobileScreenSection className="mt-4">
              {rest.map((entry) => (
                <LeaderboardRow key={`${entry.userId}-${entry.rank}`} entry={entry} type={type} />
              ))}
            </MobileScreenSection>
          )}
        </>
      )}
    </MobileScreen>
  );
};
