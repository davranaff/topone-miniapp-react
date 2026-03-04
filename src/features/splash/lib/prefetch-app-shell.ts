import { queryClient } from "@/shared/api/query-client";
import { queryKeys } from "@/shared/api/query-keys";
import { homeApi } from "@/features/home/api/home.api";
import { authApi } from "@/features/auth/api/auth.api";
import { coursesCatalogQueryKey, getCoursesCatalog } from "@/features/courses/lib/catalog-query";
import { notificationKeys, fetchUnreadCount } from "@/features/notifications/hooks/use-notifications";
import { userStatsQueryKey, fetchUserStats } from "@/features/home/hooks/use-user-stats";

export const prefetchAppShell = async () => {
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: queryKeys.home.feed,
      queryFn: homeApi.getFeed,
    }),
    queryClient.prefetchQuery({
      queryKey: coursesCatalogQueryKey,
      queryFn: getCoursesCatalog,
    }),
    queryClient.prefetchQuery({
      queryKey: userStatsQueryKey,
      queryFn: fetchUserStats,
    }),
    queryClient.prefetchQuery({
      queryKey: notificationKeys.unread(),
      queryFn: fetchUnreadCount,
    }),
    queryClient.prefetchQuery({
      queryKey: ["auth", "subscription-status"],
      queryFn: authApi.getSubscriptionStatus,
    }),
  ]);
};
