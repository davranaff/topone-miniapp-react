import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Phone, MessageCircle } from "lucide-react";
import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import { tokenStorage } from "@/shared/auth/token-storage";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

const phoneSchema = z.object({
  phone: z.string().min(9, "Telefon raqam noto'g'ri").max(15),
});
const codeSchema = z.object({
  code: z.string().min(4, "Kod kiritilishi shart"),
});

type PhoneSchema = z.infer<typeof phoneSchema>;
type CodeSchema = z.infer<typeof codeSchema>;

export const TelegramLoginPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");

  const phoneForm = useForm<PhoneSchema>({ resolver: zodResolver(phoneSchema) });
  const codeForm = useForm<CodeSchema>({ resolver: zodResolver(codeSchema) });

  const requestMutation = useMutation({
    mutationFn: (data: PhoneSchema) =>
      apiClient.post(endpoints.auth.requestLoginByPhone, { phone: data.phone }, { skipAuth: true }),
    onSuccess: (_, vars) => {
      setPhone(vars.phone);
      setStep("code");
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (data: CodeSchema) =>
      apiClient.post(endpoints.auth.verifyLoginCode, { phone, code: data.code }, { skipAuth: true }),
    onSuccess: (res) => {
      const d = res.data?.data ?? res.data;
      const tokens = {
        accessToken: String(d.access_token ?? d.accessToken ?? ""),
        refreshToken: String(d.refresh_token ?? d.refreshToken ?? ""),
      };
      tokenStorage.setTokens(tokens);
      useAuthStore.getState().updateTokens(tokens);
      navigate("/home", { replace: true });
    },
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-5">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10">
            <MessageCircle className="h-6 w-6 text-gold" />
          </div>
          <h1 className="text-xl font-bold text-t-primary">Telegram orqali kirish</h1>
          <p className="text-center text-sm text-t-muted">
            {step === "phone"
              ? "Telegram-ga bog'liq telefon raqamingizni kiriting"
              : `${phone} ga yuborilgan kodni kiriting`}
          </p>
        </div>

        {step === "phone" ? (
          <form
            className="space-y-4"
            onSubmit={phoneForm.handleSubmit((d) => requestMutation.mutate(d))}
          >
            {requestMutation.isError && (
              <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                Raqam topilmadi yoki xato yuz berdi.
              </div>
            )}
            <FormField label="Telefon raqam" htmlFor="tl-phone" error={phoneForm.formState.errors.phone?.message}>
              <Input
                id="tl-phone"
                type="tel"
                placeholder="+998 90 123 45 67"
                leadingIcon={<Phone className="h-4 w-4" />}
                {...phoneForm.register("phone")}
                error={!!phoneForm.formState.errors.phone}
              />
            </FormField>
            <Button fullWidth type="submit" loading={requestMutation.isPending}>
              Kod yuborish
            </Button>
            <Button fullWidth variant="ghost" type="button" onClick={() => navigate("/login")}>
              Orqaga
            </Button>
          </form>
        ) : (
          <form
            className="space-y-4"
            onSubmit={codeForm.handleSubmit((d) => verifyMutation.mutate(d))}
          >
            {verifyMutation.isError && (
              <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                Noto'g'ri kod. Qayta urinib ko'ring.
              </div>
            )}
            <FormField label="Tasdiqlash kodi" htmlFor="tl-code" error={codeForm.formState.errors.code?.message}>
              <Input
                id="tl-code"
                placeholder="Kodni kiriting"
                {...codeForm.register("code")}
                error={!!codeForm.formState.errors.code}
              />
            </FormField>
            <Button fullWidth type="submit" loading={verifyMutation.isPending}>
              Tasdiqlash
            </Button>
            <Button fullWidth variant="ghost" type="button" onClick={() => setStep("phone")}>
              Raqamni o'zgartirish
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
