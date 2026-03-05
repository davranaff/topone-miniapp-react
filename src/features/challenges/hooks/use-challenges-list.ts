import { useInfiniteQuery } from "@tanstack/react-query";
import { challengesApi } from "@/features/challenges/api/challenges.api";

export const useChallengesList = (
  params: {
    page?: number;
    size?: number;
    typeId?: string;
    includeCompleted?: boolean;
    enabled?: boolean;
  } = {},
) => {
  const initialPage = params.page ?? 1;
  const pageSize = params.size ?? 12;

  return useInfiniteQuery({
    queryKey: ["challenges", "list", {
      pageSize,
      typeId: params.typeId ?? "",
      includeCompleted: Boolean(params.includeCompleted),
    }],
    queryFn: ({ pageParam }) => challengesApi.list({
      page: Number(pageParam ?? initialPage),
      size: pageSize,
      typeId: params.typeId,
      includeCompleted: params.includeCompleted,
    }),
    initialPageParam: initialPage,
    getNextPageParam: (lastPage) => (
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined
    ),
    enabled: params.enabled ?? true,
    retry: false,
  });
};
