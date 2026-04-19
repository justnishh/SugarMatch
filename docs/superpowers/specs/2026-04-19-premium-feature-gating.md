# Premium Feature Gating - Test Payment

**Date:** 2026-04-19
**Topic:** Test Payment System with Tiered Feature Gating

## Overview

Implement a test payment system that gates premium features based on subscription tier. Features unlock progressively based on payment amount.

## Premium Tiers

| Tier | Price | Swipes | Who Liked You | Super Likes | Incognito | Priority |
|------|-------|--------|---------------|-------------|-----------|----------|
| Free | - | 20/day | Blurred | 1/day | ❌ | ❌ |
| Weekly | ₹499 | Unlimited | ✅ | 1/day | ❌ | ❌ |
| Monthly | ₹1,499 | Unlimited | ✅ | 2/day | ❌ | ❌ |
| Lifetime | ₹2,999 | Unlimited | ✅ | 5/day | ✅ | ✅ |

## Data Model

### Users Table Columns
- `premium_tier`: 'weekly' | 'monthly' | 'lifetime' | null
- `premium_expires_at`: timestamp
- `super_likes_remaining`: integer (default 1)
- `is_incognito`: boolean (default false)

## Features

### 1. Swipe Limits
- Free users: 20 swipes/day (tracked in localStorage)
- Premium users: Unlimited swipes
- Reset at midnight local time

### 2. Who Liked You
- Free users: See blurred profile photos
- Premium (any tier): Full access to see who liked them

### 3. Super Likes
- Free: 1/day (reset daily)
- Weekly: 1/day
- Monthly: 2/day
- Lifetime: 5/day

### 4. Incognito Mode
- Lifetime tier only
- Your profile hidden from discovery
- Can still see others

### 5. Priority Ranking
- Lifetime tier only
- Appear higher in search results

## Test Payment Flow

1. User selects plan on /premium page
2. Mock payment confirmation (no actual Stripe)
3. Update user record in Supabase:
   - Set premium_tier
   - Set premium_expires_at (weekly: +7 days, monthly: +30 days, lifetime: +999 years)
   - Set super_likes_remaining based on tier
4. Show success confirmation with tier benefits
5. Feature gates activate immediately

## Files to Create

### `src/lib/premium.ts`
- `getPremiumTier(userId)`: Get user's current tier
- `hasPremiumAccess(userId, feature)`: Check specific feature access
- `useSuperLike(userId)`: Consume and check super likes
- `canSeeWhoLikedYou(userId)`: Boolean for match visibility

### `src/lib/hooks/usePremium.ts`
- `usePremium()`: Hook returning tier, features, loading state

## Files to Modify

### `src/app/(app)/premium/page.tsx`
- Add "Test Pay" button per plan
- Mock payment success flow
- Show current tier status

### `src/components/discovery/SwipeCard.tsx`
- Check swipe limit before allowing swipe
- Show upgrade prompt at limit

### `src/app/(app)/matches/page.tsx`
- Blur photos for non-premium users in "Who Liked You"

### Database Migration
```sql
ALTER TABLE users
ADD COLUMN premium_tier TEXT DEFAULT NULL,
ADD COLUMN premium_expires_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN super_likes_remaining INTEGER DEFAULT 1,
ADD COLUMN is_incognito BOOLEAN DEFAULT false;
```

## Mock Payment Implementation

```typescript
// src/lib/premium.ts
export async function activatePremium(
  userId: string,
  tier: 'weekly' | 'monthly' | 'lifetime'
) {
  const expiresAt = tier === 'lifetime'
    ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + (tier === 'weekly' ? 7 : 30) * 24 * 60 * 60 * 1000);

  const superLikes = tier === 'lifetime' ? 5 : tier === 'monthly' ? 2 : 1;

  await supabase
    .from('users')
    .update({
      premium_tier: tier,
      premium_expires_at: expiresAt.toISOString(),
      super_likes_remaining: superLikes,
    })
    .eq('id', userId);
}
```

## Success Criteria

- [ ] User can select any plan and "pay" (test mode)
- [ ] Features unlock based on tier
- [ ] Swipe limit enforced for free users
- [ ] Who liked you blurred for non-premium
- [ ] Super likes count enforced
- [ ] Incognito mode only for lifetime
- [ ] Tier badge shown in profile