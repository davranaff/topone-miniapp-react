import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AtSign, Eye, EyeOff, Lock, LogIn } from "lucide-react";
import { loginSchema, type LoginSchema } from "@/features/auth/schemas/login.schema";
import { useLogin } from "@/features/auth/hooks/use-login";
import { getErrorMessage } from "@/shared/lib/error-map";
import {
  AuthDivider,
  AuthField,
  AuthGlassPanel,
  AuthPrimaryButton,
  AuthTitleBlock,
} from "@/features/auth/components/auth-ui";

export const LoginForm = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const location = useLocation();
  const mutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
    navigate((location.state as { from?: string } | undefined)?.from ?? "/home", { replace: true });
  });

  return (
    <div className="mx-auto flex w-full max-w-[30rem] flex-col justify-center py-2 sm:min-h-[40rem]">
      <AuthGlassPanel>
        <form className="space-y-6" onSubmit={onSubmit}>
          <AuthTitleBlock title={t("welcomeBack")} subtitle={t("loginSubtitle")} />

          <div className="space-y-4">
            <AuthField
              label={t("usernamePlaceholder")}
              placeholder={t("usernamePlaceholder")}
              autoComplete="username"
              icon={<AtSign className="h-6 w-6" />}
              error={form.formState.errors.username?.message}
              {...form.register("username")}
            />

            <AuthField
              label={t("password")}
              placeholder={t("password")}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              icon={<Lock className="h-6 w-6" />}
              trailing={(
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="transition-colors hover:text-white"
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                >
                  {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
              )}
              error={form.formState.errors.password?.message}
              {...form.register("password")}
            />

            <div className="flex justify-end">
              <Link className="text-[0.95rem] font-semibold text-white/72 transition-colors hover:text-white" to="/forgot-password">
                {t("forgot")}
              </Link>
            </div>
          </div>

          {mutation.error ? (
            <div className="rounded-[1.2rem] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {getErrorMessage(mutation.error)}
            </div>
          ) : null}

          <AuthPrimaryButton type="submit" icon={<LogIn className="h-6 w-6" />} loading={mutation.isPending}>
            {t("login")}
          </AuthPrimaryButton>

          <AuthDivider label={t("or")} />

          <p className="text-center text-[1rem] text-white/56">
            {t("noAccount")}{" "}
            <Link className="font-bold text-white transition-colors hover:text-[#f6d489]" to="/register">
              {t("register")}
            </Link>
          </p>
        </form>
      </AuthGlassPanel>
    </div>
  );
};
