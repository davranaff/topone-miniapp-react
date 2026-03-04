import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Send, UserPlus } from "lucide-react";
import { useTelegram } from "@/shared/hooks/use-telegram";
import { getTelegramLoginPath } from "@/shared/lib/telegram-webapp";
import {
  AuthDivider,
  AuthGlassPanel,
  AuthPrimaryButton,
  AuthTitleBlock,
} from "@/features/auth/components/auth-ui";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  const telegram = useTelegram();

  return (
    <div className="mx-auto flex w-full max-w-[30rem] flex-col justify-center py-4 sm:min-h-[38rem]">
      <AuthGlassPanel>
        <div className="space-y-8">
          <AuthTitleBlock title={t("welcome")} subtitle={t("loginSubtitle")} />

          <div className="space-y-4">
            <AuthPrimaryButton
              type="button"
              icon={<Send className="h-6 w-6" />}
              onClick={() => navigate(getTelegramLoginPath(telegram.isAvailable()))}
            >
              {t("telegram")}
            </AuthPrimaryButton>

            <AuthDivider label={t("or")} />

            <div className="space-y-3">
              <AuthPrimaryButton
                type="button"
                icon={<ArrowRight className="h-6 w-6" />}
                onClick={() => navigate("/login-form")}
                className="bg-[rgba(255,255,255,0.06)] shadow-[0_16px_32px_rgba(0,0,0,0.22)]"
              >
                {t("login")}
              </AuthPrimaryButton>

              <AuthPrimaryButton
                type="button"
                icon={<UserPlus className="h-6 w-6" />}
                onClick={() => navigate("/register")}
                className="bg-[rgba(236,192,89,0.12)]"
              >
                {t("register")}
              </AuthPrimaryButton>
            </div>
          </div>
        </div>
      </AuthGlassPanel>
    </div>
  );
};
