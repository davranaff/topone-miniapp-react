import type { MiniApp } from "@/entities/mini-app/types";

export const mapApiMiniApp = (raw: Record<string, unknown>): MiniApp => {
  const id = String(raw.id ?? raw.slug ?? "");

  return {
    id,
    slug: String(raw.slug ?? id),
    name: String(raw.name ?? ""),
    description: String(raw.description ?? ""),
    iconUrl: String(raw.icon_url ?? ""),
    appUrl: String(raw.app_url ?? ""),
    category: String(raw.category ?? "other"),
    permissions: (raw.permissions as string[] | undefined) ?? [],
    isActive: raw.is_active === undefined ? true : Boolean(raw.is_active),
    sortOrder: Number(raw.sort_order ?? 0),
  };
};
