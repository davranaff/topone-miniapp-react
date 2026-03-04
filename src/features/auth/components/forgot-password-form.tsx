import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { CheckCircle2, Mail } from "lucide-react";
import { authApi } from "@/features/auth/api/auth.api";
import { getErrorMessage } from "@/shared/lib/error-map";
import {
  AuthField,
  AuthGlassPanel,
  AuthPrimaryButton,
  AuthTitleBlock,
} from "@/features/auth/components/auth-ui";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email noto'g'ri"),
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
      <div className="mx-auto flex w-full max-w-[28rem] flex-col justify-center py-6 text-center sm:min-h-[38rem]">
        <AuthGlassPanel>
          <div className="space-y-5">
            <div className="liquid-glass-state-success mx-auto flex h-20 w-20 items-center justify-center rounded-full text-emerald-100">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-[-0.04em] text-t-primary">Xat yuborildi</h2>
              <p className="text-base leading-7 text-t-secondary">
                Parolni tiklash bo'yicha ko'rsatmalar emailingizga yuborildi.
              </p>
            </div>
            <Link className="text-base font-semibold text-t-primary transition-colors hover:text-gold" to="/login-form">
              Kirishga qaytish
            </Link>
          </div>
        </AuthGlassPanel>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[28rem] flex-col justify-center py-6 sm:min-h-[38rem]">
      <AuthGlassPanel>
        <form className="space-y-6" onSubmit={onSubmit}>
          <AuthTitleBlock
            title="Parolni tiklash"
            subtitle="Ko'rsatmalar ro'yxatdan o'tgan emailingizga yuboriladi"
          />

          <AuthField
            label="Email"
            placeholder="Email"
            icon={<Mail className="h-6 w-6" />}
            autoComplete="email"
            error={form.formState.errors.email?.message}
            {...form.register("email")}
          />

          {mutation.error ? (
            <div className="liquid-glass-state-danger rounded-[1.2rem] px-4 py-3 text-sm text-red-100">
              {getErrorMessage(mutation.error)}
            </div>
          ) : null}

          <AuthPrimaryButton type="submit" loading={mutation.isPending}>
            Yuborish
          </AuthPrimaryButton>

          <p className="text-center text-[1.02rem] text-t-secondary">
            <Link className="font-bold text-t-primary transition-colors hover:text-gold" to="/login-form">
              Kirishga qaytish
            </Link>
          </p>
        </form>
      </AuthGlassPanel>
    </div>
  );
};
