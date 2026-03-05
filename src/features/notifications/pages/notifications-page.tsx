import type { ReactNode } from "react";
import { Bell, BellOff, BookOpen, CheckCheck, CreditCard, Loader2, RefreshCcw, Trophy } from "lucide-react";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Button } from "@/shared/ui/button";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { EmptyState } from "@/shared/ui/empty-state";
import { cn } from "@/shared/lib/cn";
import { useInfiniteScrollTrigger } from "@/shared/hooks/use-infinite-scroll-trigger";
import { InfiniteScrollLoader } from "@/shared/ui/infinite-scroll-loader";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllRead,
  type Notification,
} from "@/features/notifications/hooks/use-notifications";

const typeIcon: Record<Notification["type"], ReactNode> = {
  system: <Bell className="h-4.5 w-4.5" />,
  course: <BookOpen className="h-4.5 w-4.5" />,
  challenge: <Trophy className="h-4.5 w-4.5" />,
  payment: <CreditCard className="h-4.5 w-4.5" />,
};

const typeLabel: Record<Notification["type"], string> = {
  system: "Tizim",
  course: "Kurs",
  challenge: "Challenge",
  payment: "To'lov",
};

const formatDateTime = (value: string) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return `${date.toLocaleDateString("uz")} • ${date.toLocaleTimeString("uz", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const NotificationCard = ({
  item,
  onMarkRead,
  markLoading,
}: {
  item: Notification;
  onMarkRead: (id: string) => void;
  markLoading: boolean;
}) => {
  const unread = !item.isRead;

  return (
    <GlassCard
      className={cn(
        "relative overflow-hidden rounded-[1.45rem] border-white/10",
        unread ? "border-gold/28 bg-[linear-gradient(145deg,rgba(212,160,23,0.09),rgba(7,7,7,0.7))]" : "opacity-88",
      )}
    >
      {unread ? (
        <div className="pointer-events-none absolute inset-y-4 left-0 w-[2px] rounded-full bg-gold/70" />
      ) : null}
      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            "liquid-glass-button-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base",
            unread ? "text-gold" : "text-t-secondary",
          )}
        >
          {typeIcon[item.type]}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-t-primary">{item.title}</p>
            {unread ? <span className="h-2 w-2 shrink-0 rounded-full bg-gold" /> : null}
          </div>

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-t-secondary">{item.body}</p>

          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="liquid-glass-chip rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-t-muted">
              {typeLabel[item.type]}
            </span>
            <div className="flex items-center gap-2">
              <p className="text-2xs text-t-muted">{formatDateTime(item.createdAt)}</p>
              {unread ? (
                <button
                  type="button"
                  onClick={() => onMarkRead(item.id)}
                  disabled={markLoading}
                  className="liquid-glass-button-link liquid-glass-surface-interactive inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gold disabled:opacity-50"
                >
                  {markLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  O'qildi
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

const NotificationSummary = ({
  total,
  unread,
  read,
}: {
  total: number;
  unread: number;
  read: number;
}) => (
  <GlassCard className="rounded-[1.6rem]">
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
      <div className="liquid-glass-surface-muted rounded-[1.1rem] px-3 py-3">
        <p className="text-[11px] uppercase tracking-[0.14em] text-t-muted">Jami</p>
        <p className="mt-1 text-xl font-bold text-t-primary">{total}</p>
      </div>
      <div className="liquid-glass-surface-muted rounded-[1.1rem] px-3 py-3">
        <p className="text-[11px] uppercase tracking-[0.14em] text-t-muted">Yangi</p>
        <p className="mt-1 text-xl font-bold text-gold">{unread}</p>
      </div>
      <div className="liquid-glass-surface-muted rounded-[1.1rem] px-3 py-3">
        <p className="text-[11px] uppercase tracking-[0.14em] text-t-muted">Arxiv</p>
        <p className="mt-1 text-xl font-bold text-t-primary">{read}</p>
      </div>
    </div>
  </GlassCard>
);

const NotificationSection = ({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) => (
  <div className="space-y-2.5">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-t-muted">{title}</p>
      <span className="text-2xs font-semibold text-t-muted">{count}</span>
    </div>
    <div className="space-y-2.5">{children}</div>
  </div>
);

export const NotificationsPage = () => {
  const notifications = useNotifications();
  const markAll = useMarkAllRead();
  const markRead = useMarkNotificationRead();
  const loadMoreRef = useInfiniteScrollTrigger({
    hasNextPage: notifications.hasNextPage,
    isFetchingNextPage: notifications.isFetchingNextPage,
    onLoadMore: () => notifications.fetchNextPage(),
  });

  if (notifications.isLoading) {
    return (
      <MobileScreen className="space-y-4 lg:space-y-5">
        <div className="h-8 w-1/2 animate-shimmer rounded-xl bg-elevated bg-shimmer bg-[length:200%_100%]" />
        <MobileScreenSection className="mt-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </MobileScreenSection>
      </MobileScreen>
    );
  }

  if (notifications.isError && !notifications.items.length) {
    return (
      <MobileScreen className="space-y-4 lg:space-y-5">
        <ErrorState variant="network" onRetry={() => notifications.refetch()} />
      </MobileScreen>
    );
  }

  const items = notifications.items;
  const unreadItems = items.filter((item) => !item.isRead);
  const readItems = items.filter((item) => item.isRead);
  const hasUnread = unreadItems.length > 0;

  return (
    <MobileScreen className="space-y-4 lg:space-y-5">
      <PageHeader
        title="Bildirishnomalar"
        subtitle="Tizim, kurs va challenge yangiliklari"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="xs"
              loading={notifications.isFetching}
              onClick={() => notifications.refetch()}
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Yangilash
            </Button>
            {hasUnread ? (
              <Button
                variant="ghost"
                size="xs"
                loading={markAll.isPending}
                onClick={() => markAll.mutate()}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                O'qildi
              </Button>
            ) : null}
          </div>
        }
      />

      <NotificationSummary
        total={notifications.total}
        unread={unreadItems.length}
        read={readItems.length}
      />

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<BellOff className="h-8 w-8" />}
            title="Bildirishnomalar yo'q"
            description="Hozircha sizda hech qanday bildirishnoma mavjud emas."
          />
        </div>
      ) : (
        <MobileScreenSection
          className={cn(
            "space-y-4",
            unreadItems.length > 0 && readItems.length > 0 && "xl:grid xl:grid-cols-2 xl:gap-4 xl:space-y-0",
          )}
        >
          {unreadItems.length > 0 ? (
            <NotificationSection title="Yangi" count={unreadItems.length}>
              {unreadItems.map((item) => (
                <NotificationCard
                  key={item.id}
                  item={item}
                  onMarkRead={(id) => markRead.mutate(id)}
                  markLoading={markRead.isPending && markRead.variables === item.id}
                />
              ))}
            </NotificationSection>
          ) : null}

          {readItems.length > 0 ? (
            <NotificationSection title="Arxiv" count={readItems.length}>
              {readItems.map((item) => (
                <NotificationCard
                  key={item.id}
                  item={item}
                  onMarkRead={(id) => markRead.mutate(id)}
                  markLoading={markRead.isPending && markRead.variables === item.id}
                />
              ))}
            </NotificationSection>
          ) : null}

          {notifications.isError && items.length > 0 ? (
            <ErrorState variant="network" onRetry={() => notifications.refetch()} />
          ) : null}

          <InfiniteScrollLoader
            sentinelRef={loadMoreRef}
            hasNextPage={notifications.hasNextPage}
            isFetchingNextPage={notifications.isFetchingNextPage}
          />
        </MobileScreenSection>
      )}
    </MobileScreen>
  );
};
