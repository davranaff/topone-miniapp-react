import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleDollarSign,
  Coins,
  RefreshCcw,
  Star,
} from "lucide-react";
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
import { useInfiniteScrollTrigger } from "@/shared/hooks/use-infinite-scroll-trigger";
import { InfiniteScrollLoader } from "@/shared/ui/infinite-scroll-loader";

type TxTab = "xp" | "coins";
type TxTypeFilter = "all" | "earned" | "spent";
type TxDirection = "credit" | "debit";

type Transaction = {
  id: string;
  amount: number;
  direction: TxDirection;
  transactionType: string;
  description: string;
  currency: TxTab;
  createdAt: string;
  referenceId?: string;
};

const TAB_CONFIG: Record<
  TxTab,
  {
    endpoint: string;
    label: string;
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyDescription: string;
  }
> = {
  xp: {
    endpoint: endpoints.transactions.xp,
    label: "XP",
    title: "XP tranzaksiyalari",
    subtitle: "To'plangan va sarflangan XP tarixini ko'ring",
    emptyTitle: "XP tranzaksiyalar yo'q",
    emptyDescription: "XP bilan bog'liq harakatlar paydo bo'lganda shu yerda chiqadi.",
  },
  coins: {
    endpoint: endpoints.transactions.coins,
    label: "Coins",
    title: "Coin tranzaksiyalari",
    subtitle: "Coin kirim va chiqimlarini transaction_type bo'yicha ko'ring",
    emptyTitle: "Coin tranzaksiyalar yo'q",
    emptyDescription: "Coin bilan bog'liq harakatlar paydo bo'lganda shu yerda chiqadi.",
  },
};

const TYPE_FILTERS: Array<{ id: TxTypeFilter; label: string }> = [
  { id: "all", label: "Barchasi" },
  { id: "earned", label: "Earned" },
  { id: "spent", label: "Spent" },
];

const toRecord = (value: unknown): Record<string, unknown> => {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
};

const normalizeTransactionType = (value: unknown) => {
  return String(value ?? "").trim().toLowerCase();
};

const resolveDirection = (transactionType: string, amount: number): TxDirection => {
  if (amount < 0) {
    return "debit";
  }

  if (["earned", "credit", "income", "reward", "bonus", "refund"].includes(transactionType)) {
    return "credit";
  }

  if (["spent", "debit", "expense", "purchase", "payment", "deducted"].includes(transactionType)) {
    return "debit";
  }

  return "credit";
};

const prettifyToken = (token: string) => {
  if (!token) {
    return "Tranzaksiya";
  }

  return token
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const mapDescription = (value: string) => {
  const key = value.trim().toLowerCase();

  const labels: Record<string, string> = {
    lesson_completion: "Dars yakunlandi",
    lesson_complete: "Dars yakunlandi",
    challenge_completion: "Challenge yakunlandi",
    challenge_complete: "Challenge yakunlandi",
    quiz_completion: "Quiz yakunlandi",
    daily_bonus: "Kunlik bonus",
    streak_bonus: "Streak bonus",
    referral_bonus: "Referral bonus",
    purchase: "Xarid",
    subscription_purchase: "Obuna xaridi",
    refund: "Qaytarim",
  };

  return labels[key] ?? prettifyToken(key);
};

const formatDateTime = (value: string) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return `${date.toLocaleDateString("uz")} • ${date.toLocaleTimeString("uz", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const shortReference = (value?: string) => {
  if (!value) {
    return "";
  }

  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-4)}`;
};

const getTabFromPath = (pathname: string): TxTab => {
  if (pathname.endsWith("/xp")) {
    return "xp";
  }

  return "coins";
};

const getPathByTab = (tab: TxTab) => (tab === "xp" ? "/transactions/xp" : "/transactions/coins");

const mapTx = (raw: Record<string, unknown>, tab: TxTab): Transaction => {
  const amount = Number(raw.amount ?? 0);
  const transactionType = normalizeTransactionType(raw.transaction_type ?? raw.type);

  return {
    id: String(raw.id ?? ""),
    amount: Math.abs(amount),
    direction: resolveDirection(transactionType, amount),
    transactionType: transactionType || "unknown",
    description: String(raw.description ?? raw.reason ?? ""),
    currency: tab,
    createdAt: String(raw.created_at ?? raw.createdAt ?? ""),
    referenceId: raw.reference_id ? String(raw.reference_id) : undefined,
  };
};

export const TransactionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tab = useMemo(() => getTabFromPath(location.pathname), [location.pathname]);
  const [typeFilter, setTypeFilter] = useState<TxTypeFilter>("all");

  useEffect(() => {
    if (location.pathname === "/transactions") {
      navigate("/transactions/coins", { replace: true });
    }
  }, [location.pathname, navigate]);

  const query = useInfiniteQuery({
    queryKey: ["transactions", tab, typeFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        size: "20",
      });

      if (typeFilter !== "all") {
        params.set("transaction_type", typeFilter);
      }

      const res = await apiClient.get(`${TAB_CONFIG[tab].endpoint}?${params.toString()}`);
      const root = toRecord(res.data);

      const dataItems = Array.isArray(root.data)
        ? (root.data as Array<Record<string, unknown>>)
        : Array.isArray(root.items)
          ? (root.items as Array<Record<string, unknown>>)
          : [];

      const pagination = toRecord(root.pagination);
      const page = Number(pagination.page ?? pageParam);
      const pages = Number(pagination.pages ?? page);
      const total = Number(pagination.total ?? dataItems.length);

      return {
        items: dataItems.map((item) => mapTx(item, tab)),
        page,
        pages,
        total,
      };
    },
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
  });

  const allItems = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);
  const totalItems = query.data?.pages[0]?.total ?? allItems.length;
  const loadMoreRef = useInfiniteScrollTrigger({
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    onLoadMore: () => query.fetchNextPage(),
  });

  const summary = useMemo(() => {
    return allItems.reduce(
      (acc, item) => {
        if (item.direction === "credit") {
          acc.earned += item.amount;
          acc.earnedCount += 1;
        } else {
          acc.spent += item.amount;
          acc.spentCount += 1;
        }

        return acc;
      },
      { earned: 0, spent: 0, earnedCount: 0, spentCount: 0 },
    );
  }, [allItems]);

  const config = TAB_CONFIG[tab];

  return (
    <MobileScreen className="space-y-4 lg:space-y-5">
      <PageHeader title={config.title} subtitle={config.subtitle} backButton />

      <div className="desktop-chip-row flex gap-2 lg:pb-0">
        {(Object.keys(TAB_CONFIG) as TxTab[]).map((tabId) => (
          <button
            key={tabId}
            type="button"
            onClick={() => navigate(getPathByTab(tabId))}
            className={cn(
              "liquid-glass-surface-interactive flex-1 rounded-xl border py-2 text-xs font-semibold transition-all",
              tabId === tab
                ? "liquid-glass-button-chip-active text-gold"
                : "liquid-glass-button-chip text-t-muted hover:border-gold/20",
            )}
          >
            {TAB_CONFIG[tabId].label}
          </button>
        ))}
      </div>

      <GlassCard className="rounded-[1.6rem]">
        <div className="grid grid-cols-3 gap-2">
          <div className="liquid-glass-surface-muted rounded-[1rem] px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-t-muted">Kirim</p>
            <p className="mt-1 text-base font-bold text-success">+{summary.earned.toLocaleString()}</p>
            <p className="text-2xs text-t-muted">{summary.earnedCount} ta</p>
          </div>
          <div className="liquid-glass-surface-muted rounded-[1rem] px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-t-muted">Chiqim</p>
            <p className="mt-1 text-base font-bold text-danger">-{summary.spent.toLocaleString()}</p>
            <p className="text-2xs text-t-muted">{summary.spentCount} ta</p>
          </div>
          <div className="liquid-glass-surface-muted rounded-[1rem] px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-t-muted">Jami</p>
            <p className="mt-1 text-base font-bold text-t-primary">{totalItems}</p>
            <p className="text-2xs text-t-muted">operatsiya</p>
          </div>
        </div>
      </GlassCard>

      <MobileScreenSection className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="desktop-chip-row flex gap-2 pb-0.5 lg:flex-wrap lg:pb-0">
            {TYPE_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setTypeFilter(filter.id)}
                className={cn(
                  "liquid-glass-surface-interactive rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                  typeFilter === filter.id
                    ? "liquid-glass-button-chip-active text-gold"
                    : "liquid-glass-button-chip text-t-muted",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <Button variant="ghost" size="xs" loading={query.isFetching} onClick={() => query.refetch()}>
            <RefreshCcw className="h-3.5 w-3.5" />
            Yangilash
          </Button>
        </div>

        {query.isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : query.isError ? (
          <ErrorState variant="network" onRetry={() => query.refetch()} />
        ) : allItems.length === 0 ? (
          <EmptyState
            icon={tab === "coins" ? <Coins className="h-8 w-8" /> : <Star className="h-8 w-8" />}
            title={config.emptyTitle}
            description={config.emptyDescription}
          />
        ) : (
          <>
            <div className="desktop-cards-grid">
              {allItems.map((tx) => (
                <GlassCard key={tx.id} className="rounded-[1.45rem]">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                        tx.direction === "credit"
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-danger/30 bg-danger/10 text-danger",
                      )}
                    >
                      {tx.direction === "credit" ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-t-primary">
                          {mapDescription(tx.description)}
                        </p>
                        <Badge
                          variant={tx.direction === "credit" ? "success" : "danger"}
                          size="sm"
                          className="uppercase"
                        >
                          {tx.transactionType || (tx.direction === "credit" ? "earned" : "spent")}
                        </Badge>
                      </div>

                      <p className="mt-1 text-xs text-t-muted">{formatDateTime(tx.createdAt)}</p>

                      {tx.referenceId ? (
                        <p className="mt-1 text-2xs text-t-muted">Ref: {shortReference(tx.referenceId)}</p>
                      ) : null}
                    </div>

                    <div className="mt-0.5 flex shrink-0 items-center gap-1">
                      {tx.currency === "xp" ? (
                        <Star className="h-3.5 w-3.5 text-gold" />
                      ) : (
                        <CircleDollarSign className="h-3.5 w-3.5 text-info" />
                      )}
                      <span
                        className={cn(
                          "text-sm font-bold tabular-nums",
                          tx.direction === "credit" ? "text-success" : "text-danger",
                        )}
                      >
                        {tx.direction === "credit" ? "+" : "-"}
                        {tx.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

            <InfiniteScrollLoader
              sentinelRef={loadMoreRef}
              hasNextPage={query.hasNextPage}
              isFetchingNextPage={query.isFetchingNextPage}
            />
          </>
        )}
      </MobileScreenSection>
    </MobileScreen>
  );
};
