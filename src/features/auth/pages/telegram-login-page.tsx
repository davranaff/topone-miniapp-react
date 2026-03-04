import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Phone, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { authApi } from "@/features/auth/api/auth.api";
import { getErrorMessage } from "@/shared/lib/error-map";
import {
  buildTelegramVerificationPath,
  isValidPhoneNumber,
  normalizePhoneNumber,
  openTelegramLink,
} from "@/shared/lib/telegram-webapp";
import {
  AuthDivider,
  AuthField,
  AuthGlassPanel,
  AuthPrimaryButton,
  AuthTitleBlock,
} from "@/features/auth/components/auth-ui";

const schema = z.object({
  phone: z
    .string()
    .min(1, "Telefon raqamni kiriting")
    .refine((value) => isValidPhoneNumber(value), "Telefon raqam noto'g'ri"),
});

type Schema = z.infer<typeof schema>;

export const TelegramLoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: "+",
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (values: Schema) => {
      const phoneNumber = normalizePhoneNumber(values.phone);
      const response = await authApi.requestTelegramLogin({ phoneNumber });

      return {
        ...response,
        phoneNumber,
      };
    },
    onSuccess: ({ botUrl, phoneNumber }) => {
      openTelegramLink(botUrl);
      navigate(buildTelegramVerificationPath(phoneNumber, botUrl), {
        replace: true,
        state: { phoneNumber, botUrl },
      });
    },
  });

  const onSubmit = form.handleSubmit((values) => requestMutation.mutate(values));

  return (
    <div className="mx-auto flex w-full max-w-[30rem] flex-col justify-center py-4 sm:min-h-[38rem]">
      <AuthGlassPanel>
        <form className="space-y-6" onSubmit={onSubmit}>
          <AuthTitleBlock title={t("telegram")} subtitle={t("telegramSubtitle")} />

          {requestMutation.isError ? (
            <div className="rounded-[1.2rem] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {getErrorMessage(requestMutation.error)}
            </div>
          ) : null}

          <AuthField
            label={t("phoneRequired")}
            placeholder="+998"
            icon={<Phone className="h-6 w-6" />}
            inputMode="tel"
            autoComplete="tel"
            error={form.formState.errors.phone?.message}
            {...form.register("phone")}
          />

          <AuthPrimaryButton type="submit" icon={<Send className="h-6 w-6" />} loading={requestMutation.isPending}>
            {t("telegram")}
          </AuthPrimaryButton>

          <AuthDivider label={t("or")} />

          <p className="text-center text-[1rem] text-white/56">
            {t("haveAccount")}{" "}
            <button
              type="button"
              className="liquid-glass-button-link liquid-glass-surface-interactive rounded-full px-3 py-1.5 font-bold text-white transition-colors hover:text-[#f6d489]"
              onClick={() => navigate("/login-form")}
            >
              {t("login")}
            </button>
          </p>
        </form>
      </AuthGlassPanel>
    </div>
  );
};
