import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AtSign,
  Eye,
  EyeOff,
  Gift,
  Lock,
  Mail,
  Phone,
  User,
  UserPlus,
} from "lucide-react";
import { useRegister } from "@/features/auth/hooks/use-register";
import { registerSchema, type RegisterSchema } from "@/features/auth/schemas/register.schema";
import { getErrorMessage } from "@/shared/lib/error-map";
import {
  AuthField,
  AuthGlassPanel,
  AuthPrimaryButton,
  AuthTitleBlock,
} from "@/features/auth/components/auth-ui";

export const RegisterForm = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const mutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const defaultReferralCode = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const params = new URLSearchParams(window.location.search);
    return params.get("referral") ?? "";
  }, []);

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "+",
      firstName: "",
      lastName: "",
      referralCode: defaultReferralCode,
      timezone: "Asia/Tashkent",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
    navigate("/login-form", { replace: true });
  });

  return (
    <div className="mx-auto flex w-full max-w-[30rem] flex-col justify-center py-2">
      <AuthGlassPanel>
        <form className="space-y-5" onSubmit={onSubmit}>
          <AuthTitleBlock title={t("createAccount")} subtitle={t("registerSubtitle")} />

          <div className="space-y-4">
            <AuthField
              label={t("firstName")}
              placeholder={t("firstName")}
              icon={<User className="h-6 w-6" />}
              error={form.formState.errors.firstName?.message}
              {...form.register("firstName")}
            />
            <AuthField
              label={t("lastName")}
              placeholder={t("lastName")}
              icon={<User className="h-6 w-6" />}
              error={form.formState.errors.lastName?.message}
              {...form.register("lastName")}
            />
            <AuthField
              label={t("email")}
              placeholder={t("email")}
              icon={<Mail className="h-6 w-6" />}
              autoComplete="email"
              error={form.formState.errors.email?.message}
              {...form.register("email")}
            />
            <AuthField
              label={t("usernamePlaceholder")}
              placeholder={t("usernamePlaceholder")}
              icon={<AtSign className="h-6 w-6" />}
              error={form.formState.errors.username?.message}
              {...form.register("username")}
            />
            <AuthField
              label={t("phone")}
              placeholder="+998"
              icon={<Phone className="h-6 w-6" />}
              inputMode="tel"
              autoComplete="tel"
              error={form.formState.errors.phoneNumber?.message}
              {...form.register("phoneNumber")}
            />
            <AuthField
              label={t("password")}
              placeholder={t("password")}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              icon={<Lock className="h-6 w-6" />}
              trailing={(
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="liquid-glass-button-icon liquid-glass-surface-interactive flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:text-white"
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                >
                  {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
              )}
              error={form.formState.errors.password?.message}
              {...form.register("password")}
            />
            <AuthField
              label={t("confirmPassword")}
              placeholder={t("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              icon={<Lock className="h-6 w-6" />}
              trailing={(
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="liquid-glass-button-icon liquid-glass-surface-interactive flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:text-white"
                  aria-label={showConfirmPassword ? t("hidePassword") : t("showPassword")}
                >
                  {showConfirmPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
              )}
              error={form.formState.errors.confirmPassword?.message}
              {...form.register("confirmPassword")}
            />
            <AuthField
              label={t("referralCode")}
              placeholder={t("referralCode")}
              icon={<Gift className="h-6 w-6" />}
              error={form.formState.errors.referralCode?.message}
              {...form.register("referralCode")}
            />
          </div>

          {mutation.error ? (
            <div className="rounded-[1.2rem] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {getErrorMessage(mutation.error)}
            </div>
          ) : null}

          <AuthPrimaryButton type="submit" icon={<UserPlus className="h-6 w-6" />} loading={mutation.isPending}>
            {t("register")}
          </AuthPrimaryButton>

          <p className="text-center text-[1rem] text-white/56">
            {t("haveAccount")}{" "}
            <Link className="font-bold text-white transition-colors hover:text-[#f6d489]" to="/login-form">
              {t("login")}
            </Link>
          </p>
        </form>
      </AuthGlassPanel>
    </div>
  );
};
