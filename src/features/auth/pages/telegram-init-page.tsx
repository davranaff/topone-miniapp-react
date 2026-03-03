import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
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

export const TelegramInitPage = () => {
  const navigate = useNavigate();
  const telegram = useTelegram();
  const mutation = useMutation({
    mutationFn: telegramAuthApi.authenticate,
    onSuccess: async (tokens) => {
      tokenStorage.setTokens(tokens);
      const user = await authApi.getCurrentUser();
      sessionStorage.setUser(user);
      useAuthStore.getState().setSession({ user, tokens });
      navigate("/home", { replace: true });
    },
  });

  useEffect(() => {
    const initData = telegram.getInitData();
    if (initData) {
      void mutation.mutateAsync({ initData });
    }
  }, [mutation, telegram]);

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

        {mutation.isPending && (
          <>
            <Spinner size="lg" />
            <div className="space-y-1">
              <p className="font-semibold text-t-primary">Входим через Telegram</p>
              <p className="text-sm text-t-muted">Пожалуйста, подождите...</p>
            </div>
          </>
        )}

        {mutation.error && (
          <div className="w-full space-y-4">
            <div className="rounded-xl border border-danger/20 bg-danger/8 p-4">
              <p className="text-sm text-danger">{getErrorMessage(mutation.error)}</p>
            </div>
            <Button fullWidth variant="outline" onClick={() => navigate("/login")}>
              Вернуться во вход
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
