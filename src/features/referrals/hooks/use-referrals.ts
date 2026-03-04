import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { referralsApi } from "@/features/referrals/api/referrals.api";
import type { ReferralCheckoutRequest } from "@/entities/referral/types";

export const referralKeys = {
  all: ["referrals"] as const,
  stats: () => [...referralKeys.all, "stats"] as const,
  history: () => [...referralKeys.all, "history"] as const,
  levels: () => [...referralKeys.all, "levels"] as const,
  checkout: (status?: string) => [...referralKeys.all, "checkout", status ?? "all"] as const,
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

export const useMyReferralCheckoutRequests = (status?: string) => {
  return useQuery({
    queryKey: referralKeys.checkout(status),
    queryFn: () => referralsApi.getMyCheckoutReferrals({ page: 1, size: 50, status }),
    staleTime: 20_000,
  });
};

export const useCreateReferralCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReferralCheckoutRequest) => referralsApi.createCheckoutReferral(input),
    onSuccess: async () => {
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: referralKeys.stats() }),
        queryClient.invalidateQueries({ queryKey: [...referralKeys.all, "checkout"] }),
      ]);
    },
  });
};

export const useDeleteReferralCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (referralId: string) => referralsApi.deleteCheckoutReferral(referralId),
    onSuccess: async () => {
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: referralKeys.stats() }),
        queryClient.invalidateQueries({ queryKey: [...referralKeys.all, "checkout"] }),
      ]);
    },
  });
};
