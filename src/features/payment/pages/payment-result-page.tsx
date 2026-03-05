import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Home, RotateCcw } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { refreshPaymentSession } from "@/features/payment/lib/payment-session";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Button } from "@/shared/ui/button";

type ResultLocationState = {
  status?: string;
  planId?: string;
  fromPaymentReturn?: boolean;
};

export const PaymentResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const state = (location.state ?? null) as ResultLocationState | null;

  const status = (searchParams.get("status") ?? state?.status ?? "unknown").toLowerCase();
  const planId = searchParams.get("plan_id") ?? state?.planId ?? "";

  const isSuccess = status === "success" || status === "paid";
  const isCancelled = status === "cancelled" || status === "canceled";
  const isFailed = status === "failed" || status === "error";

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    void Promise.allSettled([
      refreshPaymentSession(),
      queryClient.invalidateQueries({ queryKey: ["auth", "subscription-status"] }),
      queryClient.invalidateQueries({ queryKey: ["payment"] }),
      queryClient.invalidateQueries({ queryKey: ["home"] }),
    ]);
  }, [isSuccess, queryClient]);

  return (
    <MobileScreen fullHeight noPbDock className="space-y-4 lg:space-y-5">
      <PageHeader
        title="To'lov natijasi"
        subtitle="Gateway return URL dan qaytgan holat"
        backButton
        onBack={() => navigate("/subscription", { replace: true })}
      />

      <div className="mt-8 xl:mx-auto xl:max-w-[44rem]">
        <GlassCard goldBorder={isSuccess} glow={isSuccess} className="rounded-[1.9rem] px-5 py-7 text-center">
          <div
            className={
              isSuccess
                ? "mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f2d06a_0%,#d4a017_55%,#b8860b_100%)] text-white"
                : "mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-danger/30 bg-danger/10 text-danger"
            }
          >
            {isSuccess ? (
              <CheckCircle2 className="h-11 w-11" />
            ) : (
              <AlertTriangle className="h-11 w-11" />
            )}
          </div>

          <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white">
            {isSuccess
              ? "To'lov muvaffaqiyatli"
              : isCancelled
                ? "To'lov bekor qilindi"
                : isFailed
                  ? "To'lov muvaffaqiyatsiz"
                  : "To'lov holati noma'lum"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-t-muted">
            {isSuccess
              ? "Obuna yangilandi. Premium access ni ko'rish uchun bosh sahifa yoki obuna sahifasiga qayting."
              : isCancelled
                ? "Payment provider sahifasida to'lov bekor qilingan."
                : isFailed
                  ? "To'lov yakunlanmadi. Qayta urinib ko'ring."
                  : "Return URL status aniq emas."}
          </p>

          {planId ? (
            <p className="mt-4 text-xs uppercase tracking-[0.16em] text-gold/70">
              plan id: {planId}
            </p>
          ) : null}
        </GlassCard>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:mx-auto xl:max-w-[44rem]">
        <Button
          fullWidth
          size="xl"
          onClick={() => navigate("/home", { replace: true })}
        >
          <Home className="h-4 w-4" />
          Bosh sahifa
        </Button>
        <Button
          fullWidth
          size="xl"
          variant="outline"
          onClick={() => navigate("/subscription", { replace: true })}
        >
          <RotateCcw className="h-4 w-4" />
          Obunaga qaytish
        </Button>
      </div>
    </MobileScreen>
  );
};
