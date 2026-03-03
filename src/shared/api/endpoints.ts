export const endpoints = {
  auth: {
    login: "/api/v1/auth/login",
    register: "/api/v1/auth/register",
    forgotPassword: "/api/v2/auth/forgot-password",
    me: "/api/v1/auth/me",
    refresh: "/api/v1/auth/refresh",
    telegramAuth: "/api/v1/telegram/auth/telegram",
  },
  courses: {
    list: "/api/v1/courses/",
    detail: (courseId: string) => `/api/v1/courses/${courseId}`,
  },
  profile: {
    me: "/api/v1/auth/me",
  },
  miniApps: {
    list: "/api/v1/mini-apps",
    detail: (slug: string) => `/api/v1/mini-apps/${slug}`,
  },
} as const;
