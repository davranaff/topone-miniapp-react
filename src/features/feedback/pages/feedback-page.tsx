import { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Check, Info, Megaphone } from "lucide-react";
import type { HomeAnnouncement } from "@/features/home/types/home.types";
import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import { MobileScreen } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { Button } from "@/shared/ui/button";
import { getErrorMessage } from "@/shared/lib/error-map";

const schema = z.object({
  message: z
    .string()
    .trim()
    .min(10, "Kamida 10 ta belgi kiriting")
    .max(4000, "Matn 4000 belgidan oshmasligi kerak"),
});

type Schema = z.infer<typeof schema>;

type FeedbackLocationState = {
  announcement?: HomeAnnouncement;
};

export const FeedbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [sent, setSent] = useState(false);
  const locationState = (location.state as FeedbackLocationState | null) ?? null;

  const announcementId = searchParams.get("announcementId") ?? locationState?.announcement?.id ?? "";
  const announcementTitle = searchParams.get("title") ?? locationState?.announcement?.title ?? "";

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      message: "",
    },
  });

  const platform = useMemo(() => {
    if (typeof navigator === "undefined") {
      return "web";
    }

    return /iphone|ipad|ipod/i.test(navigator.userAgent) ? "ios-web" : "web";
  }, []);

  const mutation = useMutation({
    mutationFn: async (data: Schema) => {
      const payload = new FormData();
      payload.append("announcement_id", announcementId);
      payload.append("message", data.message.trim());
      payload.append("platform", platform);
      payload.append("locale", navigator.language || "uz");

      return apiClient.post(endpoints.feedback.mobile, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      setSent(true);
      form.reset();
    },
  });

  return (
    <MobileScreen>
      <PageHeader title="Fikr-mulohaza" subtitle="Banner bo'yicha xabaringizni yuboring" backButton />

      <div className="mt-4">
        {!announcementId ? (
          <GlassCard className="space-y-3 text-center">
            <Info className="mx-auto h-8 w-8 text-gold" />
            <p className="text-sm font-semibold text-t-primary">Feedback banner topilmadi</p>
            <p className="text-xs leading-5 text-t-muted">
              Bu sahifa faqat feedback action bo'lgan announcement orqali ochiladi.
            </p>
            <Button variant="ghost" size="sm" onClick={() => navigate("/home")}>
              Bosh sahifaga qaytish
            </Button>
          </GlassCard>
        ) : sent ? (
          <GlassCard className="space-y-3 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold">
              <Check className="h-8 w-8" />
            </div>
            <p className="text-lg font-semibold text-t-primary">Rahmat</p>
            <p className="text-sm leading-6 text-t-muted">
              Fikringiz muvaffaqiyatli yuborildi. Uni ko'rib chiqamiz.
            </p>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              Yopish
            </Button>
          </GlassCard>
        ) : (
          <GlassCard className="space-y-5">
            <div className="rounded-[1.1rem] border border-gold/20 bg-gold/8 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/80">
                    Feedback banner
                  </p>
                  <p className="mt-1 text-sm font-semibold text-t-primary">
                    {announcementTitle || "Announcement"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1rem] border border-white/8 bg-white/4 px-4 py-3 text-xs text-white/65">
              Foydalanuvchi identifikatsiyasi va platforma ma'lumotlari avtomatik qo'shiladi.
            </div>

            {mutation.isError ? (
              <div className="rounded-[1rem] border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                {getErrorMessage(mutation.error)}
              </div>
            ) : null}

            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            >
              <div className="space-y-2">
                <label className="text-sm font-semibold text-t-primary" htmlFor="feedback-message">
                  Xabar
                </label>
                <textarea
                  id="feedback-message"
                  rows={6}
                  placeholder="Muammo yoki taklifingizni batafsil yozing..."
                  className="w-full resize-none rounded-[1.2rem] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-4 text-sm text-white placeholder:text-white/38 outline-none transition-colors focus:border-gold/35"
                  {...form.register("message")}
                />
                {form.formState.errors.message ? (
                  <p className="text-xs text-danger">{form.formState.errors.message.message}</p>
                ) : null}
              </div>

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
