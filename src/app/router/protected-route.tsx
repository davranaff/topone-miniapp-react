import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Spinner } from "@/shared/ui/spinner";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useShallow } from "zustand/react/shallow";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { isBootstrapped, status, isTelegram } = useAuthStore(
    useShallow((state) => ({
      isBootstrapped: state.isBootstrapped,
      status: state.status,
      isTelegram: state.isTelegram,
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
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={isTelegram ? "/telegram/init" : "/login"} replace state={{ from }} />;
  }

  return children;
};
