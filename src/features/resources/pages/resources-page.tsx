import { useMemo, useState } from "react";
import {
  BookMarked,
  BookOpen,
  ExternalLink,
  Globe,
  Lock,
  Newspaper,
  PlayCircle,
  Star,
  Wrench,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { InfiniteScrollLoader } from "@/shared/ui/infinite-scroll-loader";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { GlassCard } from "@/shared/ui/glass-card";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { useInfiniteScrollTrigger } from "@/shared/hooks/use-infinite-scroll-trigger";
import { useResourceCategories, useResources } from "@/features/resources/hooks/use-resources";
import type { ResourceCategory, ResourceItem } from "@/features/resources/types/resource.types";
import { cn } from "@/shared/lib/cn";

const getCategoryTitle = (category?: string) => {
  if (!category) return "Resurslar";
  const normalized = category.replace(/[_-]+/g, " ").trim();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

type ResourceIconKey = "tool" | "video" | "news" | "book" | "default";

const getCategoryIconKey = (value?: string): ResourceIconKey => {
  const normalized = value?.toLowerCase() ?? "";

  if (normalized.includes("tool") || normalized.includes("app")) return "tool";
  if (normalized.includes("video") || normalized.includes("podcast") || normalized.includes("audio")) return "video";
  if (normalized.includes("news")) return "news";
  if (normalized.includes("book") || normalized.includes("guide") || normalized.includes("tutorial")) return "book";

  return "default";
};

const renderCategoryIcon = (iconKey: ResourceIconKey) => {
  if (iconKey === "tool") return <Wrench className="h-5 w-5" />;
  if (iconKey === "video") return <PlayCircle className="h-5 w-5" />;
  if (iconKey === "news") return <Newspaper className="h-5 w-5" />;
  if (iconKey === "book") return <BookOpen className="h-5 w-5" />;
  return <BookMarked className="h-5 w-5" />;
};

const buildFallbackCategories = (items: ResourceItem[]): ResourceCategory[] => {
  const groups = new Map<string, number>();

  items.forEach((item) => {
    const key = item.category?.trim() || "other";
    groups.set(key, (groups.get(key) ?? 0) + 1);
  });

  return Array.from(groups.entries())
    .map(([key, count]) => ({
      id: key,
      name: getCategoryTitle(key),
      count,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
};

const ResourceCard = ({ resource }: { resource: ResourceItem }) => {
  const categoryIconKey = getCategoryIconKey(resource.type ?? resource.category);
  const card = (
    <div
      className={cn(
        "relative h-full min-h-[320px] overflow-hidden rounded-[2rem] shadow-[0_18px_42px_rgba(0,0,0,0.42)] transition-all duration-500 ease-out",
        !resource.isLocked && "group-hover:-translate-y-1 group-hover:shadow-[0_24px_58px_rgba(0,0,0,0.5)]",
        resource.isLocked && "opacity-70",
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(212,160,23,0.22)_0%,rgba(15,23,42,0.92)_70%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/36 to-transparent" />

      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {resource.category && (
              <Badge variant="gold" size="sm">
                {getCategoryTitle(resource.category)}
              </Badge>
            )}
            {resource.type && (
              <Badge variant="muted" size="sm" className="bg-white/14 text-white/86">
                {getCategoryTitle(resource.type)}
              </Badge>
            )}
            {resource.isFeatured && (
              <Badge variant="solid" size="sm" className="bg-white/14 text-white">
                Featured
              </Badge>
            )}
          </div>

          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border bg-black/30 backdrop-blur-sm",
              resource.isLocked ? "border-white/12 text-t-muted" : "border-gold/25 text-gold",
            )}
          >
            {resource.isLocked ? <Lock className="h-4.5 w-4.5" /> : renderCategoryIcon(categoryIconKey)}
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <h3 className="line-clamp-2 text-[1.25rem] font-extrabold leading-tight tracking-[-0.03em] text-white">
              {resource.title}
            </h3>
            {resource.description && (
              <p className="line-clamp-3 text-[0.95rem] leading-5 text-white/72">{resource.description}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {resource.author && (
              <span className="liquid-glass-chip rounded-full px-3 py-1 text-[11px] font-medium text-white/86">
                {resource.author}
              </span>
            )}
            {resource.language && (
              <span className="liquid-glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium text-white/86">
                <Globe className="h-3.5 w-3.5" />
                {resource.language}
              </span>
            )}
            {resource.viewCount > 0 && (
              <span className="liquid-glass-chip rounded-full px-3 py-1 text-[11px] font-medium text-white/86">
                {resource.viewCount} views
              </span>
            )}
          </div>

          {!resource.isLocked && resource.url ? (
            <div className="rounded-[1.2rem] bg-[rgba(255,255,255,0.05)] p-3 backdrop-blur-xl">
              <div className="flex items-center justify-between text-sm font-semibold text-white">
                <span>Manbani ochish</span>
                <ExternalLink className="h-4 w-4 text-gold" />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (!resource.isLocked && resource.url) {
    return (
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block h-full"
        aria-label={`Open ${resource.title}`}
      >
        {card}
      </a>
    );
  }

  return <div className="group block h-full">{card}</div>;
};

export const ResourcesPage = () => {
  const categories = useResourceCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const effectiveCategoryId = selectedCategoryId ?? categories.data?.[0]?.id;
  const resources = useResources(effectiveCategoryId);
  const loadMoreRef = useInfiniteScrollTrigger({
    hasNextPage: resources.hasNextPage,
    isFetchingNextPage: resources.isFetchingNextPage,
    onLoadMore: () => resources.fetchNextPage(),
  });

  const fallbackCategories = useMemo(
    () => buildFallbackCategories(resources.items),
    [resources.items],
  );

  const visibleCategories = categories.data?.length ? categories.data : fallbackCategories;
  const activeCategory =
    visibleCategories.find((item) => item.id === effectiveCategoryId) ??
    visibleCategories[0];
  const featuredResource = resources.items.find((item) => item.isFeatured) ?? resources.items[0];

  if (categories.isLoading && resources.isLoading) {
    return (
      <MobileScreen className="space-y-4 lg:space-y-5">
        <div className="h-8 w-1/3 rounded-xl bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
        <SkeletonCard />
        <MobileScreenSection className="mt-4 desktop-cards-grid">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </MobileScreenSection>
      </MobileScreen>
    );
  }

  if (categories.isError && resources.isError && !resources.items.length) {
    return (
      <MobileScreen className="space-y-4 lg:space-y-5">
        <ErrorState variant="network" onRetry={() => {
          void categories.refetch();
          void resources.refetch();
        }} />
      </MobileScreen>
    );
  }

  const items = resources.items;

  return (
    <MobileScreen className="space-y-4 lg:space-y-5">
      <PageHeader title="Resurslar" subtitle="Kategoriya bo'yicha qo'shimcha materiallar" />

      <GlassCard padding="none" className="relative overflow-hidden rounded-[2rem]">
        <div className="relative p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
                <Star className="h-3.5 w-3.5" />
                Library
              </div>
              <h2 className="text-[1.25rem] font-extrabold tracking-[-0.03em] text-t-primary">
                {activeCategory ? getCategoryTitle(activeCategory.name) : "Qo'shimcha resurslar"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-t-muted">
                {activeCategory
                  ? `${activeCategory.count} ta material shu kategoriya ichida jamlangan`
                  : "Video, guide, tools va foydali materiallar bir joyda"}
              </p>
            </div>
            <div className="liquid-glass-surface flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.2rem] text-gold">
              <BookMarked className="h-5 w-5" />
            </div>
          </div>

          {featuredResource && (
            <div className="mt-4 rounded-[1.45rem] border border-white/8 bg-black/12 p-4 backdrop-blur-xl">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="gold" size="sm">Tavsiya</Badge>
                {featuredResource.type && (
                  <Badge variant="outline" size="sm">{getCategoryTitle(featuredResource.type)}</Badge>
                )}
              </div>
              <p className="text-sm font-semibold text-t-primary">{featuredResource.title}</p>
              {featuredResource.description && (
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-t-muted">{featuredResource.description}</p>
              )}
            </div>
          )}
        </div>
      </GlassCard>

      {!!visibleCategories.length && (
        <div className="desktop-chip-row">
          <div className="flex gap-2 pb-1 lg:flex-wrap lg:pb-0">
            {visibleCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategoryId(category.id)}
                className={cn(
                  "liquid-glass-surface-interactive flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium",
                  activeCategory?.id === category.id
                    ? "liquid-glass-button-chip-active text-gold"
                    : "liquid-glass-button-chip text-t-secondary",
                )}
              >
                <span>{getCategoryTitle(category.name)}</span>
                <span className="text-[11px] opacity-75">{category.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {resources.isLoading ? (
        <MobileScreenSection className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </MobileScreenSection>
      ) : resources.isError && !items.length ? (
        <ErrorState variant="network" onRetry={() => resources.refetch()} />
      ) : items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<BookMarked className="h-8 w-8" />}
            title="Resurslar topilmadi"
            description="Bu kategoriya uchun hozircha qo'shimcha materiallar mavjud emas."
          />
        </div>
      ) : (
        <MobileScreenSection className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {items.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}

          {resources.isError ? (
            <ErrorState variant="network" onRetry={() => resources.refetch()} />
          ) : null}

          <InfiniteScrollLoader
            sentinelRef={loadMoreRef}
            hasNextPage={resources.hasNextPage}
            isFetchingNextPage={resources.isFetchingNextPage}
          />
        </MobileScreenSection>
      )}
    </MobileScreen>
  );
};
