export type Challenge = {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  xpReward: number;
  coinReward?: number;
  durationDays?: number;
  isLocked: boolean;
  isCompleted?: boolean;
  isStarted?: boolean;
  progress?: number;
  categoryId?: string;
  coverUrl?: string;
};

export type ChallengeProgress = {
  challengeId: string;
  userId: string;
  status: "in_progress" | "completed" | "failed";
  progress: number;
  startedAt: string;
  completedAt?: string;
};
