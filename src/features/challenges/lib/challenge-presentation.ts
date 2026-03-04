import type { Challenge, ChallengeTypeCode } from "@/entities/challenge/types";

type ChallengeTypeLabels = Record<ChallengeTypeCode, string>;

type ChallengeStatusLabels = {
  active: string;
  pending?: string;
  completed?: string;
  locked?: string;
  fallback?: string;
};

const FALLBACK_TYPE_CODE: ChallengeTypeCode = "other";

export const getChallengeTypeLabel = (
  challenge: Challenge,
  labels: ChallengeTypeLabels,
  fallback = labels.other,
) => {
  if (challenge.typeLabel) {
    return challenge.typeLabel;
  }

  return labels[challenge.typeCode ?? FALLBACK_TYPE_CODE] ?? fallback;
};

export const getChallengeStatusLabel = (
  challenge: Challenge,
  labels: ChallengeStatusLabels,
) => {
  if (challenge.statusLabel) {
    return challenge.statusLabel;
  }

  if (challenge.isCompleted) {
    return labels.completed ?? labels.active;
  }

  if (challenge.isStarted) {
    return labels.active;
  }

  if (challenge.isLocked) {
    return labels.locked ?? labels.pending ?? labels.fallback ?? labels.active;
  }

  return labels.pending ?? labels.fallback ?? labels.active;
};

export const getChallengeRewardLabel = (challenge: Challenge) => {
  if (challenge.coinReward && challenge.coinReward > 0) {
    return `${challenge.coinReward} Coin`;
  }

  return `${challenge.xpReward} XP`;
};

export const getChallengeCardBackground = (
  challenge: Challenge,
  { placeholder = false }: { placeholder?: boolean } = {},
) => {
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
