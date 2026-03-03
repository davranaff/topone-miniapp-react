import { authApi } from "@/features/auth/api/auth.api";
import { coursesApi } from "@/features/courses/api/courses.api";
import { miniAppsApi } from "@/features/mini-apps/api/mini-apps.api";
import type { HomeFeed } from "@/features/home/types/home.types";

export const homeApi = {
  async getFeed(): Promise<HomeFeed> {
    const [profile, courses, miniApps] = await Promise.all([
      authApi.getProfile(),
      coursesApi.list({ page: 1, size: 3 }),
      miniAppsApi.list(),
    ]);

    return {
      profile,
      courses: courses.items,
      miniApps: miniApps.slice(0, 3),
    };
  },
};
