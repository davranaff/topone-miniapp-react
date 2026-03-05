import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock3, RefreshCcw, ShieldCheck, Trophy } from "lucide-react";
import { challengesApi } from "@/features/challenges/api/challenges.api";
import { ChallengeShowcaseCard } from "@/features/challenges/components/challenge-showcase-card";
import { useChallengesList } from "@/features/challenges/hooks/use-challenges-list";
import {
  challengePlaceholderCategories,
  getChallengePlaceholders,
} from "@/features/challenges/lib/challenge-placeholders";
import {
  formatCountdownParts,
  getChallengeCycleLabel,
  getChallengeCycleRemaining,
} from "@/features/challenges/lib/challenge-timing";
import type { Challenge, ChallengeCategory } from "@/entities/challenge/types";
import { hasApiStatus } from "@/shared/api/error-helpers";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { StatCardsRow } from "@/shared/ui/stat-card";
import { GlassCard } from "@/shared/ui/glass-card";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";

const sortCategories = (categories: ChallengeCategory[]) => {
  return [...categories].sort((left, right) => {
    const priority = (value: ChallengeCategory) => {
      if (value.typeCode === "daily") return 0;
      if (value.typeCode === "weekly") return 1;
      if (value.typeCode === "monthly") return 2;
      return 3;
    };

    return priority(left) - priority(right);
  });
};

const CountdownTile = ({
  value,
  label,
  highlight = false,
}: {
  value: string;
  label: string;
  highlight?: boolean;
}) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-[1.05rem] border px-2.5 py-2.5 text-center backdrop-blur-[16px]",
      "bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]",
      highlight ? "border-gold/30" : "border-white/10",
    )}
  >
    <p className={cn("text-[1.55rem] font-black leading-none tabular-nums", highlight ? "text-gold" : "text-t-primary")}>{value}</p>
    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/58">{label}</p>
  </div>
);

const ChallengeCycleTimerCard = ({
  category,
  disabled,
}: {
  category?: ChallengeCategory;
  disabled?: boolean;
}) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!category || disabled) {
      return;
    }

    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, [category, disabled]);

  if (!category || disabled) {
    return null;
  }

  const remaining = getChallengeCycleRemaining(now, category.typeCode, category.activeDays);
  if (remaining <= 0) {
    return null;
  }

  const parts = formatCountdownParts(remaining);
  const cycleLabel = getChallengeCycleLabel(category.typeCode);

  return (
    <GlassCard className="rounded-[1.75rem] border-transparent bg-[linear-gradient(155deg,rgba(8,10,12,0.76),rgba(8,10,12,0.58))]">
      <div className="flex items-center gap-3">
        <div className="liquid-glass-surface flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] text-gold">
          <Clock3 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-t-primary">{cycleLabel}</p>
          <p className="text-xs text-t-muted">{category.title} kategoriyasi yangilanish vaqtigacha</p>
        </div>
      </div>

      <div className={cn("mt-3 grid gap-2", parts.hasDays ? "grid-cols-4" : "grid-cols-3")}>
        {parts.hasDays ? (
          <CountdownTile value={parts.days} label="kun" highlight />
        ) : null}
        <CountdownTile value={parts.hours} label="soat" />
        <CountdownTile value={parts.minutes} label="daq" />
        <CountdownTile value={parts.seconds} label="sek" />
      </div>
    </GlassCard>
  );
};

export const ChallengesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeCategoryId, setActiveCategoryId] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["challenges", "categories"],
    queryFn: () => challengesApi.categories(),
    retry: false,
  });

  const statsQuery = useQuery({
    queryKey: ["challenges", "stats"],
    queryFn: () => challengesApi.overallStats(),
    enabled: true,
    retry: false,
  });

  const apiCategories = categoriesQuery.data?.items.length ? sortCategories(categoriesQuery.data.items) : [];
  const resolvedApiCategoryId =
    activeCategoryId && apiCategories.some((category) => category.typeId === activeCategoryId)
      ? activeCategoryId
      : apiCategories[0]?.typeId ?? "";

  const activeApiCategory = apiCategories.find((category) => category.typeId === resolvedApiCategoryId);

  const challenges = useChallengesList({
    typeId: activeApiCategory?.typeId,
    enabled: !!activeApiCategory?.typeId,
  });

  const permissionDenied =
    hasApiStatus(challenges.error, 403) || hasApiStatus(statsQuery.error, 403);

  const categories = permissionDenied ? challengePlaceholderCategories : apiCategories;
  const resolvedActiveCategoryId =
    activeCategoryId && categories.some((category) => category.typeId === activeCategoryId)
      ? activeCategoryId
      : categories[0]?.typeId ?? "";
  const activeCategory = categories.find((category) => category.typeId === resolvedActiveCategoryId);

  const openChallengeMutation = useMutation({
    mutationFn: async (challenge: Challenge) => {
      if (!challenge.hasUserProgress && !challenge.isLocked) {
        await challengesApi.createProgress(challenge.id);
      }

      return challenge.id;
    },
    onSuccess: async (challengeId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["challenges", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["challenges", "detail", challengeId] }),
      ]);
      navigate(`/challenges/${challengeId}`);
    },
  });

  const activePlaceholders = activeCategory ? getChallengePlaceholders(activeCategory.typeCode) : [];
  const stats = permissionDenied
    ? { total: 0, inProgress: 0, completed: 0, failed: 0 }
    : statsQuery.data ?? { total: 0, inProgress: 0, completed: 0, failed: 0 };

  const handleChallengeOpen = (challenge: Challenge) => {
    if (permissionDenied) {
      navigate("/subscription");
      return;
    }

    if (challenge.isLocked || challenge.hasUserProgress || challenge.isStarted) {
      navigate(`/challenges/${challenge.id}`);
      return;
    }

    openChallengeMutation.mutate(challenge);
  };

  const showCategoriesError =
    !permissionDenied &&
    categoriesQuery.isError &&
    !hasApiStatus(categoriesQuery.error, 403);

  return (
    <MobileScreen className="space-y-4 lg:space-y-5">
      <PageHeader title="Challenjlar" subtitle="Daily, weekly va monthly challenge oqimi" />

      <StatCardsRow
        columns={4}
        stats={[
          { label: "Jami", value: stats.total, icon: <Trophy className="h-4 w-4" /> },
          { label: "Jarayonda", value: stats.inProgress, icon: <Clock3 className="h-4 w-4" /> },
          { label: "Bajarilgan", value: stats.completed, icon: <ShieldCheck className="h-4 w-4" />, highlight: true },
          { label: "Failed", value: stats.failed, icon: <Trophy className="h-4 w-4" /> },
        ]}
      />

      <ChallengeCycleTimerCard category={activeCategory} disabled={permissionDenied} />

      <GlassCard className="rounded-[1.68rem] border-transparent bg-[linear-gradient(150deg,rgba(9,10,12,0.74),rgba(9,10,12,0.5))]">
        <div className="flex items-center gap-3">
          <div className="liquid-glass-surface flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] text-gold">
            <Trophy className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-t-primary">
              {permissionDenied ? "Premium challenjlar obuna bilan ochiladi" : "Challenjlar kategoriya bo'yicha ko'rsatiladi"}
            </p>
            <p className="mt-0.5 text-xs text-t-muted">
              {permissionDenied
                ? "Obunani faollashtirgandan keyin challenge ichida progress topshirish mumkin."
                : "Boshlanmagan challenge ochilganda progress avtomatik yaratiladi."}
            </p>
          </div>
        </div>
      </GlassCard>

      {showCategoriesError ? (
        <ErrorState variant="network" onRetry={() => categoriesQuery.refetch()} />
      ) : null}

      {categories.length > 0 ? (
        <GlassCard className="rounded-[1.55rem] border-transparent bg-[linear-gradient(160deg,rgba(8,10,12,0.78),rgba(8,10,12,0.56))]">
          <div className="desktop-chip-row flex gap-2 pb-1 lg:flex-wrap lg:pb-0">
            {categories.map((category) => (
              <button
                key={category.typeId}
                type="button"
                onClick={() => setActiveCategoryId(category.typeId)}
                className={`liquid-glass-surface-interactive rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  category.typeId === resolvedActiveCategoryId
                    ? "liquid-glass-button-chip-active text-black uppercase tracking-[0.14em]"
                    : "liquid-glass-button-chip text-white/72 uppercase tracking-[0.14em]"
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>
        </GlassCard>
      ) : null}

      <MobileScreenSection className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-t-muted">
            {permissionDenied ? "Premium kartalar" : `Topildi: ${challenges.data?.items.length ?? 0}`}
          </p>
          {!permissionDenied ? (
            <Button
              variant="ghost"
              size="xs"
              className="liquid-glass-button-chip"
              loading={challenges.isFetching}
              onClick={() => challenges.refetch()}
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Yangilash
            </Button>
          ) : null}
        </div>

        {!permissionDenied && challenges.isLoading ? (
          Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
        ) : null}

        {!permissionDenied && challenges.isError && !hasApiStatus(challenges.error, 403) ? (
          <ErrorState variant="network" onRetry={() => challenges.refetch()} />
        ) : null}

        {!permissionDenied && !challenges.isLoading && !challenges.isError && !challenges.data?.items.length ? (
          <EmptyState
            icon={<Trophy className="h-8 w-8" />}
            title="Bu kategoriyada challengelar yo'q"
            description="Yangi challengelar paydo bo'lganda shu yerda ko'rinadi."
          />
        ) : null}

        {permissionDenied && !!activePlaceholders.length ? (
          <div className="desktop-cards-grid">
            {activePlaceholders.map((challenge) => (
              <ChallengeShowcaseCard
                key={challenge.id}
                challenge={challenge}
                placeholder
                onClick={() => navigate("/subscription")}
              />
            ))}
          </div>
        ) : null}

        {!permissionDenied && !!challenges.data?.items.length ? (
          <div className="desktop-cards-grid">
            {challenges.data.items.map((challenge) => (
              <ChallengeShowcaseCard
                key={challenge.id}
                challenge={challenge}
                onClick={() => handleChallengeOpen(challenge)}
              />
            ))}
          </div>
        ) : null}
      </MobileScreenSection>
    </MobileScreen>
  );
};
