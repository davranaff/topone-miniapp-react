import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Flag,
  Lock,
  Send,
  ShieldCheck,
  Star,
  Trophy,
} from "lucide-react";
import { challengesApi } from "@/features/challenges/api/challenges.api";
import { useChallengeDetail } from "@/features/challenges/hooks/use-challenge-detail";
import {
  getChallengeRewardLabel,
  getChallengeStatusLabel,
  getChallengeTypeLabel,
} from "@/features/challenges/lib/challenge-presentation";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Badge } from "@/shared/ui/badge";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { Skeleton, SkeletonCard } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { StatCardsRow } from "@/shared/ui/stat-card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { SheetModal } from "@/shared/ui/sheet-modal";
import { hasApiStatus } from "@/shared/api/error-helpers";
import { cn } from "@/shared/lib/cn";
import { useShellNav } from "@/widgets/navigation/shell-nav";
import type { Challenge } from "@/entities/challenge/types";
import {
  formatCountdownParts,
  getChallengeCycleLabel,
  getChallengeCycleRemaining,
} from "@/features/challenges/lib/challenge-timing";

const difficultyVariant: Record<Challenge["difficulty"], "success" | "info" | "danger"> = {
  easy: "success",
  medium: "info",
  hard: "danger",
};

const difficultyLabel: Record<Challenge["difficulty"], string> = {
  easy: "Oson",
  medium: "O'rta",
  hard: "Qiyin",
};

const normalizeTelegramUrl = (value: string) => {
  let normalized = value.trim();

  if (!normalized) {
    return normalized;
  }

  if (normalized.startsWith("http://")) {
    normalized = normalized.slice(7);
  } else if (normalized.startsWith("https://")) {
    normalized = normalized.slice(8);
  }

  if (!normalized.includes("@") && !normalized.includes("/") && !normalized.includes(".")) {
    normalized = `@${normalized}`;
  }

  if (normalized.startsWith("@")) {
    normalized = `t.me/${normalized.slice(1)}`;
  }

  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = `https://${normalized}`;
  }

  return normalized;
};

const DetailSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="liquid-glass-surface-muted space-y-3 rounded-[1.55rem] border border-white/8 px-4 py-4">
    <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/58">{title}</h2>
    {children}
  </div>
);

const DetailSurface = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div
    className={cn(
      "liquid-glass-surface-muted rounded-[1.55rem] border border-white/8 px-4 py-4",
      className,
    )}
  >
    {children}
  </div>
);

const ChallengeDetailHero = ({ challenge }: { challenge: Challenge }) => {
  const typeLabel = getChallengeTypeLabel(
    challenge,
    {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      other: "Challenge",
    },
    "Challenge",
  );
  const statusLabel = getChallengeStatusLabel(challenge, {
    active: "Faol",
    pending: "Kutilmoqda",
    completed: "Bajarilgan",
    locked: "Yopiq",
    fallback: "Faol",
  });
  const rewardLabel = getChallengeRewardLabel(challenge);

  return (
    <div className="relative overflow-hidden rounded-[1.9rem] border border-white/10 bg-[rgba(10,10,10,0.58)] shadow-[0_20px_50px_rgba(0,0,0,0.32)]">
      {challenge.coverUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-26"
          style={{ backgroundImage: `url(${challenge.coverUrl})` }}
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(6,7,10,0.62),rgba(6,7,10,0.8))]" />

      <div className="relative space-y-4 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" size="sm" className="liquid-glass-chip text-white/92">
              {typeLabel}
            </Badge>
            <Badge variant={challenge.isCompleted ? "success" : "muted"} size="sm">
              {statusLabel}
            </Badge>
          </div>
          <Badge variant="gold" size="sm">
            {rewardLabel}
          </Badge>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-[1.18rem] font-extrabold leading-tight tracking-[-0.03em] text-white">
            {challenge.title}
          </h1>
          <p className="line-clamp-3 text-sm leading-6 text-white/72">{challenge.description}</p>
        </div>
      </div>
    </div>
  );
};

export const ChallengeDetailPage = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const challenge = useChallengeDetail(challengeId);
  const { setOverride, resetOverride } = useShellNav();
  const [completeOpen, setCompleteOpen] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [now, setNow] = useState(() => new Date());
  const submitRef = useRef<(() => void) | null>(null);

  const detailStats = useQuery({
    queryKey: ["challenges", "detail-stats", challengeId],
    queryFn: () => challengesApi.detailStats(challengeId!),
    enabled: !!challengeId && !challenge.isError,
    retry: false,
  });

  const rewards = useQuery({
    queryKey: ["challenges", "rewards", challengeId],
    queryFn: () => challengesApi.rewards(challengeId!),
    enabled: !!challengeId && !challenge.isError,
    retry: false,
  });

  const subchallenges = useQuery({
    queryKey: ["challenges", "subchallenges", challengeId],
    queryFn: () => challengesApi.subchallenges(challengeId!),
    enabled: !!challengeId && !challenge.isError,
    retry: false,
  });

  const startMutation = useMutation({
    mutationFn: () => challengesApi.createProgress(challengeId!),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["challenges", "detail", challengeId] }),
        queryClient.invalidateQueries({ queryKey: ["challenges", "list"] }),
      ]);
    },
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      const progressId = challenge.data?.progressId;
      if (!progressId) {
        throw new Error("Challenge progress topilmadi");
      }

      return challengesApi.updateProgress(progressId, {
        result: normalizeTelegramUrl(resultUrl),
        notes: notes.trim() || undefined,
      });
    },
    onSuccess: async () => {
      setCompleteOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["challenges", "detail", challengeId] }),
        queryClient.invalidateQueries({ queryKey: ["challenges", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["challenges", "detail-stats", challengeId] }),
      ]);
    },
  });

  const data = challenge.data;
  const is403 = hasApiStatus(challenge.error, 403);
  const isLocked = Boolean(data?.isLocked);
  const isCompleted = Boolean(data?.isCompleted);
  const isWeeklyOrMonthly = data?.typeCode === "weekly" || data?.typeCode === "monthly";
  const progress = data?.progress ?? 0;
  const cycleRemaining = getChallengeCycleRemaining(now, data?.typeCode, data?.durationDays);
  const cycleParts = formatCountdownParts(cycleRemaining);
  const cycleLabel = getChallengeCycleLabel(data?.typeCode);

  const rewardsValue = rewards.data ?? {
    xp: data?.xpReward ?? 0,
    coin: data?.coinReward ?? 0,
  };

  useEffect(() => {
    submitRef.current = () => {
      if (!resultUrl.trim()) {
        return;
      }

      completeMutation.mutate();
    };
  }, [completeMutation, notes, resultUrl]);

  useEffect(() => {
    if (!data || data.isCompleted) {
      return;
    }

    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, [data]);

  useEffect(() => {
    if (!data || challenge.isError) {
      resetOverride();
      return;
    }

    if (isLocked || isCompleted || isWeeklyOrMonthly) {
      setOverride({});
      return () => resetOverride();
    }

    if (!data.hasUserProgress) {
      setOverride({
        action: {
          label: "Boshlash",
          icon: <Flag className="h-4 w-4" />,
          onClick: () => startMutation.mutate(),
          loading: startMutation.isPending,
        },
      });

      return () => resetOverride();
    }

    if (completeOpen) {
      setOverride({
        action: {
          label: "Tugatish",
          icon: <Send className="h-4 w-4" />,
          onClick: () => submitRef.current?.(),
          loading: completeMutation.isPending,
        },
      });

      return () => resetOverride();
    }

    setOverride({
      action: {
        label: "Challengeni topshirish",
        icon: <Flag className="h-4 w-4" />,
        onClick: () => setCompleteOpen(true),
      },
    });

    return () => resetOverride();
  }, [
    challenge.isError,
    completeMutation.isPending,
    completeOpen,
    data,
    isCompleted,
    isLocked,
    isWeeklyOrMonthly,
    resetOverride,
    setOverride,
    startMutation,
  ]);

  if (challenge.isLoading) {
    return (
      <MobileScreen>
        <div className="space-y-4 pt-2">
          <div className="h-8 w-2/3 rounded-xl bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
          <Skeleton className="h-48 w-full rounded-[2rem]" />
          <Skeleton className="h-24 w-full rounded-[1.6rem]" />
          <SkeletonCard />
        </div>
      </MobileScreen>
    );
  }

  if (is403) {
    return (
      <MobileScreen>
        <PageHeader title="Premium challenge" backButton />
        <GlassCard className="mt-4 space-y-4 rounded-[2rem]">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] border border-gold/20 bg-gold/10 text-gold">
            <Lock className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-t-primary">Bu challenge premium obuna bilan ochiladi</p>
            <p className="text-sm leading-6 text-t-secondary">
              Flutter ilovadagi kabi premium challenge'lar subscription orqali ochiladi.
            </p>
          </div>
          <Button fullWidth onClick={() => navigate("/subscription")}>
            Obuna olish
          </Button>
        </GlassCard>
      </MobileScreen>
    );
  }

  if (challenge.isError || !data) {
    return (
      <MobileScreen>
        <ErrorState variant="not-found" onRetry={() => challenge.refetch()} />
      </MobileScreen>
    );
  }

  return (
    <MobileScreen>
      <PageHeader
        title={data.title}
        backButton
        actions={
          <Badge variant={difficultyVariant[data.difficulty]} size="sm">
            {difficultyLabel[data.difficulty]}
          </Badge>
        }
      />

      <div className="mt-4 space-y-4">
        <ChallengeDetailHero challenge={data} />

        <StatCardsRow
          columns={4}
          stats={[
            {
              label: "Jami foydalanuvchi",
              value: detailStats.data?.totalUsers ?? 0,
              icon: <Trophy className="h-4 w-4" />,
            },
            {
              label: "Jarayonda",
              value: detailStats.data?.inProgress ?? 0,
              icon: <Clock3 className="h-4 w-4" />,
            },
            {
              label: "Bajarilgan",
              value: detailStats.data?.completed ?? 0,
              icon: <ShieldCheck className="h-4 w-4" />,
              highlight: true,
            },
            {
              label: "Failed",
              value: detailStats.data?.failed ?? 0,
              icon: <Trophy className="h-4 w-4" />,
            },
          ]}
        />

        {cycleRemaining > 0 && !isCompleted ? (
          <DetailSurface className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="liquid-glass-surface-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.95rem] text-gold">
                <CalendarClock className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-t-primary">{cycleLabel}</p>
                <p className="text-xs text-t-muted">Joriy challenge sikli tugashigacha qolgan vaqt</p>
              </div>
            </div>

            <div className={cn("grid gap-2", cycleParts.hasDays ? "grid-cols-4" : "grid-cols-3")}>
              {cycleParts.hasDays ? (
                <div className="liquid-glass-surface-muted rounded-[0.9rem] px-2 py-2 text-center">
                  <p className="text-sm font-bold text-t-primary">{cycleParts.days}</p>
                  <p className="text-2xs text-t-muted">kun</p>
                </div>
              ) : null}
              <div className="liquid-glass-surface-muted rounded-[0.9rem] px-2 py-2 text-center">
                <p className="text-sm font-bold text-t-primary">{cycleParts.hours}</p>
                <p className="text-2xs text-t-muted">soat</p>
              </div>
              <div className="liquid-glass-surface-muted rounded-[0.9rem] px-2 py-2 text-center">
                <p className="text-sm font-bold text-t-primary">{cycleParts.minutes}</p>
                <p className="text-2xs text-t-muted">daq</p>
              </div>
              <div className="liquid-glass-surface-muted rounded-[0.9rem] px-2 py-2 text-center">
                <p className="text-sm font-bold text-t-primary">{cycleParts.seconds}</p>
                <p className="text-2xs text-t-muted">sek</p>
              </div>
            </div>
          </DetailSurface>
        ) : null}

        <DetailSurface className="grid grid-cols-2 gap-3">
          <div className="liquid-glass-surface rounded-[1.2rem] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">XP reward</p>
            <div className="mt-2 flex items-center gap-2 text-gold">
              <Star className="h-4 w-4" />
              <span className="text-lg font-bold">{rewardsValue.xp}</span>
            </div>
          </div>
          <div className="liquid-glass-surface rounded-[1.2rem] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Coin reward</p>
            <div className="mt-2 flex items-center gap-2 text-gold">
              <Trophy className="h-4 w-4" />
              <span className="text-lg font-bold">{rewardsValue.coin}</span>
            </div>
          </div>
        </DetailSurface>

        {progress > 0 && (
          <DetailSurface>
            <ProgressBar value={progress} max={100} showLabel label="Progress" />
          </DetailSurface>
        )}

        {isCompleted && (
          <DetailSurface className="border-gold/20">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-gold" />
              <div>
                <p className="text-sm font-semibold text-gold">Challenge bajarilgan</p>
                <p className="text-xs text-t-muted">
                  {data.progressResult ? "Natija va izohlar muvaffaqiyatli topshirilgan." : "Progress yakunlangan."}
                </p>
              </div>
            </div>
          </DetailSurface>
        )}

        {isLocked && (
          <DetailSurface className="border-gold/20">
            <div className="flex items-start gap-3">
              <div className="liquid-glass-surface-muted flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border border-gold/20 text-gold">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-t-primary">Challenge hozircha yopiq</p>
                <p className="text-xs leading-5 text-t-muted">
                  {data.unlockDay
                    ? `${data.unlockDay}-kundan keyin ochiladi. Flutter ilovadagi kabi bu holat subscription emas, unlock schedule bilan bog'liq.`
                    : "Avvalgi bosqichlarni yakunlagach challenge ochiladi."}
                </p>
              </div>
            </div>
          </DetailSurface>
        )}

        <DetailSection title="Tavsif">
          <p className="text-sm leading-7 text-t-secondary">{data.description}</p>
        </DetailSection>

        {!!data.howItWorks?.length && (
          <DetailSection title="Qanday ishlaydi">
            <div className="space-y-3">
              {data.howItWorks.map((item, index) => (
                <div key={`${item}-${index}`} className="liquid-glass-surface flex items-start gap-3 rounded-[1.1rem] px-3.5 py-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <p className="text-sm leading-6 text-t-secondary">{item}</p>
                </div>
              ))}
            </div>
          </DetailSection>
        )}

        {!!data.checkmark?.length && (
          <DetailSection title="Muhim punktlar">
            <div className="space-y-3">
              {data.checkmark.map((item, index) => (
                <div key={`${item}-${index}`} className="liquid-glass-surface flex items-start gap-3 rounded-[1.1rem] px-3.5 py-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-info" />
                  <p className="text-sm leading-6 text-t-secondary">{item}</p>
                </div>
              ))}
            </div>
          </DetailSection>
        )}

        {!!subchallenges.data?.items.length && (
          <DetailSection title="Subchallenge'lar">
            <div className="space-y-3">
              {subchallenges.data.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="liquid-glass-surface-interactive liquid-glass-surface-muted block w-full rounded-[1.2rem] px-4 py-3 text-left"
                  onClick={() => navigate(`/challenges/${item.id}`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-t-primary">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-t-muted">{item.description}</p>
                    </div>
                    <Badge variant={item.isCompleted ? "success" : "muted"} size="sm">
                      {item.isCompleted ? "Done" : "Open"}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </DetailSection>
        )}

        {!!data.additionalResources?.length && (
          <DetailSection title="Qo'shimcha resurslar">
            <div className="space-y-3">
              {data.additionalResources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <div className="liquid-glass-surface-interactive liquid-glass-surface-muted rounded-[1.2rem] px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-t-primary">{resource.title}</p>
                        {resource.description && (
                          <p className="text-xs leading-5 text-t-muted">{resource.description}</p>
                        )}
                      </div>
                      <ExternalLink className="h-4 w-4 shrink-0 text-gold" />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-2xs text-white/56">
                      {resource.type ? (
                        <span className="liquid-glass-chip rounded-full px-2.5 py-1 uppercase tracking-[0.18em]">
                          {resource.type}
                        </span>
                      ) : null}
                      {resource.author ? <span>{resource.author}</span> : null}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </DetailSection>
        )}
      </div>

      <SheetModal
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        title="Challenge topshirish"
        description="Telegram link yoki username va qisqa izoh qoldiring."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-white/58">
              Telegram havola
            </label>
            <Input
              value={resultUrl}
              onChange={(event) => setResultUrl(event.target.value)}
              placeholder="@username yoki t.me/username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-white/58">
              Izoh
            </label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Qisqa natija yoki izoh yozing"
              className={cn(
                "min-h-28 w-full resize-none rounded-[1rem] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-t-primary outline-none transition focus:border-gold/45 focus:ring-2 focus:ring-gold/20",
              )}
            />
          </div>

          <DetailSurface className="rounded-[1.3rem] text-xs leading-5 text-t-muted">
            Flutter ilovadagi flow kabi submit paytida natija `result`, izoh esa `notes` sifatida progress update endpoint'iga yuboriladi.
          </DetailSurface>

          <Button
            fullWidth
            loading={completeMutation.isPending}
            disabled={!resultUrl.trim()}
            onClick={() => submitRef.current?.()}
          >
            Topshirish
          </Button>
        </div>
      </SheetModal>
    </MobileScreen>
  );
};
