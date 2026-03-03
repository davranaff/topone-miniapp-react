import { mapApiUser } from "@/entities/user/model";
import type { SessionUser, Tokens } from "@/features/auth/types/auth.types";

export const mapUserToSession = (raw: Record<string, unknown>): SessionUser => {
  const profile = mapApiUser(raw);

  return {
    id: profile.id,
    email: profile.email,
    username: profile.username,
    phoneNumber: profile.phoneNumber,
    firstName: profile.firstName,
    lastName: profile.lastName,
    avatarUrl: profile.avatarUrl,
    roles: profile.roles,
  };
};

export const mapTokens = (raw: Record<string, unknown>): Tokens => {
  const accessToken = String(raw.access_token ?? raw.accessToken ?? "");
  const refreshToken = String(raw.refresh_token ?? raw.refreshToken ?? "");

  return {
    accessToken,
    refreshToken,
  };
};
