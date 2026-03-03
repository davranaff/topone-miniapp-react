import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRegister } from "@/features/auth/hooks/use-register";
import { registerSchema, type RegisterSchema } from "@/features/auth/schemas/register.schema";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { getErrorMessage } from "@/shared/lib/error-map";

export const RegisterForm = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const mutation = useRegister();
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      firstName: "",
      lastName: "",
      timezone: "Asia/Tashkent",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
    navigate("/login", { replace: true });
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-text">{t("register")}</h2>
        <p className="text-sm text-muted">Создайте новый аккаунт и переходите в продукт без миграции архитектуры.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label={t("firstName")} error={form.formState.errors.firstName?.message}>
          <Input {...form.register("firstName")} />
        </FormField>
        <FormField label={t("lastName")} error={form.formState.errors.lastName?.message}>
          <Input {...form.register("lastName")} />
        </FormField>
      </div>

      <FormField label={t("email")} error={form.formState.errors.email?.message}>
        <Input {...form.register("email")} autoComplete="email" />
      </FormField>
      <FormField label={t("username")} error={form.formState.errors.username?.message}>
        <Input {...form.register("username")} />
      </FormField>
      <FormField label={t("phone")} error={form.formState.errors.phoneNumber?.message}>
        <Input {...form.register("phoneNumber")} />
      </FormField>
      <FormField label={t("password")} error={form.formState.errors.password?.message}>
        <Input {...form.register("password")} autoComplete="new-password" type="password" />
      </FormField>
      <FormField label="Подтверждение пароля" error={form.formState.errors.confirmPassword?.message}>
        <Input {...form.register("confirmPassword")} autoComplete="new-password" type="password" />
      </FormField>
      <FormField label="Timezone" error={form.formState.errors.timezone?.message}>
        <Input {...form.register("timezone")} />
      </FormField>

      {mutation.error ? <p className="text-sm text-error">{getErrorMessage(mutation.error)}</p> : null}

      <div className="grid gap-3">
        <Button className="w-full" type="submit" disabled={mutation.isPending}>
          {t("register")}
        </Button>
        <Link className="text-sm text-muted hover:text-primary" to="/login">
          Уже есть аккаунт
        </Link>
      </div>
    </form>
  );
};
