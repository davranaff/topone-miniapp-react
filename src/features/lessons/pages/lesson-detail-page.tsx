import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CirclePlay,
  ExternalLink,
  FileText,
  HelpCircle,
  Lock,
  MessageCircle,
  Star,
} from "lucide-react";
import { lessonsApi } from "@/features/lessons/api/lessons.api";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Badge } from "@/shared/ui/badge";
import { ErrorState } from "@/shared/ui/error-state";
import { EmptyState } from "@/shared/ui/empty-state";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { SegmentedTabs } from "@/shared/ui/segmented-tabs";
import { Skeleton, SkeletonCard } from "@/shared/ui/skeleton";
import { Button } from "@/shared/ui/button";
import { LessonVideoPlayer } from "@/shared/ui/lesson-video-player";
import { useShellNav } from "@/widgets/navigation/shell-nav";
import { hasApiStatus } from "@/shared/api/error-helpers";
import type { Lesson, LessonProgress } from "@/entities/lesson/types";

type LessonTab = "details" | "resources" | "quizzes";

const lessonTypeLabel: Record<Lesson["type"], string> = {
  video: "Video",
  text: "Matn",
  quiz: "Test",
};

const lessonTypeVariant: Record<Lesson["type"], "gold" | "info" | "success"> = {
  video: "gold",
  text: "info",
  quiz: "success",
};

const checkpointCanSave = (
  nextProgress: { currentTimeSeconds: number; watchTimeSeconds: number },
  currentProgress?: LessonProgress,
) => {
  if (!currentProgress?.id) return false;
  if (nextProgress.currentTimeSeconds <= 0) return false;

  return (
    nextProgress.currentTimeSeconds !== currentProgress.currentTimeSeconds ||
    nextProgress.watchTimeSeconds !== currentProgress.watchTimeSeconds
  );
};

export const LessonDetailPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setOverride, resetOverride } = useShellNav();
  const [tab, setTab] = useState<LessonTab>("details");
  const lastSavedRef = useRef(0);
  const completeLessonRef = useRef<() => void>(() => undefined);

  const lesson = useQuery({
    queryKey: ["lessons", "detail", lessonId],
    queryFn: () => lessonsApi.detail(lessonId!),
    enabled: Boolean(lessonId),
  });

  const progress = useQuery({
    queryKey: ["lessons", "progress", lessonId],
    enabled: Boolean(lessonId && lesson.data && !lesson.data.isLocked && lesson.data.isOpen),
    retry: false,
    queryFn: async () => {
      if (lesson.data?.userProgress) {
        return lesson.data.userProgress;
      }

      try {
        return await lessonsApi.progressByLesson(lessonId!);
      } catch (error) {
        if (hasApiStatus(error, 404) && lesson.data?.courseId) {
          return lessonsApi.createProgress({
            lessonId: lessonId!,
            courseId: lesson.data.courseId,
          });
        }

        throw error;
      }
    },
  });

  const quizzes = useQuery({
    queryKey: ["lessons", "quizzes", lessonId],
    enabled: Boolean(lessonId && lesson.data),
    retry: false,
    queryFn: async () => {
      try {
        return await lessonsApi.quizzesByLesson(lessonId!);
      } catch {
        return [];
      }
    },
  });

  const saveProgressMutation = useMutation({
    mutationFn: (input: {
      lessonProgressId: string;
      currentTimeSeconds: number;
      watchTimeSeconds: number;
    }) =>
      lessonsApi.updateProgress(input.lessonProgressId, {
        currentTimeSeconds: input.currentTimeSeconds,
        watchTimeSeconds: input.watchTimeSeconds,
        lastWatchedAt: new Date().toISOString(),
        completionCount: progress.data?.completionCount ?? 0,
      }),
    onSuccess: (updatedProgress) => {
      queryClient.setQueryData(["lessons", "progress", lessonId], updatedProgress);
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => lessonsApi.complete(lessonId!),
    onSuccess: async (updatedProgress) => {
      queryClient.setQueryData(["lessons", "progress", lessonId], updatedProgress);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["lessons", "detail", lessonId] }),
        queryClient.invalidateQueries({ queryKey: ["lessons", "course-content", courseId] }),
        queryClient.invalidateQueries({ queryKey: ["lessons", "course", courseId] }),
        queryClient.invalidateQueries({ queryKey: ["courses", "detail", courseId] }),
      ]);
    },
  });
  const isCompletingLesson = completeMutation.isPending;

  useEffect(() => {
    completeLessonRef.current = () => {
      completeMutation.mutate();
    };
  }, [completeMutation]);

  const activeProgress = progress.data ?? lesson.data?.userProgress;
  const isLocked = lesson.data?.isLocked || lesson.data?.isOpen === false;
  const isCompleted = activeProgress?.status === "COMPLETED" || lesson.data?.isCompleted;

  const navOverride = useMemo(() => {
    if (!lesson.data || lesson.isError) {
      return null;
    }

    if (isLocked) {
      return {
        action: {
          label: "Obuna olish",
          icon: <ChevronRight className="h-4 w-4" />,
          onClick: () => navigate("/subscription"),
        },
      };
    }

    if (isCompleted) {
      return {
        action: {
          label: "Bajarildi",
          icon: <CheckCircle2 className="h-4 w-4" />,
          onClick: () => undefined,
          disabled: true,
          tone: "success" as const,
        },
      };
    }

    return {
      showChatButton: true,
      action: {
        label: "Tugatdim",
        icon: <CheckCircle2 className="h-4 w-4" />,
        onClick: () => {
          completeLessonRef.current();
        },
        loading: isCompletingLesson,
      },
    };
  }, [isCompletingLesson, isCompleted, isLocked, lesson.data, lesson.isError, navigate]);

  useEffect(() => {
    if (!navOverride) {
      resetOverride();
      return;
    }

    setOverride(navOverride);

    return () => resetOverride();
  }, [navOverride, resetOverride, setOverride]);

  if (lesson.isLoading) {
    return (
      <MobileScreen className="space-y-4 lg:space-y-5">
        <div className="h-8 w-1/2 rounded-xl bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
        <Skeleton className="aspect-video rounded-[1.4rem]" />
        <Skeleton className="h-16 rounded-[1.4rem]" />
        <SkeletonCard />
      </MobileScreen>
    );
  }

  if (lesson.isError && hasApiStatus(lesson.error, 403)) {
    return (
      <MobileScreen className="space-y-4 lg:space-y-5">
        <PageHeader title="Dars" backButton />
        <GlassCard className="mt-4">
          <p className="text-sm text-t-secondary">
            Darsni ko'rish uchun obuna rasmiylashtiring.
          </p>
          <Button className="mt-4" fullWidth onClick={() => navigate("/subscription")}>
            Obuna olish
          </Button>
        </GlassCard>
      </MobileScreen>
    );
  }

  if (
    (lesson.isError && hasApiStatus(lesson.error, 400)) ||
    (lesson.data && !lesson.data.isOpen)
  ) {
    return (
      <MobileScreen className="space-y-4 lg:space-y-5">
        <PageHeader title="Dars" backButton />
        <GlassCard className="mt-4 flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/6">
            <Lock className="h-7 w-7 text-white/70" />
          </div>
          <p className="text-lg font-semibold text-t-primary">Dars hozircha yopiq</p>
          <p className="max-w-sm text-sm text-t-secondary">
            Bu darsni ochish uchun avvalgi darslarni yakunlang yoki kerakli obunani faollashtiring.
          </p>
        </GlassCard>
      </MobileScreen>
    );
  }

  if (lesson.isError || !lesson.data) {
    return (
      <MobileScreen className="space-y-4 lg:space-y-5">
        <ErrorState variant="network" onRetry={() => lesson.refetch()} />
      </MobileScreen>
    );
  }

  const currentLesson = lesson.data;
  const lessonTabs: Array<{
    value: LessonTab;
    label: string;
    icon: ReactNode;
    badge?: number;
  }> = [
    { value: "details", label: "Tafsilotlar", icon: <FileText className="h-4 w-4" /> },
    { value: "resources", label: "Resurslar", icon: <BookOpen className="h-4 w-4" /> },
    {
      value: "quizzes",
      label: "Testlar",
      icon: <HelpCircle className="h-4 w-4" />,
      badge: quizzes.data?.length ?? 0,
    },
  ] as const;

  return (
    <MobileScreen className="space-y-4 lg:space-y-5">
      <PageHeader
        title={currentLesson.title}
        backButton
        actions={
          <Badge variant={lessonTypeVariant[currentLesson.type]} size="sm">
            {lessonTypeLabel[currentLesson.type]}
          </Badge>
        }
      />

      <GlassCard className="space-y-3 rounded-[1.5rem]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-t-primary">Dars progressi</p>
            <p className="text-xs text-t-muted">
              {activeProgress?.currentTimeSeconds
                ? `${Math.floor(activeProgress.currentTimeSeconds / 60)} daq davom etilgan`
                : "Boshlashga tayyor"}
            </p>
          </div>
          {currentLesson.duration && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-t-secondary">
              {currentLesson.duration}
            </span>
          )}
        </div>

        <ProgressBar
          value={activeProgress?.progressPercentage ?? 0}
          max={100}
          showLabel
          label="Bajarilish"
        />
      </GlassCard>

      <SegmentedTabs
        value={tab}
        onValueChange={(value) => setTab(value as LessonTab)}
        variant="glass"
      tabs={lessonTabs.map((item) => ({
        value: item.value,
        label: item.label,
        icon: item.icon,
        badge: item.badge,
      }))}
    />

      {tab === "details" && (
        <MobileScreenSection className="desktop-main-aside">
          <div className="space-y-4">
            {currentLesson.type === "video" ? (
              <LessonVideoPlayer
                title={currentLesson.title}
                muxPlaybackId={currentLesson.muxPlaybackId}
                videoUrl={currentLesson.videoUrl}
                initialPositionSeconds={activeProgress?.currentTimeSeconds ?? 0}
                onProgressCheckpoint={(checkpoint) => {
                  if (!activeProgress?.id) return;
                  if (!checkpointCanSave(checkpoint, activeProgress)) return;
                  if (checkpoint.currentTimeSeconds === lastSavedRef.current) return;
                  if (saveProgressMutation.isPending) return;

                  lastSavedRef.current = checkpoint.currentTimeSeconds;
                  void saveProgressMutation.mutate({
                    lessonProgressId: activeProgress.id,
                    currentTimeSeconds: checkpoint.currentTimeSeconds,
                    watchTimeSeconds: checkpoint.watchTimeSeconds,
                  });
                }}
                onEnded={() => {
                  if (!isCompleted) {
                    completeLessonRef.current();
                  }
                }}
              />
            ) : currentLesson.type === "text" ? (
              <GlassCard className="rounded-[1.5rem]">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gold" />
                  <p className="text-sm font-semibold text-t-primary">Matnli dars</p>
                </div>
                <p className="mt-4 text-sm leading-7 text-t-secondary">
                  {currentLesson.description ?? "Bu dars uchun matn mavjud emas."}
                </p>
              </GlassCard>
            ) : (
              <GlassCard className="rounded-[1.5rem]">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-gold" />
                  <p className="text-sm font-semibold text-t-primary">Quiz darsi</p>
                </div>
                <p className="mt-4 text-sm leading-7 text-t-secondary">
                  Bu dars uchun asosiy material quiz orqali beriladi.
                </p>
              </GlassCard>
            )}

            <GlassCard className="rounded-[1.5rem]">
              <p className="text-lg font-semibold text-t-primary">Tavsif</p>
              <p className="mt-3 text-sm leading-7 text-t-secondary">
                {currentLesson.description ?? "Bu dars uchun tavsif kiritilmagan."}
              </p>
            </GlassCard>
          </div>

          <div className="space-y-4">
            {currentLesson.keyPoints.length > 0 && (
              <GlassCard className="rounded-[1.5rem]">
                <p className="text-lg font-semibold text-t-primary">Nimani o'rganasiz</p>
                <div className="mt-4 space-y-3">
                  {currentLesson.keyPoints.map((point, index) => (
                    <div key={`${point}-${index}`} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gold/12 text-gold">
                        <Star className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-sm leading-6 text-t-secondary">{point}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            <GlassCard className="rounded-[1.5rem]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/12 text-gold">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-t-primary">Mentor bilan aloqa</p>
                  <p className="text-xs text-t-muted">
                    {currentLesson.authorName
                      ? `${currentLesson.authorName} bilan dars bo'yicha yozishishingiz mumkin`
                      : "Mentor chat keyinroq faol bo'ladi"}
                  </p>
                </div>
              </div>
              <Button
                className="mt-4"
                fullWidth
                variant="secondary"
                disabled={!currentLesson.authorId}
                onClick={() => navigate("/stream-chat-channel")}
              >
                <MessageCircle className="h-4 w-4" />
                {currentLesson.authorId ? "Mentorga yozish" : "Mentor mavjud emas"}
              </Button>
            </GlassCard>
          </div>
        </MobileScreenSection>
      )}

      {tab === "resources" && (
        currentLesson.resources.length > 0 ? (
          <MobileScreenSection className="desktop-cards-grid">
            {currentLesson.resources.map((resource) => (
              <GlassCard key={resource.id} className="rounded-[1.5rem]">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/12 text-gold">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-t-primary">{resource.name}</p>
                    {resource.description && (
                      <p className="mt-1 text-xs leading-6 text-t-muted">{resource.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-t-muted">
                      {resource.category && (
                        <span className="rounded-full border border-white/10 px-2 py-1">{resource.category}</span>
                      )}
                      {resource.language && (
                        <span className="rounded-full border border-white/10 px-2 py-1">{resource.language}</span>
                      )}
                    </div>
                  </div>
                </div>

                <Button className="mt-4" variant="outline" fullWidth asChild>
                  <a href={resource.url} target="_blank" rel="noreferrer noopener">
                    <ExternalLink className="h-4 w-4" />
                    Resursni ochish
                  </a>
                </Button>
              </GlassCard>
            ))}
          </MobileScreenSection>
        ) : (
          <EmptyState
            icon={<BookOpen className="h-8 w-8" />}
            title="Resurslar topilmadi"
            description="Bu dars uchun qo'shimcha materiallar hozircha yo'q."
          />
        )
      )}

      {tab === "quizzes" && (
        quizzes.isLoading ? (
          <MobileScreenSection>
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </MobileScreenSection>
        ) : quizzes.data?.length ? (
          <MobileScreenSection className="desktop-cards-grid">
            {quizzes.data.map((quiz) => (
              <GlassCard key={quiz.id} className="rounded-[1.5rem]">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-success/10 text-success">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-t-primary">{quiz.title}</p>
                      {quiz.isCompleted && (
                        <Badge variant="success" size="sm">Bajarilgan</Badge>
                      )}
                    </div>
                    {quiz.description && (
                      <p className="mt-1 text-xs leading-6 text-t-muted">{quiz.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-t-muted">
                      <span className="rounded-full border border-white/10 px-2 py-1">
                        {quiz.questionCount} savol
                      </span>
                      <span className="rounded-full border border-white/10 px-2 py-1">
                        {quiz.passingScorePercent}% o'tish bali
                      </span>
                      {quiz.timeLimitSeconds ? (
                        <span className="rounded-full border border-white/10 px-2 py-1">
                          {Math.ceil(quiz.timeLimitSeconds / 60)} daqiqa
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <Button className="mt-4" fullWidth variant="secondary" disabled>
                  <CirclePlay className="h-4 w-4" />
                  Quiz flow keyingi bosqichda ulanadi
                </Button>
              </GlassCard>
            ))}
          </MobileScreenSection>
        ) : (
          <EmptyState
            icon={<HelpCircle className="h-8 w-8" />}
            title="Testlar topilmadi"
            description="Bu dars uchun quizlar hozircha yo'q."
          />
        )
      )}
    </MobileScreen>
  );
};
