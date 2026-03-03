import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Lock, User, Send } from "lucide-react";
import { loginSchema, type LoginSchema } from "@/features/auth/schemas/login.schema";
import { useLogin } from "@/features/auth/hooks/use-login";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { getErrorMessage } from "@/shared/lib/error-map";

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
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-t-primary">{t("login")}</h2>
        <p className="text-sm text-t-muted">{t("subtitle")}</p>
      </div>

      <div className="space-y-3">
        <FormField
          label={t("username")}
          htmlFor="username"
          error={form.formState.errors.username?.message}
        >
          <Input
            id="username"
            leadingIcon={<User className="h-4 w-4" />}
            error={!!form.formState.errors.username}
            autoComplete="username"
            {...form.register("username")}
          />
        </FormField>

        <FormField
          label={t("password")}
          htmlFor="password"
          error={form.formState.errors.password?.message}
        >
          <Input
            id="password"
            leadingIcon={<Lock className="h-4 w-4" />}
            trailingIcon={
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="text-t-muted hover:text-t-primary transition"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={!!form.formState.errors.password}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            {...form.register("password")}
          />
        </FormField>
      </div>

      {mutation.error && (
        <p className="rounded-lg border border-danger/20 bg-danger/8 px-3 py-2 text-sm text-danger">
          {getErrorMessage(mutation.error)}
        </p>
      )}

      <div className="space-y-3">
        <Button fullWidth type="submit" loading={mutation.isPending}>
          {t("login")}
        </Button>

        <Button
          fullWidth
          type="button"
          variant="outline"
          onClick={() => navigate("/telegram/init")}
        >
          <Send className="h-4 w-4" />
          Войти через Telegram
        </Button>
      </div>

      <div className="flex items-center justify-between text-sm">
        <Link className="text-t-muted hover:text-gold transition" to="/register">
          {t("register")}
        </Link>
        <Link className="text-t-muted hover:text-gold transition" to="/forgot-password">
          {t("forgot")}
        </Link>
      </div>
    </form>
  );
};
