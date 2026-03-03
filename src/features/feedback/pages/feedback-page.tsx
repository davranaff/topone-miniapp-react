import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { MessageSquarePlus } from "lucide-react";
import { apiClient } from "@/shared/api/client";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

const schema = z.object({
  subject: z.string().min(3, "Kamida 3 ta belgi"),
  message: z.string().min(10, "Kamida 10 ta belgi"),
});
type Schema = z.infer<typeof schema>;

const SUBJECTS = [
  "Texnik muammo",
  "Kontent haqida",
  "To'lov muammosi",
  "Taklif",
  "Boshqa",
];

export const FeedbackPage = () => {
  const [sent, setSent] = useState(false);
  const form = useForm<Schema>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: Schema) =>
      apiClient.post("/api/v1/feedback/", {
        subject: data.subject,
        message: data.message,
      }),
    onSuccess: () => {
      setSent(true);
      form.reset();
    },
  });

  return (
    <MobileScreen>
      <PageHeader title="Fikr-mulohaza" subtitle="Taklif yoki muammoingizni yuboring" backButton />

      <div className="mt-4">
        {sent ? (
          <GlassCard goldBorder className="text-center">
            <MessageSquarePlus className="mx-auto h-8 w-8 text-gold mb-2" />
            <p className="text-sm font-semibold text-t-primary">Fikringiz yuborildi!</p>
            <p className="mt-1 text-xs text-t-muted">Tez orada ko'rib chiqamiz. Rahmat!</p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => setSent(false)}>
              Yana yuborish
            </Button>
          </GlassCard>
        ) : (
          <GlassCard>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
            >
              {mutation.isError && (
                <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
                  Xato yuz berdi. Qayta urinib ko'ring.
                </div>
              )}

              <FormField label="Mavzu" htmlFor="fb-subject" error={form.formState.errors.subject?.message}>
                <div className="flex flex-wrap gap-2 mb-2">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => form.setValue("subject", s, { shouldValidate: true })}
                      className={`rounded-lg border px-3 py-1 text-xs font-medium transition-all ${
                        form.watch("subject") === s
                          ? "border-gold/40 bg-gold/10 text-gold"
                          : "border-border/40 bg-elevated text-t-muted hover:border-gold/20"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <Input
                  id="fb-subject"
                  placeholder="Yoki o'zingiz yozing"
                  {...form.register("subject")}
                  error={!!form.formState.errors.subject}
                />
              </FormField>

              <FormField label="Xabar" htmlFor="fb-message" error={form.formState.errors.message?.message}>
                <textarea
                  id="fb-message"
                  rows={5}
                  placeholder="Muammo yoki taklifingizni batafsil yozing..."
                  className="w-full resize-none rounded-xl border border-border/60 bg-elevated px-4 py-3 text-sm text-t-primary placeholder:text-t-muted focus:border-gold/40 focus:outline-none transition-colors"
                  {...form.register("message")}
                />
                {form.formState.errors.message && (
                  <p className="text-xs text-danger">{form.formState.errors.message.message}</p>
                )}
              </FormField>

              <Button fullWidth type="submit" loading={mutation.isPending}>
                Yuborish
              </Button>
            </form>
          </GlassCard>
        )}
      </div>
    </MobileScreen>
  );
};
