import { ChevronRight, Clock3, Lock, Star, Trophy } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { ProgressBar } from "@/shared/ui/progress-bar";
import type { Challenge } from "@/entities/challenge/types";
import {
  getChallengeCardBackground,
  getChallengeRewardLabel,
  getChallengeStatusLabel,
  getChallengeTypeLabel,
} from "@/features/challenges/lib/challenge-presentation";

const getStatusTone = (challenge: Challenge, placeholder: boolean) => {
  if (placeholder) {
    return "bg-white/15 text-white backdrop-blur-sm";
  }

  if (challenge.isCompleted) {
    return "bg-success/85 text-white";
  }

  if (challenge.isStarted) {
    return "bg-gold/85 text-black";
  }

  if (challenge.isLocked) {
    return "bg-white/15 text-white backdrop-blur-sm";
  }

  return "bg-white/15 text-white backdrop-blur-sm";
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
    <button
      type="button"
      onClick={onClick}
      className="group block w-full rounded-[2rem] text-left transition-transform duration-300 active:scale-[0.992]"
    >
      <div className="relative h-[188px] overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_18px_42px_rgba(0,0,0,0.42)] transition-all duration-300 group-hover:-translate-y-0.5">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: getChallengeCardBackground(challenge, { placeholder }) }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

        {placeholder && (
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,13,0.24),rgba(7,9,13,0.62))] backdrop-blur-[2px]" />
        )}

        <div className="relative flex h-full flex-col justify-between p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Badge variant="solid" size="sm" className="bg-white/15 text-white backdrop-blur-sm">
                {typeLabel}
              </Badge>
              <Badge
                variant="solid"
                size="sm"
                className={getStatusTone(challenge, placeholder)}
              >
                {statusLabel}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {placeholder ? (
                <div className="inline-flex items-center gap-1 rounded-full border border-transparent bg-gold px-3 py-1 text-[11px] font-semibold text-black">
                  <Lock className="h-3.5 w-3.5" />
                  PRO
                </div>
              ) : (
                <div className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
                  {getChallengeRewardLabel(challenge)}
                </div>
              )}
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

            {!placeholder && progress > 0 ? (
              <div className="rounded-[1.35rem] border border-white/10 bg-black/25 p-3.5 backdrop-blur-md">
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
              <div className="flex items-center justify-between rounded-[1.35rem] border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/90 backdrop-blur-md">
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
                <div className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-white/78">
                  {placeholder ? "Obuna" : "Batafsil"}
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};
