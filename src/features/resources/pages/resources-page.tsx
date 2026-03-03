import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookMarked, Lock, ExternalLink } from "lucide-react";
import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Badge } from "@/shared/ui/badge";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { EmptyState } from "@/shared/ui/empty-state";

type Resource = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  fileUrl?: string;
  isLocked: boolean;
};

const mapResource = (r: Record<string, unknown>): Resource => ({
  id: String(r.id ?? ""),
  title: String(r.title ?? ""),
  description: r.description ? String(r.description) : undefined,
  category: r.category ? String(r.category) : undefined,
  fileUrl: r.file_url ? String(r.file_url) : undefined,
  isLocked: Boolean(r.is_locked ?? false),
});

export const ResourcesPage = () => {
  const resources = useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.resources.list);
      const payload = res.data?.data ?? res.data;
      const items = Array.isArray(payload) ? payload : (payload?.items ?? []);
      return (items as Array<Record<string, unknown>>).map(mapResource);
    },
  });

  if (resources.isLoading) {
    return (
      <MobileScreen>
        <div className="h-8 w-1/3 rounded-xl bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
        <MobileScreenSection className="mt-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </MobileScreenSection>
      </MobileScreen>
    );
  }

  if (resources.isError) {
    return (
      <MobileScreen>
        <ErrorState variant="network" onRetry={() => resources.refetch()} />
      </MobileScreen>
    );
  }

  const items = resources.data ?? [];

  return (
    <MobileScreen>
      <PageHeader title="Resurslar" subtitle="Qo'shimcha materiallar" />

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<BookMarked className="h-8 w-8" />}
            title="Resurslar topilmadi"
            description="Hozircha qo'shimcha materiallar mavjud emas."
          />
        </div>
      ) : (
        <MobileScreenSection className="mt-4">
          {items.map((resource) => (
            <GlassCard
              key={resource.id}
              interactive={!resource.isLocked}
              className={resource.isLocked ? "opacity-60" : ""}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/40 bg-elevated">
                  {resource.isLocked
                    ? <Lock className="h-4 w-4 text-t-muted" />
                    : <BookMarked className="h-4 w-4 text-gold" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-t-primary">{resource.title}</p>
                  {resource.description && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-t-muted">{resource.description}</p>
                  )}
                  {resource.category && (
                    <Badge variant="muted" size="sm" className="mt-1">{resource.category}</Badge>
                  )}
                </div>
                {!resource.isLocked && resource.fileUrl && (
                  <a
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-t-muted hover:text-gold transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </GlassCard>
          ))}
        </MobileScreenSection>
      )}
    </MobileScreen>
  );
};
