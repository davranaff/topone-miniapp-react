export type Lesson = {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  duration?: string;
  videoUrl?: string;
  muxPlaybackId?: string;
  isLocked: boolean;
  isCompleted?: boolean;
  type: "video" | "text" | "quiz";
};
