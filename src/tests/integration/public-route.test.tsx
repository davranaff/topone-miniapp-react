import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { PublicRoute } from "@/app/router/public-route";
import { useAuthStore } from "@/features/auth/store/auth.store";

describe("PublicRoute", () => {
  beforeEach(() => {
    window.sessionStorage.clear();

    useAuthStore.setState({
      status: "anonymous",
      user: null,
      tokens: null,
      isTelegram: false,
      isBootstrapped: true,
      error: null,
    });
  });

  it("keeps normal web guest on login page", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <div>Login Page</div>
              </PublicRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("redirects mini-app guest from login to telegram init", () => {
    useAuthStore.setState({
      status: "anonymous",
      user: null,
      tokens: null,
      isTelegram: true,
      isBootstrapped: true,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <div>Login Page</div>
              </PublicRoute>
            }
          />
          <Route path="/telegram/init" element={<div>Telegram Init</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Telegram Init")).toBeInTheDocument();
  });

  it("allows fallback login inside mini-app", () => {
    useAuthStore.setState({
      status: "anonymous",
      user: null,
      tokens: null,
      isTelegram: true,
      isBootstrapped: true,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={["/login?fallback=telegram"]}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <div>Login Page</div>
              </PublicRoute>
            }
          />
          <Route path="/telegram/init" element={<div>Telegram Init</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("keeps fallback mode on other guest auth routes in mini-app", () => {
    useAuthStore.setState({
      status: "anonymous",
      user: null,
      tokens: null,
      isTelegram: true,
      isBootstrapped: true,
      error: null,
    });

    window.sessionStorage.setItem("tg_auth_fallback", "1");

    render(
      <MemoryRouter initialEntries={["/login-form"]}>
        <Routes>
          <Route
            path="/login-form"
            element={
              <PublicRoute>
                <div>Login Form Page</div>
              </PublicRoute>
            }
          />
          <Route path="/telegram/init" element={<div>Telegram Init</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login Form Page")).toBeInTheDocument();
  });
});
