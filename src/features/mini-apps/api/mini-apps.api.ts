import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import { mapApiMiniApp } from "@/entities/mini-app/model";
import type { MiniApp } from "@/entities/mini-app/types";

const fallbackMiniApps: MiniApp[] = [
  {
    id: "calorie-tracker",
    slug: "calorie-tracker",
    name: "Calorie Tracker",
    description: "Track your daily nutrition and macros",
    iconUrl: "",
    appUrl: "asset:assets/mini_apps/calorie/index.html",
    category: "health",
    permissions: [],
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "habit-tracker",
    slug: "habit-tracker",
    name: "Habit Tracker",
    description: "Build better habits with streak tracking",
    iconUrl: "",
    appUrl: "asset:assets/mini_apps/habits/index.html",
    category: "productivity",
    permissions: [],
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "pomodoro",
    slug: "pomodoro",
    name: "Pomodoro",
    description: "Focus timer for productive study sessions",
    iconUrl: "",
    appUrl: "asset:assets/mini_apps/pomodoro/index.html",
    category: "productivity",
    permissions: [],
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "bridge-demo",
    slug: "bridge-demo",
    name: "Bridge Demo",
    description: "Test the TopOne JS bridge APIs",
    iconUrl: "",
    appUrl: "asset:assets/mini_apps/demo/index.html",
    category: "tools",
    permissions: [],
    isActive: true,
    sortOrder: 99,
  },
];

export const miniAppsApi = {
  async list(): Promise<MiniApp[]> {
    try {
      const response = await apiClient.get(endpoints.miniApps.list);
      const payload = (response.data?.data ?? response.data) as Array<Record<string, unknown>>;
      return payload.map(mapApiMiniApp).sort((a, b) => a.sortOrder - b.sortOrder);
    } catch {
      return fallbackMiniApps;
    }
  },
  async detail(slug: string): Promise<MiniApp | null> {
    const items = await miniAppsApi.list();
    return items.find((item) => item.slug === slug || item.id === slug) ?? null;
  },
};
