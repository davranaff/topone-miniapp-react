import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loginSchema, type LoginSchema } from "@/features/auth/schemas/login.schema";
import { useLogin } from "@/features/auth/hooks/use-login";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { getErrorMessage } from "@/shared/lib/error-map";
import { Spinner } from "@/shared/ui/spinner";
import { TelegramLoginButton } from "@/features/auth/components/telegram-login-button";

export const LoginForm = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const location = useLocation();
  const mutation = useLogin();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
    navigate((location.state as { from?: string } | undefined)?.from ?? "/home", { replace: true });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-text">{t("login")}</h2>
        <p className="text-sm text-muted">{t("subtitle")}</p>
      </div>

      <FormField label={t("username")} error={form.formState.errors.username?.message}>
        <Input {...form.register("username")} autoComplete="username" />
      </FormField>

      <FormField label={t("password")} error={form.formState.errors.password?.message}>
        <Input {...form.register("password")} autoComplete="current-password" type="password" />
      </FormField>

      {mutation.error ? <p className="text-sm text-error">{getErrorMessage(mutation.error)}</p> : null}

      <div className="grid gap-3">
        <Button className="w-full" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? <Spinner /> : t("login")}
        </Button>
        <TelegramLoginButton onClick={() => navigate("/telegram/init")} />
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-muted">
        <Link className="hover:text-primary" to="/register">
          {t("register")}
        </Link>
        <Link className="hover:text-primary" to="/forgot-password">
          {t("forgot")}
        </Link>
      </div>
    </form>
  );
};
