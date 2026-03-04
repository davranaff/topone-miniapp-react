export type Challenge = {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  difficultyLabel?: string;
  xpReward: number;
  coinReward?: number;
  durationDays?: number;
  isLocked: boolean;
  isCompleted?: boolean;
  isStarted?: boolean;
  progress?: number;
  categoryId?: string;
  coverUrl?: string;
  typeLabel?: string;
  typeCode?: "daily" | "weekly" | "monthly" | "other";
  statusLabel?: string;
  statusCode?: string;
  icon?: string;
  unlockDay?: number;
  subchallengeProgress?: {
    completedCount: number;
    failedCount: number;
    pendingCount: number;
    totalCount: number;
  };
};

export type ChallengeProgress = {
  challengeId: string;
  userId: string;
  status: "in_progress" | "completed" | "failed";
  progress: number;
  startedAt: string;
  completedAt?: string;
};
