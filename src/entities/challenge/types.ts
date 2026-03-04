export type ChallengeTypeCode = "daily" | "weekly" | "monthly" | "other";

export type ChallengeAdditionalResource = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  type?: string;
  url: string;
  author?: string;
};

export type ChallengeCategory = {
  id: string;
  typeId: string;
  title: string;
  count: number;
  activeDays?: number;
  typeCode: ChallengeTypeCode;
};

export type ChallengeOverallStats = {
  total: number;
  inProgress: number;
  completed: number;
  failed: number;
};

export type ChallengeCommunityStats = {
  totalUsers: number;
  inProgress: number;
  completed: number;
  failed: number;
};

export type ChallengeRewards = {
  xp: number;
  coin: number;
};

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
  hasUserProgress?: boolean;
  progress?: number;
  progressId?: string;
  progressStatus?: string;
  progressResult?: string;
  progressNotes?: string;
  progressCompletedAt?: string;
  categoryId?: string;
  coverUrl?: string;
  bgGradient?: string;
  typeId?: string;
  typeLabel?: string;
  typeCode?: ChallengeTypeCode;
  statusLabel?: string;
  statusCode?: string;
  icon?: string;
  unlockDay?: number;
  howItWorks?: string[];
  checkmark?: string[];
  additionalResources?: ChallengeAdditionalResource[];
  subchallengeProgress?: {
    completedCount: number;
    failedCount: number;
    pendingCount: number;
    totalCount: number;
    percentage?: number;
  };
};

export type ChallengeProgress = {
  id: string;
  challengeId: string;
  userId: string;
  status: string;
  progress: number;
  startedAt?: string;
  completedAt?: string;
  result?: string;
  notes?: string;
};
