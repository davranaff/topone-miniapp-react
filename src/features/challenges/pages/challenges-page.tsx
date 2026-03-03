import { Link } from "react-router-dom";
import { Swords, Star, Lock, ChevronRight } from "lucide-react";
import { useChallengesList } from "@/features/challenges/hooks/use-challenges-list";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { GlassCard } from "@/shared/ui/glass-card";
import { Badge } from "@/shared/ui/badge";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { cn } from "@/shared/lib/cn";
import type { Challenge } from "@/entities/challenge/types";

const difficultyVariant: Record<Challenge["difficulty"], "success" | "info" | "danger"> = {
  easy: "success",
  medium: "info",
  hard: "danger",
};

const difficultyLabel: Record<Challenge["difficulty"], string> = {
  easy: "Oson",
  medium: "O'rta",
  hard: "Qiyin",
};

const ChallengeItem = ({ challenge }: { challenge: Challenge }) => (
  <Link to={`/challenges/${challenge.id}`}>
    <GlassCard interactive goldBorder={challenge.isCompleted}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
            challenge.isCompleted
              ? "border-gold/30 bg-gold/10 text-gold"
              : challenge.isLocked
              ? "border-border/50 bg-elevated text-t-muted"
              : "border-border/60 bg-elevated text-t-secondary",
          )}
        >
          {challenge.isLocked ? (
            <Lock className="h-4 w-4" />
          ) : (
            <Swords className="h-4 w-4" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-t-primary">{challenge.title}</p>
            <ChevronRight className="h-4 w-4 shrink-0 text-t-muted" />
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-t-muted">{challenge.description}</p>

          <div className="mt-2 flex items-center gap-2">
            <Badge variant={difficultyVariant[challenge.difficulty]} size="sm">
              {difficultyLabel[challenge.difficulty]}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-gold">
              <Star className="h-3 w-3" />
              {challenge.xpReward} XP
            </span>
          </div>
        </div>
      </div>

      {challenge.isStarted && challenge.progress !== undefined && challenge.progress > 0 && (
        <div className="mt-3">
          <ProgressBar value={challenge.progress} max={100} size="xs" />
        </div>
      )}
    </GlassCard>
  </Link>
);

export const ChallengesPage = () => {
  const challenges = useChallengesList();

  return (
    <MobileScreen>
      <PageHeader title="Challenjlar" subtitle="O'z bilim va ko'nikmalarini sinab ko'r" />

      {challenges.isLoading && (
        <MobileScreenSection className="mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </MobileScreenSection>
      )}

      {challenges.isError && (
        <div className="mt-6">
          <ErrorState variant="network" onRetry={() => challenges.refetch()} />
        </div>
      )}

      {!challenges.isLoading && !challenges.isError && !challenges.data?.items.length && (
        <div className="mt-10">
          <EmptyState
            icon={<Swords className="h-8 w-8" />}
            title="Challenjlar topilmadi"
            description="Hozircha hech qanday challenj mavjud emas."
          />
        </div>
      )}

      {!!challenges.data?.items.length && (
        <MobileScreenSection className="mt-4">
          {challenges.data.items.map((c) => (
            <ChallengeItem key={c.id} challenge={c} />
          ))}
        </MobileScreenSection>
      )}
    </MobileScreen>
  );
};
