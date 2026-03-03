import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Spinner } from "@/shared/ui/spinner";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useShallow } from "zustand/react/shallow";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { isBootstrapped, status } = useAuthStore(
    useShallow((state) => ({
      isBootstrapped: state.isBootstrapped,
      status: state.status,
    })),
  );

  if (!isBootstrapped || status === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};
