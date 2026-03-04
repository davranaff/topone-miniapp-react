import { ChevronRight, Clock3, Lock, Star, Trophy } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { cn } from "@/shared/lib/cn";
import type { Challenge } from "@/entities/challenge/types";
import {
  getChallengeCardBackground,
  getChallengeRewardLabel,
  getChallengeStatusLabel,
  getChallengeTypeLabel,
} from "@/features/challenges/lib/challenge-presentation";

const getStatusTone = (challenge: Challenge, placeholder: boolean) => {
  if (placeholder) {
    return "liquid-glass-chip text-white";
  }

  if (challenge.isCompleted) {
    return "liquid-glass-state-success text-white";
  }

  if (challenge.isStarted) {
    return "liquid-glass-button-chip-active text-black";
  }

  if (challenge.isLocked) {
    return "liquid-glass-chip text-white";
  }

  return "liquid-glass-chip text-white";
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
  const typeLabel = getChallengeTypeLabel(
    challenge,
    {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      other: "Challenge",
    },
    "Challenge",
  );
  const statusLabel = placeholder
    ? "PRO"
    : getChallengeStatusLabel(challenge, {
        active: "Faol",
        pending: "Faol",
        completed: "Faol",
        locked: "Faol",
        fallback: "Faol",
      });

  return (
    <button type="button" onClick={onClick} className="group block w-full rounded-[2rem] text-left">
      <div className="relative min-h-[212px] overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_26px_70px_rgba(0,0,0,0.42)]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: getChallengeCardBackground(challenge, { placeholder }) }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/42 to-black/12" />

        {placeholder && (
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,13,0.2),rgba(7,9,13,0.58))] backdrop-blur-[1.5px]" />
        )}

        <div className="relative flex min-h-[212px] flex-col justify-between p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Badge variant="outline" size="sm" className="liquid-glass-chip text-white">
                {typeLabel}
              </Badge>
              <Badge
                variant="outline"
                size="sm"
                className={getStatusTone(challenge, placeholder)}
              >
                {statusLabel}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {placeholder ? (
                <div className="liquid-glass-state-gold inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold text-gold">
                  <Lock className="h-3.5 w-3.5" />
                  PRO
                </div>
              ) : (
                <div className="liquid-glass-chip rounded-full px-3 py-1 text-[11px] font-semibold text-white/90">
                  {getChallengeRewardLabel(challenge)}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <h3 className="line-clamp-2 max-w-[88%] text-[1.18rem] font-extrabold leading-tight tracking-[-0.03em] text-white">
                {challenge.title}
              </h3>
              <p className="line-clamp-2 max-w-[92%] text-sm leading-5 text-white/78">
                {challenge.description}
              </p>
            </div>

            {!placeholder && progress > 0 ? (
              <div className="liquid-glass-surface rounded-[1.35rem] p-3.5 text-white">
                <div className="mb-2 flex flex-wrap items-center gap-3 text-[11px] font-medium text-white/74">
                  {challenge.durationDays ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5" />
                      {challenge.durationDays} kun
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5" />
                    {getChallengeRewardLabel(challenge)}
                  </span>
                </div>
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
              <div className="liquid-glass-surface flex items-center justify-between rounded-[1.35rem] px-4 py-3 text-sm font-semibold text-white/90">
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-white/72">
                  {challenge.durationDays ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5" />
                      {challenge.durationDays} kun
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5">
                    {placeholder ? <Trophy className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
                    {getChallengeRewardLabel(challenge)}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};
