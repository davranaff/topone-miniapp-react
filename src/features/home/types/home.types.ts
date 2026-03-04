import type { SubscriptionStatus } from "@/features/auth/types/auth.types";
import type { Challenge } from "@/entities/challenge/types";
import type { Course } from "@/entities/course/types";
import type { UserProfile } from "@/entities/user/types";

export type HomeAnnouncement = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  actionUrl?: string;
  actionType: string;
  orderIndex: number;
};

export type HomeFeed = {
  profile: UserProfile;
  announcements: HomeAnnouncement[];
  courses: Course[];
  courseAccess: "granted" | "denied";
  challenges: Challenge[];
  challengeAccess: "granted" | "denied";
  subscriptionStatus?: SubscriptionStatus;
};
