import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";

export type Notification = {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  type: "system" | "course" | "challenge" | "payment";
  createdAt: string;
};

const mapNotification = (r: Record<string, unknown>): Notification => ({
  id: String(r.id ?? ""),
  title: String(r.title ?? r.subject ?? ""),
  body: String(r.body ?? r.message ?? r.content ?? ""),
  isRead: Boolean(r.is_read ?? r.isRead ?? false),
  type: (r.type as Notification["type"]) ?? "system",
  createdAt: String(r.created_at ?? r.createdAt ?? ""),
});

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
  unread: () => [...notificationKeys.all, "unread"] as const,
};

export const fetchUnreadCount = async () => {
  const res = await apiClient.get(endpoints.notifications.unreadCount);
  const data = res.data?.data ?? res.data;
  return Number(data?.count ?? data?.unread_count ?? 0);
};

export const useNotifications = () => {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: async () => {
      const res = await apiClient.get(endpoints.notifications.list);
      const payload = res.data?.data ?? res.data;
      const items = Array.isArray(payload) ? payload : (payload?.items ?? []);
      return (items as Array<Record<string, unknown>>).map(mapNotification);
    },
    staleTime: 30_000,
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: fetchUnreadCount,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
};

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.patch(endpoints.notifications.markRead(id)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post(endpoints.notifications.markAllRead),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(endpoints.notifications.delete(id)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};
