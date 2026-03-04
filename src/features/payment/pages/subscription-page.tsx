import { useState } from "react";
import { CreditCard, CheckCircle2, ExternalLink, Loader2, XCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/error-state";
import { usePaymentPlans } from "@/features/payment/hooks/use-payment-plans";
import { paymentApi } from "@/features/payment/api/payment.api";
import type { SubscriptionPlan, PaymentLink } from "@/entities/payment/types";
import { cn } from "@/shared/lib/cn";

const PROVIDER_LABELS: Record<string, string> = {
  click: "Click",
  payme: "Payme",
  tribute: "Tribute",
};

const PlanCard = ({
  plan,
  recommended,
  onSelect,
  loading,
}: {
  plan: SubscriptionPlan;
  recommended?: boolean;
  onSelect: () => void;
  loading?: boolean;
}) => (
  <GlassCard goldBorder={recommended}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-base font-bold text-t-primary">
          {plan.durationMonths} {plan.durationMonths === 1 ? "oy" : plan.durationMonths === 6 ? "oy" : "oy"}
        </p>
        <p className="mt-1">
          <span className="text-xl font-bold text-gold">{plan.price.toLocaleString()}</span>{" "}
          <span className="text-xs text-t-muted">{plan.currency}</span>
        </p>
      </div>
      {recommended && <Badge variant="gold" size="sm">Tavsiya</Badge>}
    </div>

    {plan.description && (
      <p className="mt-2 text-xs text-t-muted">{plan.description}</p>
    )}

    <div className="mt-3 space-y-1">
      <p className="flex items-center gap-2 text-xs text-t-secondary">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-gold" />
        Barcha kurslar
      </p>
      <p className="flex items-center gap-2 text-xs text-t-secondary">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-gold" />
        Challenjlar va quizlar
      </p>
      <p className="flex items-center gap-2 text-xs text-t-secondary">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-gold" />
        Premium badge
      </p>
    </div>

    <Button
      fullWidth
      variant={recommended ? "primary" : "outline"}
      className="mt-4"
      onClick={onSelect}
      loading={loading}
    >
      <CreditCard className="h-4 w-4" />
      To'lash
    </Button>
  </GlassCard>
);

const PaymentLinksModal = ({
  links,
  onClose,
}: {
  links: PaymentLink[];
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
    <GlassCard className="w-full max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-base font-bold text-t-primary">To'lov usulini tanlang</p>
        <button onClick={onClose} className="text-t-muted hover:text-t-primary transition-colors">
          <XCircle className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-2">
        {links.map((link) => (
          <a
            key={link.provider}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-elevated px-4 py-3",
              "transition-all hover:border-gold/40 hover:bg-elevated/80",
            )}
          >
            <span className="text-sm font-semibold text-t-primary">
              {PROVIDER_LABELS[link.provider] ?? link.label}
            </span>
            <ExternalLink className="h-4 w-4 text-t-muted" />
          </a>
        ))}
      </div>

      <Button fullWidth variant="ghost" size="sm" className="mt-4" onClick={onClose}>
        Bekor qilish
      </Button>
    </GlassCard>
  </div>
);

export const SubscriptionPage = () => {
  const plans = usePaymentPlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[] | null>(null);

  const createInvoice = useMutation({
    mutationFn: async (planId: string) => {
      const invoice = await paymentApi.createInvoice(planId);
      const { links } = await paymentApi.getInvoiceLinks(invoice.id);
      return links;
    },
    onSuccess: (links) => {
      setPaymentLinks(links);
    },
  });

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    createInvoice.mutate(planId);
  };

  if (plans.isLoading) {
    return (
      <MobileScreen>
        <div className="h-8 w-1/3 rounded-xl bg-elevated animate-shimmer bg-shimmer bg-[length:200%_100%]" />
        <MobileScreenSection className="mt-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </MobileScreenSection>
      </MobileScreen>
    );
  }

  if (plans.isError) {
    return (
      <MobileScreen>
        <ErrorState variant="network" onRetry={() => plans.refetch()} />
      </MobileScreen>
    );
  }

  const items = plans.data ?? [];

  return (
    <MobileScreen>
      <PageHeader title="Obuna" subtitle="Premium imkoniyatlarga ega bo'ling" backButton />

      {createInvoice.isError && (
        <div className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          Xato yuz berdi. Qayta urinib ko'ring.
        </div>
      )}

      <MobileScreenSection className="mt-4">
        {items.map((plan, i) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            recommended={i === 1}
            onSelect={() => handleSelectPlan(plan.id)}
            loading={createInvoice.isPending && selectedPlanId === plan.id}
          />
        ))}
      </MobileScreenSection>

      {paymentLinks && (
        <PaymentLinksModal
          links={paymentLinks}
          onClose={() => {
            setPaymentLinks(null);
            setSelectedPlanId(null);
          }}
        />
      )}
    </MobileScreen>
  );
};
