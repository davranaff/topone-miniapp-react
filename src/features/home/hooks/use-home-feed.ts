import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import { homeApi } from "@/features/home/api/home.api";

export const useHomeFeed = () => {
  return useQuery({
    queryKey: queryKeys.home.feed,
    queryFn: homeApi.getFeed,
  });
};
