import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import type { ResourceCategory, ResourceItem } from "@/features/resources/types/resource.types";

const toOptionalString = (value: unknown) => {
  if (value == null) return undefined;
  const normalized = String(value).trim();
  return normalized ? normalized : undefined;
};

const mapCategory = (raw: Record<string, unknown>): ResourceCategory => {
  const name = String(raw.name ?? raw.category ?? raw.id ?? "");
  const id = String(raw.id ?? raw.category ?? raw.name ?? "");

  return {
    id,
    name,
    count: Number(raw.count ?? raw.resource_count ?? 0),
    orderIndex:
      raw.order_index != null || raw.orderIndex != null
        ? Number(raw.order_index ?? raw.orderIndex)
        : undefined,
  };
};

const mapResource = (raw: Record<string, unknown>): ResourceItem => ({
  id: String(raw.id ?? ""),
  title: String(raw.title ?? raw.name ?? ""),
  description: toOptionalString(raw.description),
  category: toOptionalString(raw.category),
  type: toOptionalString(raw.type),
  url: toOptionalString(raw.url ?? raw.file_url),
  author: toOptionalString(raw.author),
  tags: Array.isArray(raw.tags) ? raw.tags.map((item) => String(item)) : [],
  language: toOptionalString(raw.language),
  isFeatured: Boolean(raw.is_featured ?? raw.isFeatured ?? false),
  isActive: raw.is_active == null ? true : Boolean(raw.is_active ?? raw.isActive),
  viewCount: Number(raw.view_count ?? raw.viewCount ?? 0),
  rating:
    raw.rating == null
      ? undefined
      : Number.isNaN(Number(raw.rating))
        ? undefined
        : Number(raw.rating),
  isLocked: Boolean(raw.is_locked ?? raw.isLocked ?? false),
});

export const resourcesApi = {
  async categories(): Promise<ResourceCategory[]> {
    const res = await apiClient.get(endpoints.resources.categories, {
      params: { page: 1, size: 50 },
    });
    const payload = res.data?.data ?? res.data;
    const items = Array.isArray(payload) ? payload : (payload?.items ?? payload?.results ?? []);

    return (items as Array<Record<string, unknown>>)
      .map(mapCategory)
      .filter((item) => item.id && item.name)
      .sort((left, right) => {
        if (left.orderIndex != null && right.orderIndex != null) {
          return left.orderIndex - right.orderIndex;
        }

        return left.name.localeCompare(right.name);
      });
  },

  async list({
    category,
    page = 1,
    size = 100,
  }: {
    category?: string;
    page?: number;
    size?: number;
  } = {}): Promise<ResourceItem[]> {
    const res = await apiClient.get(endpoints.resources.list, {
      params: {
        page,
        size,
        ...(category ? { category } : {}),
      },
    });
    const payload = res.data?.data ?? res.data;
    const items = Array.isArray(payload) ? payload : (payload?.items ?? payload?.results ?? []);

    return (items as Array<Record<string, unknown>>)
      .map(mapResource)
      .filter((item) => item.id && item.title);
  },
};
