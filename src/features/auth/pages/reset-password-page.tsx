import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

const schema = z
  .object({
    token: z.string().min(1, "Token kiritilishi shart"),
    password: z.string().min(8, "Kamida 8 ta belgi"),
    confirmPassword: z.string().min(1, "Parolni tasdiqlang"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Parollar mos kelmaydi",
    path: ["confirmPassword"],
  });

type Schema = z.infer<typeof schema>;

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const form = useForm<Schema>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: Schema) =>
      apiClient.post(endpoints.auth.resetPassword, {
        token: data.token,
        new_password: data.password,
        confirm_password: data.confirmPassword,
      }, { skipAuth: true }),
    onSuccess: () => setSuccess(true),
  });

  const onSubmit = form.handleSubmit((data) => mutation.mutate(data));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-5">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10">
            <KeyRound className="h-6 w-6 text-gold" />
          </div>
          <h1 className="text-xl font-bold text-t-primary">Parolni yangilash</h1>
          <p className="text-center text-sm text-t-muted">Emailingizga yuborilgan kodni kiriting</p>
        </div>

        {success ? (
          <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-center">
            <p className="text-sm font-semibold text-success">Parol muvaffaqiyatli yangilandi!</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => navigate("/login")}>
              Kirish
            </Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            {mutation.isError && (
              <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                Xato yuz berdi. Token yaroqsiz yoki muddati o'tgan.
              </div>
            )}
            <FormField label="Tasdiqlash kodi" htmlFor="rp-token" error={form.formState.errors.token?.message}>
              <Input id="rp-token" placeholder="Token" {...form.register("token")} error={!!form.formState.errors.token} />
            </FormField>
            <FormField label="Yangi parol" htmlFor="rp-pass" error={form.formState.errors.password?.message}>
              <Input id="rp-pass" type="password" placeholder="Kamida 8 ta belgi" {...form.register("password")} error={!!form.formState.errors.password} />
            </FormField>
            <FormField label="Parolni tasdiqlang" htmlFor="rp-confirm" error={form.formState.errors.confirmPassword?.message}>
              <Input id="rp-confirm" type="password" placeholder="Parolni qayta kiriting" {...form.register("confirmPassword")} error={!!form.formState.errors.confirmPassword} />
            </FormField>
            <Button fullWidth type="submit" loading={mutation.isPending}>Yangilash</Button>
            <Button fullWidth variant="ghost" type="button" onClick={() => navigate("/login")}>Orqaga</Button>
          </form>
        )}
      </div>
    </div>
  );
};
