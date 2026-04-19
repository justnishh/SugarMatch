import { createClient } from "@/lib/supabase/client";

export type PremiumTier = "weekly" | "monthly" | "lifetime" | null;

export interface PremiumStatus {
  tier: PremiumTier;
  isActive: boolean;
  expiresAt: Date | null;
  superLikesRemaining: number;
  isIncognito: boolean;
  features: {
    unlimitedSwipes: boolean;
    seeWhoLikedYou: boolean;
    superLikesPerDay: number;
    incognitoMode: boolean;
    priorityRanking: boolean;
  };
}

const TIER_CONFIG = {
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
};

export async function getPremiumStatus(userId: string): Promise<PremiumStatus> {
  const supabase = createClient();

  const { data: user } = await supabase
    .from("users")
    .select("premium_tier, premium_expires_at, super_likes_remaining, is_incognito")
    .eq("id", userId)
    .single();

  if (!user || !user.premium_tier) {
    return {
      tier: null,
      isActive: false,
      expiresAt: null,
      superLikesRemaining: 1,
      isIncognito: false,
      features: TIER_CONFIG.free,
    };
  }

  const expiresAt = user.premium_expires_at ? new Date(user.premium_expires_at) : null;
  const isActive = expiresAt ? expiresAt > new Date() : false;
  const tier = isActive ? user.premium_tier as PremiumTier : null;

  return {
    tier,
    isActive,
    expiresAt,
    superLikesRemaining: user.super_likes_remaining ?? 1,
    isIncognito: user.is_incognito ?? false,
    features: tier ? TIER_CONFIG[tier] : TIER_CONFIG.free,
  };
}

export async function activatePremium(
  userId: string,
  tier: "weekly" | "monthly" | "lifetime"
): Promise<void> {
  const supabase = createClient();

  const days = tier === "weekly" ? 7 : tier === "monthly" ? 30 : 365 * 100;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const superLikes = tier === "lifetime" ? 5 : tier === "monthly" ? 2 : 1;

  await supabase
    .from("users")
    .update({
      premium_tier: tier,
      premium_expires_at: expiresAt.toISOString(),
      super_likes_remaining: superLikes,
      is_incognito: tier === "lifetime",
    })
    .eq("id", userId);
}

export async function useSuperLike(userId: string): Promise<boolean> {
  const supabase = createClient();
  const status = await getPremiumStatus(userId);

  if (status.superLikesRemaining <= 0) {
    return false;
  }

  await supabase
    .from("users")
    .update({ super_likes_remaining: status.superLikesRemaining - 1 })
    .eq("id", userId);

  return true;
}

export async function resetDailySuperLikes(userId: string): Promise<void> {
  const supabase = createClient();
  const status = await getPremiumStatus(userId);

  await supabase
    .from("users")
    .update({ super_likes_remaining: status.features.superLikesPerDay })
    .eq("id", userId);
}

export async function toggleIncognito(userId: string): Promise<boolean> {
  const supabase = createClient();
  const status = await getPremiumStatus(userId);

  if (!status.features.incognitoMode) {
    return false;
  }

  const newState = !status.isIncognito;
  await supabase
    .from("users")
    .update({ is_incognito: newState })
    .eq("id", userId);

  return newState;
}