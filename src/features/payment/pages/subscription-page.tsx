import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, CheckCircle2, CreditCard, RefreshCw, Star, WalletCards } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/features/auth/api/auth.api";
import { paymentApi } from "@/features/payment/api/payment.api";
import { refreshPaymentSession } from "@/features/payment/lib/payment-session";
import type { SubscriptionPlan } from "@/entities/payment/types";
import { formatDate } from "@/shared/lib/date";
import { cn } from "@/shared/lib/cn";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";

const formatMoney = (value: number, currency: string) => {
  return `${value.toLocaleString("ru-RU")} ${currency}`;
};

const isActiveStatus = (status?: string) => status?.toLowerCase() === "active";

const isSubscriptionStillActive = (endDate?: string) => {
  if (!endDate) {
    return true;
  }

  const parsed = new Date(endDate);
  if (Number.isNaN(parsed.getTime())) {
    return true;
  }

  return parsed.getTime() > Date.now();
};

const isTrialPlan = (plan: SubscriptionPlan) => Boolean(plan.isTrial || plan.price <= 0);

const sortPlans = (plans: SubscriptionPlan[]) => {
  return [...plans].sort((a, b) => {
    if (a.durationMonths === 1 && b.durationMonths !== 1) return -1;
    if (a.durationMonths !== 1 && b.durationMonths === 1) return 1;
    return a.price - b.price;
  });
};

const splitDescription = (description?: string) => {
  if (!description?.trim()) {
    return ["Barcha kurslar va premium imkoniyatlar ochiladi."];
  }

  return description
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .split(/\n|•|,|;|\./g)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
};

const CurrentSubscriptionCard = ({
  planName,
  endDate,
  paymentMethod,
  isTrial,
  autoRenew,
}: {
  planName: string;
  endDate?: string;
  paymentMethod?: string;
  isTrial?: boolean;
  autoRenew?: boolean;
}) => (
  <GlassCard goldBorder glow className="overflow-hidden rounded-[1.75rem]">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,208,106,0.16),transparent_45%)]" />
    <div className="relative space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/75">
            Joriy obuna
          </p>
          <h2 className="mt-1 text-2xl font-bold text-t-primary">
            {planName}
          </h2>
        </div>
        <Badge variant={isTrial ? "info" : "success"}>
          {isTrial ? "Free trial" : "Faol"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-t-muted">
            <CalendarDays className="h-3.5 w-3.5" />
            Amal qilish muddati
          </div>
          <p className="mt-1 text-sm font-semibold text-t-primary">
            {formatDate(endDate, "uz-UZ")}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-t-muted">
            <WalletCards className="h-3.5 w-3.5" />
            To'lov usuli
          </div>
          <p className="mt-1 text-sm font-semibold text-t-primary">
            {paymentMethod || (isTrial ? "Bepul aktivatsiya" : "—")}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gold/15 bg-gold/10 px-4 py-3 text-sm text-[#f4e5bb]">
        {isTrial
          ? "Sizning free trial rejangiz faol. Trial rejani qayta sotib olish ko'rsatilmaydi."
          : autoRenew
            ? "Joriy tarifni uzaytirish uchun shu rejani tanlang."
            : "Faol pullik tarif mavjud. Shu reja uchun tugma uzaytirish holatida ko'rsatiladi."}
      </div>
    </div>
  </GlassCard>
);

const PlanCard = ({
  plan,
  isCurrentPlan,
  hasActiveSubscription,
  loading,
  onSelect,
}: {
  plan: SubscriptionPlan;
  isCurrentPlan: boolean;
  hasActiveSubscription: boolean;
  loading: boolean;
  onSelect: () => void;
}) => {
  const trial = isTrialPlan(plan);
  const monthlyEquivalent = plan.durationMonths > 0 ? plan.price / plan.durationMonths : plan.price;
  const features = splitDescription(plan.description);

  return (
    <GlassCard
      goldBorder={isCurrentPlan}
      glow={isCurrentPlan}
      className={cn(
        "rounded-[1.75rem] p-5",
        isCurrentPlan && "border-emerald-400/40 shadow-[0_24px_48px_rgba(16,185,129,0.12)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-bold text-t-primary">
            {plan.name || `${plan.durationMonths} oy`}
          </p>
          <p className="mt-1 text-xs text-t-muted">
            {plan.durationMonths >= 12
              ? `${plan.durationMonths} oy`
              : `${plan.durationMonths} oylik tarif`}
          </p>
        </div>

        {isCurrentPlan ? (
          <Badge variant={trial ? "info" : "success"}>Joriy</Badge>
        ) : trial ? (
          <Badge variant="gold">Trial</Badge>
        ) : hasActiveSubscription ? (
          <Badge variant="muted">Premium</Badge>
        ) : null}
      </div>

      <div className="mt-5 flex items-end gap-2">
        <span className="text-3xl font-black tracking-[-0.05em] text-white">
          {trial ? "Bepul" : formatMoney(plan.price, plan.currency)}
        </span>
      </div>

      {!trial && plan.durationMonths > 1 ? (
        <div className="mt-3 inline-flex rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs font-semibold text-[#f3dea3]">
          ≈ {formatMoney(monthlyEquivalent, plan.currency)} / oy
        </div>
      ) : null}

      <div className="mt-4 space-y-2">
        {features.map((feature) => (
          <div key={feature} className="flex items-start gap-2 text-sm text-t-secondary">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <Button
        fullWidth
        size="xl"
        variant={isCurrentPlan && !trial ? "success" : trial ? "secondary" : "primary"}
        className="mt-5"
        loading={loading}
        disabled={isCurrentPlan && trial}
        onClick={onSelect}
      >
        {isCurrentPlan && !trial ? (
          <>
            <RefreshCw className="h-4 w-4" />
            Uzaytirish
          </>
        ) : trial ? (
          <>
            <Star className="h-4 w-4" />
            {isCurrentPlan ? "Joriy reja" : "Bepul boshlash"}
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            Sotib olish
          </>
        )}
      </Button>
    </GlassCard>
  );
};

export const SubscriptionPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const subscriptionStatus = useQuery({
    queryKey: ["auth", "subscription-status"],
    queryFn: () => authApi.getSubscriptionStatus(),
    staleTime: 60_000,
  });

  const activeSubscriptions = useQuery({
    queryKey: ["payment", "subscriptions", "active"],
    queryFn: () => paymentApi.getSubscriptions({ status: "active", page: 1, size: 20 }),
    staleTime: 60_000,
  });

  const plans = useQuery({
    queryKey: ["payment", "plans"],
    queryFn: () => paymentApi.getPlans(),
    staleTime: 5 * 60_000,
  });

  const freePlanMutation = useMutation({
    mutationFn: (planId: string) => paymentApi.subscribeToFreePlan(planId),
    onSuccess: async () => {
      await Promise.allSettled([
        refreshPaymentSession(),
        queryClient.invalidateQueries({ queryKey: ["auth", "subscription-status"] }),
        queryClient.invalidateQueries({ queryKey: ["payment"] }),
        queryClient.invalidateQueries({ queryKey: ["home"] }),
      ]);
    },
  });

  const sortedPlans = sortPlans(plans.data ?? []);
  const currentStatus = subscriptionStatus.data;
  const activeSubscriptionFromList = activeSubscriptions.data?.items.find(
    (item) => isActiveStatus(item.status) && isSubscriptionStillActive(item.subscriptionEndDate),
  );
  const currentPlanId = currentStatus?.planId ?? activeSubscriptionFromList?.plan?.id ?? null;
  const hasActiveSubscription = Boolean(
    (currentStatus?.subscribed && isActiveStatus(currentStatus.status)) ||
    activeSubscriptionFromList,
  );
  const currentPlanIsTrial = Boolean(
    currentStatus?.planIsTrial ||
    activeSubscriptionFromList?.plan?.isTrial ||
    (currentStatus?.subscribed && (currentStatus?.amount ?? 0) <= 0),
  );
  const visiblePlans = sortedPlans.filter((plan) => {
    if (!hasActiveSubscription || currentPlanIsTrial) {
      return true;
    }

    return !isTrialPlan(plan);
  });

  const handlePlanAction = (plan: SubscriptionPlan) => {
    const isCurrentPlan = currentPlanId === plan.id && hasActiveSubscription;

    if (isCurrentPlan && isTrialPlan(plan)) {
      return;
    }

    if (isTrialPlan(plan)) {
      freePlanMutation.mutate(plan.id);
      return;
    }

    navigate(`/payment-methods?planId=${encodeURIComponent(plan.id)}&extend=${hasActiveSubscription ? "1" : "0"}`, {
      state: {
        plan,
        isExtend: hasActiveSubscription,
      },
    });
  };

  const pageError = plans.error ?? subscriptionStatus.error ?? activeSubscriptions.error;

  if (plans.isLoading && !plans.data) {
    return (
      <MobileScreen className="space-y-4 lg:space-y-5">
        <div className="h-8 w-1/3 rounded-xl bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
        <MobileScreenSection className="mt-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </MobileScreenSection>
      </MobileScreen>
    );
  }

  if (pageError && !plans.data?.length) {
    return (
      <MobileScreen className="space-y-4 lg:space-y-5">
        <ErrorState variant="network" onRetry={() => {
          void Promise.allSettled([
            plans.refetch(),
            subscriptionStatus.refetch(),
            activeSubscriptions.refetch(),
          ]);
        }} />
      </MobileScreen>
    );
  }

  return (
    <MobileScreen className="space-y-4 lg:space-y-5">
      <PageHeader
        title="Premium obuna"
        subtitle="Flutter flow kabi joriy tarif, trial va uzaytirish holatlari bilan"
        backButton
      />

      {freePlanMutation.isError ? (
        <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          Free trialni faollashtirib bo'lmadi. Trial allaqachon ishlatilgan bo'lishi mumkin.
        </div>
      ) : null}

      {(currentStatus?.subscribed && (currentStatus.planName || activeSubscriptionFromList?.plan?.name)) ? (
        <div className="mt-4 xl:max-w-[46rem]">
          <CurrentSubscriptionCard
            planName={currentStatus.planName ?? activeSubscriptionFromList?.plan?.name ?? "Premium"}
            endDate={currentStatus.subscriptionEndDate ?? activeSubscriptionFromList?.subscriptionEndDate}
            paymentMethod={currentStatus.paymentMethod ?? activeSubscriptionFromList?.paymentMethodTitle}
            isTrial={currentPlanIsTrial || activeSubscriptionFromList?.plan?.isTrial}
            autoRenew={currentStatus.autoRenew ?? activeSubscriptionFromList?.autoRenew}
          />
        </div>
      ) : null}

      <div className="mt-5 rounded-[1.75rem] border border-gold/10 bg-[linear-gradient(180deg,rgba(242,208,106,0.1),rgba(18,18,18,0.2))] px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/20 bg-gold/15 text-gold">
            <Star className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-t-primary">
              Tariflar backenddan olinadi
            </p>
            <p className="mt-1 text-sm text-t-muted">
              Trial reja joriy bo'lsa, u qayta sotib olishga chiqmaydi. Joriy pullik tarif esa uzaytirish holatida ko'rsatiladi.
            </p>
          </div>
        </div>
      </div>

      <MobileScreenSection className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {visiblePlans.map((plan) => {
          const isCurrentPlan = currentPlanId === plan.id && hasActiveSubscription;
          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={isCurrentPlan}
              hasActiveSubscription={hasActiveSubscription}
              loading={
                freePlanMutation.isPending &&
                freePlanMutation.variables === plan.id
              }
              onSelect={() => handlePlanAction(plan)}
            />
          );
        })}
      </MobileScreenSection>

      <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-t-muted xl:max-w-[54rem]">
        <div className="flex items-center gap-2 font-semibold text-t-primary">
          <ArrowRight className="h-4 w-4 text-gold" />
          To'lov oqimi
        </div>
        <p className="mt-2">
          Tarif tanlash → to'lov usuli → kutish ekrani → muvaffaqiyatli yakun. Bu oqim endi Flutter dagi payment flow ga yaqinlashtirilgan.
        </p>
      </div>
    </MobileScreen>
  );
};
