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
    categoryId,
    isLocked: Boolean(raw.is_locked),
    releaseDate: raw.release_date ? String(raw.release_date) : undefined,
    skills:
      (raw.skills as Array<Record<string, unknown>> | undefined)?.map((skill) => ({
        id: String(skill.id ?? ""),
        title: String(skill.title ?? ""),
      })) ?? [],
  };
};
