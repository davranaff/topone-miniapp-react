import { useQuery } from "@tanstack/react-query";
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
  return useQuery({
    queryKey: ["challenges", "list", params],
    queryFn: () => challengesApi.list(params),
    enabled: params.enabled ?? true,
    retry: false,
  });
};
