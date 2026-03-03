import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "@/features/auth/store/auth.store";

describe("auth store", () => {
  beforeEach(() => {
    useAuthStore.setState({
      status: "idle",
      user: null,
      tokens: null,
      isTelegram: false,
      isBootstrapped: false,
      error: null,
    });
  });

  it("stores session", () => {
    useAuthStore.getState().setSession({
      user: {
        id: "1",
        email: "user@example.com",
        username: "user",
        firstName: "Test",
        lastName: "User",
        roles: ["student"],
      },
      tokens: {
        accessToken: "access",
        refreshToken: "refresh",
      },
    });

    const state = useAuthStore.getState();
    expect(state.status).toBe("authenticated");
    expect(state.tokens?.accessToken).toBe("access");
    expect(state.user?.username).toBe("user");
  });
});
