import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { achievementsApi } from "@/features/achievements/api/achievements.api";

export const achievementKeys = {
  all: ["achievements"] as const,
  catalog: () => [...achievementKeys.all, "catalog"] as const,
  my: () => [...achievementKeys.all, "my"] as const,
  earned: () => [...achievementKeys.all, "earned"] as const,
};

export const useAchievementsCatalog = () => {
  return useQuery({
    queryKey: achievementKeys.catalog(),
    queryFn: () => achievementsApi.getCatalog(),
    staleTime: 5 * 60_000,
  });
};

export const useMyAchievements = () => {
  return useQuery({
    queryKey: achievementKeys.my(),
    queryFn: () => achievementsApi.getMyAchievements(),
    staleTime: 60_000,
  });
};

export const useEarnedAchievements = () => {
  return useQuery({
    queryKey: achievementKeys.earned(),
    queryFn: () => achievementsApi.getEarned(),
    staleTime: 60_000,
  });
};

export const useClaimAchievement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => achievementsApi.claimAchievement(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: achievementKeys.all });
    },
  });
};
