import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { AlertCircle, RotateCcw } from "lucide-react";
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

type SourceType = "hls" | "video" | "youtube";

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
  const hlsRef = useRef<Hls | null>(null);
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
    seekAppliedRef.current = false;
    lastCurrentTimeRef.current = initialPositionSeconds;
    watchTimeRef.current = 0;
    lastCheckpointRef.current = initialPositionSeconds;
  }, [initialPositionSeconds, muxPlaybackId, videoUrl]);

  const source = useMemo(() => {
    try {
      if (muxPlaybackId?.trim()) {
        const resolved = getMuxPlaybackUrl(muxPlaybackId.trim());
        return { url: resolved.url, type: "hls" as SourceType, error: null as string | null };
      }

      const normalizedVideoUrl = videoUrl?.trim();
      if (!normalizedVideoUrl) {
        return { url: null, type: null, error: "Video topilmadi" };
      }

      if (toYouTubeEmbedUrl(normalizedVideoUrl)) {
        return { url: normalizedVideoUrl, type: "youtube" as SourceType, error: null as string | null };
      }

      return {
        url: normalizedVideoUrl,
        type: normalizedVideoUrl.includes(".m3u8") ? "hls" as SourceType : "video" as SourceType,
        error: null as string | null,
      };
    } catch (sourceError) {
      return {
        url: null,
        type: null,
        error: toUserFacingError(sourceError),
      };
    }
  }, [muxPlaybackId, videoUrl]);

  const sourceKey = `${retryKey}:${source.type ?? "none"}:${source.url ?? "none"}`;
  const isLoading =
    source.error == null &&
    source.type !== "youtube" &&
    source.url != null &&
    (playerState.sourceKey !== sourceKey ? true : playerState.isLoading);
  const error = source.error ?? (playerState.sourceKey === sourceKey ? playerState.error : null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !source.url || !source.type || source.type === "youtube") {
      return;
    }

    const destroyHls = () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
    const markLoaded = () => {
      setPlayerState({ sourceKey, isLoading: false, error: null });
    };
    const markError = (message: string) => {
      requestAnimationFrame(() => {
        setPlayerState({ sourceKey, isLoading: false, error: message });
      });
    };

    const emitCheckpoint = () => {
      const currentTimeSeconds = Math.floor(video.currentTime || 0);
      const totalDurationSeconds = Number.isFinite(video.duration) ? Math.floor(video.duration) : 0;
      const diff = Math.max(0, currentTimeSeconds - lastCurrentTimeRef.current);
      watchTimeRef.current += diff;
      lastCurrentTimeRef.current = currentTimeSeconds;

      onProgressCheckpoint?.({
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
        onProgressCheckpoint?.({
          currentTimeSeconds,
          totalDurationSeconds: Number.isFinite(video.duration) ? Math.floor(video.duration) : 0,
          watchTimeSeconds: watchTimeRef.current,
        });
      }
    };

    const handleEnded = () => {
      emitCheckpoint();
      onEnded?.();
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
  }, [initialPositionSeconds, onEnded, onProgressCheckpoint, source, sourceKey]);

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
      <div className={cn("overflow-hidden rounded-[1.4rem] border border-white/10 bg-black shadow-card", className)}>
        <div className="aspect-video w-full">
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

  return (
    <div className={cn("overflow-hidden rounded-[1.4rem] border border-white/10 bg-black shadow-card", className)}>
      <div className="relative aspect-video w-full">
        <video
          ref={videoRef}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full"
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-gold" />
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
        "flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-[1.4rem]",
        "border border-white/10 bg-[linear-gradient(180deg,rgba(24,24,24,0.95),rgba(10,10,10,0.9))] p-6 text-center shadow-card",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/6 text-white/70">
        <AlertCircle className="h-6 w-6" />
      </div>
      <p className="max-w-xs text-sm text-white/80">{message}</p>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        <RotateCcw className="h-4 w-4" />
        Qayta urinish
      </Button>
    </div>
  );
};
