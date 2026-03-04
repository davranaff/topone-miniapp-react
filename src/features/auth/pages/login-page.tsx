import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Send, UserPlus } from "lucide-react";
import { useTelegram } from "@/shared/hooks/use-telegram";
import { getTelegramLoginPath } from "@/shared/lib/telegram-webapp";
import {
  AuthDivider,
  AuthPrimaryButton,
  AuthTitleBlock,
} from "@/features/auth/components/auth-ui";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  const telegram = useTelegram();

  return (
    <div className="mx-auto flex w-full max-w-[28rem] flex-col justify-center py-4 sm:min-h-[38rem]">
      <div className="space-y-10">
        <AuthTitleBlock title={t("welcome")} />

        <div className="space-y-5">
          <AuthPrimaryButton
            type="button"
            icon={<Send className="h-6 w-6" />}
            onClick={() => navigate(getTelegramLoginPath(telegram.isAvailable()))}
          >
            {t("telegram")}
          </AuthPrimaryButton>

          <AuthDivider label={t("or")} />

          <div className="space-y-4">
            <AuthPrimaryButton
              type="button"
              icon={<ArrowRight className="h-6 w-6" />}
              onClick={() => navigate("/login-form")}
            >
              {t("login")}
            </AuthPrimaryButton>

            <AuthPrimaryButton
              type="button"
              icon={<UserPlus className="h-6 w-6" />}
              onClick={() => navigate("/register")}
              className="bg-[linear-gradient(135deg,#ecc15d_0%,#c38d24_52%,#9f6f16_100%)]"
            >
              {t("register")}
            </AuthPrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};
