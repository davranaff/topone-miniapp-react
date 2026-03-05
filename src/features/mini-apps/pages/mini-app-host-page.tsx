import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "@/app/providers/theme-provider";
import { useSession } from "@/features/auth/hooks/use-session";
import { PageHeader } from "@/shared/ui/page-header";
import { Badge } from "@/shared/ui/badge";
import { useTelegram } from "@/shared/hooks/use-telegram";
import { useMiniAppDetail } from "@/features/mini-apps/hooks/use-mini-app-detail";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { GlassCard } from "@/shared/ui/glass-card";
import { AppLoadingScreen } from "@/shared/ui/app-loading-screen";

const MINI_APP_ASSET_PREFIX = "asset:assets/mini_apps/";

const resolveMiniAppUrl = (appUrl: string) => {
  if (appUrl.startsWith(MINI_APP_ASSET_PREFIX)) {
    return `/mini_apps/${appUrl.slice(MINI_APP_ASSET_PREFIX.length)}`;
  }

  if (appUrl.startsWith("asset:")) {
    return `/${appUrl.slice("asset:".length)}`;
  }

  if (appUrl.startsWith("http://") || appUrl.startsWith("https://") || appUrl.startsWith("/")) {
    return appUrl;
  }

  return `https://${appUrl}`;
};

const parseMessagePayload = (value: unknown): Record<string, unknown> | null => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }

  return typeof value === "object" ? (value as Record<string, unknown>) : null;
};

const isSafeInternalRoute = (value: unknown): value is string => {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//");
};

const readCssPxVar = (name: string) => {
  if (typeof document === "undefined") {
    return 0;
  }

  const raw = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim().replace("px", "");
  const numeric = Number.parseFloat(raw);
  return Number.isFinite(numeric) ? Math.max(0, Math.round(numeric)) : 0;
};

export const MiniAppHostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const telegram = useTelegram();
  const session = useSession();
  const { theme } = useTheme();
  const app = useMiniAppDetail(slug);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [embeddedHtml, setEmbeddedHtml] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const resolvedUrl = app.data ? resolveMiniAppUrl(app.data.appUrl) : "";
  const isLocalAsset = resolvedUrl.startsWith("/mini_apps/");
  const canEmbed = Boolean(resolvedUrl) && (isLocalAsset || resolvedUrl.startsWith("http://") || resolvedUrl.startsWith("https://"));

  useEffect(() => {
    if (!isLocalAsset || !app.data?.id) {
      setEmbeddedHtml(null);
      setLocalError(null);
      setIsLocalLoading(false);
      return;
    }

    let cancelled = false;

    const loadLocalMiniApp = async () => {
      setIsLocalLoading(true);
      setLocalError(null);
      setEmbeddedHtml(null);

      try {
        const response = await fetch(resolvedUrl, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const sourceHtml = await response.text();
        const safeTop = readCssPxVar("--tg-safe-top");
        const safeBottom = readCssPxVar("--tg-safe-bottom");
        const safeLeft = readCssPxVar("--tg-safe-left");
        const safeRight = readCssPxVar("--tg-safe-right");

        const tokenJson = JSON.stringify({ token: session.tokens?.accessToken ?? "" });
        const profileJson = JSON.stringify({
          id: session.user?.id ?? "",
          username: session.user?.username ?? "",
          firstName: session.user?.firstName ?? "",
          lastName: session.user?.lastName ?? "",
          avatar: session.user?.avatarUrl ?? "",
        });
        const themeJson = JSON.stringify({
          mode: theme,
          primaryColor: "#D4A017",
        });

        const themeInjection = `
<style>
:root {
  --app-bg: ${theme === "dark" ? "#0a0a0a" : "#ffffff"};
  --app-surface: ${theme === "dark" ? "#141414" : "#f6f3ee"};
  --app-surface2: ${theme === "dark" ? "#1e1e1e" : "#ece6db"};
  --app-border: ${theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"};
  --app-text: ${theme === "dark" ? "#e4e4e7" : "#111827"};
  --app-dim: ${theme === "dark" ? "#71717a" : "#6b7280"};
  --app-primary: #d4a017;
  --app-safe-top: ${safeTop}px;
  --app-safe-bottom: ${safeBottom}px;
  --app-safe-left: ${safeLeft}px;
  --app-safe-right: ${safeRight}px;
  --app-mode: ${theme};
}
body {
  background: var(--app-bg) !important;
  color: var(--app-text) !important;
}
</style>`;

        const bridgeInjection = `
<script>
(function() {
  const token = ${tokenJson};
  const profile = ${profileJson};
  const themeData = ${themeJson};

  const emit = function(payload) {
    try {
      window.parent.postMessage(payload, "*");
    } catch (_) {}
  };

  window.TopOne = {
    getAuthToken: function() { return Promise.resolve(token); },
    getUserProfile: function() { return Promise.resolve(profile); },
    getTheme: function() { return Promise.resolve(themeData); },
    navigate: function(route) {
      emit({ type: "topone-miniapp-navigate", route: route || null });
      return Promise.resolve({ route: route || null });
    },
    close: function() {
      emit({ type: "topone-miniapp-close" });
      return Promise.resolve({ success: true });
    },
    trackActivity: function(payload) {
      const nextPayload = payload || {};
      emit({ type: "topone-miniapp-track", payload: nextPayload });
      return Promise.resolve({
        success: true,
        xp: Number(nextPayload.xp || 0),
        coins: Number(nextPayload.coins || 0)
      });
    }
  };
})();
</script>`;

        const injected = `${themeInjection}\n${bridgeInjection}\n`;
        const mergedHtml = sourceHtml.includes("</head>")
          ? sourceHtml.replace("</head>", `${injected}</head>`)
          : `${injected}${sourceHtml}`;

        if (!cancelled) {
          setEmbeddedHtml(mergedHtml);
          setIsLocalLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          setEmbeddedHtml(null);
          setLocalError(error instanceof Error ? error.message : "Mini app yuklanmadi");
          setIsLocalLoading(false);
        }
      }
    };

    void loadLocalMiniApp();

    return () => {
      cancelled = true;
    };
  }, [
    app.data?.id,
    app.data?.appUrl,
    isLocalAsset,
    resolvedUrl,
    session.tokens?.accessToken,
    session.user?.id,
    session.user?.username,
    session.user?.firstName,
    session.user?.lastName,
    session.user?.avatarUrl,
    theme,
  ]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!iframeRef.current?.contentWindow || event.source !== iframeRef.current.contentWindow) {
        return;
      }

      const payload = parseMessagePayload(event.data);
      if (!payload?.type || typeof payload.type !== "string") {
        return;
      }

      if (payload.type === "topone-miniapp-close") {
        navigate(-1);
        return;
      }

      if (payload.type === "topone-miniapp-navigate" && isSafeInternalRoute(payload.route)) {
        navigate(payload.route);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  if (app.isLoading) {
    return <AppLoadingScreen status="Mini app yuklanmoqda..." />;
  }

  if (!app.data) {
    return (
      <MobileScreen className="space-y-4 lg:space-y-5">
        <PageHeader title="Mini app" subtitle="Topilmadi" backButton />
        <GlassCard className="rounded-[1.6rem] border-border/45 p-6">
          <p className="text-sm text-t-secondary">So'ralgan mini app topilmadi.</p>
        </GlassCard>
      </MobileScreen>
    );
  }

  return (
    <MobileScreen className="space-y-4 lg:space-y-5">
      <PageHeader title={app.data.name} subtitle={app.data.description} />
      <GlassCard className="rounded-[1.6rem] border-border/45 p-6">
        <div className="flex flex-wrap gap-3">
          <Badge>{telegram.isAvailable() ? "Telegram runtime" : "Browser runtime"}</Badge>
          <Badge className="uppercase tracking-[0.08em]">{app.data.category}</Badge>
        </div>

        {isLocalAsset && isLocalLoading ? (
          <AppLoadingScreen fullScreen={false} compact status="Mini app tayyorlanmoqda..." className="mt-6 rounded-[1.2rem]" />
        ) : null}

        {isLocalAsset && localError ? (
          <div className="mt-6 rounded-lg border border-red-400/35 bg-red-950/25 px-4 py-3 text-sm text-red-200">
            Mini app yuklanmadi: {localError}
          </div>
        ) : null}

        {isLocalAsset && embeddedHtml ? (
          <iframe
            ref={iframeRef}
            className="mt-6 h-[66vh] w-full rounded-lg border border-border/55 bg-background xl:h-[72vh]"
            srcDoc={embeddedHtml}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            title={app.data.name}
          />
        ) : null}

        {canEmbed && !isLocalAsset ? (
          <iframe
            ref={iframeRef}
            className="mt-6 h-[66vh] w-full rounded-lg border border-border bg-white xl:h-[72vh]"
            src={resolvedUrl}
            title={app.data.name}
          />
        ) : null}

        {!canEmbed ? (
          <div className="mt-6 rounded-lg border border-dashed border-border bg-background p-6 text-sm text-muted">
            Mini app URL qo'llab-quvvatlanmadi: `{app.data.appUrl}`
          </div>
        ) : null}
      </GlassCard>
    </MobileScreen>
  );
};
