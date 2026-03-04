import { useState } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, MessageCircleMore } from "lucide-react";
import { authApi } from "@/features/auth/api/auth.api";
import { sessionStorage } from "@/shared/auth/session-storage";
import { tokenStorage } from "@/shared/auth/token-storage";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Button } from "@/shared/ui/button";
import { OtpInput } from "@/shared/ui/otp-input";
import { getErrorMessage } from "@/shared/lib/error-map";
import { TELEGRAM_LOGIN_CODE_LENGTH, openTelegramLink } from "@/shared/lib/telegram-webapp";

type TelegramVerificationState = {
  phoneNumber?: string;
  botUrl?: string;
};

export const TelegramCodeVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const locationState = (location.state as TelegramVerificationState | null) ?? null;
  const phoneNumber = locationState?.phoneNumber ?? searchParams.get("phone") ?? "";
  const botUrl = locationState?.botUrl ?? searchParams.get("bot") ?? "";
  const [code, setCode] = useState("");

  const mutation = useMutation({
    mutationFn: async (code: string) => {
      const result = await authApi.verifyTelegramCode({ phoneNumber, code });
      authApi.ensureTokens(result.tokens);
      tokenStorage.setTokens(result.tokens);

      try {
        const user = await authApi.getCurrentUser();
        sessionStorage.setUser(user);
        useAuthStore.getState().setSession({ user, tokens: result.tokens });
      } catch (error) {
        if (!result.user) {
          tokenStorage.clear();
          sessionStorage.clear();
          useAuthStore.getState().clearSession();
          throw error;
        }

        sessionStorage.setUser(result.user);
        useAuthStore.getState().setSession({ user: result.user, tokens: result.tokens });
      }
    },
    onSuccess: () => {
      navigate("/home", { replace: true });
    },
  });

  if (!phoneNumber) {
    return <Navigate to="/telegram-login" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-5">
      <div className="w-full max-w-sm space-y-6">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm text-t-muted transition hover:text-t-primary"
          onClick={() => navigate("/telegram-login")}
        >
          <ArrowLeft className="h-4 w-4" />
          Orqaga
        </button>

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10">
            <MessageCircleMore className="h-6 w-6 text-gold" />
          </div>
          <h1 className="text-xl font-bold text-t-primary">Tasdiqlash kodi</h1>
          <p className="text-sm text-t-muted">
            Telegram botda ko'rsatilgan 6 xonali kodni kiriting.
          </p>
          <p className="text-sm font-medium text-t-primary">{phoneNumber}</p>
        </div>

        <div className="space-y-4">
          {mutation.isError ? (
            <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {getErrorMessage(mutation.error)}
            </div>
          ) : null}

          <OtpInput
            value={code}
            onChange={(value) => {
              if (mutation.isError) {
                mutation.reset();
              }

              setCode(value);
            }}
            onComplete={(value) => mutation.mutate(value)}
            maxLength={TELEGRAM_LOGIN_CODE_LENGTH}
            disabled={mutation.isPending}
            error={mutation.isError}
          />

          <Button
            fullWidth
            type="button"
            loading={mutation.isPending}
            onClick={() => {
              if (code.length === TELEGRAM_LOGIN_CODE_LENGTH) {
                mutation.reset();
                mutation.mutate(code);
              }
            }}
            disabled={code.length !== TELEGRAM_LOGIN_CODE_LENGTH}
          >
            Tasdiqlash
          </Button>

          {botUrl ? (
            <Button fullWidth variant="outline" type="button" onClick={() => openTelegramLink(botUrl)}>
              Telegram botni qayta ochish
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
