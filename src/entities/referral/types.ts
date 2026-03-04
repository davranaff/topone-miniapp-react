export type ReferralStats = {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  availableBalance: number;
  referralCode: string;
  referralUrl: string;
};

export type ReferralHistoryItem = {
  id: string;
  username: string;
  joinedAt: string;
  isActive: boolean;
  earnedAmount: number;
};

export type ReferralLevel = {
  id: string;
  level: number;
  name: string;
  minReferrals: number;
  rewardPercentage: number;
  isUnlocked: boolean;
};
