import type { Course } from "@/entities/course/types";
import type { MiniApp } from "@/entities/mini-app/types";
import type { UserProfile } from "@/entities/user/types";

export type HomeFeed = {
  profile: UserProfile;
  courses: Course[];
  miniApps: MiniApp[];
};
