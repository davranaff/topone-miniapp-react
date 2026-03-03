export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  home: {
    feed: ["home", "feed"] as const,
  },
  courses: {
    list: (filters: unknown) => ["courses", "list", filters] as const,
    detail: (courseId: string) => ["courses", "detail", courseId] as const,
  },
  profile: {
    me: ["profile", "me"] as const,
  },
  miniApps: {
    list: ["mini-apps", "list"] as const,
    detail: (slug: string) => ["mini-apps", "detail", slug] as const,
  },
} as const;
