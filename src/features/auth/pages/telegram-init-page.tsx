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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
        <div className="mb-6 flex justify-center">{mutation.isPending ? <Spinner /> : null}</div>
        <h1 className="text-2xl font-semibold">Telegram Mini App Init</h1>
        <p className="mt-2 text-sm text-slate-300">
          Получаем `initData`, обмениваем его на `access/refresh token` и поднимаем session store.
        </p>
        {mutation.error ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-red-300">{getErrorMessage(mutation.error)}</p>
            <Button type="button" variant="secondary" onClick={() => navigate("/login")}>
              Вернуться к логину
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
