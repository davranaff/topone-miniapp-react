import { Navigate } from "react-router-dom";
import { useSession } from "@/features/auth/hooks/use-session";
import { Spinner } from "@/shared/ui/spinner";

export const SplashPage = () => {
  const session = useSession();

  if (session.isBootstrapped) {
    return <Navigate replace to={session.status === "authenticated" ? "/home" : "/login"} />;
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-base">
      <div
        data-glow
        className="pointer-events-none absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-3xl"
      />

      <div className="relative flex flex-col items-center gap-5 text-center animate-fade-in-up">
        <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-gold/30 bg-gold/10">
          <span className="text-3xl font-black text-gold">T1</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-t-primary">TopOne</h1>
          <p className="text-sm text-t-muted">Образовательная платформа</p>
        </div>

        <Spinner size="md" />
      </div>
    </div>
  );
};
