import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { ProtectedRoute } from "@/app/router/protected-route";
import { useAuthStore } from "@/features/auth/store/auth.store";

describe("ProtectedRoute", () => {
  beforeEach(() => {
    useAuthStore.setState({
      status: "anonymous",
      user: null,
      tokens: null,
      isTelegram: false,
      isBootstrapped: true,
      error: null,
    });
  });

  it("redirects anonymous users to login", () => {
    render(
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/private"
            element={
              <ProtectedRoute>
                <div>Private Page</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
