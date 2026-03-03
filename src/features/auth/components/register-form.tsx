import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Lock, User, Mail, Phone } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-t-primary">{t("register")}</h2>
        <p className="text-sm text-t-muted">Создайте аккаунт TopOne</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label={t("firstName")} htmlFor="firstName" error={form.formState.errors.firstName?.message}>
          <Input id="firstName" leadingIcon={<User className="h-4 w-4" />} error={!!form.formState.errors.firstName} {...form.register("firstName")} />
        </FormField>
        <FormField label={t("lastName")} htmlFor="lastName" error={form.formState.errors.lastName?.message}>
          <Input id="lastName" error={!!form.formState.errors.lastName} {...form.register("lastName")} />
        </FormField>
      </div>

      <FormField label={t("email")} htmlFor="email" error={form.formState.errors.email?.message}>
        <Input id="email" leadingIcon={<Mail className="h-4 w-4" />} error={!!form.formState.errors.email} autoComplete="email" {...form.register("email")} />
      </FormField>

      <FormField label={t("username")} htmlFor="reg-username" error={form.formState.errors.username?.message}>
        <Input id="reg-username" leadingIcon={<User className="h-4 w-4" />} error={!!form.formState.errors.username} {...form.register("username")} />
      </FormField>

      <FormField label={t("phone")} htmlFor="phone" error={form.formState.errors.phoneNumber?.message}>
        <Input id="phone" leadingIcon={<Phone className="h-4 w-4" />} error={!!form.formState.errors.phoneNumber} {...form.register("phoneNumber")} />
      </FormField>

      <FormField label={t("password")} htmlFor="reg-password" error={form.formState.errors.password?.message}>
        <Input
          id="reg-password"
          leadingIcon={<Lock className="h-4 w-4" />}
          trailingIcon={
            <button type="button" tabIndex={-1} onClick={() => setShowPassword((v) => !v)} className="text-t-muted hover:text-t-primary transition">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          error={!!form.formState.errors.password}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          {...form.register("password")}
        />
      </FormField>

      <FormField label="Подтверждение пароля" htmlFor="confirmPassword" error={form.formState.errors.confirmPassword?.message}>
        <Input id="confirmPassword" error={!!form.formState.errors.confirmPassword} type="password" autoComplete="new-password" {...form.register("confirmPassword")} />
      </FormField>

      {mutation.error && (
        <p className="rounded-lg border border-danger/20 bg-danger/8 px-3 py-2 text-sm text-danger">
          {getErrorMessage(mutation.error)}
        </p>
      )}

      <div className="space-y-3">
        <Button fullWidth type="submit" loading={mutation.isPending}>
          {t("register")}
        </Button>
        <p className="text-center text-sm text-t-muted">
          Уже есть аккаунт?{" "}
          <Link className="text-gold hover:underline" to="/login">Войти</Link>
        </p>
      </div>
    </form>
  );
};
