import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { telegramAuthApi } from "@/features/auth/api/telegram-auth.api";
import { authApi } from "@/features/auth/api/auth.api";
import { useTelegram } from "@/shared/hooks/use-telegram";
import { tokenStorage } from "@/shared/auth/token-storage";
import { sessionStorage } from "@/shared/auth/session-storage";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Spinner } from "@/shared/ui/spinner";
import { Button } from "@/shared/ui/button";
import { getErrorMessage } from "@/shared/lib/error-map";
import { getTelegramInitDataWithRetry } from "@/shared/lib/telegram-webapp";

export const TelegramInitPage = () => {
  const navigate = useNavigate();
  const telegram = useTelegram();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Telegram ishga tushirilmoqda...");

  useEffect(() => {
    let isDisposed = false;

    const bootstrap = async () => {
      if (!telegram.isAvailable()) {
        navigate("/login", { replace: true });
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        telegram.ready();
        telegram.expand();
        telegram.disableVerticalSwipes();

        const existingTokens = tokenStorage.getTokens();

        if (existingTokens) {
          setStatusMessage("Sessiya tekshirilmoqda...");

          try {
            const user = await authApi.getCurrentUser();

            if (isDisposed) {
              return;
            }

            sessionStorage.setUser(user);
            useAuthStore.getState().setSession({ user, tokens: existingTokens });
            navigate("/home", { replace: true });
            return;
          } catch {
            tokenStorage.clear();
            sessionStorage.clear();
            useAuthStore.getState().clearSession();
          }
        }

        setStatusMessage("Telegram bilan bog'lanmoqda...");
        const initData = await getTelegramInitDataWithRetry(telegram);

        if (!initData) {
          navigate("/login", { replace: true });
          return;
        }

        setStatusMessage("Akkaunt tekshirilmoqda...");
        const tokens = await telegramAuthApi.authenticate({ initData });
        authApi.ensureTokens(tokens);
        tokenStorage.setTokens(tokens);

        setStatusMessage("Profil yuklanmoqda...");
        const user = await authApi.getCurrentUser();

        if (isDisposed) {
          return;
        }

        sessionStorage.setUser(user);
        useAuthStore.getState().setSession({ user, tokens });
        navigate("/home", { replace: true });
      } catch (nextError) {
        if (isDisposed) {
          return;
        }

        tokenStorage.clear();
        sessionStorage.clear();
        useAuthStore.getState().clearSession();
        setError(getErrorMessage(nextError));
      } finally {
        if (!isDisposed) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      isDisposed = true;
    };
  }, [navigate, telegram]);

  if (!telegram.isAvailable()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-base px-4">
      <div
        data-glow
        className="pointer-events-none absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/12 blur-3xl"
      />

        <div className="relative flex w-full max-w-sm flex-col items-center gap-6 text-center animate-fade-in-up">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10">
            <span className="text-2xl font-black text-gold">T1</span>
          </div>

        {isLoading ? (
          <>
            <Spinner size="lg" />
            <div className="space-y-1">
              <p className="font-semibold text-t-primary">Telegram orqali kirilmoqda</p>
              <p className="text-sm text-t-muted">{statusMessage}</p>
            </div>
          </>
        ) : null}

        {error ? (
          <div className="w-full space-y-4">
            <div className="rounded-xl border border-danger/20 bg-danger/8 p-4">
              <p className="text-sm text-danger">{error}</p>
            </div>
            <Button fullWidth variant="outline" onClick={() => window.location.reload()}>
              Qayta urinish
            </Button>
            <Button fullWidth variant="ghost" onClick={() => navigate("/login")}>
              Oddiy kirishga qaytish
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
