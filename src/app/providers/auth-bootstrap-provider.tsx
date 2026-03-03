import { useEffect, type ReactNode } from "react";
import { useAuthBootstrap } from "@/features/auth/hooks/use-auth-bootstrap";

export const AuthBootstrapProvider = ({ children }: { children: ReactNode }) => {
  const bootstrap = useAuthBootstrap();

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return children;
};
