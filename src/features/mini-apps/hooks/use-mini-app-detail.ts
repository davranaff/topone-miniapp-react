import { useQuery } from "@tanstack/react-query";
import { miniAppsApi } from "@/features/mini-apps/api/mini-apps.api";
import { queryKeys } from "@/shared/api/query-keys";

export const useMiniAppDetail = (slug?: string) => {
  return useQuery({
    queryKey: queryKeys.miniApps.detail(slug ?? ""),
    queryFn: () => miniAppsApi.detail(slug ?? ""),
    enabled: Boolean(slug),
  });
};
