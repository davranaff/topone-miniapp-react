import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Mail, CheckCircle2 } from "lucide-react";
import { authApi } from "@/features/auth/api/auth.api";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { getErrorMessage } from "@/shared/lib/error-map";

const forgotPasswordSchema = z.object({
  email: z.string().email("Введите email"),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordForm = () => {
  const mutation = useMutation({
    mutationFn: authApi.forgotPassword,
  });

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
  });

  if (mutation.isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-success/25 bg-success/10 text-success">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-t-primary">Письмо отправлено</h3>
          <p className="text-sm text-t-muted">Проверьте ваш email для инструкций по сбросу пароля.</p>
        </div>
        <Link to="/login" className="text-sm text-gold hover:underline">
          Вернуться во вход
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-t-primary">Восстановление пароля</h2>
        <p className="text-sm text-t-muted">Письмо придёт на адрес, указанный при регистрации.</p>
      </div>

      <FormField
        label="Email"
        htmlFor="forgot-email"
        error={form.formState.errors.email?.message}
        hint="Письмо придёт на указанный адрес"
      >
        <Input
          id="forgot-email"
          leadingIcon={<Mail className="h-4 w-4" />}
          error={!!form.formState.errors.email}
          autoComplete="email"
          {...form.register("email")}
        />
      </FormField>

      {mutation.error && (
        <p className="rounded-lg border border-danger/20 bg-danger/8 px-3 py-2 text-sm text-danger">
          {getErrorMessage(mutation.error)}
        </p>
      )}

      <div className="space-y-3">
        <Button fullWidth type="submit" loading={mutation.isPending}>
          Отправить ссылку
        </Button>
        <p className="text-center text-sm text-t-muted">
          <Link className="text-gold hover:underline" to="/login">Вернуться во вход</Link>
        </p>
      </div>
    </form>
  );
};
