export type UserProfile = {
  id: string;
  email: string;
  username: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  timezone: string;
  avatarUrl?: string;
  roles: string[];
  joinedAt?: string;
  hasPassword?: boolean;
  hasActiveSubscription?: boolean;
  subscriptionType?: string;
};

export type UserProfileUpdate = Partial<
  Pick<UserProfile, "email" | "username" | "phoneNumber" | "firstName" | "lastName" | "timezone">
>;
