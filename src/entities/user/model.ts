import type { UserProfile } from "@/entities/user/types";

type RawUser = Record<string, unknown>;

export const mapApiUser = (raw: RawUser): UserProfile => {
  const roles =
    (raw.roles as Array<{ name?: string } | string> | undefined)?.map((role) =>
      typeof role === "string" ? role : (role.name ?? ""),
    ) ?? [];

  return {
    id: String(raw.id ?? ""),
    email: String(raw.email ?? ""),
    username: String(raw.username ?? ""),
    phoneNumber: raw.phone_number ? String(raw.phone_number) : undefined,
    firstName: String(raw.first_name ?? ""),
    lastName: String(raw.last_name ?? ""),
    timezone: String(raw.timezone ?? "Asia/Tashkent"),
    avatarUrl: raw.avatar_url ? String(raw.avatar_url) : undefined,
    roles: roles.filter(Boolean),
    joinedAt: raw.joined_at ? String(raw.joined_at) : undefined,
    hasPassword: Boolean(raw.has_password),
    hasActiveSubscription: Boolean(raw.has_active_subscription),
    subscriptionType: raw.subscription_type ? String(raw.subscription_type) : undefined,
  };
};
