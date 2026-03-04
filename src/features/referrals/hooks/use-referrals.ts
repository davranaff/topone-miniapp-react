import { useQuery } from "@tanstack/react-query";
import { referralsApi } from "@/features/referrals/api/referrals.api";

export const referralKeys = {
  all: ["referrals"] as const,
  stats: () => [...referralKeys.all, "stats"] as const,
  history: () => [...referralKeys.all, "history"] as const,
  levels: () => [...referralKeys.all, "levels"] as const,
};

export const useReferralStats = () => {
  return useQuery({
    queryKey: referralKeys.stats(),
    queryFn: () => referralsApi.getStats(),
    staleTime: 60_000,
  });
};

export const useReferralHistory = () => {
  return useQuery({
    queryKey: referralKeys.history(),
    queryFn: () => referralsApi.getHistory(),
    staleTime: 60_000,
  });
};

export const useReferralLevels = () => {
  return useQuery({
    queryKey: referralKeys.levels(),
    queryFn: () => referralsApi.getLevels(),
    staleTime: 5 * 60_000,
  });
};
