import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AxiosInstance } from "axios";
import { attachInterceptors } from "@/shared/api/interceptors";
import { tokenStorage } from "@/shared/auth/token-storage";

describe("interceptors", () => {
  const requestUse = vi.fn();
  const responseUse = vi.fn();

  beforeEach(() => {
    requestUse.mockReset();
    responseUse.mockReset();
  });

  it("registers request and response interceptors", () => {
    attachInterceptors({
      interceptors: {
        request: { use: requestUse },
        response: { use: responseUse },
      },
    } as unknown as AxiosInstance);

    expect(requestUse).toHaveBeenCalledTimes(1);
    expect(responseUse).toHaveBeenCalledTimes(1);
  });

  it("adds auth header to request config", async () => {
    window.localStorage.setItem("topone.access-token", "access");
    window.localStorage.setItem("topone.refresh-token", "refresh");

    attachInterceptors({
      interceptors: {
        request: {
          use: (fn: (value: { url?: string; headers: Headers }) => unknown) => {
            const headers = new Headers();
            fn({ url: "/api/v1/auth/me", headers });
            expect(headers.get("Authorization")).toBe("Bearer access");
          },
        },
        response: { use: vi.fn() },
      },
    } as unknown as AxiosInstance);

    expect(tokenStorage.getTokens()?.accessToken).toBe("access");
  });
});
