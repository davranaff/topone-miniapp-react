import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  startTransition,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Award,
  Bell,
  CircleCheckBig,
  Flame,
  GraduationCap,
  TrendingUp,
  Trophy,
  X,
  type LucideIcon,
} from "lucide-react";
import { queryClient } from "@/shared/api/query-client";
import { queryKeys } from "@/shared/api/query-keys";
import { notificationKeys } from "@/features/notifications/hooks/use-notifications";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { tokenStorage } from "@/shared/auth/token-storage";
import { endpoints } from "@/shared/api/endpoints";
import { env } from "@/shared/config/env";
import { userStatsQueryKey, type UserStats } from "@/features/home/hooks/use-user-stats";
import { achievementKeys } from "@/features/achievements/hooks/use-achievements";
import { cn } from "@/shared/lib/cn";

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY_MS = 3000;
const PING_INTERVAL_MS = 10_000;
const TOAST_VISIBLE_MS = 4300;
const MAX_EVENT_CACHE_SIZE = 250;
const MAX_TOAST_QUEUE = 8;

const IMPORTANT_EVENT_TYPES = new Set([
  "challenge_completed",
  "lesson_completed",
  "achievement_unlocked",
  "level_up",
  "daily_streak_achieved",
  "quiz_passed",
  "quiz_completed",
  "course_completed",
]);

type RealtimeEvent = {
  eventId: string;
  type: string;
  timestamp: string;
  notificationId?: string;
  data: Record<string, unknown>;
  extraData: Record<string, unknown>;
};

type RealtimeToast = {
  id: string;
  type: string;
  title: string;
  message: string;
  subtitle?: string;
};

const toRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
};

const toText = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }

    const normalized = value.trim();
    if (normalized.length > 0) {
      return normalized;
    }
  }

  return null;
};

const toInt = (...values: unknown[]) => {
  for (const value of values) {
    if (value == null) {
      continue;
    }

    const parsed = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.trunc(parsed));
    }
  }

  return 0;
};

const normalizeEventType = (value: string) => {
  const normalized = value.trim().toLowerCase().replaceAll(".", "_");
  if (normalized === "daily_login") {
    return "daily_streak_achieved";
  }
  if (normalized === "user_level_up") {
    return "level_up";
  }
  if (normalized === "reward_daily_claimed") {
    return "daily_streak_achieved";
  }
  if (normalized === "challenge_complete") {
    return "challenge_completed";
  }
  if (normalized === "lesson_complete") {
    return "lesson_completed";
  }
  if (normalized === "quiz_complete") {
    return "quiz_completed";
  }

  return normalized;
};

const buildNotificationsWebSocketUrl = (accessToken: string) => {
  const url = new URL(env.VITE_API_BASE_URL);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = endpoints.ws.notifications;
  url.search = "";
  url.searchParams.set("token", accessToken);
  return url.toString();
};

const resolveEventIcon = (type: string): LucideIcon => {
  switch (type) {
    case "challenge_completed":
      return Trophy;
    case "lesson_completed":
      return GraduationCap;
    case "achievement_unlocked":
      return Award;
    case "level_up":
      return TrendingUp;
    case "daily_streak_achieved":
      return Flame;
    case "quiz_passed":
    case "quiz_completed":
      return CircleCheckBig;
    default:
      return Bell;
  }
};

const getDefaultTitle = (type: string) => {
  switch (type) {
    case "challenge_completed":
      return "Challenge tugallandi";
    case "lesson_completed":
      return "Dars tugallandi";
    case "achievement_unlocked":
      return "Yutuq ochildi";
    case "level_up":
      return "Daraja oshdi";
    case "daily_streak_achieved":
      return "Streak yangilandi";
    case "quiz_passed":
    case "quiz_completed":
      return "Quiz yakunlandi";
    case "course_completed":
      return "Kurs yakunlandi";
    default:
      return "Yangi bildirishnoma";
  }
};

const getDefaultMessage = (event: RealtimeEvent) => {
  const extra = event.extraData;

  switch (event.type) {
    case "challenge_completed":
      return toText(extra.challenge_title)
        ? `"${toText(extra.challenge_title)}" challenge yakunlandi`
        : "Challenge muvaffaqiyatli tugatildi";
    case "lesson_completed":
      return toText(extra.lesson_title)
        ? `"${toText(extra.lesson_title)}" darsi tugatildi`
        : "Dars muvaffaqiyatli tugatildi";
    case "achievement_unlocked":
      return toText(extra.achievement_title)
        ? `Yangi yutuq: ${toText(extra.achievement_title)}`
        : "Yangi yutuq ochildi";
    case "level_up":
      return toInt(extra.new_level) > 0
        ? `${toInt(extra.new_level)}-darajaga chiqdingiz`
        : "Yangi darajaga ko'tarildingiz";
    case "daily_streak_achieved":
      return toInt(extra.streak_days) > 0
        ? `${toInt(extra.streak_days)} kunlik streak saqlandi`
        : "Kunlik streak yangilandi";
    case "quiz_passed":
    case "quiz_completed":
      if (toText(extra.quiz_title)) {
        return `"${toText(extra.quiz_title)}" quizi muvaffaqiyatli yakunlandi`;
      }
      return "Quiz muvaffaqiyatli yakunlandi";
    case "course_completed":
      return toText(extra.course_title)
        ? `"${toText(extra.course_title)}" kursi yakunlandi`
        : "Kurs muvaffaqiyatli yakunlandi";
    default:
      return "Sizda yangi hodisa bor";
  }
};

const formatDuration = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
};

const getRewards = (event: RealtimeEvent) => {
  const extra = event.extraData;
  const data = event.data;

  return {
    xp: toInt(
      extra.xp_earned,
      extra.xp_awarded,
      extra.points_awarded,
      data.xp_earned,
      data.xp_awarded,
      data.points_awarded,
      data.reward_xp,
    ),
    coins: toInt(
      extra.coins_earned,
      extra.coins_awarded,
      data.coins_earned,
      data.coins_awarded,
      data.reward_coins,
    ),
    streak: toInt(extra.streak_days, extra.streak_count, data.streak_days, data.streak_count),
  };
};

const buildSubtitle = (event: RealtimeEvent) => {
  const details: string[] = [];
  const rewards = getRewards(event);

  if (rewards.xp > 0) {
    details.push(`+${rewards.xp} XP`);
  }
  if (rewards.coins > 0) {
    details.push(`+${rewards.coins} Coin`);
  }

  const completionTime = toInt(event.extraData.completion_time_seconds);
  if (completionTime > 0) {
    details.push(`⏱ ${formatDuration(completionTime)}`);
  }

  const progress = toInt(event.extraData.progress_percentage, event.data.progress_percentage);
  if (progress === 100) {
    details.push("📊 100%");
  }

  return details.length > 0 ? details.join(" • ") : undefined;
};

const isImportantEvent = (event: RealtimeEvent) => {
  if (IMPORTANT_EVENT_TYPES.has(event.type)) {
    return true;
  }

  const rewards = getRewards(event);
  return rewards.xp > 0 || rewards.coins > 0;
};

const createToastFromEvent = (event: RealtimeEvent): RealtimeToast => {
  const title = toText(event.data.title) ?? getDefaultTitle(event.type);
  const message = toText(event.data.message, event.data.body) ?? getDefaultMessage(event);

  return {
    id: event.eventId,
    type: event.type,
    title,
    message,
    subtitle: buildSubtitle(event),
  };
};

export const NotificationsRealtimeProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const authStatus = useAuthStore((state) => state.status);
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);
  const accessTokenFromStore = useAuthStore((state) => state.tokens?.accessToken ?? null);

  const accessToken = (() => {
    if (typeof accessTokenFromStore === "string" && accessTokenFromStore.trim().length > 0) {
      return accessTokenFromStore;
    }

    return tokenStorage.getTokens()?.accessToken ?? null;
  })();

  const [activeToast, setActiveToast] = useState<RealtimeToast | null>(null);

  const toastQueueRef = useRef<RealtimeToast[]>([]);
  const activeToastRef = useRef<RealtimeToast | null>(null);
  const toastDismissTimerRef = useRef<number | null>(null);
  const seenEventIdsRef = useRef<string[]>([]);
  const seenEventLookupRef = useRef(new Set<string>());

  const clearToastDismissTimer = () => {
    if (toastDismissTimerRef.current == null) {
      return;
    }

    window.clearTimeout(toastDismissTimerRef.current);
    toastDismissTimerRef.current = null;
  };

  const showNextToast = () => {
    if (activeToastRef.current) {
      return;
    }

    const next = toastQueueRef.current.shift();
    if (!next) {
      return;
    }

    activeToastRef.current = next;
    setActiveToast(next);
    clearToastDismissTimer();

    toastDismissTimerRef.current = window.setTimeout(() => {
      activeToastRef.current = null;
      setActiveToast(null);
      showNextToast();
    }, TOAST_VISIBLE_MS);
  };

  const dismissActiveToast = () => {
    clearToastDismissTimer();
    activeToastRef.current = null;
    setActiveToast(null);
    showNextToast();
  };

  const processRealtimeEvent = useEffectEvent((event: RealtimeEvent) => {
    const dedupeKey = toText(event.eventId, event.notificationId, `${event.type}:${event.timestamp}`);
    if (!dedupeKey) {
      return;
    }

    if (seenEventLookupRef.current.has(dedupeKey)) {
      return;
    }

    seenEventLookupRef.current.add(dedupeKey);
    seenEventIdsRef.current.push(dedupeKey);
    if (seenEventIdsRef.current.length > MAX_EVENT_CACHE_SIZE) {
      const removed = seenEventIdsRef.current.shift();
      if (removed) {
        seenEventLookupRef.current.delete(removed);
      }
    }

    if (!isImportantEvent(event)) {
      return;
    }

    if (event.notificationId) {
      queryClient.setQueryData<number>(notificationKeys.unread(), (previous) => {
        return typeof previous === "number" ? previous + 1 : 1;
      });
    }

    const rewards = getRewards(event);
    const shouldPatchStats =
      rewards.xp > 0 ||
      rewards.coins > 0 ||
      rewards.streak > 0 ||
      event.type === "level_up";

    if (shouldPatchStats) {
      queryClient.setQueryData<UserStats>(userStatsQueryKey, (previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          xp: previous.xp + rewards.xp,
          coins: previous.coins + rewards.coins,
          streak: rewards.streak > 0 ? Math.max(previous.streak, rewards.streak) : previous.streak,
        };
      });
    }

    void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.home.feed });
    void queryClient.invalidateQueries({ queryKey: userStatsQueryKey });

    if (event.type === "achievement_unlocked") {
      void queryClient.invalidateQueries({ queryKey: achievementKeys.all });
    }

    if (event.type === "challenge_completed") {
      void queryClient.invalidateQueries({ queryKey: ["challenges"] });
    }

    if (
      event.type === "lesson_completed" ||
      event.type === "course_completed" ||
      event.type === "quiz_passed" ||
      event.type === "quiz_completed"
    ) {
      void queryClient.invalidateQueries({ queryKey: ["courses"] });
      void queryClient.invalidateQueries({ queryKey: ["lessons"] });
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
    }

    if (location.pathname.startsWith("/notifications")) {
      return;
    }

    const toast = createToastFromEvent(event);
    startTransition(() => {
      toastQueueRef.current = [...toastQueueRef.current, toast].slice(-MAX_TOAST_QUEUE);
      showNextToast();
    });
  });

  const handleSocketMessage = useEffectEvent((rawData: string, socket: WebSocket) => {
    if (rawData === "ping") {
      socket.send(JSON.stringify({ type: "pong", timestamp: new Date().toISOString() }));
      return;
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawData) as Record<string, unknown>;
    } catch {
      return;
    }

    const normalizedType = normalizeEventType(String(parsed.type ?? ""));
    if (!normalizedType) {
      return;
    }

    if (normalizedType === "ping") {
      socket.send(JSON.stringify({ type: "pong", timestamp: new Date().toISOString() }));
      return;
    }

    if (normalizedType === "pong" || normalizedType === "connection_established") {
      return;
    }

    const rootData = toRecord(parsed.data);
    const rootExtraData = toRecord(parsed.extra_data ?? parsed.extraData);
    const wrappedEventType = toText(
      rootData.event,
      rootData.event_name,
      parsed.event_name,
    );
    const wrappedEventData = toRecord(rootData.event_data ?? rootData.payload ?? parsed.event_data);

    const effectiveType = normalizedType === "event" && wrappedEventType
      ? normalizeEventType(wrappedEventType)
      : normalizedType;

    if (!effectiveType || effectiveType === "event") {
      return;
    }

    const data = normalizedType === "event"
      ? { ...rootData, ...wrappedEventData }
      : rootData;
    const extraData = normalizedType === "event"
      ? { ...wrappedEventData, ...rootExtraData }
      : rootExtraData;

    const eventId = toText(
      parsed.event_id,
      parsed.eventId,
      parsed.notification_id,
      data.event_id,
      data.id,
    ) ?? `${effectiveType}:${Date.now().toString(36)}`;

    processRealtimeEvent({
      eventId,
      type: effectiveType,
      timestamp: toText(parsed.timestamp) ?? new Date().toISOString(),
      notificationId: toText(parsed.notification_id, parsed.notificationId) ?? undefined,
      data,
      extraData,
    });
  });

  useEffect(() => {
    const shouldConnect =
      isBootstrapped &&
      authStatus !== "anonymous" &&
      typeof accessToken === "string" &&
      accessToken.length > 0;

    if (!shouldConnect || !accessToken) {
      return;
    }

    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let pingTimer: number | null = null;
    let reconnectAttempts = 0;
    let isActive = true;
    let isManualClose = false;

    const clearReconnectTimer = () => {
      if (reconnectTimer == null) {
        return;
      }

      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    };

    const clearPingTimer = () => {
      if (pingTimer == null) {
        return;
      }

      window.clearInterval(pingTimer);
      pingTimer = null;
    };

    const startPingTimer = () => {
      clearPingTimer();

      pingTimer = window.setInterval(() => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
          return;
        }

        socket.send(JSON.stringify({ type: "ping", timestamp: new Date().toISOString() }));
      }, PING_INTERVAL_MS);
    };

    const closeSocket = () => {
      clearPingTimer();

      if (!socket) {
        return;
      }

      const state = socket.readyState;
      if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) {
        socket.close(1000, "Client disconnect");
      }
      socket = null;
    };

    const scheduleReconnect = () => {
      if (!isActive || isManualClose) {
        return;
      }

      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        return;
      }

      reconnectAttempts += 1;
      const delay = BASE_RECONNECT_DELAY_MS * reconnectAttempts;
      clearReconnectTimer();
      reconnectTimer = window.setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, delay);
    };

    const connect = () => {
      if (!isActive || isManualClose) {
        return;
      }

      if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
        return;
      }

      const wsUrl = buildNotificationsWebSocketUrl(accessToken);
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        reconnectAttempts = 0;
        startPingTimer();
      };

      socket.onmessage = (messageEvent) => {
        if (typeof messageEvent.data !== "string" || !socket) {
          return;
        }
        handleSocketMessage(messageEvent.data, socket);
      };

      socket.onerror = () => {
        // onclose handles retries
      };

      socket.onclose = (closeEvent) => {
        clearPingTimer();
        socket = null;
        if (!isActive || isManualClose) {
          return;
        }

        if (closeEvent.code === 1008) {
          return;
        }

        scheduleReconnect();
      };
    };

    connect();

    return () => {
      isActive = false;
      isManualClose = true;
      clearReconnectTimer();
      clearPingTimer();
      closeSocket();
    };
  }, [accessToken, authStatus, isBootstrapped]);

  useEffect(() => {
    return () => {
      clearToastDismissTimer();
    };
  }, []);

  return (
    <>
      {children}
      {activeToast && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] flex justify-center px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))]">
          <div
            role="status"
            aria-live="polite"
            className={cn(
              "pointer-events-auto animate-scale-in w-full max-w-lg rounded-[1.45rem] border border-gold/30",
              "liquid-glass-button-chip bg-[linear-gradient(145deg,rgba(44,31,11,0.9),rgba(14,10,5,0.95))] px-4 py-3",
              "shadow-[0_18px_44px_rgba(0,0,0,0.42)]",
            )}
            onClick={() => navigate("/notifications")}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-gold/30 bg-gold/12 text-gold">
                {(() => {
                  const Icon = resolveEventIcon(activeToast.type);
                  return <Icon className="h-5 w-5" />;
                })()}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-t-primary">{activeToast.title}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-t-secondary">{activeToast.message}</p>
                {activeToast.subtitle && (
                  <p className="mt-1 truncate text-xs font-medium text-gold/95">{activeToast.subtitle}</p>
                )}
              </div>

              <button
                type="button"
                aria-label="Close notification"
                onClick={(event) => {
                  event.stopPropagation();
                  dismissActiveToast();
                }}
                className="liquid-glass-button-icon liquid-glass-surface-interactive flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-t-muted transition-colors hover:text-t-primary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
