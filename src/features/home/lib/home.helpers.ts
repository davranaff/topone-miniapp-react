import { env } from "@/shared/config/env";
import type { SubscriptionStatus } from "@/features/auth/types/auth.types";

export const normalizeMediaUrl = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  try {
    return new URL(trimmed, env.VITE_API_BASE_URL).toString();
  } catch {
    return trimmed;
  }
};

export const parseDailyCutoffTime = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const maybeDate = new Date(normalized);
  const looksLikeDateTime =
    normalized.includes("T") ||
    normalized.endsWith("Z") ||
    /[+-]\d{2}:?\d{2}$/.test(normalized);

  if (looksLikeDateTime && !Number.isNaN(maybeDate.getTime())) {
    return {
      hour: maybeDate.getHours(),
      minute: maybeDate.getMinutes(),
      second: maybeDate.getSeconds(),
    };
  }

  const matchedTime = normalized.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);

  if (!matchedTime) {
    return null;
  }

  const hour = Number(matchedTime[1]);
  const minute = Number(matchedTime[2]);
  const second = Number(matchedTime[3] ?? 0);

  if ([hour, minute, second].some((part) => Number.isNaN(part))) {
    return null;
  }

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
    return null;
  }

  return { hour, minute, second };
};

export const getNextDailyCycle = (
  now: Date,
  subscriptionStatus?: SubscriptionStatus,
) => {
  const cutoff = parseDailyCutoffTime(subscriptionStatus?.lastPurchaseTime);

  if (cutoff) {
    const next = new Date(now);
    next.setHours(cutoff.hour, cutoff.minute, cutoff.second, 0);

    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }

  if (subscriptionStatus?.purchaseDate) {
    const purchaseDate = new Date(subscriptionStatus.purchaseDate);

    if (!Number.isNaN(purchaseDate.getTime())) {
      const next = new Date(purchaseDate);
      const elapsedMs = now.getTime() - next.getTime();

      if (elapsedMs >= 0) {
        const elapsedDays = Math.floor(elapsedMs / 86_400_000);
        next.setDate(next.getDate() + elapsedDays + 1);

        if (next <= now) {
          next.setDate(next.getDate() + 1);
        }
      }

      return next;
    }
  }

  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  return nextMidnight;
};

export const getRemainingCountdown = (
  now: Date,
  subscriptionStatus?: SubscriptionStatus,
) => {
  const diff = getNextDailyCycle(now, subscriptionStatus).getTime() - now.getTime();
  return Math.max(diff, 0);
};

export const formatCountdown = (milliseconds: number) => {
  const totalSeconds = Math.max(Math.floor(milliseconds / 1000), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0"));
};
