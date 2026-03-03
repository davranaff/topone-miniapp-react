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
    <form className="space-y-4 rounded-lg border border-border bg-surface p-6 shadow-card" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Имя" error={form.formState.errors.firstName?.message}>
          <Input {...form.register("firstName")} />
        </FormField>
        <FormField label="Фамилия" error={form.formState.errors.lastName?.message}>
          <Input {...form.register("lastName")} />
        </FormField>
      </div>
      <FormField label="Email" error={form.formState.errors.email?.message}>
        <Input {...form.register("email")} />
      </FormField>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Username" error={form.formState.errors.username?.message}>
          <Input {...form.register("username")} />
        </FormField>
        <FormField label="Телефон" error={form.formState.errors.phoneNumber?.message}>
          <Input {...form.register("phoneNumber")} />
        </FormField>
      </div>
      <FormField label="Timezone" error={form.formState.errors.timezone?.message}>
        <Input {...form.register("timezone")} />
      </FormField>
      {mutation.error ? <p className="text-sm text-error">{getErrorMessage(mutation.error)}</p> : null}
      {mutation.isSuccess ? <p className="text-sm text-primary">Профиль обновлён</p> : null}
      <Button type="submit" disabled={mutation.isPending}>
        Сохранить изменения
      </Button>
    </form>
  );
};
