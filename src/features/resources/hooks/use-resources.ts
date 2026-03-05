import { useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { resourcesApi } from "@/features/resources/api/resources.api";

export const resourceKeys = {
  all: ["resources"] as const,
  categories: () => [...resourceKeys.all, "categories"] as const,
  list: (category?: string) => [...resourceKeys.all, "list", category ?? "all"] as const,
};

export const useResourceCategories = () => {
  return useQuery({
    queryKey: resourceKeys.categories(),
    queryFn: () => resourcesApi.categories(),
    staleTime: 60_000,
  });
};

export const useResources = (category?: string) => {
  const query = useInfiniteQuery({
    queryKey: resourceKeys.list(category),
    queryFn: ({ pageParam = 1 }) =>
      resourcesApi.listPaginated({
        category,
        page: Number(pageParam),
        size: 20,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined
    ),
    staleTime: 60_000,
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
