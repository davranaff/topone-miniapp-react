import { useQuery } from "@tanstack/react-query";
import { levelsApi } from "@/features/levels/api/levels.api";

export const levelsKeys = {
  all: ["levels"] as const,
  list: () => [...levelsKeys.all, "list"] as const,
};

export const useLevels = () => {
  return useQuery({
    queryKey: levelsKeys.list(),
    queryFn: () => levelsApi.getAllLevels({ page: 1, size: 100 }),
    staleTime: 5 * 60_000,
  });
};
