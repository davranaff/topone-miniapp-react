import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  CheckCircle2,
  Copy,
  CreditCard,
  RefreshCw,
  Star,
  Trash2,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { EmptyState } from "@/shared/ui/empty-state";
import { SegmentedTabs } from "@/shared/ui/segmented-tabs";
import { paymentApi } from "@/features/payment/api/payment.api";
import {
  referralKeys,
  useCreateReferralCheckout,
  useDeleteReferralCheckout,
  useMyReferralCheckoutRequests,
  useReferralHistory,
  useReferralLevels,
  useReferralStats,
} from "@/features/referrals/hooks/use-referrals";
import { cn } from "@/shared/lib/cn";
import type { ReferralCheckoutStatus } from "@/entities/referral/types";

type MainTab = "partners" | "withdraw";
type WithdrawMode = "card" | "subscription";

const MIN_WITHDRAW_AMOUNT = 300_000;

const formatMoney = (amount: number) => amount.toLocaleString("ru-RU");
const toStatus = (value?: string): ReferralCheckoutStatus => {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "approved") return "approved";
  if (normalized === "rejected") return "rejected";
  return "pending";
};
const getErrorText = (error: unknown) => (error instanceof Error ? error.message : "Xatolik yuz berdi");

export const ReferralsPage = () => {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>("partners");
  const [withdrawMode, setWithdrawMode] = useState<WithdrawMode>("card");
  const [statusFilter, setStatusFilter] = useState<"all" | ReferralCheckoutStatus>("all");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardFirstName, setCardFirstName] = useState("");
  const [cardLastName, setCardLastName] = useState("");
  const [amount, setAmount] = useState("");

  const stats = useReferralStats();
  const history = useReferralHistory();
  const levels = useReferralLevels();
  const checkoutRequests = useMyReferralCheckoutRequests(statusFilter === "all" ? undefined : statusFilter);
  const createCheckout = useCreateReferralCheckout();
  const deleteCheckout = useDeleteReferralCheckout();

  const activeSubscriptions = useQuery({
    queryKey: ["payment", "subscriptions", "active", "referral"],
    queryFn: () => paymentApi.getSubscriptions({ status: "active", page: 1, size: 20 }),
    staleTime: 30_000,
    enabled: mainTab === "withdraw" && withdrawMode === "subscription",
  });

  const plans = useQuery({
    queryKey: ["payment", "plans", "referral"],
    queryFn: () => paymentApi.getPlans(),
    staleTime: 60_000,
    enabled: mainTab === "withdraw" && withdrawMode === "subscription",
  });

  const payFromReferral = useMutation({
    mutationFn: (planId: string) => paymentApi.payFromReferralEarnings(planId),
    onSuccess: async () => {
      setSelectedPlanId(null);
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: referralKeys.stats() }),
        queryClient.invalidateQueries({ queryKey: ["payment", "subscriptions"] }),
      ]);
    },
  });

  const extendFromReferral = useMutation({
    mutationFn: () => paymentApi.extendFromReferralEarnings(),
    onSuccess: async () => {
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: referralKeys.stats() }),
        queryClient.invalidateQueries({ queryKey: ["payment", "subscriptions"] }),
      ]);
    },
  });

  const handleCopy = () => {
    if (stats.data?.referralUrl) {
      void navigator.clipboard.writeText(stats.data.referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isInitialLoading = stats.isLoading || history.isLoading || levels.isLoading;
  if (isInitialLoading && !stats.data) {
    return (
      <MobileScreen>
        <div className="h-8 w-1/3 rounded-xl bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
        <MobileScreenSection className="mt-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </MobileScreenSection>
      </MobileScreen>
    );
  }

  if (stats.isError) {
    return (
      <MobileScreen>
        <ErrorState variant="network" onRetry={() => stats.refetch()} />
      </MobileScreen>
    );
  }

  const data = stats.data!;
  const availableBalance = data.availableBalance > 0
    ? data.availableBalance
    : Math.max(0, data.totalCommissionEarned - data.approvedAmount);
  const historyItems = history.data ?? [];
  const levelItems = levels.data ?? [];
  const checkoutItems = checkoutRequests.data?.items ?? [];

  const planItems = (plans.data ?? []).filter((plan) => !plan.isTrial && plan.price > 0);

  const activeSubscriptionItems = (activeSubscriptions.data?.items ?? []).filter((item) => {
    return item.status.toLowerCase() === "active";
  });

  const submitCheckout = async () => {
    setCheckoutError(null);

    const sanitizedCardNumber = cardNumber.replace(/\D/g, "");
    if (sanitizedCardNumber.length !== 16) {
      setCheckoutError("Karta raqami 16 raqam bo'lishi kerak.");
      return;
    }

    if (cardFirstName.trim().length === 0 || cardLastName.trim().length === 0) {
      setCheckoutError("Ism va familiya kiritilishi shart.");
      return;
    }

    const numericAmount = Number(amount.replace(/\s+/g, "").replace(",", "."));
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setCheckoutError("To'g'ri summa kiriting.");
      return;
    }

    if (numericAmount < MIN_WITHDRAW_AMOUNT) {
      setCheckoutError(`Minimal summa: ${formatMoney(MIN_WITHDRAW_AMOUNT)} UZS.`);
      return;
    }

    if (numericAmount > availableBalance) {
      setCheckoutError("Yechib olish summasi mavjud balansdan katta.");
      return;
    }

    try {
      await createCheckout.mutateAsync({
        cardNumber: sanitizedCardNumber,
        cardOwnerFirstName: cardFirstName.trim(),
        cardOwnerLastName: cardLastName.trim(),
        amount: numericAmount,
      });
      setCardNumber("");
      setCardFirstName("");
      setCardLastName("");
      setAmount("");
      setCheckoutError(null);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "So'rov yuborilmadi.");
    }
  };

  const renderCheckoutStatus = (status: string) => {
    const normalized = toStatus(status);
    if (normalized === "approved") {
      return <Badge variant="success" size="sm">Tasdiqlangan</Badge>;
    }
    if (normalized === "rejected") {
      return <Badge variant="danger" size="sm">Rad etilgan</Badge>;
    }
    return <Badge variant="gold" size="sm">Kutilmoqda</Badge>;
  };

  return (
    <MobileScreen className="space-y-4 lg:space-y-5">
      <PageHeader title="Referallar" subtitle="Do'stlaringizni taklif qiling va bonus oling" backButton />

      <MobileScreenSection className="mt-4 space-y-4 lg:space-y-5">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <GlassCard className="text-center">
            <Users className="mx-auto h-5 w-5 text-gold mb-1" />
            <p className="text-lg font-bold text-t-primary">{data.totalReferrals}</p>
            <p className="text-2xs text-t-muted">Jami referallar</p>
          </GlassCard>
          <GlassCard className="text-center">
            <TrendingUp className="mx-auto h-5 w-5 text-success mb-1" />
            <p className="text-lg font-bold text-t-primary">{data.activeReferrals}</p>
            <p className="text-2xs text-t-muted">Faol</p>
          </GlassCard>
          <GlassCard className="text-center">
            <Wallet className="mx-auto h-5 w-5 text-info mb-1" />
            <p className="text-lg font-bold text-t-primary">{formatMoney(availableBalance)}</p>
            <p className="text-2xs text-t-muted">Balans</p>
          </GlassCard>
          <GlassCard className="text-center">
            <Award className="mx-auto h-5 w-5 text-gold mb-1" />
            <p className="text-lg font-bold text-t-primary">{formatMoney(data.totalEarnings)}</p>
            <p className="text-2xs text-t-muted">Jami daromad</p>
          </GlassCard>
        </div>

        <SegmentedTabs
          value={mainTab}
          onValueChange={(nextValue) => setMainTab(nextValue as MainTab)}
          variant="glass"
          tabs={[
            { value: "partners", label: "Hamkorlik", icon: <Users className="h-4 w-4" /> },
            { value: "withdraw", label: "Pul yechish", icon: <Wallet className="h-4 w-4" /> },
          ]}
        />

        {mainTab === "partners" ? (
          <>
            <GlassCard goldBorder>
              <p className="text-xs font-semibold uppercase tracking-wider text-t-muted mb-2">
                Sizning referal havolangiz
              </p>
              <div className="rounded-lg border border-border/60 bg-surface px-3 py-2">
                <p className="truncate text-sm font-mono text-gold">
                  {data.referralUrl || `https://t.me/TopOneBot?start=${data.referralCode}`}
                </p>
              </div>
              <Button
                fullWidth
                variant={copied ? "success" : "outline"}
                className="mt-3"
                onClick={handleCopy}
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Nusxa olindi!" : "Nusxa ko'chirish"}
              </Button>
            </GlassCard>

            <div className="desktop-two-col">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-t-muted">
                  Taklif qilinganlar ({historyItems.length})
                </p>
                {history.isError ? (
                  <GlassCard className="rounded-[1.2rem] border-danger/20">
                    <p className="text-sm text-t-secondary">Referral tarixini yuklab bo'lmadi.</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => history.refetch()}>
                      Qayta urinish
                    </Button>
                  </GlassCard>
                ) : historyItems.length === 0 ? (
                  <EmptyState
                    icon={<Users className="h-8 w-8" />}
                    title="Hali referal yo'q"
                    description="Do'stlaringizni taklif qiling va bonuslar oling."
                  />
                ) : (
                  <div className="space-y-2">
                    {historyItems.map((item) => (
                      <GlassCard key={item.id}>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/40 bg-elevated text-sm">
                            <UserRound className="h-4 w-4 text-t-muted" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-t-primary">@{item.username}</p>
                            <p className="text-xs text-t-muted">
                              {item.joinedAt ? new Date(item.joinedAt).toLocaleDateString("uz") : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={item.isActive ? "success" : "muted"} size="sm">
                              {item.isActive ? "Faol" : "Passiv"}
                            </Badge>
                            {item.earnedAmount > 0 && (
                              <span className="text-xs font-semibold text-gold">
                                +{formatMoney(item.earnedAmount)}
                              </span>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-t-muted">
                  Referal darajalari ({levelItems.length})
                </p>
                {levels.isError ? (
                  <GlassCard className="rounded-[1.2rem] border-danger/20">
                    <p className="text-sm text-t-secondary">Darajalarni yuklab bo'lmadi.</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => levels.refetch()}>
                      Qayta urinish
                    </Button>
                  </GlassCard>
                ) : levelItems.length === 0 ? (
                  <EmptyState
                    icon={<Award className="h-8 w-8" />}
                    title="Darajalar topilmadi"
                    description="Referral level ma'lumotlari keyinroq paydo bo'lishi mumkin."
                  />
                ) : (
                  <div className="space-y-2">
                    {levelItems.map((level) => {
                      const unlocked = level.isUnlocked || data.totalReferrals >= level.minReferrals;

                      return (
                        <GlassCard key={level.id || `${level.level}-${level.minReferrals}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-t-primary">{level.name || `Level ${level.level}`}</p>
                              <p className="text-xs text-t-muted">
                                {level.minReferrals}+ referral • {level.rewardPercentage}% bonus
                              </p>
                            </div>
                            <Badge variant={unlocked ? "success" : "muted"} size="sm">
                              {unlocked ? "Ochilgan" : "Yopiq"}
                            </Badge>
                          </div>
                        </GlassCard>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <SegmentedTabs
              value={withdrawMode}
              onValueChange={(nextValue) => setWithdrawMode(nextValue as WithdrawMode)}
              variant="pill"
              tabs={[
                { value: "card", label: "Kartaga", icon: <CreditCard className="h-4 w-4" /> },
                { value: "subscription", label: "Tarifga", icon: <Star className="h-4 w-4" /> },
              ]}
            />

            {withdrawMode === "card" ? (
              <GlassCard className="space-y-3 rounded-[1.3rem]">
                <div className="rounded-xl border border-gold/20 bg-gold/10 px-3 py-2 text-sm text-gold">
                  Mavjud balans: {formatMoney(availableBalance)} UZS
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    value={cardFirstName}
                    onChange={(event) => setCardFirstName(event.target.value)}
                    className="rounded-xl border border-border/50 bg-surface px-3 py-2 text-sm text-t-primary outline-none focus:border-gold/40"
                    placeholder="Ism"
                  />
                  <input
                    value={cardLastName}
                    onChange={(event) => setCardLastName(event.target.value)}
                    className="rounded-xl border border-border/50 bg-surface px-3 py-2 text-sm text-t-primary outline-none focus:border-gold/40"
                    placeholder="Familiya"
                  />
                </div>
                <input
                  value={cardNumber}
                  onChange={(event) => setCardNumber(event.target.value)}
                  className="w-full rounded-xl border border-border/50 bg-surface px-3 py-2 text-sm text-t-primary outline-none focus:border-gold/40"
                  placeholder="Karta raqami (16 raqam)"
                  inputMode="numeric"
                />
                <input
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full rounded-xl border border-border/50 bg-surface px-3 py-2 text-sm text-t-primary outline-none focus:border-gold/40"
                  placeholder={`Summa (min ${formatMoney(MIN_WITHDRAW_AMOUNT)})`}
                  inputMode="decimal"
                />
                {(checkoutError || createCheckout.error) && (
                  <p className="text-xs text-danger">
                    {checkoutError || getErrorText(createCheckout.error)}
                  </p>
                )}
                <Button
                  fullWidth
                  onClick={submitCheckout}
                  loading={createCheckout.isPending}
                >
                  So'rov yuborish
                </Button>
              </GlassCard>
            ) : (
              <GlassCard className="space-y-3 rounded-[1.3rem]">
                <div className="rounded-xl border border-gold/20 bg-gold/10 px-3 py-2 text-sm text-gold">
                  Mavjud referral balans: {formatMoney(availableBalance)} UZS
                </div>

                <p className="text-xs font-semibold uppercase tracking-wider text-t-muted">
                  Joriy obunalar
                </p>
                {activeSubscriptions.isLoading ? (
                  <SkeletonCard />
                ) : activeSubscriptionItems.length === 0 ? (
                  <p className="text-sm text-t-secondary">Faol obuna topilmadi.</p>
                ) : (
                  <div className="space-y-2">
                    {activeSubscriptionItems.map((subscription) => {
                      const isTrial = Boolean(subscription.plan?.isTrial || subscription.amount <= 0);
                      return (
                        <div key={subscription.id} className="rounded-xl border border-border/50 bg-surface px-3 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-t-primary">
                                {subscription.plan?.name || "Active plan"}
                              </p>
                              <p className="text-xs text-t-muted">
                                {subscription.subscriptionEndDate
                                  ? `Tugash: ${new Date(subscription.subscriptionEndDate).toLocaleDateString("uz")}`
                                  : "Tugash sanasi yo'q"}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isTrial || extendFromReferral.isPending}
                              loading={extendFromReferral.isPending}
                              onClick={() => extendFromReferral.mutate()}
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              Uzaytirish
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <p className="pt-1 text-xs font-semibold uppercase tracking-wider text-t-muted">
                  Tariflar (referral balansdan sotib olish)
                </p>
                {plans.isLoading ? (
                  <SkeletonCard />
                ) : planItems.length === 0 ? (
                  <p className="text-sm text-t-secondary">Tariflar topilmadi.</p>
                ) : (
                  <div className="space-y-2">
                    {planItems.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlanId((prev) => (prev === plan.id ? null : plan.id))}
                        className={cn(
                          "w-full rounded-xl border px-3 py-3 text-left transition",
                          selectedPlanId === plan.id
                            ? "border-gold/45 bg-gold/10"
                            : "border-border/50 bg-surface",
                        )}
                      >
                        <p className="text-sm font-semibold text-t-primary">{plan.name}</p>
                        <p className="text-xs text-t-muted">
                          {formatMoney(plan.price)} {plan.currency} • {plan.durationMonths} oy
                        </p>
                      </button>
                    ))}
                    <Button
                      fullWidth
                      disabled={!selectedPlanId}
                      loading={payFromReferral.isPending}
                      onClick={() => {
                        if (!selectedPlanId) return;
                        payFromReferral.mutate(selectedPlanId);
                      }}
                    >
                      Tanlangan tarifni olish
                    </Button>
                    {payFromReferral.error && (
                      <p className="text-xs text-danger">{getErrorText(payFromReferral.error)}</p>
                    )}
                    {extendFromReferral.error && (
                      <p className="text-xs text-danger">{getErrorText(extendFromReferral.error)}</p>
                    )}
                  </div>
                )}
              </GlassCard>
            )}

            <div>
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-t-muted">
                  Mening so'rovlarim ({checkoutItems.length})
                </p>
                <div className="flex items-center gap-1">
                  {(["all", "pending", "approved", "rejected"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-2xs font-semibold transition",
                        statusFilter === status
                          ? "border border-gold/35 bg-gold/15 text-gold"
                          : "border border-border/45 bg-surface text-t-muted",
                      )}
                    >
                      {status === "all" ? "Barchasi" : status}
                    </button>
                  ))}
                </div>
              </div>

              {checkoutRequests.isLoading ? (
                <SkeletonCard />
              ) : checkoutRequests.isError ? (
                <GlassCard className="rounded-[1.2rem] border-danger/20">
                  <p className="text-sm text-t-secondary">So'rovlar yuklanmadi.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => checkoutRequests.refetch()}
                  >
                    Qayta urinish
                  </Button>
                </GlassCard>
              ) : checkoutItems.length === 0 ? (
                <EmptyState
                  icon={<Wallet className="h-8 w-8" />}
                  title="So'rovlar yo'q"
                  description="Yuborilgan yechib olish so'rovlari shu yerda chiqadi."
                />
              ) : (
                <div className="desktop-cards-grid">
                  {checkoutItems.map((item) => {
                    const status = toStatus(item.status);
                    const canDelete = status === "pending";
                    return (
                      <GlassCard key={item.id}>
                        <div className="flex items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-t-primary">
                              {item.cardOwnerFirstName} {item.cardOwnerLastName}
                            </p>
                            <p className="text-xs text-t-muted">
                              {item.cardNumber} • {formatMoney(item.amount)} UZS
                            </p>
                            {item.createdAt && (
                              <p className="text-2xs text-t-muted">
                                {new Date(item.createdAt).toLocaleString("uz")}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {renderCheckoutStatus(item.status)}
                            {canDelete && (
                              <button
                                type="button"
                                aria-label="Delete request"
                                onClick={() => deleteCheckout.mutate(item.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-full border border-danger/40 bg-danger/10 text-danger transition hover:bg-danger/20"
                              >
                                {deleteCheckout.isPending ? (
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </MobileScreenSection>
    </MobileScreen>
  );
};
