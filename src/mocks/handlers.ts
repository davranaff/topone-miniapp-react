import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("*/api/v1/auth/login", () =>
    HttpResponse.json({
      success: true,
      data: {
        access_token: "access-token",
        refresh_token: "refresh-token",
      },
    }),
  ),
  http.get("*/api/v1/auth/me", () =>
    HttpResponse.json({
      success: true,
      data: {
        id: "1",
        email: "test@example.com",
        username: "test",
        first_name: "Test",
        last_name: "User",
        timezone: "Asia/Tashkent",
        roles: ["student"],
      },
    }),
  ),
];
