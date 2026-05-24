export const PREMIUM_TIERS = {
  weekly: { price: 499, label: "Weekly", days: 7 },
  monthly: { price: 1499, label: "Monthly", days: 30 },
  lifetime: { price: 2999, label: "Lifetime", days: 365 * 100 },
} as const;

export const FREE_SWIPE_LIMIT = 20;

export const TIER_FEATURES = {
  free: {
    unlimitedSwipes: false,
    seeWhoLikedYou: false,
    superLikesPerDay: 1,
    incognitoMode: false,
    priorityRanking: false,
  },
  weekly: {
    unlimitedSwipes: true,
    seeWhoLikedYou: true,
    superLikesPerDay: 1,
    incognitoMode: false,
    priorityRanking: false,
  },
  monthly: {
    unlimitedSwipes: true,
    seeWhoLikedYou: true,
    superLikesPerDay: 2,
    incognitoMode: false,
    priorityRanking: false,
  },
  lifetime: {
    unlimitedSwipes: true,
    seeWhoLikedYou: true,
    superLikesPerDay: 5,
    incognitoMode: true,
    priorityRanking: true,
  },
} as const;
