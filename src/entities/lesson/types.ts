export type LessonProgress = {
  id: string;
  lessonId: string;
  status: string;
  progressPercentage: number;
  currentTimeSeconds: number;
  totalDurationSeconds: number;
  watchTimeSeconds: number;
  lastWatchedAt?: string;
  startedAt?: string;
  completedAt?: string;
  completionCount: number;
  notes?: string;
};

export type LessonResource = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  type?: string;
  url: string;
  author?: string;
  tags: string[];
  language?: string;
  isFeatured: boolean;
  isActive: boolean;
  viewCount: number;
  rating?: string;
};

export type LessonQuizSummary = {
  id: string;
  title: string;
  description?: string;
  lessonId?: string;
  questionCount: number;
  isActive: boolean;
  type?: string;
  orderIndex?: number;
  timeLimitSeconds?: number;
  isCompleted: boolean;
  attemptsCount: number;
  maxAttempts: number;
  passingScorePercent: number;
};

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
  isOpen: boolean;
  isCompleted?: boolean;
  type: "video" | "text" | "quiz";
  keyPoints: string[];
  resources: LessonResource[];
  userProgress?: LessonProgress;
  authorId?: string;
  authorName?: string;
};
