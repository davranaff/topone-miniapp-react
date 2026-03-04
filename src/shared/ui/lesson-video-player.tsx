import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { AlertCircle, PlayCircle, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { getMuxPlaybackUrl } from "@/shared/lib/mux";
import { Button } from "@/shared/ui/button";

type LessonVideoCheckpoint = {
  currentTimeSeconds: number;
  totalDurationSeconds: number;
  watchTimeSeconds: number;
};

type LessonVideoPlayerProps = {
  muxPlaybackId?: string;
  videoUrl?: string;
  title?: string;
  initialPositionSeconds?: number;
  className?: string;
  onProgressCheckpoint?: (checkpoint: LessonVideoCheckpoint) => void;
  onEnded?: () => void;
};

type SourceType = "hls" | "video" | "youtube" | "mux-web";

type ResolvedSource = {
  url: string | null;
  type: SourceType | null;
  error: string | null;
  playbackId?: string;
  playbackToken?: string;
};

const YOUTUBE_PATTERN =
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/i;

const toYouTubeEmbedUrl = (url: string) => {
  const match = url.match(YOUTUBE_PATTERN);
  if (!match) return null;
  return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
};

const toUserFacingError = (error: unknown) => {
  const message = String(error ?? "");
  const normalized = message.toLowerCase();

  if (
    normalized.includes("403") ||
    normalized.includes("forbidden") ||
    normalized.includes("manifestloaderror")
  ) {
    return "Video hozircha mavjud emas";
  }

  if (normalized.includes("network")) {
    return "Video yuklanmadi. Tarmoqni tekshiring";
  }

  return "Video yuklashda xatolik yuz berdi";
};

let muxPlayerScriptPromise: Promise<void> | null = null;

const loadMuxPlayerScript = () => {
  if (typeof window === "undefined" || window.customElements?.get("mux-player")) {
    return Promise.resolve();
  }

  if (muxPlayerScriptPromise) {
    return muxPlayerScriptPromise;
  }

  muxPlayerScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-topone-mux-player="true"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Mux player script load failed")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/@mux/mux-player";
    script.async = true;
    script.dataset.toponeMuxPlayer = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Mux player script load failed"));
    document.head.appendChild(script);
  });

  return muxPlayerScriptPromise;
};

const PlayerChrome = ({ title }: { title?: string }) => (
  <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4">
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 backdrop-blur-xl">
      <Sparkles className="h-4 w-4 text-gold" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/78">
        TopOne Player
      </span>
    </div>
    {title ? (
      <div className="max-w-[55%] truncate rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[11px] font-medium text-white/72 backdrop-blur-xl">
        {title}
      </div>
    ) : null}
  </div>
);

export const LessonVideoPlayer = ({
  muxPlaybackId,
  videoUrl,
  title,
  initialPositionSeconds = 0,
  className,
  onProgressCheckpoint,
  onEnded,
}: LessonVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const muxPlayerRef = useRef<HTMLElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const onProgressCheckpointRef = useRef(onProgressCheckpoint);
  const onEndedRef = useRef(onEnded);
  const seekAppliedRef = useRef(false);
  const lastCurrentTimeRef = useRef(0);
  const watchTimeRef = useRef(0);
  const lastCheckpointRef = useRef(initialPositionSeconds);
  const [retryKey, setRetryKey] = useState(0);
  const [playerState, setPlayerState] = useState<{
    sourceKey: string;
    isLoading: boolean;
    error: string | null;
  }>({
    sourceKey: "",
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    onProgressCheckpointRef.current = onProgressCheckpoint;
    onEndedRef.current = onEnded;
  }, [onEnded, onProgressCheckpoint]);

  const syncPlayerState = useCallback((nextState: {
    sourceKey: string;
    isLoading: boolean;
    error: string | null;
  }) => {
    setPlayerState((current) => {
      if (
        current.sourceKey === nextState.sourceKey &&
        current.isLoading === nextState.isLoading &&
        current.error === nextState.error
      ) {
        return current;
      }

      return nextState;
    });
  }, []);

  useEffect(() => {
    seekAppliedRef.current = false;
    lastCurrentTimeRef.current = initialPositionSeconds;
    watchTimeRef.current = 0;
    lastCheckpointRef.current = initialPositionSeconds;
  }, [initialPositionSeconds, muxPlaybackId, videoUrl]);

  const source = useMemo<ResolvedSource>(() => {
    try {
      if (muxPlaybackId?.trim()) {
        const resolved = getMuxPlaybackUrl(muxPlaybackId.trim());
        return {
          url: resolved.url,
          type: typeof window !== "undefined" ? "mux-web" : "hls",
          error: null,
          playbackId: muxPlaybackId.trim(),
          playbackToken: resolved.playbackToken,
        };
      }

      const normalizedVideoUrl = videoUrl?.trim();
      if (!normalizedVideoUrl) {
        return { url: null, type: null, error: "Video topilmadi" };
      }

      if (toYouTubeEmbedUrl(normalizedVideoUrl)) {
        return { url: normalizedVideoUrl, type: "youtube", error: null };
      }

      return {
        url: normalizedVideoUrl,
        type: normalizedVideoUrl.includes(".m3u8") ? "hls" : "video",
        error: null,
      };
    } catch (sourceError) {
      return {
        url: null,
        type: null,
        error: toUserFacingError(sourceError),
      };
    }
  }, [muxPlaybackId, videoUrl]);

  const sourceKey = `${retryKey}:${source.type ?? "none"}:${source.url ?? "none"}:${source.playbackToken ?? "no-token"}`;
  const isLoading =
    source.error == null &&
    source.type !== "youtube" &&
    source.url != null &&
    (playerState.sourceKey !== sourceKey ? true : playerState.isLoading);
  const error = source.error ?? (playerState.sourceKey === sourceKey ? playerState.error : null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !source.url || !source.type || source.type === "youtube" || source.type === "mux-web") {
      return;
    }

    const destroyHls = () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };

    const markLoaded = () => {
      requestAnimationFrame(() => {
        syncPlayerState({ sourceKey, isLoading: false, error: null });
      });
    };

    const markError = (message: string) => {
      requestAnimationFrame(() => {
        syncPlayerState({ sourceKey, isLoading: false, error: message });
      });
    };

    const emitCheckpoint = () => {
      const currentTimeSeconds = Math.floor(video.currentTime || 0);
      const totalDurationSeconds = Number.isFinite(video.duration) ? Math.floor(video.duration) : 0;
      const diff = Math.max(0, currentTimeSeconds - lastCurrentTimeRef.current);
      watchTimeRef.current += diff;
      lastCurrentTimeRef.current = currentTimeSeconds;

      onProgressCheckpointRef.current?.({
        currentTimeSeconds,
        totalDurationSeconds,
        watchTimeSeconds: watchTimeRef.current,
      });
    };

    const applyInitialPosition = () => {
      if (seekAppliedRef.current || initialPositionSeconds <= 0 || !Number.isFinite(video.duration)) {
        return;
      }

      const safePosition = Math.min(initialPositionSeconds, Math.max(Math.floor(video.duration) - 1, 0));
      if (safePosition > 0) {
        video.currentTime = safePosition;
      }
      seekAppliedRef.current = true;
    };

    const handleLoadedMetadata = () => {
      applyInitialPosition();
      markLoaded();
    };

    const handleCanPlay = () => {
      markLoaded();
    };

    const handleTimeUpdate = () => {
      const currentTimeSeconds = Math.floor(video.currentTime || 0);
      const diff = Math.max(0, currentTimeSeconds - lastCurrentTimeRef.current);
      watchTimeRef.current += diff;
      lastCurrentTimeRef.current = currentTimeSeconds;

      if (currentTimeSeconds - lastCheckpointRef.current >= 10) {
        lastCheckpointRef.current = currentTimeSeconds;
        onProgressCheckpointRef.current?.({
          currentTimeSeconds,
          totalDurationSeconds: Number.isFinite(video.duration) ? Math.floor(video.duration) : 0,
          watchTimeSeconds: watchTimeRef.current,
        });
      }
    };

    const handleEnded = () => {
      emitCheckpoint();
      onEndedRef.current?.();
    };

    const handleError = () => {
      destroyHls();
      markError("Video yuklab bo'lmadi");
    };

    destroyHls();
    video.pause();
    video.removeAttribute("src");
    video.load();

    if (source.type === "hls") {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source.url;
      } else if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsRef.current = hls;
        hls.loadSource(source.url);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            destroyHls();
            markError(toUserFacingError(data.details ?? data.type));
          }
        });
      } else {
        markError("Brauzer bu formatni qo'llamaydi");
      }
    } else {
      video.src = source.url;
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("pause", emitCheckpoint);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    return () => {
      emitCheckpoint();
      destroyHls();
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("pause", emitCheckpoint);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [initialPositionSeconds, source, sourceKey, syncPlayerState]);

  useEffect(() => {
    if (!source.url || source.type !== "mux-web") {
      return;
    }

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const attachMuxPlayer = async () => {
      try {
        await loadMuxPlayerScript();
      } catch (scriptError) {
        if (!cancelled) {
          requestAnimationFrame(() => {
            syncPlayerState({ sourceKey, isLoading: false, error: toUserFacingError(scriptError) });
          });
        }
        return;
      }

      if (cancelled) {
        return;
      }

      const player = muxPlayerRef.current as (HTMLMediaElement & HTMLElement) | null;
      if (!player) {
        return;
      }

      const markLoaded = () => {
        requestAnimationFrame(() => {
          syncPlayerState({ sourceKey, isLoading: false, error: null });
        });
      };

      const markError = (message: string) => {
        requestAnimationFrame(() => {
          syncPlayerState({ sourceKey, isLoading: false, error: message });
        });
      };

      const emitCheckpoint = () => {
        const currentTimeSeconds = Math.floor(Number(player.currentTime ?? 0));
        const totalDurationSeconds = Number.isFinite(player.duration) ? Math.floor(player.duration) : 0;
        const diff = Math.max(0, currentTimeSeconds - lastCurrentTimeRef.current);
        watchTimeRef.current += diff;
        lastCurrentTimeRef.current = currentTimeSeconds;

        onProgressCheckpointRef.current?.({
          currentTimeSeconds,
          totalDurationSeconds,
          watchTimeSeconds: watchTimeRef.current,
        });
      };

      const applyInitialPosition = () => {
        if (seekAppliedRef.current || initialPositionSeconds <= 0 || !Number.isFinite(player.duration)) {
          return;
        }

        const safePosition = Math.min(initialPositionSeconds, Math.max(Math.floor(player.duration) - 1, 0));
        if (safePosition > 0) {
          player.currentTime = safePosition;
        }
        seekAppliedRef.current = true;
      };

      const handleLoadedMetadata = () => {
        applyInitialPosition();
        markLoaded();
      };

      const handleCanPlay = () => {
        markLoaded();
      };

      const handleTimeUpdate = () => {
        const currentTimeSeconds = Math.floor(Number(player.currentTime ?? 0));
        const diff = Math.max(0, currentTimeSeconds - lastCurrentTimeRef.current);
        watchTimeRef.current += diff;
        lastCurrentTimeRef.current = currentTimeSeconds;

        if (currentTimeSeconds - lastCheckpointRef.current >= 10) {
          lastCheckpointRef.current = currentTimeSeconds;
          onProgressCheckpointRef.current?.({
            currentTimeSeconds,
            totalDurationSeconds: Number.isFinite(player.duration) ? Math.floor(player.duration) : 0,
            watchTimeSeconds: watchTimeRef.current,
          });
        }
      };

      const handleEnded = () => {
        emitCheckpoint();
        onEndedRef.current?.();
      };

      const handleError = () => {
        markError("Video yuklab bo'lmadi");
      };

      player.addEventListener("loadedmetadata", handleLoadedMetadata);
      player.addEventListener("canplay", handleCanPlay);
      player.addEventListener("timeupdate", handleTimeUpdate);
      player.addEventListener("pause", emitCheckpoint);
      player.addEventListener("ended", handleEnded);
      player.addEventListener("error", handleError);

      if (Number(player.readyState ?? 0) > 0) {
        applyInitialPosition();
        markLoaded();
      }

      cleanup = () => {
        emitCheckpoint();
        player.removeEventListener("loadedmetadata", handleLoadedMetadata);
        player.removeEventListener("canplay", handleCanPlay);
        player.removeEventListener("timeupdate", handleTimeUpdate);
        player.removeEventListener("pause", emitCheckpoint);
        player.removeEventListener("ended", handleEnded);
        player.removeEventListener("error", handleError);
      };
    };

    void attachMuxPlayer();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [initialPositionSeconds, source, sourceKey, syncPlayerState]);

  if (source.type === "youtube" && source.url) {
    const embedUrl = toYouTubeEmbedUrl(source.url);

    if (!embedUrl) {
      return (
        <PlayerErrorCard
          className={className}
          message="Video manzili noto'g'ri"
          onRetry={() => setRetryKey((value) => value + 1)}
        />
      );
    }

    return (
      <div className={cn("overflow-hidden rounded-[1.65rem] border border-white/10 bg-black shadow-card", className)}>
        <div className="relative aspect-video w-full">
          <PlayerChrome title={title} />
          <iframe
            className="h-full w-full"
            src={embedUrl}
            title={title ?? "Lesson video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <PlayerErrorCard
        className={className}
        message={error}
        onRetry={() => setRetryKey((value) => value + 1)}
      />
    );
  }

  if (source.type === "mux-web" && source.playbackId) {
    return (
      <div className={cn("overflow-hidden rounded-[1.65rem] border border-white/10 bg-black shadow-card", className)}>
        <div className="relative aspect-video w-full overflow-hidden rounded-[1.65rem] bg-[radial-gradient(circle_at_top,rgba(245,200,66,0.14),transparent_32%),#050505]">
          <PlayerChrome title={title} />
          <mux-player
            key={sourceKey}
            ref={(node) => {
              muxPlayerRef.current = node;
            }}
            className="h-full w-full"
            playback-id={source.playbackId}
            playback-token={source.playbackToken}
            stream-type="on-demand"
            prefer-playback="mse"
            primary-color="#ffffff"
            secondary-color="#060606"
            accent-color="#F6C768"
            disable-tracking="true"
            title={title ?? "Lesson video"}
          />

          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-black/35">
                  <PlayCircle className="h-8 w-8 text-gold" />
                </div>
                <p className="text-sm text-white/80">Video yuklanmoqda...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-[1.65rem] border border-white/10 bg-black shadow-card", className)}>
      <div className="relative aspect-video w-full">
        <PlayerChrome title={title} />
        <video
          ref={videoRef}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full bg-black"
        />

        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-black/35">
                <PlayCircle className="h-8 w-8 text-gold" />
              </div>
              <p className="text-sm text-white/80">Video yuklanmoqda...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PlayerErrorCard = ({
  className,
  message,
  onRetry,
}: {
  className?: string;
  message: string;
  onRetry: () => void;
}) => {
  return (
    <div
      className={cn(
        "flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-[1.65rem]",
        "border border-white/10 bg-[radial-gradient(circle_at_top,rgba(245,200,66,0.14),transparent_35%),linear-gradient(180deg,rgba(24,24,24,0.95),rgba(10,10,10,0.9))] p-6 text-center shadow-card",
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/70">
        <AlertCircle className="h-7 w-7" />
      </div>
      <p className="max-w-xs text-sm text-white/80">{message}</p>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        <RotateCcw className="h-4 w-4" />
        Qayta urinish
      </Button>
    </div>
  );
};
