import { BellOff, CheckCheck, Trash2 } from "lucide-react";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Button } from "@/shared/ui/button";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { EmptyState } from "@/shared/ui/empty-state";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllRead,
  useDeleteNotification,
  type Notification,
} from "@/features/notifications/hooks/use-notifications";

const typeIcon: Record<Notification["type"], string> = {
  system:    "🔔",
  course:    "📚",
  challenge: "⚔️",
  payment:   "💳",
};

const NotificationCard = ({ item }: { item: Notification }) => {
  const markRead = useMarkNotificationRead();
  const del = useDeleteNotification();

  return (
    <GlassCard
      className={item.isRead ? "opacity-70" : ""}
      goldBorder={!item.isRead}
    >
      <div className="flex items-start gap-3">
        <button
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/40 bg-elevated text-base"
          onClick={() => !item.isRead && markRead.mutate(item.id)}
        >
          {typeIcon[item.type]}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-t-primary">{item.title}</p>
            {!item.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-gold" />}
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-t-muted">{item.body}</p>
          <p className="mt-1 text-2xs text-t-muted">
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString("uz") : ""}
          </p>
        </div>
        <button
          onClick={() => del.mutate(item.id)}
          className="shrink-0 p-1 text-t-muted hover:text-danger transition-colors"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </GlassCard>
  );
};

export const NotificationsPage = () => {
  const notifications = useNotifications();
  const markAll = useMarkAllRead();

  if (notifications.isLoading) {
    return (
      <MobileScreen>
        <div className="h-8 w-1/2 rounded-xl bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
        <MobileScreenSection className="mt-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </MobileScreenSection>
      </MobileScreen>
    );
  }

  if (notifications.isError) {
    return (
      <MobileScreen>
        <ErrorState variant="network" onRetry={() => notifications.refetch()} />
      </MobileScreen>
    );
  }

  const items = notifications.data ?? [];
  const hasUnread = items.some((n) => !n.isRead);

  return (
    <MobileScreen>
      <PageHeader
        title="Bildirishnomalar"
        actions={
          hasUnread ? (
            <Button
              variant="ghost"
              size="xs"
              loading={markAll.isPending}
              onClick={() => markAll.mutate()}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Barchasini o'qish
            </Button>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<BellOff className="h-8 w-8" />}
            title="Bildirishnomalar yo'q"
            description="Hozircha sizda hech qanday bildirishnoma mavjud emas."
          />
        </div>
      ) : (
        <MobileScreenSection className="mt-4">
          {items.map((n) => (
            <NotificationCard key={n.id} item={n} />
          ))}
        </MobileScreenSection>
      )}
    </MobileScreen>
  );
};
