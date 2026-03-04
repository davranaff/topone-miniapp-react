import { describe, expect, it } from "vitest";
import {
  buildTelegramVerificationPath,
  getTelegramInitDataWithRetry,
  getTelegramLoginPath,
  isValidPhoneNumber,
  normalizePhoneNumber,
} from "@/shared/lib/telegram-webapp";

describe("telegram-webapp helpers", () => {
  it("normalizes phone numbers to E.164-like format", () => {
    expect(normalizePhoneNumber("+998 90 123-45-67")).toBe("+998901234567");
    expect(normalizePhoneNumber("998 (90) 123 45 67")).toBe("+998901234567");
  });

  it("validates international phone numbers", () => {
    expect(isValidPhoneNumber("+998901234567")).toBe(true);
    expect(isValidPhoneNumber("123")).toBe(false);
  });

  it("builds the verification route with encoded query params", () => {
    expect(
      buildTelegramVerificationPath("+998901234567", "https://t.me/topone_bot?start=login_998901234567"),
    ).toBe(
      "/telegram-code-verification?phone=%2B998901234567&bot=https%3A%2F%2Ft.me%2Ftopone_bot%3Fstart%3Dlogin_998901234567",
    );
  });

  it("returns the correct login entry path for runtime type", () => {
    expect(getTelegramLoginPath(true)).toBe("/telegram/init");
    expect(getTelegramLoginPath(false)).toBe("/telegram-login");
  });

  it("retries initData lookup until Telegram becomes ready", async () => {
    let attempts = 0;
    const telegram = {
      getInitData: () => {
        attempts += 1;
        return attempts >= 3 ? "query_id=abc" : null;
      },
    };

    await expect(getTelegramInitDataWithRetry(telegram, 3)).resolves.toBe("query_id=abc");
  });
});
