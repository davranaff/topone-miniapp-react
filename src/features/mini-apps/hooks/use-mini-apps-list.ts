import { useQuery } from "@tanstack/react-query";
import { miniAppsApi } from "@/features/mini-apps/api/mini-apps.api";
import { queryKeys } from "@/shared/api/query-keys";

export const useMiniAppsList = () => {
  return useQuery({
    queryKey: queryKeys.miniApps.list,
    queryFn: miniAppsApi.list,
  });
};
