import { Navigate } from "react-router-dom";
import { useSession } from "@/features/auth/hooks/use-session";
import { Spinner } from "@/shared/ui/spinner";

export const SplashPage = () => {
  const session = useSession();

  if (session.isBootstrapped) {
    return <Navigate replace to={session.status === "authenticated" ? "/home" : "/login"} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
        <div className="mb-6 flex justify-center">
          <Spinner />
        </div>
        <p className="text-xs uppercase tracking-[0.16em] text-primary">TopOne</p>
        <h1 className="mt-3 text-3xl font-semibold">Splash</h1>
        <p className="mt-3 text-sm text-slate-300">
          Bootstrapping auth session, Telegram runtime and route graph before redirect.
        </p>
      </div>
    </div>
  );
};
