import { useQuery } from "@tanstack/react-query";
import { paymentApi } from "@/features/payment/api/payment.api";

export const usePaymentPlans = () => {
  return useQuery({
    queryKey: ["payment", "plans"],
    queryFn: () => paymentApi.getPlans(),
    staleTime: 5 * 60_000,
  });
};
