import type { ReactNode } from "react";
import type { AppRouteMeta } from "@/shared/types/route";

export type AppRouteDefinition = {
  path: string;
  element: ReactNode;
  meta: AppRouteMeta;
};
