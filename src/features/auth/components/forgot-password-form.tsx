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
        <div className="space-y-5">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-300">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-white">Xat yuborildi</h2>
            <p className="text-base leading-7 text-[#d4c3a0]">
              Parolni tiklash bo'yicha ko'rsatmalar emailingizga yuborildi.
            </p>
          </div>
          <Link className="text-base font-semibold text-white transition-colors hover:text-[#f6d489]" to="/login-form">
            Kirishga qaytish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[28rem] flex-col justify-center py-6 sm:min-h-[38rem]">
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
          <div className="rounded-[1.2rem] border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {getErrorMessage(mutation.error)}
          </div>
        ) : null}

        <AuthPrimaryButton type="submit" loading={mutation.isPending}>
          Yuborish
        </AuthPrimaryButton>

        <p className="text-center text-[1.02rem] text-white/62">
          <Link className="font-bold text-white transition-colors hover:text-[#f6d489]" to="/login-form">
            Kirishga qaytish
          </Link>
        </p>
      </form>
    </div>
  );
};
