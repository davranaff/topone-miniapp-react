import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "@/features/auth/hooks/use-session";
import { TopOneLogo } from "@/shared/ui/topone-logo";
import { prefetchAppShell } from "@/features/splash/lib/prefetch-app-shell";

const getSplashTarget = (state: unknown) => {
  if (!state || typeof state !== "object" || !("from" in state)) {
    return null;
  }

  const from = (state as { from?: unknown }).from;

  if (typeof from !== "string" || !from.startsWith("/") || from.startsWith("//")) {
    return null;
  }

  if (
    from === "/" ||
    from === "/splash" ||
    from.startsWith("/login") ||
    from.startsWith("/register") ||
    from.startsWith("/telegram")
  ) {
    return null;
  }

  return from;
};

export const SplashPage = () => {
  const session = useSession();
  const location = useLocation();
  const [minDurationPassed, setMinDurationPassed] = useState(false);
  const [prefetchDone, setPrefetchDone] = useState(false);
  const directTarget = getSplashTarget(location.state);

  useEffect(() => {
    const timer = window.setTimeout(() => setMinDurationPassed(true), 1000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!session.isBootstrapped) {
      return;
    }

    let mounted = true;

    const warm = async () => {
      try {
        if (session.status === "authenticated") {
          await prefetchAppShell();
        }
      } catch {
        // Prefetch is best-effort; navigation must continue even if one request fails.
      } finally {
        if (mounted) {
          setPrefetchDone(true);
        }
      }
    };

    void warm();

    return () => {
      mounted = false;
    };
  }, [session.isBootstrapped, session.status]);

  if (session.isBootstrapped && minDurationPassed && prefetchDone) {
    if (session.status === "authenticated") {
      return <Navigate replace to={directTarget ?? "/home"} />;
    }

    return <Navigate replace to={session.isTelegram ? "/telegram/init" : "/login"} />;
  }

  const progressValue = Number(session.isBootstrapped) + Number(prefetchDone) + Number(minDurationPassed);
  const progressWidth = `${Math.round((progressValue / 3) * 100)}%`;

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-base px-6 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,#000000_0%,#000000_78%,#2a1901_90%,#6f4308_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_18%,rgba(212,160,23,0.25),transparent_28%),radial-gradient(circle_at_74%_88%,rgba(212,160,23,0.18),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-35 bg-[repeating-linear-gradient(120deg,rgba(255,215,128,0.08)_0px,rgba(255,215,128,0.08)_2px,transparent_2px,transparent_18px)]" />

      <div className="relative w-full max-w-[22rem] animate-fade-in-up lg:max-w-[28rem]">
        <div className="mx-auto flex flex-col items-center gap-8 text-center">
          <TopOneLogo size="xl" framed={false} className="drop-shadow-[0_0_38px_rgba(212,160,23,0.46)]" />

          <div className="w-full">
            <div className="relative h-2.5 overflow-hidden rounded-full bg-black/65 shadow-[inset_0_0_0_1px_rgba(242,205,127,0.3)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,rgba(255,236,184,0.96)_0%,rgba(245,200,66,0.96)_45%,rgba(167,109,19,0.95)_100%)] shadow-[0_0_20px_rgba(245,200,66,0.5)] transition-[width] duration-500"
                style={{ width: progressWidth }}
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_26%,rgba(255,255,255,0.45)_48%,transparent_74%)] bg-[length:220%_100%] animate-[shimmer_1.8s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
