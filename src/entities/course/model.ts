import type { Course } from "@/entities/course/types";

export const mapApiCourse = (raw: Record<string, unknown>): Course => {
  const categoryId =
    typeof raw.category_id === "string"
      ? raw.category_id
      : typeof raw.category === "object" && raw.category
        ? String((raw.category as { id?: string }).id ?? "")
        : "";

  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    subtitle: String(raw.subtitle ?? ""),
    duration: String(raw.duration ?? ""),
    image: String(raw.image ?? ""),
    coverUrl: raw.cover_url
      ? String(raw.cover_url)
      : raw.image
        ? String(raw.image)
        : undefined,
    categoryId,
    isLocked: Boolean(raw.is_locked),
    releaseDate: raw.release_date ? String(raw.release_date) : undefined,
    progress:
      raw.progress != null
        ? Number(raw.progress)
        : raw.user_progress && typeof raw.user_progress === "object"
          ? Number((raw.user_progress as { progress_percentage?: number }).progress_percentage ?? 0)
          : undefined,
    skills:
      (raw.skills as Array<Record<string, unknown>> | undefined)?.map((skill) => ({
        id: String(skill.id ?? ""),
        title: String(skill.title ?? ""),
      })) ?? [],
  };
};
