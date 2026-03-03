import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth.api";

export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
  });
};
