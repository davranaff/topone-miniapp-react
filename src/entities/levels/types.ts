export type LevelItem = {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  coinBonus: number;
  badgeUrl?: string;
  perks?: Record<string, unknown>;
};
