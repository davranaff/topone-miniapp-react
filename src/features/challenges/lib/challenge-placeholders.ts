import type { Challenge, ChallengeCategory, ChallengeTypeCode } from "@/entities/challenge/types";

const makePlaceholder = (
  id: string,
  title: string,
  description: string,
  typeCode: ChallengeTypeCode,
  reward: { xpReward: number; coinReward?: number },
): Challenge => ({
  id,
  title,
  description,
  difficulty: "medium",
  xpReward: reward.xpReward,
  coinReward: reward.coinReward,
  isLocked: true,
  isCompleted: false,
  isStarted: false,
  progress: 0,
  typeCode,
  typeLabel:
    typeCode === "daily"
      ? "Kundalik"
      : typeCode === "weekly"
        ? "Haftalik"
        : typeCode === "monthly"
          ? "Oylik"
          : "Challenge",
  statusLabel: "PRO",
});

export const challengePlaceholderCategories: ChallengeCategory[] = [
  {
    id: "static-daily",
    typeId: "static-daily",
    title: "Kundalik",
    count: 7,
    activeDays: 1,
    typeCode: "daily",
  },
  {
    id: "static-weekly",
    typeId: "static-weekly",
    title: "Haftalik",
    count: 1,
    activeDays: 7,
    typeCode: "weekly",
  },
  {
    id: "static-monthly",
    typeId: "static-monthly",
    title: "Oylik",
    count: 1,
    activeDays: 30,
    typeCode: "monthly",
  },
];

const placeholderMap: Record<ChallengeTypeCode, Challenge[]> = {
  daily: [
    makePlaceholder(
      "static-daily-1",
      "1 ta fokus sessiya",
      "Bugun 1 ta chalg'imasdan fokus sessiyasini yakunlang.",
      "daily",
      { xpReward: 120, coinReward: 25 },
    ),
    makePlaceholder(
      "static-daily-2",
      "3 ta vazifa bajarish",
      "Bugungi ro'yxatdan istalgan 3 ta vazifani tugating.",
      "daily",
      { xpReward: 90, coinReward: 15 },
    ),
    makePlaceholder(
      "static-daily-3",
      "1 ta dars ko'rish",
      "Kurslardan bitta yangi darsni ko'rib chiqing.",
      "daily",
      { xpReward: 140 },
    ),
    makePlaceholder(
      "static-daily-4",
      "Kunlik konspekt",
      "O'rganganingiz bo'yicha qisqa yozuv qoldiring.",
      "daily",
      { xpReward: 80 },
    ),
    makePlaceholder(
      "static-daily-5",
      "10 daqiqa practice",
      "Amaliyotga kamida 10 daqiqa vaqt ajrating.",
      "daily",
      { xpReward: 110, coinReward: 10 },
    ),
    makePlaceholder(
      "static-daily-6",
      "1 ta mini hisobot",
      "Natijangizni link yoki screenshot bilan topshiring.",
      "daily",
      { xpReward: 95 },
    ),
    makePlaceholder(
      "static-daily-7",
      "Kun yakuni review",
      "Bugungi progress bo'yicha qisqa tahlil yozing.",
      "daily",
      { xpReward: 75, coinReward: 20 },
    ),
  ],
  weekly: [
    makePlaceholder(
      "static-weekly-1",
      "Haftalik challenge",
      "7 kun davomida uzluksiz progressni ushlab turing.",
      "weekly",
      { xpReward: 450, coinReward: 100 },
    ),
  ],
  monthly: [
    makePlaceholder(
      "static-monthly-1",
      "Oylik challenge",
      "Bir oy ichida eng katta natijani chiqarish uchun premium challenge.",
      "monthly",
      { xpReward: 1200, coinReward: 300 },
    ),
  ],
  other: [],
};

export const getChallengePlaceholders = (typeCode: ChallengeTypeCode) => {
  return placeholderMap[typeCode] ?? [];
};
