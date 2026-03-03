import type { ReactElement } from "react";
import type { AppRouteMeta } from "@/shared/types/route";

export type AppRouteDefinition = {
  path: string;
  element: ReactElement;
  meta: AppRouteMeta;
};
