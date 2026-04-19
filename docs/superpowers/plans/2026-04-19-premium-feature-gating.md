# Premium Feature Gating Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement test payment system with tiered feature gating (Weekly, Monthly, Lifetime plans)

**Architecture:** Add premium columns to users table, create premium utility functions and hooks, gate features in SwipeCard and Matches components.

**Tech Stack:** Next.js, Supabase, TypeScript

---

## Task 1: Add premium columns to users table

**Files:**
- Create: `supabase/migrations/2026-04-19-add-premium-columns.sql`

- [ ] **Step 1: Create migration file**

```sql
-- Premium Feature Gating Columns
ALTER TABLE users
ADD COLUMN premium_tier TEXT DEFAULT NULL,
ADD COLUMN premium_expires_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN super_likes_remaining INTEGER DEFAULT 1,
ADD COLUMN is_incognito BOOLEAN DEFAULT false;

-- Add index for faster queries
CREATE INDEX idx_users_premium_tier ON users(premium_tier);
CREATE INDEX idx_users_premium_expires ON users(premium_expires_at);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/2026-04-19-add-premium-columns.sql
git commit -m "feat: add premium columns to users table"
```

---

## Task 2: Create premium utility functions

**Files:**
- Create: `src/lib/premium.ts`

- [ ] **Step 1: Create premium.ts with utility functions**

```typescript
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

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
  const isActive = expiresAt && expiresAt > new Date();
  const tier = isActive ? user.premium_tier : null;

  return {
    tier,
    isActive,
    expiresAt,
    superLikesRemaining: user.super_likes_remaining ?? 1,
    isIncognito: user.is_incognito ?? false,
    features: TIER_CONFIG[tier ?? "free"],
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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/premium.ts
git commit -m "feat: add premium utility functions"
```

---

## Task 3: Create usePremium hook

**Files:**
- Create: `src/lib/hooks/usePremium.ts`

- [ ] **Step 1: Create the hook**

```typescript
"use client";

import { useEffect, useState } from "react";
import { getPremiumStatus, PremiumStatus } from "@/lib/premium";

export function usePremium() {
  const [status, setStatus] = useState<PremiumStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setStatus(null);
        setLoading(false);
        return;
      }

      setUserId(user.id);
      const premiumStatus = await getPremiumStatus(user.id);
      setStatus(premiumStatus);
      setLoading(false);
    }

    fetchStatus();
  }, []);

  return {
    status,
    loading,
    userId,
    isPremium: status?.isActive ?? false,
    tier: status?.tier,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/hooks/usePremium.ts
git commit -m "feat: add usePremium hook"
```

---

## Task 4: Update premium page with test payment

**Files:**
- Modify: `src/app/(app)/premium/page.tsx`

- [ ] **Step 1: Update premium page with test payment flow**

Add import:
```typescript
import { activatePremium } from "@/lib/premium";
import { usePremium } from "@/lib/hooks/usePremium";
import { Check } from "lucide-react";
```

Add inside component:
```typescript
const { status: premiumStatus, userId, loading } = usePremium();

async function handleTestPay(tier: "weekly" | "monthly" | "lifetime") {
  if (!userId) return;
  await activatePremium(userId, tier);
  window.location.reload();
}
```

Update plan buttons to show tier badge and test pay:
```typescript
{plans.map((plan) => (
  <button
    key={plan.name}
    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
      plan.popular
        ? "border-amber-400 bg-amber-50"
        : "border-border hover:border-amber-200"
    }`}
    onClick={() => {
      const tierMap = { "Weekly": "weekly", "Monthly": "monthly", "3 Months": "lifetime" };
      handleTestPay(tierMap[plan.name as keyof typeof tierMap]);
    }}
  >
    <div className="flex items-center gap-3">
      <div>
        <p className="font-semibold text-left">{plan.name}</p>
        {plan.popular && (
          <Badge className="bg-amber-500 text-white text-[10px] mt-0.5">
            Most Popular
          </Badge>
        )}
      </div>
    </div>
    <div className="text-right">
      <span className="text-xl font-bold">{plan.price}</span>
      <span className="text-xs text-muted-foreground">
        {plan.period}
      </span>
    </div>
  </button>
))}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(app\)/premium/page.tsx
git commit -m "feat: add test payment to premium page"
```

---

## Task 5: Gate swipes in discovery page

**Files:**
- Modify: `src/app/(app)/home/page.tsx`

- [ ] **Step 1: Check swipe limit before action**

Add import:
```typescript
import { usePremium } from "@/lib/hooks/usePremium";
```

Add inside HomePage:
```typescript
const { status: premiumStatus } = usePremium();
const [swipeCount, setSwipeCount] = useState(() => {
  const saved = localStorage.getItem("swipeCount");
  const today = new Date().toDateString();
  if (saved) {
    const { count, date } = JSON.parse(saved);
    if (date === today) return count;
  }
  return 0;
});

const MAX_FREE_SWIPES = 20;

function canSwipe(): boolean {
  if (premiumStatus?.features.unlimitedSwipes) return true;
  return swipeCount < MAX_FREE_SWIPES;
}

function recordSwipe() {
  if (premiumStatus?.features.unlimitedSwipes) return;
  const newCount = swipeCount + 1;
  setSwipeCount(newCount);
  localStorage.setItem("swipeCount", JSON.stringify({
    count: newCount,
    date: new Date().toDateString(),
  }));
}
```

Update handleSwipe to call recordSwipe:
```typescript
const handleSwipe = async (direction: "left" | "right" | "up") => {
  // ... existing code ...
  recordSwipe();
};
```

Add upgrade prompt when limit reached:
```typescript
{!canSwipe() && (
  <div className="absolute inset-0 bg-white/90 z-50 flex flex-col items-center justify-center p-6 rounded-3xl">
    <Crown className="w-16 h-16 text-amber-500 mb-4" />
    <h3 className="text-xl font-bold mb-2">Daily Limit Reached</h3>
    <p className="text-muted-foreground text-center mb-6">
      You've used all {MAX_FREE_SWIPES} swipes today. Upgrade to Premium for unlimited swipes!
    </p>
    <Button onClick={() => router.push("/premium")}>
      Upgrade Now
    </Button>
  </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(app\)/home/page.tsx
git commit -m "feat: gate swipes with daily limit"
```

---

## Task 6: Gate "Who Liked You" in matches page

**Files:**
- Modify: `src/app/(app)/matches/page.tsx`

- [ ] **Step 1: Check premium for seeing who liked you**

Add import:
```typescript
import { usePremium } from "@/lib/hooks/usePremium";
import { Lock } from "lucide-react";
```

Add inside MatchesPage:
```typescript
const { status: premiumStatus } = usePremium();
```

Update render to blur photos when not premium:
```typescript
<div className={`relative ${!premiumStatus?.features.seeWhoLikedYou ? "blur-sm" : ""}`}>
  <img src={liker.photos[0]} alt="" className="w-full h-48 object-cover rounded-2xl" />
  {!premiumStatus?.features.seeWhoLikedYou && (
    <div className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center">
      <Lock className="w-8 h-8 text-white mb-2" />
      <p className="text-white text-sm font-medium">Premium Required</p>
      <Button 
        size="sm" 
        className="mt-2 bg-amber-500 hover:bg-amber-600"
        onClick={() => router.push("/premium")}
      >
        Upgrade
      </Button>
    </div>
  )}
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(app\)/matches/page.tsx
git commit -m "feat: gate who liked you with premium check"
```

---

## Task 7: Gate Super Likes

**Files:**
- Modify: `src/components/discovery/SwipeCard.tsx`

- [ ] **Step 1: Check super like availability**

Add import:
```typescript
import { usePremium } from "@/lib/hooks/usePremium";
import { useSuperLike } from "@/lib/premium";
```

Add inside SwipeCard:
```typescript
const { status: premiumStatus } = usePremium();

async function handleSuperLike() {
  if (!premiumStatus || premiumStatus.superLikesRemaining <= 0) {
    return;
  }
  await useSuperLike();
  onSwipe("up");
}
```

Update super like button to show remaining count:
```typescript
<Button
  onClick={handleSuperLike}
  disabled={!premiumStatus || premiumStatus.superLikesRemaining <= 0}
  className="rounded-full w-14 h-14 bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
>
  <Star className="w-6 h-6 text-white" />
  <span className="absolute -top-1 -right-1 bg-white text-xs font-bold text-blue-500 rounded-full w-5 h-5 flex items-center justify-center">
    {premiumStatus?.superLikesRemaining ?? 0}
  </span>
</Button>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/discovery/SwipeCard.tsx
git commit -m "feat: gate super likes with premium check"
```

---

## Task 8: Update development log

**Files:**
- Modify: `DEVELOPMENT_LOG.md`

- [ ] **Step 1: Update log**

Add to Work Completed section:
```markdown
### Phase 5: Premium Feature Gating (April 19, 2026)
- **Premium Tiers**: Weekly (₹499), Monthly (₹1,499), Lifetime (₹2,999)
- **Test Payment**: Mock payment flow (Stripe later)
- **Feature Gating**: Swipe limits, Who Liked You, Super Likes, Incognito, Priority
- **Premium Hook**: usePremium hook for tier status
- Files: `src/lib/premium.ts`, `src/lib/hooks/usePremium.ts`, premium/page.tsx, SwipeCard.tsx, matches/page.tsx, home/page.tsx
```

- [ ] **Step 2: Commit**

```bash
git add DEVELOPMENT_LOG.md
git commit -m "docs: update development log"
```

---

## Task 9: Verify build

**Files:**
- Test: Development build

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: Build completes without errors

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: complete premium feature gating system"
```

---

**Plan complete.** Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?