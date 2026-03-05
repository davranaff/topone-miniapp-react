import { useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();
  const { t } = useTranslation("auth");
  const telegram = useTelegram();
  const from = (location.state as { from?: string } | null)?.from;

  return (
    <div className="mx-auto flex w-full max-w-[34rem] flex-col justify-center py-4 lg:py-6 sm:min-h-[40rem]">
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
                onClick={() => navigate("/login-form", { state: from ? { from } : undefined })}
                variant="soft"
              >
                {t("login")}
              </AuthPrimaryButton>

              <AuthPrimaryButton
                type="button"
                icon={<UserPlus className="h-6 w-6" />}
                onClick={() => navigate("/register")}
                variant="soft"
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
