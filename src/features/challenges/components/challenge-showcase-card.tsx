import { ChevronRight, Clock3, Lock, Star, Trophy } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { cn } from "@/shared/lib/cn";
import type { Challenge } from "@/entities/challenge/types";

const getCardBackground = (challenge: Challenge, placeholder: boolean) => {
  if (challenge.coverUrl) {
    return `linear-gradient(180deg, rgba(5,7,10,0.12) 0%, rgba(5,7,10,0.78) 100%), url(${challenge.coverUrl})`;
  }

  if (challenge.bgGradient) {
    return challenge.bgGradient;
  }

  if (placeholder) {
    return "linear-gradient(135deg, rgba(100,116,139,0.92) 0%, rgba(63,63,70,0.94) 100%)";
  }

  if (challenge.isCompleted) {
    return "linear-gradient(135deg, rgba(16,185,129,0.9) 0%, rgba(15,118,110,0.95) 100%)";
  }

  if (challenge.isStarted) {
    return "linear-gradient(135deg, rgba(212,160,23,0.92) 0%, rgba(139,105,20,0.96) 100%)";
  }

  return "linear-gradient(135deg, rgba(71,85,105,0.94) 0%, rgba(39,39,42,0.96) 100%)";
};

const getRewardLabel = (challenge: Challenge) => {
  if (challenge.coinReward && challenge.coinReward > 0) {
    return `${challenge.coinReward} Coin`;
  }

  return `${challenge.xpReward} XP`;
};

const getStatusTone = (challenge: Challenge, placeholder: boolean) => {
  if (placeholder) {
    return "bg-white/12 text-white";
  }

  if (challenge.isCompleted) {
    return "bg-success/85 text-white";
  }

  if (challenge.isStarted) {
    return "bg-gold/85 text-black";
  }

  if (challenge.isLocked) {
    return "bg-white/12 text-white";
  }

  return "bg-white/12 text-white";
};

type ChallengeShowcaseCardProps = {
  challenge: Challenge;
  placeholder?: boolean;
  onClick: () => void;
};

export const ChallengeShowcaseCard = ({
  challenge,
  placeholder = false,
  onClick,
}: ChallengeShowcaseCardProps) => {
  const progress = challenge.progress ?? 0;
  const typeLabel = challenge.typeLabel ?? "Challenge";
  const statusLabel = challenge.statusLabel ?? (placeholder ? "PRO" : "Faol");

  return (
    <button type="button" onClick={onClick} className="group block w-full text-left">
      <div className="relative min-h-[196px] overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_26px_70px_rgba(0,0,0,0.42)] transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:border-gold/20 group-hover:shadow-[0_34px_86px_rgba(0,0,0,0.56)]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: getCardBackground(challenge, placeholder) }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent)]" />

        {placeholder && (
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,13,0.22),rgba(7,9,13,0.58))] backdrop-blur-[1.5px]" />
        )}

        <div className="relative flex min-h-[196px] flex-col justify-between p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Badge variant="solid" size="sm" className="bg-white/12 text-white backdrop-blur-sm">
                {typeLabel}
              </Badge>
              <Badge
                variant="solid"
                size="sm"
                className={cn("backdrop-blur-sm", getStatusTone(challenge, placeholder))}
              >
                {statusLabel}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {placeholder ? (
                <div className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-black/25 px-3 py-1 text-[11px] font-semibold text-gold backdrop-blur-sm">
                  <Lock className="h-3.5 w-3.5" />
                  PRO
                </div>
              ) : (
                <div className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
                  {getRewardLabel(challenge)}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <h3 className="line-clamp-2 text-lg font-bold leading-tight text-white">
                {challenge.title}
              </h3>
              <p className="line-clamp-2 text-sm leading-5 text-white/78">
                {challenge.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-white/78">
              {challenge.durationDays ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" />
                  {challenge.durationDays} kun
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                {placeholder ? <Trophy className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
                {getRewardLabel(challenge)}
              </span>
            </div>

            {!placeholder && progress > 0 ? (
              <div className="rounded-[1.35rem] border border-white/10 bg-black/25 p-3.5 backdrop-blur-md">
                <ProgressBar
                  value={progress}
                  max={100}
                  size="xs"
                  showLabel
                  label="Progress"
                  trackClassName="bg-white/15"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between text-sm font-semibold text-white/90">
                <span>{placeholder ? "Obuna bilan ochiladi" : "Batafsil ko'rish"}</span>
                <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};
