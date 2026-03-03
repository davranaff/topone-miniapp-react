import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useShallow } from "zustand/react/shallow";

export const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isBootstrapped, status } = useAuthStore(
    useShallow((state) => ({
      isBootstrapped: state.isBootstrapped,
      status: state.status,
    })),
  );

  if (isBootstrapped && status === "authenticated") {
    return <Navigate to="/home" replace />;
  }

  return children;
};
