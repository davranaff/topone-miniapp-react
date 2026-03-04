import type { ChallengeTypeCode } from "@/entities/challenge/types";

const toNextDailyBoundary = (now: Date) => {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next;
};

const toNextWeeklyBoundary = (now: Date) => {
  const next = new Date(now);
  const day = next.getDay(); // 0 Sunday, 1 Monday
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  next.setDate(next.getDate() + daysUntilMonday);
  next.setHours(0, 0, 0, 0);
  return next;
};

const toNextMonthlyBoundary = (now: Date) => {
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  next.setHours(0, 0, 0, 0);
  return next;
};

const toActiveDaysBoundary = (now: Date, activeDays?: number) => {
  if (!activeDays || activeDays <= 0) {
    return null;
  }

  const normalizedDays = Math.max(1, Math.floor(activeDays));
  const next = new Date(now);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() + normalizedDays);

  if (next <= now) {
    next.setDate(next.getDate() + normalizedDays);
  }

  return next;
};

export const getChallengeCycleDeadline = (
  now: Date,
  typeCode?: ChallengeTypeCode,
  activeDays?: number,
) => {
  if (typeCode === "daily") {
    return toNextDailyBoundary(now);
  }

  if (typeCode === "weekly") {
    return toNextWeeklyBoundary(now);
  }

  if (typeCode === "monthly") {
    return toNextMonthlyBoundary(now);
  }

  return toActiveDaysBoundary(now, activeDays);
};

export const getChallengeCycleLabel = (typeCode?: ChallengeTypeCode) => {
  if (typeCode === "daily") {
    return "Kun yakunigacha";
  }

  if (typeCode === "weekly") {
    return "Hafta yangilanishigacha";
  }

  if (typeCode === "monthly") {
    return "Oy yangilanishigacha";
  }

  return "Challenge sikli";
};

export const getChallengeCycleRemaining = (
  now: Date,
  typeCode?: ChallengeTypeCode,
  activeDays?: number,
) => {
  const deadline = getChallengeCycleDeadline(now, typeCode, activeDays);

  if (!deadline) {
    return 0;
  }

  return Math.max(0, deadline.getTime() - now.getTime());
};

export const formatCountdownParts = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    hasDays: days > 0,
  };
};
