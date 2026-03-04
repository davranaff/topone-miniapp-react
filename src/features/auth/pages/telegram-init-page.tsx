import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { telegramAuthApi } from "@/features/auth/api/telegram-auth.api";
import { authApi } from "@/features/auth/api/auth.api";
import { useTelegram } from "@/shared/hooks/use-telegram";
import { tokenStorage } from "@/shared/auth/token-storage";
import { sessionStorage } from "@/shared/auth/session-storage";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Spinner } from "@/shared/ui/spinner";
import { getErrorMessage } from "@/shared/lib/error-map";
import { getTelegramInitDataWithRetry } from "@/shared/lib/telegram-webapp";
import { TopOneLogo } from "@/shared/ui/topone-logo";
import { AuthGlassPanel, AuthPrimaryButton } from "@/features/auth/components/auth-ui";

const FALLBACK_LOGIN_PATH = "/login?fallback=telegram";

export const TelegramInitPage = () => {
  const navigate = useNavigate();
  const telegram = useTelegram();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Telegram ishga tushirilmoqda...");

  useEffect(() => {
    let isDisposed = false;

    const waitForTelegramRuntime = async () => {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        if (telegram.isAvailable()) {
          return true;
        }

        await new Promise((resolve) => globalThis.setTimeout(resolve, 200 * (attempt + 1)));
      }

      return false;
    };

    const bootstrap = async () => {
      const runtimeDetected = await waitForTelegramRuntime();

      if (!runtimeDetected || isDisposed) {
        navigate(FALLBACK_LOGIN_PATH, { replace: true });
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
            navigate("/splash", { replace: true });
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
          navigate(FALLBACK_LOGIN_PATH, { replace: true });
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
        navigate("/splash", { replace: true });
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

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-base px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(245,200,66,0.2),transparent_34%),radial-gradient(circle_at_84%_84%,rgba(212,160,23,0.18),transparent_34%)]" />
      <div className="relative w-full max-w-sm animate-fade-in-up">
        <AuthGlassPanel className="text-center">
          <div className="space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full liquid-glass-surface">
              <TopOneLogo size="md" framed={false} />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-t-primary">Telegram Auth</h1>
              <p className="text-sm text-t-secondary">{statusMessage}</p>
            </div>

            {isLoading ? (
              <div className="flex justify-center">
                <Spinner size="lg" />
              </div>
            ) : null}

            {error ? (
              <div className="space-y-3">
                <div className="liquid-glass-state-danger rounded-[1.2rem] px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
                <AuthPrimaryButton type="button" variant="soft" onClick={() => window.location.reload()}>
                  Qayta urinish
                </AuthPrimaryButton>
                <AuthPrimaryButton
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(FALLBACK_LOGIN_PATH, { replace: true })}
                >
                  Oddiy kirishga qaytish
                </AuthPrimaryButton>
              </div>
            ) : null}
          </div>
        </AuthGlassPanel>
      </div>
    </div>
  );
};
