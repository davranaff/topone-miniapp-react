import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthBootstrapProvider } from "@/app/providers/auth-bootstrap-provider";
import { TelegramContext } from "@/shared/telegram/telegram-context";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { tokenStorage } from "@/shared/auth/token-storage";

vi.mock("@/features/auth/api/auth.api", () => ({
  authApi: {
    getCurrentUser: vi.fn().mockResolvedValue({
      id: "1",
      email: "user@example.com",
      username: "user",
      firstName: "Test",
      lastName: "User",
      roles: ["student"],
    }),
  },
}));

describe("AuthBootstrapProvider", () => {
  it("bootstraps session from stored tokens", async () => {
    window.localStorage.setItem("topone.access-token", "access");
    window.localStorage.setItem("topone.refresh-token", "refresh");

    render(
      <TelegramContext.Provider
        value={{
          isAvailable: () => false,
          ready: () => undefined,
          expand: () => undefined,
          getInitData: () => null,
          getSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
          disableVerticalSwipes: () => undefined,
          enableClosingConfirmation: () => undefined,
        }}
      >
        <AuthBootstrapProvider>
          <div />
        </AuthBootstrapProvider>
      </TelegramContext.Provider>,
    );

    await waitFor(() => expect(useAuthStore.getState().isBootstrapped).toBe(true));
    expect(tokenStorage.getTokens()?.accessToken).toBe("access");
  });
});
