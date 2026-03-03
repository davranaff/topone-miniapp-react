export type CourseSkill = {
  id: string;
  title: string;
};

export type Course = {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  image: string;
  categoryId: string;
  isLocked: boolean;
  releaseDate?: string;
  skills: CourseSkill[];
};
