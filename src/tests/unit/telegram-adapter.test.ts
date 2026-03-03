import { beforeEach, describe, expect, it } from "vitest";
import { TelegramBrowserAdapter } from "@/shared/telegram/telegram-browser-adapter";
import { TelegramWebAppAdapter } from "@/shared/telegram/telegram-webapp-adapter";

describe("telegram adapters", () => {
  beforeEach(() => {
    delete window.Telegram;
  });

  it("browser adapter is noop", () => {
    const adapter = new TelegramBrowserAdapter();
    expect(adapter.isAvailable()).toBe(false);
    expect(adapter.getInitData()).toBeNull();
  });

  it("webapp adapter reads runtime values", () => {
    window.Telegram = {
      WebApp: {
        ready: () => undefined,
        expand: () => undefined,
        initData: "query_id=1",
        contentSafeAreaInset: { top: 10, right: 0, bottom: 5, left: 0 },
      },
    };

    const adapter = new TelegramWebAppAdapter();
    expect(adapter.isAvailable()).toBe(true);
    expect(adapter.getInitData()).toBe("query_id=1");
    expect(adapter.getSafeAreaInsets().bottom).toBe(5);
  });
});
