import { useMemo } from "react";
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

type NotificationsPage = {
  items: Notification[];
  page: number;
  pages: number;
  total: number;
};

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
  const query = useInfiniteQuery({
    queryKey: notificationKeys.list(),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await apiClient.get(endpoints.notifications.list, {
        params: { page: Number(pageParam), size: 20 },
      });
      const root = (res.data?.data ?? res.data) as Record<string, unknown>;
      const itemsRaw = Array.isArray(root?.items)
        ? (root.items as Array<Record<string, unknown>>)
        : Array.isArray(root?.data)
          ? (root.data as Array<Record<string, unknown>>)
          : Array.isArray(res.data?.data)
            ? (res.data.data as Array<Record<string, unknown>>)
            : [];
      const pagination =
        root?.pagination && typeof root.pagination === "object"
          ? (root.pagination as Record<string, unknown>)
          : null;
      const page = Number(pagination?.page ?? root?.page ?? pageParam);
      const pages = Number(pagination?.pages ?? root?.pages ?? 1);
      const total = Number(pagination?.total ?? root?.total ?? itemsRaw.length);

      return {
        items: itemsRaw.map(mapNotification),
        page: Number.isFinite(page) && page > 0 ? page : 1,
        pages: Number.isFinite(pages) && pages > 0 ? pages : 1,
        total: Number.isFinite(total) && total >= 0 ? total : itemsRaw.length,
      } satisfies NotificationsPage;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined
    ),
    staleTime: 30_000,
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  const total = query.data?.pages[0]?.total ?? items.length;

  return {
    ...query,
    items,
    total,
  };
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
