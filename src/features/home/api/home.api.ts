import { authApi } from "@/features/auth/api/auth.api";
import { ApiError } from "@/shared/api/api-error";
import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import { buildQueryString } from "@/shared/lib/url";
import { challengesApi } from "@/features/challenges/api/challenges.api";
import { coursesApi } from "@/features/courses/api/courses.api";
import type { HomeAnnouncement, HomeFeed } from "@/features/home/types/home.types";

const mapAnnouncement = (raw: Record<string, unknown>): HomeAnnouncement => ({
  id: String(raw.id ?? ""),
  title: String(raw.title ?? ""),
  description: String(raw.description ?? ""),
  imageUrl: raw.image_url ? String(raw.image_url) : undefined,
  actionUrl: raw.action_url ? String(raw.action_url) : undefined,
  actionType: String(raw.action_type ?? "web"),
  orderIndex: Number(raw.order_index ?? 0),
});

const getAnnouncements = async () => {
  const response = await apiClient.get(
    `${endpoints.announcements.list}${buildQueryString({ page: 1, size: 5 })}`,
  );
  const payload = response.data as Record<string, unknown>;
  const items = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload.items)
      ? payload.items
      : [];

  return items.map(mapAnnouncement).sort((left, right) => left.orderIndex - right.orderIndex);
};

export const homeApi = {
  async getFeed(): Promise<HomeFeed> {
    const profile = await authApi.getProfile();
    const [announcementsResult, coursesResult, challengesResult, subscriptionStatusResult] =
      await Promise.allSettled([
        getAnnouncements(),
        coursesApi.list({ page: 1, size: 8 }),
        challengesApi.list({ page: 1, size: 6 }),
        authApi.getSubscriptionStatus(),
      ]);

    const announcements = announcementsResult.status === "fulfilled"
      ? announcementsResult.value
      : [];
    let courseAccess: HomeFeed["courseAccess"] = "granted";
    let courses = [] as HomeFeed["courses"];

    if (coursesResult.status === "fulfilled") {
      courses = coursesResult.value.items;
    } else if (
      coursesResult.reason instanceof ApiError &&
      coursesResult.reason.statusCode === 403
    ) {
      courseAccess = "denied";
    }

    let challengeAccess: HomeFeed["challengeAccess"] = "granted";
    let challenges = [] as HomeFeed["challenges"];

    if (challengesResult.status === "fulfilled") {
      challenges = challengesResult.value.items;
    } else if (
      challengesResult.reason instanceof ApiError &&
      challengesResult.reason.statusCode === 403
    ) {
      challengeAccess = "denied";
    }

    return {
      profile,
      announcements,
      courses,
      courseAccess,
      challenges,
      challengeAccess,
      subscriptionStatus:
        subscriptionStatusResult.status === "fulfilled"
          ? subscriptionStatusResult.value
          : undefined,
    };
  },
};
