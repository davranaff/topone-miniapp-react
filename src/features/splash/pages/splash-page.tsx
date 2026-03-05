import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "@/features/auth/hooks/use-session";
import { prefetchAppShell } from "@/features/splash/lib/prefetch-app-shell";
import { AppLoadingScreen } from "@/shared/ui/app-loading-screen";

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
  return <AppLoadingScreen progress={Math.round((progressValue / 3) * 100)} />;
};
