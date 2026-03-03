import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";
import { Button } from "@/shared/ui/button";

export const AppErrorPage = () => {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Unknown application error";

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4">
      <div className="w-full max-w-xl rounded-[2rem] border border-border bg-surface p-8 shadow-card">
        <p className="text-sm uppercase tracking-[0.16em] text-primary">Application Error</p>
        <h1 className="mt-3 text-3xl font-semibold text-text">Что-то сломалось в текущем route tree</h1>
        <p className="mt-4 text-sm text-muted">{message}</p>
        <div className="mt-6 flex gap-3">
          <Button type="button" onClick={() => window.location.assign("/home")}>
            На главную
          </Button>
          <Link className="inline-flex h-11 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-text" to="/login">
            Логин
          </Link>
        </div>
      </div>
    </div>
  );
};
