import { useQuery } from "@tanstack/react-query";
import { challengesApi } from "@/features/challenges/api/challenges.api";

export const useChallengeDetail = (challengeId: string | undefined) => {
  return useQuery({
    queryKey: ["challenges", "detail", challengeId],
    queryFn: () => challengesApi.detail(challengeId!),
    enabled: !!challengeId,
  });
};
