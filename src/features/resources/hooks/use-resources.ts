import { useQuery } from "@tanstack/react-query";
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
  return useQuery({
    queryKey: resourceKeys.list(category),
    queryFn: () => resourcesApi.list({ category }),
    staleTime: 60_000,
  });
};
