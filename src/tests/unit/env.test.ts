import { describe, expect, it } from "vitest";
import { envSchema } from "@/shared/config/env";

describe("env schema", () => {
  it("parses valid env", () => {
    expect(
      envSchema.parse({
        VITE_API_BASE_URL: "https://api.top1secret.uz",
        VITE_APP_ENV: "development",
      }),
    ).toEqual({
      VITE_API_BASE_URL: "https://api.top1secret.uz",
      VITE_APP_ENV: "development",
    });
  });

  it("throws on invalid env", () => {
    expect(() =>
      envSchema.parse({
        VITE_API_BASE_URL: "not-a-url",
        VITE_APP_ENV: "broken",
      }),
    ).toThrow();
  });
});
