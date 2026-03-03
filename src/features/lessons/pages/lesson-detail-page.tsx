import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PlayCircle, FileText, HelpCircle, Lock, ChevronRight } from "lucide-react";
import { lessonsApi } from "@/features/lessons/api/lessons.api";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import type { Lesson } from "@/entities/lesson/types";

const typeLabel: Record<Lesson["type"], string> = {
  video: "Video",
  text:  "Matn",
  quiz:  "Test",
};

const typeVariant: Record<Lesson["type"], "gold" | "info" | "success"> = {
  video: "gold",
  text:  "info",
  quiz:  "success",
};

const VideoPlayerPlaceholder = ({ title }: { title: string }) => (
  <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-elevated border border-border/40">
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
        <PlayCircle className="h-8 w-8 text-gold" />
      </div>
      <p className="text-sm font-medium text-t-secondary">{title}</p>
      <p className="text-xs text-t-muted">Mux Video Player</p>
    </div>
  </div>
);

const TextLessonPlaceholder = ({ description }: { description?: string }) => (
  <GlassCard>
    <div className="flex items-center gap-2 mb-3">
      <FileText className="h-4 w-4 text-gold" />
      <p className="text-sm font-semibold text-t-primary">Dars matni</p>
    </div>
    <p className="text-sm leading-relaxed text-t-secondary">
      {description ?? "Dars matni yuklanmoqda..."}
    </p>
  </GlassCard>
);

export const LessonDetailPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const lesson = useQuery({
    queryKey: ["lessons", "detail", lessonId],
    queryFn: () => lessonsApi.detail(lessonId!),
    enabled: !!lessonId,
  });

  if (lesson.isLoading) {
    return (
      <MobileScreen>
        <div className="h-8 w-2/3 rounded-xl bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
        <div className="mt-4 aspect-video w-full rounded-2xl">
          <Skeleton className="h-full w-full rounded-2xl" />
        </div>
        <Skeleton className="mt-4 h-24 w-full rounded-2xl" />
      </MobileScreen>
    );
  }

  if (lesson.isError || !lesson.data) {
    return (
      <MobileScreen>
        <ErrorState variant="not-found" onRetry={() => navigate(-1)} retryLabel="Назад" />
      </MobileScreen>
    );
  }

  const { data } = lesson;

  return (
    <MobileScreen>
      <PageHeader
        title={data.title}
        backButton
        actions={
          <Badge variant={typeVariant[data.type]} size="sm">
            {typeLabel[data.type]}
          </Badge>
        }
      />

      <div className="mt-4 space-y-4">
        {data.isLocked ? (
          <GlassCard className="border-gold/20 bg-gold/5">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 shrink-0 text-gold" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-t-primary">Dars bloklangan</p>
                <p className="text-xs text-t-muted">Obuna rasmiylashtiring</p>
              </div>
              <button onClick={() => navigate("/subscription")}>
                <ChevronRight className="h-4 w-4 text-gold" />
              </button>
            </div>
          </GlassCard>
        ) : data.type === "video" ? (
          <VideoPlayerPlaceholder title={data.title} />
        ) : data.type === "text" ? (
          <TextLessonPlaceholder description={data.description} />
        ) : (
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="h-4 w-4 text-gold" />
              <p className="text-sm font-semibold text-t-primary">Test</p>
            </div>
            <p className="text-xs text-t-muted">Test tez kunda qo'shiladi</p>
          </GlassCard>
        )}

        {!data.isLocked && data.description && data.type !== "text" && (
          <GlassCard>
            <p className="text-sm leading-relaxed text-t-secondary">{data.description}</p>
          </GlassCard>
        )}

        {!data.isLocked && !data.isCompleted && (
          <Button fullWidth variant="primary">
            Darsni tugatdim
          </Button>
        )}

        {data.isCompleted && (
          <GlassCard goldBorder className="text-center">
            <p className="text-sm font-semibold text-gold">✓ Dars bajarildi!</p>
          </GlassCard>
        )}
      </div>
    </MobileScreen>
  );
};
