import type { ReactNode } from "react";
import { BellOff, CheckCheck, Loader2, RefreshCcw, Trash2 } from "lucide-react";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Button } from "@/shared/ui/button";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { EmptyState } from "@/shared/ui/empty-state";
import { cn } from "@/shared/lib/cn";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllRead,
  useDeleteNotification,
  type Notification,
} from "@/features/notifications/hooks/use-notifications";

const typeIcon: Record<Notification["type"], string> = {
  system: "🔔",
  course: "📚",
  challenge: "⚔️",
  payment: "💳",
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
  onDelete,
  markLoading,
  deleteLoading,
}: {
  item: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  markLoading: boolean;
  deleteLoading: boolean;
}) => {
  const unread = !item.isRead;

  return (
    <GlassCard className={unread ? "rounded-[1.4rem] border-gold/25" : "rounded-[1.4rem] opacity-88"}>
      <div className="flex items-start gap-3.5">
        <button
          className="liquid-glass-button-icon liquid-glass-surface-interactive flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base"
          onClick={() => unread && onMarkRead(item.id)}
          disabled={item.isRead || markLoading}
          aria-label="Mark as read"
        >
          {markLoading ? <Loader2 className="h-4 w-4 animate-spin text-gold" /> : typeIcon[item.type]}
        </button>

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
            <p className="text-2xs text-t-muted">{formatDateTime(item.createdAt)}</p>
          </div>
        </div>

        <button
          onClick={() => onDelete(item.id)}
          disabled={deleteLoading}
          className="liquid-glass-button-icon liquid-glass-surface-interactive shrink-0 rounded-lg p-1.5 text-t-muted transition-colors hover:text-danger disabled:opacity-55"
          aria-label="Delete"
        >
          {deleteLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        </button>
      </div>
    </GlassCard>
  );
};

const NotificationSummary = ({
  total,
  unread,
}: {
  total: number;
  unread: number;
}) => (
  <GlassCard className="rounded-[1.6rem]">
    <div className="grid grid-cols-2 gap-3">
      <div className="liquid-glass-surface-muted rounded-[1.1rem] px-3 py-3">
        <p className="text-[11px] uppercase tracking-[0.14em] text-t-muted">Jami</p>
        <p className="mt-1 text-xl font-bold text-t-primary">{total}</p>
      </div>
      <div className="liquid-glass-surface-muted rounded-[1.1rem] px-3 py-3">
        <p className="text-[11px] uppercase tracking-[0.14em] text-t-muted">Yangi</p>
        <p className="mt-1 text-xl font-bold text-gold">{unread}</p>
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
  const del = useDeleteNotification();

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

  if (notifications.isError) {
    return (
      <MobileScreen className="space-y-4 lg:space-y-5">
        <ErrorState variant="network" onRetry={() => notifications.refetch()} />
      </MobileScreen>
    );
  }

  const items = notifications.data ?? [];
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

      <NotificationSummary total={items.length} unread={unreadItems.length} />

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
                  onDelete={(id) => del.mutate(id)}
                  markLoading={markRead.isPending && markRead.variables === item.id}
                  deleteLoading={del.isPending && del.variables === item.id}
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
                  onDelete={(id) => del.mutate(id)}
                  markLoading={markRead.isPending && markRead.variables === item.id}
                  deleteLoading={del.isPending && del.variables === item.id}
                />
              ))}
            </NotificationSection>
          ) : null}
        </MobileScreenSection>
      )}
    </MobileScreen>
  );
};
