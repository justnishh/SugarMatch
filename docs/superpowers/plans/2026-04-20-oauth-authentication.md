# OAuth Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement OAuth authentication (Google/Facebook) alongside existing email/password login system

**Architecture:** Add OAuth buttons to login page, create callback route handler, maintain existing Supabase auth flow

**Tech Stack:** Next.js 16, Supabase Auth, TypeScript

---

## Task 1: Create OAuth callback route handler

**Files:**
- Create: `src/app/api/auth/callback/route.ts`

- [ ] **Step 1: Create callback route file**

```typescript
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to home page or the intended page
  const url = requestUrl.origin + next;
  return NextResponse.redirect(url);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/auth/callback/route.ts
git commit -m "feat: add OAuth callback route handler"
```

---

## Task 2: Update login page with OAuth buttons

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Import useRouter for redirect after login**

Add to imports:
```typescript
import { useRouter } from "next/navigation";
```

- [ ] **Step 2: Add OAuth buttons to login form**

Inside the form, below the existing email/password inputs and above the submit button, add:

```typescript
<div className="mt-6">
  <div className="text-center text-sm text-muted-foreground mb-4">
    <span>Or continue with</span>
  </div>
  <div className="grid gap-3">
    <a
      href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v2/authorize?provider=google&redirect_to=${encodeURIComponent(`${window.location.origin}/api/auth/callback`)}&response_type=code`}
      className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
    >
      <div className="flex items-center gap-3">
        {/* Google logo */}
        <div className="flex-shrink-0">
          <img src="https://cdnjs.cloudflare.com/ajax/libs/simple-icons/7.14.0/google.svg" width="20" height="20" alt="Google" />
        </div>
        <span className="text-sm font-medium text-gray-900">Continue with Google</span>
      </div>
    </a>
    
    <a
      href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v2/authorize?provider=facebook&redirect_to=${encodeURIComponent(`${window.location.origin}/api/auth/callback`)}&response_type=code`}
      className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
    >
      <div className="flex items-center gap-3">
        {/* Facebook logo */}
        <div className="flex-shrink-0">
          <img src="https://cdnjs.cloudflare.com/ajax/libs/simple-icons/7.14.0/facebook.svg" width="20" height="20" alt="Facebook" />
        </div>
        <span className="text-sm font-medium text-gray-900">Continue with Facebook</span>
      </div>
    </a>
  </div>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/app/(auth)/login/page.tsx
git commit -m "feat: add OAuth buttons to login page"
```

---

## Task 3: Update register page with OAuth buttons (optional)

**Files:**
- Modify: `src/app/(auth)/register/page.tsx`

- [ ] **Step 1: Add OAuth buttons to register page**

Similar to login page, add OAuth buttons below the existing form:

```typescript
<div className="mt-6">
  <div className="text-center text-sm text-muted-foreground mb-4">
    <span>Or continue with</span>
  </div>
  <div className="grid gap-3">
    <a
      href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v2/authorize?provider=google&redirect_to=${encodeURIComponent(`${window.location.origin}/api/auth/callback`)}&response_type=code`}
      className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
    >
      <div className="flex items-center gap-3">
        {/* Google logo */}
        <div className="flex-shrink-0">
          <img src="https://cdnjs.cloudflare.com/ajax/libs/simple-icons/7.14.0/google.svg" width="20" height="20" alt="Google" />
        </div>
        <span className="text-sm font-medium text-gray-900">Continue with Google</span>
      </div>
    </a>
    
    <a
      href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v2/authorize?provider=facebook&redirect_to=${encodeURIComponent(`${window.location.origin}/api/auth/callback`)}&response_type=code`}
      className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
    >
      <div className="flex items-center gap-3">
        {/* Facebook logo */}
        <div className="flex-shrink-0">
          <img src="https://cdnjs.cloudflare.com/ajax/libs/simple-icons/7.14.0/facebook.svg" width="20" height="20" alt="Facebook" />
        </div>
        <span className="text-sm font-medium text-gray-900">Continue with Facebook</span>
      </div>
    </a>
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(auth)/register/page.tsx
git commit -m "feat: add OAuth buttons to register page"
```

---

## Task 4: Update layout for auth pages (if needed)

**Files:**
- Modify: `src/app/(auth)/layout.tsx`

- [ ] **Step 1: Ensure proper layout for OAuth pages**

Currently the layout is:
```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex flex-col">
      {children}
    </div>
  );
}
```

This layout is already good - no changes needed unless we want to adjust spacing for the OAuth buttons.

- [ ] **Step 2: Commit** (only if changes made)

```bash
# Only if we made changes
git add src/app/(auth)/layout.tsx
git commit -m "chore: adjust auth layout for OAuth buttons"
```

---

## Task 5: Verify OAuth flow works

**Files:**
- Test: End-to-end OAuth flow

- [ ] **Step 1: Test Google OAuth**

Run: `npm run dev`
Expected: Login page shows Google and Facebook buttons
Click Google button → redirects to Google auth → returns to app → shows home page

- [ ] **Step 2: Test Facebook OAuth**

Run: `npm run dev`
Expected: Login page shows Google and Facebook buttons
Click Facebook button → redirects to Facebook auth → returns to app → shows home page

- [ ] **Step 3: Test error handling**

Test with invalid OAuth configurations (optional)

- [ ] **Step 4: Commit final**

```bash
git commit -m "feat: verify OAuth authentication flow"
```

---

**Plan complete.** Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?