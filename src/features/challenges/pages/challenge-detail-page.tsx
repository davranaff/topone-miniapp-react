import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, Star, Lock, Clock, ChevronRight, PlayCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useChallengeDetail } from "@/features/challenges/hooks/use-challenge-detail";
import { challengesApi } from "@/features/challenges/api/challenges.api";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Badge } from "@/shared/ui/badge";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { SubscriptionRequiredState } from "@/shared/ui/subscription-required-state";
import { hasApiStatus } from "@/shared/api/error-helpers";
import { useShellNav } from "@/widgets/navigation/shell-nav";
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

export const ChallengeDetailPage = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const challenge = useChallengeDetail(challengeId);
  const { setOverride, resetOverride } = useShellNav();

  const startMutation = useMutation({
    mutationFn: () => challengesApi.start(challengeId!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["challenges", "detail", challengeId] });
    },
  });
  const isStartingChallenge = startMutation.isPending;
  const startChallenge = startMutation.mutate;

  useEffect(() => {
    if (!challenge.data || challenge.isError) {
      setOverride({});
      return () => resetOverride();
    }

    if (challenge.data.isLocked) {
      setOverride({
        action: {
          label: "Obuna olish",
          icon: <ChevronRight className="h-4 w-4" />,
          onClick: () => navigate("/subscription"),
        },
      });
      return () => resetOverride();
    }

    if (challenge.data.isCompleted) {
      setOverride({
        action: {
          label: "Bajarildi",
          icon: <CheckCircle2 className="h-4 w-4" />,
          onClick: () => undefined,
          disabled: true,
          tone: "success",
        },
      });
      return () => resetOverride();
    }

    setOverride({
        action: {
          label: challenge.data.isStarted ? "Davom etish" : "Boshlash",
          icon: <PlayCircle className="h-4 w-4" />,
          onClick: () => {
            if (!challenge.data?.isStarted) {
              startChallenge();
            }
          },
          loading: isStartingChallenge,
        },
      });

    return () => resetOverride();
  }, [
    challenge.data,
    challenge.isError,
    isStartingChallenge,
    navigate,
    resetOverride,
    setOverride,
    startChallenge,
  ]);

  if (challenge.isLoading) {
    return (
      <MobileScreen>
        <div className="space-y-4 pt-2">
          <div className="h-8 w-2/3 rounded-xl bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </MobileScreen>
    );
  }

  if (challenge.isError && hasApiStatus(challenge.error, 403)) {
    return (
      <MobileScreen>
        <PageHeader title="Challenj" backButton />
        <SubscriptionRequiredState />
      </MobileScreen>
    );
  }

  if (challenge.isError || !challenge.data) {
    return (
      <MobileScreen>
        <ErrorState variant="not-found" onRetry={() => navigate(-1)} retryLabel="Назад" />
      </MobileScreen>
    );
  }

  const { data } = challenge;
  const progress = data.progress ?? 0;

  return (
    <MobileScreen>
      <PageHeader
        title={data.title}
        backButton
        actions={
          <Badge variant={difficultyVariant[data.difficulty]} size="sm">
            {difficultyLabel[data.difficulty]}
          </Badge>
        }
      />

      <div className="mt-4 space-y-4">
        {/* Description */}
        <GlassCard>
          <p className="text-sm leading-relaxed text-t-secondary">{data.description}</p>

          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 text-sm">
              <Star className="h-4 w-4 text-gold" />
              <span className="font-semibold text-gold">{data.xpReward} XP</span>
            </div>
            {data.coinReward != null && data.coinReward > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-t-secondary">
                <span className="text-base">🪙</span>
                <span>{data.coinReward} tanga</span>
              </div>
            )}
            {data.durationDays != null && (
              <div className="flex items-center gap-1.5 text-sm text-t-secondary">
                <Clock className="h-4 w-4" />
                <span>{data.durationDays} kun</span>
              </div>
            )}
          </div>

          {progress > 0 && (
            <div className="mt-4">
              <ProgressBar value={progress} max={100} showLabel label="Bajarildi" />
            </div>
          )}
        </GlassCard>

        {/* CTA */}
        {data.isCompleted && (
          <GlassCard goldBorder className="text-center">
            <p className="text-sm font-semibold text-gold">✓ Challenj bajarildi!</p>
          </GlassCard>
        )}

        {data.isLocked && (
          <GlassCard className="border-gold/20 bg-gold/5">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 shrink-0 text-gold" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-t-primary">Challenj bloklangan</p>
                <p className="text-xs text-t-muted">Obuna rasmiylashtiring</p>
              </div>
              <Link to="/subscription">
                <ChevronRight className="h-4 w-4 text-gold" />
              </Link>
            </div>
          </GlassCard>
        )}
      </div>
    </MobileScreen>
  );
};
