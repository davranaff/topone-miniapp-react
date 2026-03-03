import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-text">Восстановление пароля</h2>
        <p className="text-sm text-muted">Базовый foundation под `forgot/reset` уже подключён.</p>
      </div>

      <FormField label="Email" error={form.formState.errors.email?.message} hint="Письмо придёт на адрес, указанный при регистрации">
        <Input {...form.register("email")} autoComplete="email" />
      </FormField>

      {mutation.error ? <p className="text-sm text-error">{getErrorMessage(mutation.error)}</p> : null}
      {mutation.isSuccess ? <p className="text-sm text-primary">Запрос отправлен</p> : null}

      <Button className="w-full" type="submit" disabled={mutation.isPending}>
        Отправить
      </Button>
    </form>
  );
};
