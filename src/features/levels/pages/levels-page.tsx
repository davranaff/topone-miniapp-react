import { Award, CheckCircle2, Lock, Star } from "lucide-react";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { EmptyState } from "@/shared/ui/empty-state";
import { useLevels } from "@/features/levels/hooks/use-levels";
import { useUserStats } from "@/features/home/hooks/use-user-stats";
import { cn } from "@/shared/lib/cn";

const getPerkText = (perks?: Record<string, unknown>) => {
  if (!perks) {
    return "";
  }

  const values = Object.values(perks).map((value) => String(value).trim()).filter(Boolean);
  return values.join(", ");
};

export const LevelsPage = () => {
  const levels = useLevels();
  const stats = useUserStats();
  const currentLevel = stats.data?.level ?? 0;

  if (levels.isLoading) {
    return (
      <MobileScreen>
        <PageHeader title="Darajalar" subtitle="Yutuqlar bo'yicha progression" backButton />
        <MobileScreenSection className="mt-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </MobileScreenSection>
      </MobileScreen>
    );
  }

  if (levels.isError) {
    return (
      <MobileScreen>
        <PageHeader title="Darajalar" subtitle="Yutuqlar bo'yicha progression" backButton />
        <MobileScreenSection className="mt-6">
          <ErrorState variant="network" onRetry={() => levels.refetch()} />
        </MobileScreenSection>
      </MobileScreen>
    );
  }

  const list = levels.data ?? [];
  if (list.length === 0) {
    return (
      <MobileScreen>
        <PageHeader title="Darajalar" subtitle="Yutuqlar bo'yicha progression" backButton />
        <MobileScreenSection className="mt-8">
          <EmptyState
            icon={<Award className="h-8 w-8" />}
            title="Darajalar topilmadi"
            description="Keyinroq qayta urinib ko'ring."
          />
        </MobileScreenSection>
      </MobileScreen>
    );
  }

  return (
    <MobileScreen>
      <PageHeader
        title="Darajalar"
        subtitle={`Joriy daraja: ${currentLevel > 0 ? currentLevel : "—"}`}
        backButton
      />

      <MobileScreenSection className="mt-4">
        {list.map((item) => {
          const isCompleted = currentLevel > 0 && item.level < currentLevel;
          const isCurrent = currentLevel > 0 && item.level === currentLevel;
          const isLocked = currentLevel > 0 && item.level > currentLevel;
          const perkText = getPerkText(item.perks);

          return (
            <GlassCard
              key={`${item.level}-${item.title}`}
              className={cn(
                "rounded-[1.35rem] border transition-colors",
                isCurrent && "border-gold/45 bg-gold/10",
                isCompleted && "border-success/30",
                !isCurrent && !isCompleted && "border-border/40",
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.85rem] border",
                    isCurrent && "border-gold/45 bg-gold/20 text-gold",
                    isCompleted && "border-success/45 bg-success/20 text-success",
                    isLocked && "border-border/45 bg-elevated text-t-muted",
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isLocked ? (
                    <Lock className="h-4.5 w-4.5" />
                  ) : (
                    <Star className="h-4.5 w-4.5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-bold text-t-primary">{item.title}</p>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-2xs font-semibold uppercase tracking-wide",
                        isCompleted && "bg-success/15 text-success",
                        isCurrent && "bg-gold/15 text-gold",
                        isLocked && "bg-elevated text-t-muted",
                      )}
                    >
                      {isCompleted ? "Ochilgan" : isCurrent ? "Joriy" : "Yopiq"}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-t-secondary">
                    Level {item.level} • {item.minXp.toLocaleString()} - {item.maxXp.toLocaleString()} XP
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-gold/12 px-2 py-0.5 font-semibold text-gold">
                      +{item.coinBonus.toLocaleString()} coin
                    </span>
                    {perkText && (
                      <span className="truncate text-t-muted">
                        Perk: {perkText}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </MobileScreenSection>
    </MobileScreen>
  );
};
