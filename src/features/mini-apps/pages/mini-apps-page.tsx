import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { useMiniAppsList } from "@/features/mini-apps/hooks/use-mini-apps-list";
import { MiniAppCard } from "@/widgets/mini-apps/mini-app-card";
import { MiniAppsEmptyState } from "@/features/mini-apps/components/mini-apps-empty-state";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { GlassCard } from "@/shared/ui/glass-card";
import { cn } from "@/shared/lib/cn";

export const MiniAppsPage = () => {
  const miniApps = useMiniAppsList();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const categories = [
    "all",
    ...Array.from(new Set((miniApps.data ?? []).map((app) => app.category).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b),
    ),
  ];
  const activeCategory = categories.includes(selectedCategory) ? selectedCategory : "all";
  const filteredApps = (miniApps.data ?? []).filter(
    (app) => activeCategory === "all" || app.category === activeCategory,
  );

  return (
    <MobileScreen className="space-y-4 lg:space-y-5">
      <PageHeader title="Mini apps" subtitle="Каталог mini apps из flutter-topsecret + web bridge." />
      {miniApps.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-52" />
          ))}
        </div>
      ) : null}
      {!miniApps.isLoading && !miniApps.data?.length ? <MiniAppsEmptyState /> : null}

      {!miniApps.isLoading && categories.length > 1 ? (
        <GlassCard className="rounded-[1.4rem] border-border/50 p-3">
          <div className="-mx-1 flex overflow-x-auto px-1 [scrollbar-width:none]">
            <div className="flex gap-2">
              {categories.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "liquid-glass-surface-interactive rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.12em]",
                      isActive ? "border-gold/45 bg-gold/18 text-gold" : "border-border/50 text-t-secondary",
                    )}
                  >
                    {category.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
        </GlassCard>
      ) : null}

      {!miniApps.isLoading && miniApps.data?.length ? (
        <p className="text-xs uppercase tracking-[0.2em] text-t-muted">Topildi: {filteredApps.length}</p>
      ) : null}

      {!miniApps.isLoading && miniApps.data?.length && filteredApps.length === 0 ? (
        <GlassCard className="rounded-[1.4rem] border-border/45 p-6 text-center">
          <p className="text-sm text-t-secondary">Bu kategoriya uchun mini app topilmadi.</p>
        </GlassCard>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filteredApps.map((app) => (
          <Link key={app.id} to={`/mini-apps/${app.slug}`}>
            <MiniAppCard app={app} />
          </Link>
        ))}
      </div>
    </MobileScreen>
  );
};
