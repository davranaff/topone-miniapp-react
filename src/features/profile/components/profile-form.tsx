import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { profileSchema, type ProfileSchema } from "@/features/profile/schemas/profile.schema";
import { useUpdateProfile } from "@/features/profile/hooks/use-update-profile";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { getErrorMessage } from "@/shared/lib/error-map";
import type { UserProfile } from "@/entities/user/types";

export const ProfileForm = ({ profile }: { profile: UserProfile }) => {
  const mutation = useUpdateProfile();
  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: profile.email,
      username: profile.username,
      phoneNumber: profile.phoneNumber ?? "",
      firstName: profile.firstName,
      lastName: profile.lastName,
      timezone: profile.timezone,
    },
  });

  useEffect(() => {
    form.reset({
      email: profile.email,
      username: profile.username,
      phoneNumber: profile.phoneNumber ?? "",
      firstName: profile.firstName,
      lastName: profile.lastName,
      timezone: profile.timezone,
    });
  }, [form, profile]);

  const onSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Ism" htmlFor="p-firstName" error={form.formState.errors.firstName?.message}>
          <Input id="p-firstName" error={!!form.formState.errors.firstName} {...form.register("firstName")} />
        </FormField>
        <FormField label="Familiya" htmlFor="p-lastName" error={form.formState.errors.lastName?.message}>
          <Input id="p-lastName" error={!!form.formState.errors.lastName} {...form.register("lastName")} />
        </FormField>
      </div>

      <FormField label="Email" htmlFor="p-email" error={form.formState.errors.email?.message}>
        <Input id="p-email" type="email" error={!!form.formState.errors.email} autoComplete="email" {...form.register("email")} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Username" htmlFor="p-username" error={form.formState.errors.username?.message}>
          <Input id="p-username" error={!!form.formState.errors.username} {...form.register("username")} />
        </FormField>
        <FormField label="Telefon" htmlFor="p-phone" error={form.formState.errors.phoneNumber?.message}>
          <Input id="p-phone" type="tel" error={!!form.formState.errors.phoneNumber} {...form.register("phoneNumber")} />
        </FormField>
      </div>

      {mutation.error && (
        <p className="rounded-lg border border-danger/20 bg-danger/8 px-3 py-2 text-sm text-danger">
          {getErrorMessage(mutation.error)}
        </p>
      )}
      {mutation.isSuccess && (
        <p className="rounded-lg border border-success/20 bg-success/8 px-3 py-2 text-sm text-success">
          Profil yangilandi
        </p>
      )}

      <Button fullWidth type="submit" loading={mutation.isPending}>
        Saqlash
      </Button>
    </form>
  );
};
