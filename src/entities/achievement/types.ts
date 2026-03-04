export type Achievement = {
  id: string;
  title: string;
  description: string;
  iconKey?: string;
  category: string;
  targetValue: number;
  rewardXp: number;
  rewardCoins: number;
  isLocked: boolean;
};

export type UserAchievement = Achievement & {
  currentValue: number;
  progress: number;
  isEarned: boolean;
  isClaimed: boolean;
  earnedAt?: string;
  claimedAt?: string;
};
