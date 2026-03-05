import { useState } from "react";
import { ArrowRight, CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { paymentApi } from "@/features/payment/api/payment.api";
import { buildPaymentSuccessReturnUrl, storePaymentLink } from "@/features/payment/lib/payment-session";
import type { PaymentLink, SubscriptionPlan } from "@/entities/payment/types";
import { usePaymentPlans } from "@/features/payment/hooks/use-payment-plans";
import { cn } from "@/shared/lib/cn";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ErrorState } from "@/shared/ui/error-state";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { PaymentProviderLogo } from "@/shared/ui/payment-provider-logo";

type PaymentMethodMeta = {
  provider: string;
  title: string;
  description: string;
  badge?: string;
};

type PaymentMethodLocationState = {
  plan?: SubscriptionPlan;
  isExtend?: boolean;
};

const PAYMENT_METHODS: PaymentMethodMeta[] = [
  {
    provider: "click",
    title: "Click",
    description: "Uzcard va Humo orqali tezkor to'lov",
    badge: "UZS",
  },
  {
    provider: "payme",
    title: "Payme",
    description: "Kartalar bilan qulay checkout sahifasi",
    badge: "UZS",
  },
  {
    provider: "tribute",
    title: "Tribute",
    description: "Telegram ichidagi to'lov oqimi",
    badge: "TG",
  },
];

const findMatchingLink = (links: PaymentLink[], provider: string) => {
  return links.find((item) => item.provider.trim().toLowerCase() === provider.trim().toLowerCase());
};

export const PaymentMethodsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { data, isLoading, isError, refetch } = usePaymentPlans();

  const locationState = (location.state ?? null) as PaymentMethodLocationState | null;
  const [selectedProvider, setSelectedProvider] = useState<string>("click");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const planId = searchParams.get("planId") ?? locationState?.plan?.id ?? "";
  const isExtend = searchParams.get("extend") === "1" || locationState?.isExtend === true;

  const plan =
    (locationState?.plan && locationState.plan.id === planId
      ? locationState.plan
      : null) ??
    (data ?? []).find((item) => item.id === planId) ??
    null;

  const selectedMethod = PAYMENT_METHODS.find((item) => item.provider === selectedProvider) ?? PAYMENT_METHODS[0];

  const handleSubmit = async () => {
    if (!plan) {
      setErrorText("Tarif topilmadi.");
      return;
    }

    setIsSubmitting(true);
    setErrorText(null);

    try {
      const createdInvoice = await paymentApi.createInvoiceWithLinks(plan.id);

      if (!createdInvoice.invoiceId) {
        throw new Error("Invoice yaratilmagan.");
      }

      const returnUrl = buildPaymentSuccessReturnUrl(createdInvoice.invoiceId);
      const invoiceResult = await paymentApi.getInvoiceLinks(createdInvoice.invoiceId, returnUrl);

      const matchingLink = findMatchingLink(invoiceResult.links, selectedProvider);

      if (!matchingLink?.url) {
        throw new Error("Tanlangan to'lov tizimi uchun havola qaytmadi.");
      }

      storePaymentLink(invoiceResult.invoiceId, matchingLink.url);

      navigate(
        `/payment-waiting?invoiceId=${encodeURIComponent(invoiceResult.invoiceId)}&planId=${encodeURIComponent(plan.id)}&provider=${encodeURIComponent(selectedProvider)}`,
        {
          state: {
            invoiceId: invoiceResult.invoiceId,
            planId: plan.id,
            planName: plan.name || `${plan.durationMonths} oy`,
            paymentMethod: selectedMethod.title,
            provider: selectedProvider,
            paymentUrl: matchingLink.url,
          },
        },
      );
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "To'lov sahifasini ochib bo'lmadi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <MobileScreen className="space-y-4 lg:space-y-5">
        <PageHeader title="To'lov usuli" subtitle="Tarif uchun usul tanlanmoqda" backButton />
        <div className="mt-4 space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </MobileScreen>
    );
  }

  if (isError || !plan) {
    return (
      <MobileScreen className="space-y-4 lg:space-y-5">
        <PageHeader title="To'lov usuli" subtitle="Tarifni qayta tanlang" backButton />
        <div className="mt-4">
          <ErrorState variant="network" onRetry={() => void refetch()} />
        </div>
      </MobileScreen>
    );
  }

  const formattedPrice = plan.price > 0
    ? `${plan.price.toLocaleString("ru-RU")} ${plan.currency}`
    : "Bepul";

  return (
    <MobileScreen className="space-y-4 lg:space-y-5">
      <PageHeader
        title="To'lov usuli"
        subtitle={isExtend ? "Joriy tarifni uzaytirish" : "Tanlangan tarif uchun to'lov"}
        backButton
      />

      <div className="mt-4">
        <GlassCard goldBorder glow className="rounded-[1.75rem]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold/70">
                Tanlangan tarif
              </p>
              <h2 className="mt-1 text-2xl font-bold text-t-primary">
                {plan.name}
              </h2>
            </div>
            <Badge variant={isExtend ? "success" : "gold"}>
              {isExtend ? "Uzaytirish" : "Yangi obuna"}
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs text-t-muted">Narx</p>
              <p className="mt-1 text-lg font-bold text-white">{formattedPrice}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs text-t-muted">Davomiyligi</p>
              <p className="mt-1 text-lg font-bold text-white">{plan.durationMonths} oy</p>
            </div>
          </div>

          {plan.description ? (
            <p className="mt-4 text-sm leading-6 text-t-muted">
              {plan.description.replace(/<[^>]+>/g, " ")}
            </p>
          ) : null}
        </GlassCard>
      </div>

      {errorText ? (
        <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {errorText}
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
        {PAYMENT_METHODS.map((method) => {
          const selected = selectedProvider === method.provider;

          return (
            <button
              key={method.provider}
              type="button"
              onClick={() => setSelectedProvider(method.provider)}
              className={cn(
                "block w-full rounded-[1.6rem] text-left transition-transform duration-200",
                selected && "translate-y-[-1px]",
              )}
            >
              <GlassCard
                goldBorder={selected}
                className={cn(
                  "rounded-[1.6rem] p-4",
                  selected && "border-gold/40 bg-[linear-gradient(180deg,rgba(242,208,106,0.12),rgba(16,16,16,0.86))]",
                )}
              >
                <div className="flex items-center gap-4">
                  <PaymentProviderLogo provider={method.provider} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-t-primary">
                        {method.title}
                      </p>
                      {method.badge ? <Badge variant="muted" size="sm">{method.badge}</Badge> : null}
                    </div>
                    <p className="mt-1 text-sm text-t-muted">
                      {method.description}
                    </p>
                  </div>
                  {selected ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/30 bg-gold/15 text-gold">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  ) : (
                    <ArrowRight className="h-4 w-4 text-t-muted" />
                  )}
                </div>
              </GlassCard>
            </button>
          );
        })}
      </div>

      <div className="mt-5 xl:max-w-[44rem]">
        <GlassCard className="rounded-[1.6rem] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-gold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-t-primary">
                Xavfsiz checkout
              </p>
              <p className="mt-1 text-sm text-t-muted">
                To'lov sahifasi alohida oynada ochiladi, asosiy ilova esa kutish ekranida qoladi.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="mt-5 xl:max-w-[30rem]">
        <Button
          fullWidth
          size="xl"
          onClick={handleSubmit}
          loading={isSubmitting}
        >
          <CreditCard className="h-4 w-4" />
          {selectedMethod.title} orqali davom etish
        </Button>
      </div>
    </MobileScreen>
  );
};
