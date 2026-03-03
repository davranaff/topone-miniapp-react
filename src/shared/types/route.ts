export type AppRouteMeta = {
  requiresAuth: boolean;
  guestOnly?: boolean;
  telegramOnly?: boolean;
  layout: "app" | "auth" | "telegram";
};
