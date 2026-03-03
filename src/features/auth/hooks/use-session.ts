import { useAuthStore } from "@/features/auth/store/auth.store";
import { useShallow } from "zustand/react/shallow";

export const useSession = () => {
  return useAuthStore(
    useShallow((state) => ({
      status: state.status,
      user: state.user,
      tokens: state.tokens,
      isTelegram: state.isTelegram,
      isBootstrapped: state.isBootstrapped,
      error: state.error,
    })),
  );
};
