import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, ExternalLink, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { paymentApi } from "@/features/payment/api/payment.api";
import { clearPaymentLink, readPaymentLink, refreshPaymentSession } from "@/features/payment/lib/payment-session";
import type { InvoiceStatus } from "@/entities/payment/types";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { PaymentProviderLogo } from "@/shared/ui/payment-provider-logo";

type WaitingLocationState = {
  invoiceId?: string;
  planId?: string;
  planName?: string;
  paymentMethod?: string;
  provider?: string;
  paymentUrl?: string;
};

export const PaymentWaitingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const locationState = (location.state ?? null) as WaitingLocationState | null;

  const invoiceId = searchParams.get("invoiceId") ?? locationState?.invoiceId ?? "";
  const planId = searchParams.get("planId") ?? locationState?.planId ?? "";
  const provider = searchParams.get("provider") ?? locationState?.provider ?? "";
  const paymentMethod = locationState?.paymentMethod ?? provider.toUpperCase();
  const planName = locationState?.planName ?? "Premium";

  const paymentUrl = locationState?.paymentUrl ?? readPaymentLink(invoiceId) ?? undefined;

  const [statusData, setStatusData] = useState<InvoiceStatus | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (!invoiceId) {
      setErrorText("Invoice topilmadi. To'lovni qayta boshlang.");
      return;
    }

    let active = true;

    const syncPaidState = async (nextStatus: InvoiceStatus) => {
      clearPaymentLink(invoiceId);

      await Promise.allSettled([
        refreshPaymentSession(),
        queryClient.invalidateQueries({ queryKey: ["auth", "subscription-status"] }),
        queryClient.invalidateQueries({ queryKey: ["payment"] }),
        queryClient.invalidateQueries({ queryKey: ["home"] }),
      ]);

      if (!active) {
        return;
      }

      navigate(
        `/payment-success?invoiceId=${encodeURIComponent(nextStatus.invoiceId)}`,
        {
          replace: true,
          state: {
            invoiceStatus: nextStatus,
            paymentMethod,
            provider,
            planName: nextStatus.planName ?? planName,
            planId,
          },
        },
      );
    };

    const pollOnce = async () => {
      try {
        const nextStatus = await paymentApi.getInvoiceStatus(invoiceId);

        if (!active) {
          return;
        }

        setStatusData(nextStatus);

        if (nextStatus.status === "paid") {
          await syncPaidState(nextStatus);
          return;
        }

        if (nextStatus.status === "canceled" || nextStatus.status === "expired") {
          setErrorText("To'lov bekor qilingan yoki invoice muddati tugagan.");
        }
      } catch {
        return;
      }
    };

    void pollOnce();

    const pollId = window.setInterval(() => {
      void pollOnce();
    }, 3000);

    const elapsedId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => {
      active = false;
      window.clearInterval(pollId);
      window.clearInterval(elapsedId);
    };
  }, [invoiceId, navigate, paymentMethod, planId, planName, provider, queryClient]);

  const handleManualCheck = async () => {
    if (!invoiceId || isChecking) {
      return;
    }

    setIsChecking(true);
    setErrorText(null);

    try {
      const nextStatus = await paymentApi.getInvoiceStatus(invoiceId);
      setStatusData(nextStatus);

      if (nextStatus.status === "paid") {
        clearPaymentLink(invoiceId);

        await Promise.allSettled([
          refreshPaymentSession(),
          queryClient.invalidateQueries({ queryKey: ["auth", "subscription-status"] }),
          queryClient.invalidateQueries({ queryKey: ["payment"] }),
          queryClient.invalidateQueries({ queryKey: ["home"] }),
        ]);

        navigate(
          `/payment-success?invoiceId=${encodeURIComponent(nextStatus.invoiceId)}`,
          {
            replace: true,
            state: {
              invoiceStatus: nextStatus,
              paymentMethod,
              provider,
              planName: nextStatus.planName ?? planName,
              planId,
            },
          },
        );
        return;
      }

      if (nextStatus.status === "canceled" || nextStatus.status === "expired") {
        setErrorText("To'lov yakunlanmagan. Qayta to'lovni oching yoki orqaga qayting.");
        return;
      }

      setErrorText("To'lov hali tasdiqlanmagan. Jarayonni yakunlab qayta tekshiring.");
    } catch {
      setErrorText("To'lov holatini tekshirib bo'lmadi. Yana urinib ko'ring.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleReopenPayment = () => {
    if (!paymentUrl || typeof window === "undefined") {
      setErrorText("To'lov havolasi topilmadi.");
      return;
    }

    window.open(paymentUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <MobileScreen fullHeight noPbDock>
      <PageHeader
        title="To'lov kutilmoqda"
        subtitle="Flutter dagi waiting screen logikasi bilan polling qilinmoqda"
        backButton
        onBack={() => navigate(-1)}
      />

      <div className="mt-6 space-y-4">
        <GlassCard goldBorder glow className="rounded-[1.8rem] px-5 py-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-gold">
            <LoaderCircle className="h-10 w-10 animate-spin" />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-white">
            To'lov tasdiqlanmoqda
          </h2>
          <p className="mt-2 text-sm leading-6 text-t-muted">
            To'lov sahifasini yakunlang. Biz invoice holatini avtomatik tekshirib turamiz.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {provider ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <PaymentProviderLogo provider={provider} className="h-9 w-9 rounded-xl text-[9px]" />
                <span className="text-sm font-semibold text-t-primary">{paymentMethod}</span>
              </div>
            ) : null}
            <Badge variant="gold">{planName}</Badge>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-t-muted">Invoice status</span>
              <Badge variant={statusData?.status === "paid" ? "success" : "muted"}>
                {statusData?.status ?? "pending"}
              </Badge>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-sm text-t-muted">O'tgan vaqt</span>
              <span className="text-sm font-semibold text-t-primary">{elapsedSeconds}s</span>
            </div>
          </div>
        </GlassCard>

        {elapsedSeconds >= 60 ? (
          <GlassCard className="rounded-[1.5rem] border-gold/20 bg-gold/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-gold" />
              <div>
                <p className="text-sm font-semibold text-t-primary">
                  To'lov odatdagidan uzoqroq ketmoqda
                </p>
                <p className="mt-1 text-sm text-t-muted">
                  To'lov oynasini qayta ochib, jarayon yakunlanganini tekshiring.
                </p>
              </div>
            </div>
          </GlassCard>
        ) : null}

        {errorText ? (
          <GlassCard className="rounded-[1.5rem] border-danger/30 bg-danger/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-danger" />
              <div>
                <p className="text-sm font-semibold text-danger">{errorText}</p>
              </div>
            </div>
          </GlassCard>
        ) : null}

        <GlassCard className="rounded-[1.5rem]">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-gold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-t-primary">
                Xavfsiz polling
              </p>
              <p className="mt-1 text-sm text-t-muted">
                Status backend dagi invoice endpoint orqali har 3 soniyada tekshiriladi. To'lov tasdiqlansa, session yangilanadi va premium access darhol ko'rinadi.
              </p>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            fullWidth
            size="xl"
            variant="outline"
            onClick={handleReopenPayment}
          >
            <ExternalLink className="h-4 w-4" />
            To'lovni ochish
          </Button>
          <Button
            fullWidth
            size="xl"
            variant="primary"
            onClick={handleManualCheck}
            loading={isChecking}
          >
            <RefreshCw className="h-4 w-4" />
            Tekshirish
          </Button>
        </div>

        <Button
          fullWidth
          size="lg"
          variant="ghost"
          onClick={() => navigate("/subscription")}
        >
          <ArrowLeft className="h-4 w-4" />
          Obunaga qaytish
        </Button>
      </div>
    </MobileScreen>
  );
};
