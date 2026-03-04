import { Navigate } from "react-router-dom";
import { useSession } from "@/features/auth/hooks/use-session";
import { Spinner } from "@/shared/ui/spinner";
import { TopOneLogo } from "@/shared/ui/topone-logo";

export const SplashPage = () => {
  const session = useSession();

  if (session.isBootstrapped) {
    return <Navigate replace to={session.status === "authenticated" ? "/home" : "/login"} />;
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-base">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#070503_0%,#120e07_45%,#1a1309_100%)]" />
      <div
        data-glow
        className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-3xl"
      />
      <div className="pointer-events-none absolute bottom-[-8%] right-[-6%] h-64 w-64 rounded-full bg-[#b57e1e]/16 blur-[96px]" />

      <div className="relative flex flex-col items-center gap-5 text-center animate-fade-in-up">
        <TopOneLogo size="xl" />

        <div className="space-y-1">
          <h1 className="text-[2rem] font-extrabold tracking-[-0.04em] text-t-primary">TopOne</h1>
          <p className="text-sm text-white/58">Образовательная платформа</p>
        </div>

        <Spinner size="md" />
      </div>
    </div>
  );
};
