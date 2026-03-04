import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock3, ShieldCheck, Trophy } from "lucide-react";
import { challengesApi } from "@/features/challenges/api/challenges.api";
import { ChallengeShowcaseCard } from "@/features/challenges/components/challenge-showcase-card";
import { useChallengesList } from "@/features/challenges/hooks/use-challenges-list";
import {
  challengePlaceholderCategories,
  getChallengePlaceholders,
} from "@/features/challenges/lib/challenge-placeholders";
import type { Challenge, ChallengeCategory } from "@/entities/challenge/types";
import { hasApiStatus } from "@/shared/api/error-helpers";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { StatCardsRow } from "@/shared/ui/stat-card";
import { GlassCard } from "@/shared/ui/glass-card";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { EmptyState } from "@/shared/ui/empty-state";

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
    <MobileScreen>
      <PageHeader title="Challenjlar" subtitle="Flutter ilovadagi challenge flow bilan bir xil sahifa" />

      <MobileScreenSection className="mt-4">
        <StatCardsRow
          columns={4}
          stats={[
            { label: "Jami", value: stats.total, icon: <Trophy className="h-4 w-4" /> },
            { label: "Jarayonda", value: stats.inProgress, icon: <Clock3 className="h-4 w-4" /> },
            { label: "Bajarilgan", value: stats.completed, icon: <ShieldCheck className="h-4 w-4" />, highlight: true },
            { label: "Muvaffaqiyatsiz", value: stats.failed, icon: <Trophy className="h-4 w-4" /> },
          ]}
        />
      </MobileScreenSection>

      <MobileScreenSection className="mt-4">
        <GlassCard className="flex items-center gap-3 rounded-[1.55rem] border-white/10 px-4 py-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.15rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,226,163,0.14),rgba(255,255,255,0.03))] text-gold">
            <Clock3 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-t-primary">
              {permissionDenied ? "Premium challenjlar obuna bilan ochiladi" : "Challenge bo'limi har kuni yangilanadi"}
            </p>
            <p className="mt-0.5 text-xs text-white/54">
              {permissionDenied
                ? "Daily, weekly va monthly challenge'lar Flutter ilovadagi kabi kartalar bilan ko'rsatiladi."
                : "Kategoriya bo'yicha challengeni tanlang va progress yaratilgach ichiga kiring."}
            </p>
          </div>
        </GlassCard>
      </MobileScreenSection>

      {showCategoriesError ? (
        <div className="mt-6">
          <ErrorState variant="network" onRetry={() => categoriesQuery.refetch()} />
        </div>
      ) : null}

      {!!categories.length && (
        <MobileScreenSection className="mt-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category.typeId}
                type="button"
                onClick={() => setActiveCategoryId(category.typeId)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  category.typeId === resolvedActiveCategoryId
                    ? "bg-gold text-black"
                    : "border border-white/10 bg-white/5 text-white/72"
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>
        </MobileScreenSection>
      )}

      {!permissionDenied && challenges.isLoading && (
        <MobileScreenSection className="mt-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </MobileScreenSection>
      )}

      {!permissionDenied && challenges.isError && !hasApiStatus(challenges.error, 403) && (
        <div className="mt-6">
          <ErrorState variant="network" onRetry={() => challenges.refetch()} />
        </div>
      )}

      {!permissionDenied && !challenges.isLoading && !challenges.isError && !challenges.data?.items.length && (
        <div className="mt-10">
          <EmptyState
            icon={<Trophy className="h-8 w-8" />}
            title="Bu kategoriyada challengelar yo'q"
            description="Yangi challengelar paydo bo'lganda shu yerda ko'rinadi."
          />
        </div>
      )}

      {permissionDenied && !!activePlaceholders.length && (
        <MobileScreenSection className="mt-4">
          {activePlaceholders.map((challenge) => (
            <ChallengeShowcaseCard
              key={challenge.id}
              challenge={challenge}
              placeholder
              onClick={() => navigate("/subscription")}
            />
          ))}
        </MobileScreenSection>
      )}

      {!permissionDenied && !!challenges.data?.items.length && (
        <MobileScreenSection className="mt-4">
          {challenges.data.items.map((challenge) => (
            <ChallengeShowcaseCard
              key={challenge.id}
              challenge={challenge}
              onClick={() => handleChallengeOpen(challenge)}
            />
          ))}
        </MobileScreenSection>
      )}
    </MobileScreen>
  );
};
