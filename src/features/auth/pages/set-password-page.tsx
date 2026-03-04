import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Lock } from "lucide-react";
import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import {
  AuthField,
  AuthGlassPanel,
  AuthPrimaryButton,
  AuthTitleBlock,
} from "@/features/auth/components/auth-ui";

const schema = z
  .object({
    password: z.string().min(8, "Kamida 8 ta belgi"),
    confirmPassword: z.string().min(1, "Parolni tasdiqlang"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Parollar mos kelmaydi",
    path: ["confirmPassword"],
  });

type Schema = z.infer<typeof schema>;

export const SetPasswordPage = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<Schema>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: Schema) =>
      apiClient.post(endpoints.auth.setPasswordSimple, {
        new_password: data.password,
        confirm_password: data.confirmPassword,
      }),
    onSuccess: () => setSuccess(true),
  });

  const onSubmit = form.handleSubmit((data) => mutation.mutate(data));

  return (
    <div className="mx-auto flex w-full max-w-[28rem] flex-col justify-center py-6 sm:min-h-[38rem]">
      <AuthGlassPanel>
        {success ? (
          <div className="space-y-5 text-center">
            <AuthTitleBlock
              title="Parol o'rnatildi"
              subtitle="Yangi parol saqlandi. Endi profilingizga qaytishingiz mumkin."
            />
            <AuthPrimaryButton type="button" onClick={() => navigate("/profile")}>
              Profilga qaytish
            </AuthPrimaryButton>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            {mutation.isError && (
              <div className="liquid-glass-state-danger rounded-[1.2rem] px-4 py-3 text-sm text-red-100">
                Xato yuz berdi. Qayta urinib ko'ring.
              </div>
            )}

            <AuthTitleBlock
              title="Parol o'rnatish"
              subtitle="Akkauntingiz uchun yangi parolni kiriting"
            />

            <AuthField
              label="Yangi parol"
              placeholder="Kamida 8 ta belgi"
              type={showPassword ? "text" : "password"}
              icon={<Lock className="h-6 w-6" />}
              trailing={(
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="liquid-glass-button-icon liquid-glass-surface-interactive flex h-10 w-10 items-center justify-center rounded-xl text-t-secondary transition-colors hover:text-t-primary"
                >
                  {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
              )}
              error={form.formState.errors.password?.message}
              {...form.register("password")}
            />

            <AuthField
              label="Parolni tasdiqlash"
              placeholder="Parolni qayta kiriting"
              type={showConfirmPassword ? "text" : "password"}
              icon={<Lock className="h-6 w-6" />}
              trailing={(
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="liquid-glass-button-icon liquid-glass-surface-interactive flex h-10 w-10 items-center justify-center rounded-xl text-t-secondary transition-colors hover:text-t-primary"
                >
                  {showConfirmPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
              )}
              error={form.formState.errors.confirmPassword?.message}
              {...form.register("confirmPassword")}
            />

            <AuthPrimaryButton type="submit" loading={mutation.isPending}>
              O'rnatish
            </AuthPrimaryButton>
          </form>
        )}
      </AuthGlassPanel>
    </div>
  );
};
