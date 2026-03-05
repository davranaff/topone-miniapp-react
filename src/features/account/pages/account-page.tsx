import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import { useProfile } from "@/features/profile/hooks/use-profile";
import { useUpdateProfile } from "@/features/profile/hooks/use-update-profile";
import { MobileScreen, MobileScreenSection } from "@/shared/ui/mobile-screen";
import { PageHeader } from "@/shared/ui/page-header";
import { GlassCard } from "@/shared/ui/glass-card";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { SkeletonCard } from "@/shared/ui/skeleton";

const profileSchema = z.object({
  firstName: z.string().min(1, "Majburiy"),
  lastName: z.string().min(1, "Majburiy"),
  username: z.string().min(3, "Kamida 3 ta belgi"),
  email: z.string().email("Noto'g'ri email").or(z.literal("")),
  phoneNumber: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Majburiy"),
    newPassword: z.string().min(8, "Kamida 8 ta belgi"),
    confirmPassword: z.string().min(1, "Majburiy"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Parollar mos kelmaydi",
    path: ["confirmPassword"],
  });

type ProfileSchema = z.infer<typeof profileSchema>;
type PasswordSchema = z.infer<typeof passwordSchema>;

export const AccountPage = () => {
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  const profileForm = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    values: profile.data
      ? {
          firstName: profile.data.firstName,
          lastName: profile.data.lastName,
          username: profile.data.username,
          email: profile.data.email ?? "",
          phoneNumber: profile.data.phoneNumber ?? "",
        }
      : undefined,
  });

  const passwordForm = useForm<PasswordSchema>({ resolver: zodResolver(passwordSchema) });

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordSchema) =>
      apiClient.post(endpoints.auth.changePassword, {
        current_password: data.currentPassword,
        new_password: data.newPassword,
      }),
    onSuccess: () => {
      setPwSuccess(true);
      passwordForm.reset();
      setTimeout(() => setPwSuccess(false), 3000);
    },
  });

  if (profile.isLoading) {
    return (
      <MobileScreen className="space-y-4 lg:space-y-5">
        <SkeletonCard />
        <SkeletonCard />
      </MobileScreen>
    );
  }

  return (
    <MobileScreen className="space-y-4 lg:space-y-5">
      <PageHeader title="Akkaunt" subtitle="Shaxsiy ma'lumotlar" backButton />

      <MobileScreenSection className="mt-4 desktop-two-col">
        {/* Profile info */}
        <GlassCard>
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-t-muted">
            Shaxsiy ma'lumotlar
          </p>
          {updateProfile.isSuccess && (
            <div className="mb-3 rounded-xl border border-success/30 bg-success/10 px-4 py-2 text-sm text-success">
              Saqlandi ✓
            </div>
          )}
          {updateProfile.isError && (
            <div className="mb-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
              Xato yuz berdi
            </div>
          )}
          <form
            className="space-y-3"
            onSubmit={profileForm.handleSubmit((d) => updateProfile.mutate(d))}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="Ism" htmlFor="ac-first" error={profileForm.formState.errors.firstName?.message}>
                <Input id="ac-first" {...profileForm.register("firstName")} error={!!profileForm.formState.errors.firstName} />
              </FormField>
              <FormField label="Familiya" htmlFor="ac-last" error={profileForm.formState.errors.lastName?.message}>
                <Input id="ac-last" {...profileForm.register("lastName")} error={!!profileForm.formState.errors.lastName} />
              </FormField>
            </div>
            <FormField label="Username" htmlFor="ac-uname" error={profileForm.formState.errors.username?.message}>
              <Input id="ac-uname" {...profileForm.register("username")} error={!!profileForm.formState.errors.username} />
            </FormField>
            <FormField label="Email" htmlFor="ac-email" error={profileForm.formState.errors.email?.message}>
              <Input id="ac-email" type="email" {...profileForm.register("email")} error={!!profileForm.formState.errors.email} />
            </FormField>
            <FormField label="Telefon" htmlFor="ac-phone">
              <Input id="ac-phone" type="tel" {...profileForm.register("phoneNumber")} />
            </FormField>
            <Button
              fullWidth
              type="submit"
              loading={updateProfile.isPending}
              disabled={!profileForm.formState.isDirty}
            >
              Saqlash
            </Button>
          </form>
        </GlassCard>

        {/* Change password */}
        <GlassCard>
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-t-muted">
            Parolni o'zgartirish
          </p>
          {pwSuccess && (
            <div className="mb-3 rounded-xl border border-success/30 bg-success/10 px-4 py-2 text-sm text-success">
              Parol yangilandi ✓
            </div>
          )}
          {passwordMutation.isError && (
            <div className="mb-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
              Joriy parol noto'g'ri
            </div>
          )}
          <form
            className="space-y-3"
            onSubmit={passwordForm.handleSubmit((d) => passwordMutation.mutate(d))}
          >
            <FormField label="Joriy parol" htmlFor="ac-cur-pw" error={passwordForm.formState.errors.currentPassword?.message}>
              <Input
                id="ac-cur-pw"
                type={showCurrent ? "text" : "password"}
                trailingIcon={
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="liquid-glass-button-icon liquid-glass-surface-interactive flex h-8 w-8 items-center justify-center rounded-lg text-t-muted hover:text-t-primary"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                {...passwordForm.register("currentPassword")}
                error={!!passwordForm.formState.errors.currentPassword}
              />
            </FormField>
            <FormField label="Yangi parol" htmlFor="ac-new-pw" error={passwordForm.formState.errors.newPassword?.message}>
              <Input
                id="ac-new-pw"
                type={showNew ? "text" : "password"}
                trailingIcon={
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="liquid-glass-button-icon liquid-glass-surface-interactive flex h-8 w-8 items-center justify-center rounded-lg text-t-muted hover:text-t-primary"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                {...passwordForm.register("newPassword")}
                error={!!passwordForm.formState.errors.newPassword}
              />
            </FormField>
            <FormField label="Tasdiqlash" htmlFor="ac-conf-pw" error={passwordForm.formState.errors.confirmPassword?.message}>
              <Input id="ac-conf-pw" type="password" {...passwordForm.register("confirmPassword")} error={!!passwordForm.formState.errors.confirmPassword} />
            </FormField>
            <Button fullWidth type="submit" variant="outline" loading={passwordMutation.isPending}>
              Parolni yangilash
            </Button>
          </form>
        </GlassCard>
      </MobileScreenSection>
    </MobileScreen>
  );
};
