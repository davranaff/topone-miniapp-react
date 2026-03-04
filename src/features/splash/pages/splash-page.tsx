import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSession } from "@/features/auth/hooks/use-session";
import { TopOneLogo } from "@/shared/ui/topone-logo";
import { prefetchAppShell } from "@/features/splash/lib/prefetch-app-shell";

export const SplashPage = () => {
  const { t } = useTranslation("common");
  const session = useSession();
  const [minDurationPassed, setMinDurationPassed] = useState(false);
  const [prefetchDone, setPrefetchDone] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMinDurationPassed(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!session.isBootstrapped) {
      return;
    }

    let mounted = true;

    const warm = async () => {
      if (session.status === "authenticated") {
        await prefetchAppShell();
      }

      if (mounted) {
        setPrefetchDone(true);
      }
    };

    void warm();

    return () => {
      mounted = false;
    };
  }, [session.isBootstrapped, session.status]);

  if (session.isBootstrapped && minDurationPassed && prefetchDone) {
    return <Navigate replace to={session.status === "authenticated" ? "/home" : "/login"} />;
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-base px-6">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,#050301_0%,#0d0904_42%,#181108_100%)]" />
      <div className="pointer-events-none absolute -left-20 -top-16 h-[20rem] w-[20rem] rounded-full bg-[#e1b458]/18 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-12%] right-[-6%] h-[20rem] w-[20rem] rounded-full bg-[#b57e1e]/18 blur-[110px]" />
      <div className="pointer-events-none absolute left-1/2 top-[32%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-[130px]" />

      <div className="relative flex w-full max-w-[28rem] flex-col items-center gap-7 text-center animate-fade-in-up">
        <div className="relative">
          <div className="absolute inset-[-20%] rounded-full bg-gold/18 blur-[74px]" />
          <TopOneLogo size="xl" framed={false} className="relative" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-[2.25rem] font-extrabold tracking-[-0.055em] text-t-primary">
            {t("appName")}
          </h1>
          <p className="mx-auto max-w-xs text-sm leading-6 text-white/56">
            {session.isBootstrapped && session.status === "authenticated"
              ? t("states.loading")
              : t("states.loading")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-gold/95 [animation-delay:-0.3s]" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-gold/70 [animation-delay:-0.15s]" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-gold/45" />
        </div>

        <div className="w-full max-w-[18rem] overflow-hidden rounded-full bg-white/8">
          <div className="h-1.5 w-1/2 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-[linear-gradient(90deg,rgba(245,200,66,0.38),rgba(245,200,66,0.94),rgba(255,255,255,0.42))]" />
        </div>
      </div>
    </div>
  );
};
