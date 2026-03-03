import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Star, CircleDollarSign, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { EmptyState } from "@/shared/ui/empty-state";
import { cn } from "@/shared/lib/cn";

type TxTab = "all" | "xp" | "coins";

type Transaction = {
  id: string;
  amount: number;
  type: "credit" | "debit";
  description: string;
  currency: "xp" | "coins";
  createdAt: string;
};

const mapTx = (r: Record<string, unknown>): Transaction => ({
  id: String(r.id ?? ""),
  amount: Number(r.amount ?? 0),
  type: (r.transaction_type ?? r.type) === "credit" ? "credit" : "debit",
  description: String(r.description ?? r.reason ?? ""),
  currency: String(r.currency ?? "xp") === "coins" ? "coins" : "xp",
  createdAt: String(r.created_at ?? r.createdAt ?? ""),
});

const TAB_ENDPOINT: Record<TxTab, string> = {
  all:   endpoints.transactions.list,
  xp:    endpoints.transactions.xp,
  coins: endpoints.transactions.coins,
};

const TABS: { id: TxTab; label: string }[] = [
  { id: "all",   label: "Barchasi" },
  { id: "xp",    label: "XP" },
  { id: "coins", label: "Coins" },
];

export const TransactionsPage = () => {
  const [tab, setTab] = useState<TxTab>("all");

  const query = useInfiniteQuery({
    queryKey: ["transactions", tab],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await apiClient.get(`${TAB_ENDPOINT[tab]}?page=${pageParam}&size=20`);
      const payload = res.data?.data ?? res.data;
      const items = Array.isArray(payload) ? payload : (payload?.items ?? []);
      return {
        items: (items as Array<Record<string, unknown>>).map(mapTx),
        nextPage: items.length === 20 ? (pageParam as number) + 1 : undefined,
      };
    },
    getNextPageParam: (last) => last.nextPage,
    initialPageParam: 1,
  });

  const allItems = query.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <MobileScreen>
      <PageHeader title="Tranzaksiyalar" backButton />

      {/* Tabs */}
      <div className="mt-3 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-xl border py-2 text-xs font-semibold transition-all",
              tab === t.id
                ? "border-gold/40 bg-gold/10 text-gold"
                : "border-border/40 bg-elevated text-t-muted hover:border-gold/20",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {query.isLoading ? (
        <MobileScreenSection className="mt-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
        </MobileScreenSection>
      ) : query.isError ? (
        <div className="mt-6">
          <ErrorState variant="network" onRetry={() => query.refetch()} />
        </div>
      ) : allItems.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<Star className="h-8 w-8" />}
            title="Tranzaksiyalar yo'q"
            description="Hali hech qanday tranzaksiya amalga oshirilmagan."
          />
        </div>
      ) : (
        <MobileScreenSection className="mt-4">
          {allItems.map((tx) => (
            <GlassCard key={tx.id}>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                    tx.type === "credit"
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-danger/30 bg-danger/10 text-danger",
                  )}
                >
                  {tx.type === "credit"
                    ? <ArrowDownLeft className="h-4 w-4" />
                    : <ArrowUpRight className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-t-primary">{tx.description || "Tranzaksiya"}</p>
                  <p className="text-xs text-t-muted">{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("uz") : ""}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {tx.currency === "xp"
                    ? <Star className="h-3.5 w-3.5 text-gold" />
                    : <CircleDollarSign className="h-3.5 w-3.5 text-info" />}
                  <span
                    className={cn(
                      "text-sm font-bold tabular-nums",
                      tx.type === "credit" ? "text-success" : "text-danger",
                    )}
                  >
                    {tx.type === "credit" ? "+" : "-"}{Math.abs(tx.amount).toLocaleString()}
                  </span>
                </div>
              </div>
            </GlassCard>
          ))}

          {query.hasNextPage && (
            <Button
              fullWidth
              variant="outline"
              size="sm"
              loading={query.isFetchingNextPage}
              onClick={() => query.fetchNextPage()}
            >
              Ko'proq yuklash
            </Button>
          )}
        </MobileScreenSection>
      )}
    </MobileScreen>
  );
};
