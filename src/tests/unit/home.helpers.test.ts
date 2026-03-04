import { describe, expect, it, vi } from "vitest";
import {
  formatCountdown,
  getNextDailyCycle,
  getRemainingCountdown,
  normalizeMediaUrl,
  parseDailyCutoffTime,
} from "@/features/home/lib/home.helpers";

vi.mock("@/shared/config/env", () => ({
  env: {
    VITE_API_BASE_URL: "https://api.topone.test/api/v1",
  },
}));

describe("home.helpers", () => {
  it("parses last purchase time", () => {
    expect(parseDailyCutoffTime("09:15:30")).toEqual({ hour: 9, minute: 15, second: 30 });
    expect(parseDailyCutoffTime("09:15")).toEqual({ hour: 9, minute: 15, second: 0 });
    expect(parseDailyCutoffTime("bad")).toBeNull();
  });

  it("calculates the next cycle from last_purchase_time", () => {
    const now = new Date("2026-03-04T10:00:00+05:00");
    const next = getNextDailyCycle(now, { subscribed: true, isPremium: true, lastPurchaseTime: "18:30:00" });

    expect(next.toISOString()).toBe(new Date("2026-03-04T18:30:00+05:00").toISOString());
  });

  it("falls back to purchase date if time of day is unavailable", () => {
    const now = new Date("2026-03-04T10:00:00+05:00");
    const next = getNextDailyCycle(now, {
      subscribed: true,
      isPremium: true,
      purchaseDate: "2026-03-03T07:00:00+05:00",
    });

    expect(next.toISOString()).toBe(new Date("2026-03-05T07:00:00+05:00").toISOString());
  });

  it("formats countdown into fixed width parts", () => {
    expect(formatCountdown(3_723_000)).toEqual(["01", "02", "03"]);
    expect(getRemainingCountdown(new Date("2026-03-04T10:00:00+05:00"))).toBeGreaterThan(0);
  });

  it("normalizes relative media urls against API base url", () => {
    expect(normalizeMediaUrl("/media/banner.png")).toBe("https://api.topone.test/media/banner.png");
    expect(normalizeMediaUrl("//cdn.topone.test/banner.png")).toBe("https://cdn.topone.test/banner.png");
  });
});
