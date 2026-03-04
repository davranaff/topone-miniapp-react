export type ReferralStats = {
  totalReferrals: number;
  pendingReferrals: number;
  activeReferrals: number;
  totalCommissionEarned: number;
  approvedAmount: number;
  totalEarnings: number;
  availableBalance: number;
  currentLevelName?: string;
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

export type ReferralCheckoutStatus = "pending" | "approved" | "rejected";

export type ReferralCheckoutRequest = {
  cardNumber: string;
  cardOwnerFirstName: string;
  cardOwnerLastName: string;
  amount: number;
};

export type ReferralCheckoutItem = {
  id: string;
  cardNumber: string;
  cardOwnerFirstName: string;
  cardOwnerLastName: string;
  amount: number;
  status: ReferralCheckoutStatus;
  createdAt?: string;
};

export type ReferralCheckoutList = {
  items: ReferralCheckoutItem[];
  page: number;
  pages: number;
  total: number;
  hasMore: boolean;
};

export type ReferralPlanPaymentResult = {
  amountPaid: number;
  remainingCommission: number;
  remainingAvailable: number;
};
