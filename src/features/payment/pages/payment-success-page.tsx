import { useEffect } from "react";
import { CalendarDays, Check, Home, ShieldCheck, Star } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentApi } from "@/features/payment/api/payment.api";
import { refreshPaymentSession } from "@/features/payment/lib/payment-session";
import type { InvoiceStatus } from "@/entities/payment/types";
import { formatDate } from "@/shared/lib/date";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Button } from "@/shared/ui/button";

type PaymentSuccessLocationState = {
  invoiceStatus?: InvoiceStatus;
  paymentMethod?: string;
  provider?: string;
  planName?: string;
  planId?: string;
};

const featureItems = [
  "Kurslar va lessonlar",
  "Challenge access",
  "Premium badge va kontent",
  "Chat va qo'shimcha imkoniyatlar",
];

export const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const locationState = (location.state ?? null) as PaymentSuccessLocationState | null;

  const invoiceId = searchParams.get("invoiceId") ?? locationState?.invoiceStatus?.invoiceId ?? "";

  const invoiceStatusQuery = useQuery({
    queryKey: ["payment", "invoice-status", invoiceId, "success"],
    queryFn: () => paymentApi.getInvoiceStatus(invoiceId),
    enabled: Boolean(invoiceId && !locationState?.invoiceStatus),
    staleTime: 30_000,
  });

  const invoiceStatus = locationState?.invoiceStatus ?? invoiceStatusQuery.data ?? null;

  useEffect(() => {
    if (!invoiceStatus || invoiceStatus.status !== "paid") {
      return;
    }

    void Promise.allSettled([
      refreshPaymentSession(),
      queryClient.invalidateQueries({ queryKey: ["auth", "subscription-status"] }),
      queryClient.invalidateQueries({ queryKey: ["payment"] }),
      queryClient.invalidateQueries({ queryKey: ["home"] }),
    ]);
  }, [invoiceStatus, queryClient]);

  if (!invoiceStatus && invoiceStatusQuery.isLoading) {
    return (
      <MobileScreen fullHeight noPbDock>
        <PageHeader title="To'lov muvaffaqiyatli" subtitle="Ma'lumotlar yuklanmoqda" backButton />
      </MobileScreen>
    );
  }

  const planName = locationState?.planName ?? invoiceStatus?.planName ?? "Premium";

  return (
    <MobileScreen fullHeight noPbDock>
      <PageHeader
        title="To'lov muvaffaqiyatli"
        subtitle="Flutter dagi success screen ga yaqin yakun sahifasi"
        backButton
        onBack={() => navigate("/home")}
      />

      <div className="mt-6 space-y-4">
        <GlassCard goldBorder glow className="rounded-[1.9rem] px-5 py-7 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f2d06a_0%,#d4a017_55%,#b8860b_100%)] text-white shadow-[0_20px_40px_rgba(212,160,23,0.26)]">
            <Check className="h-12 w-12" />
          </div>

          <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white">
            Premium aktiv
          </h2>
          <p className="mt-2 text-sm leading-6 text-t-muted">
            To'lov tasdiqlandi. Obuna va ruxsatlar session ichida yangilandi.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <div className="flex items-center gap-2 text-xs text-t-muted">
                <Star className="h-3.5 w-3.5" />
                Tarif
              </div>
              <p className="mt-1 text-base font-bold text-t-primary">{planName}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <div className="flex items-center gap-2 text-xs text-t-muted">
                <CalendarDays className="h-3.5 w-3.5" />
                Davomiyligi
              </div>
              <p className="mt-1 text-base font-bold text-t-primary">
                {invoiceStatus?.planDurationMonths ? `${invoiceStatus.planDurationMonths} oy` : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <div className="flex items-center gap-2 text-xs text-t-muted">
                <CalendarDays className="h-3.5 w-3.5" />
                Boshlangan sana
              </div>
              <p className="mt-1 text-base font-bold text-t-primary">
                {formatDate(invoiceStatus?.subscriptionStart, "uz-UZ")}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <div className="flex items-center gap-2 text-xs text-t-muted">
                <CalendarDays className="h-3.5 w-3.5" />
                Tugash sanasi
              </div>
              <p className="mt-1 text-base font-bold text-t-primary">
                {formatDate(invoiceStatus?.subscriptionEnd, "uz-UZ")}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="rounded-[1.6rem]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-gold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-t-primary">
                Endi sizga ochildi
              </p>
              <div className="mt-3 space-y-2">
                {featureItems.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-t-secondary">
                    <Check className="h-4 w-4 text-gold" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        <Button
          fullWidth
          size="xl"
          onClick={() => navigate("/home", { replace: true })}
        >
          <Home className="h-4 w-4" />
          Bosh sahifaga o'tish
        </Button>
      </div>
    </MobileScreen>
  );
};
