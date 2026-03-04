export type LeaderboardEntry = {
  userId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  rank: number;
  value: number;
  isCurrentUser?: boolean;
};

export type LeaderboardType = "xp" | "coins" | "referrals";
