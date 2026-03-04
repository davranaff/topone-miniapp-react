import { useState } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { authApi } from "@/features/auth/api/auth.api";
import { sessionStorage } from "@/shared/auth/session-storage";
import { tokenStorage } from "@/shared/auth/token-storage";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { OtpInput } from "@/shared/ui/otp-input";
import { getErrorMessage } from "@/shared/lib/error-map";
import { TELEGRAM_LOGIN_CODE_LENGTH, openTelegramLink } from "@/shared/lib/telegram-webapp";
import {
  AuthBackButton,
  AuthGlassPanel,
  AuthPrimaryButton,
  AuthTitleBlock,
} from "@/features/auth/components/auth-ui";

type TelegramVerificationState = {
  phoneNumber?: string;
  botUrl?: string;
};

export const TelegramCodeVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("auth");
  const [searchParams] = useSearchParams();
  const locationState = (location.state as TelegramVerificationState | null) ?? null;
  const phoneNumber = locationState?.phoneNumber ?? searchParams.get("phone") ?? "";
  const botUrl = locationState?.botUrl ?? searchParams.get("bot") ?? "";
  const [code, setCode] = useState("");

  const mutation = useMutation({
    mutationFn: async (enteredCode: string) => {
      const result = await authApi.verifyTelegramCode({ phoneNumber, code: enteredCode });
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
      navigate("/splash", { replace: true });
    },
  });

  if (!phoneNumber) {
    return <Navigate to="/telegram-login" replace />;
  }

  return (
    <div className="mx-auto flex w-full max-w-[30rem] flex-col justify-center py-2 sm:min-h-[38rem]">
      <AuthGlassPanel>
        <div className="space-y-6">
          <AuthBackButton onClick={() => navigate("/telegram-login")} className="-ml-2" />

          <AuthTitleBlock
            title={t("verifyCode")}
            subtitle={`${t("verifySubtitle")} ${phoneNumber}`}
          />

          {mutation.isError ? (
            <div className="liquid-glass-state-danger rounded-[1.2rem] px-4 py-3 text-sm text-red-100">
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
            onComplete={() => undefined}
            maxLength={TELEGRAM_LOGIN_CODE_LENGTH}
            disabled={mutation.isPending}
            error={mutation.isError}
            className="gap-3"
            slotClassName="liquid-glass-field h-[4.8rem] w-[3.65rem] rounded-[1.35rem] text-[1.95rem] font-bold text-t-primary"
            activeSlotClassName="border-white/35"
            errorSlotClassName="ring-1 ring-red-400/70"
          />

          <AuthPrimaryButton
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
            {t("verify")}
          </AuthPrimaryButton>

          {botUrl ? (
            <button
              type="button"
              className="liquid-glass-button-link liquid-glass-surface-interactive w-full rounded-[1.2rem] px-4 py-3 text-center text-[0.98rem] font-semibold text-t-secondary transition-colors hover:text-t-primary"
              onClick={() => openTelegramLink(botUrl)}
            >
              {t("telegramOpenAgain")}
            </button>
          ) : null}
        </div>
      </AuthGlassPanel>
    </div>
  );
};
