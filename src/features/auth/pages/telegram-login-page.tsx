import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { MessageCircle, Phone } from "lucide-react";
import { authApi } from "@/features/auth/api/auth.api";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { getErrorMessage } from "@/shared/lib/error-map";
import {
  buildTelegramVerificationPath,
  isValidPhoneNumber,
  normalizePhoneNumber,
  openTelegramLink,
} from "@/shared/lib/telegram-webapp";

const schema = z.object({
  phone: z
    .string()
    .min(1, "Telefon raqamni kiriting")
    .refine((value) => isValidPhoneNumber(value), "Telefon raqam noto'g'ri"),
});

type Schema = z.infer<typeof schema>;

export const TelegramLoginPage = () => {
  const navigate = useNavigate();
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: "+",
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (values: Schema) => {
      const phoneNumber = normalizePhoneNumber(values.phone);
      const response = await authApi.requestTelegramLogin({ phoneNumber });

      return {
        ...response,
        phoneNumber,
      };
    },
    onSuccess: ({ botUrl, phoneNumber }) => {
      openTelegramLink(botUrl);
      navigate(buildTelegramVerificationPath(phoneNumber, botUrl), {
        replace: true,
        state: { phoneNumber, botUrl },
      });
    },
  });

  const onSubmit = form.handleSubmit((values) => requestMutation.mutate(values));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-5">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10">
            <MessageCircle className="h-6 w-6 text-gold" />
          </div>
          <h1 className="text-xl font-bold text-t-primary">Telegram orqali kirish</h1>
          <p className="text-sm text-t-muted">
            Telefon raqamingizni kiriting. Keyin Telegram bot orqali 6 xonali kodni olasiz.
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          {requestMutation.isError ? (
            <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {getErrorMessage(requestMutation.error)}
            </div>
          ) : null}

          <FormField
            label="Telefon raqam"
            htmlFor="tg-phone"
            error={form.formState.errors.phone?.message}
          >
            <Input
              id="tg-phone"
              type="tel"
              inputMode="tel"
              placeholder="+998901234567"
              leadingIcon={<Phone className="h-4 w-4" />}
              autoComplete="tel"
              error={!!form.formState.errors.phone}
              {...form.register("phone")}
            />
          </FormField>

          <Button fullWidth type="submit" loading={requestMutation.isPending}>
            Telegram botni ochish
          </Button>

          <Button fullWidth variant="ghost" type="button" onClick={() => navigate("/login")}>
            Orqaga
          </Button>
        </form>
      </div>
    </div>
  );
};
