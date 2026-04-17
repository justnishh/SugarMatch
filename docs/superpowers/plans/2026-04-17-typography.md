# Typography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the app's typography to use Playfair Display for headings and Inter for body text, with a consistent heading hierarchy.

**Architecture:** Add Google Fonts via next/font/google, create CSS variables, define heading utility classes in Tailwind theme.

**Tech Stack:** Next.js, Tailwind CSS, Google Fonts (next/font/google)

---

### Task 1: Update layout.tsx with new fonts

**Files:**
- Modify: `src/app/layout.tsx:1-51`

- [ ] **Step 1: Import Playfair Display and Inter fonts**

Update the imports at the top of the file:

```tsx
import { Geist, Geist_Mono, Playfair_Display, Inter } from "next/font/google";
```

- [ ] **Step 2: Add font configurations**

After the existing geistMono configuration, add:

```tsx
const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});
```

- [ ] **Step 3: Update html className**

Add the new font variables to the html className:

```tsx
className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${inter.variable} h-full antialiased`}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add Playfair Display and Inter fonts"
```

---

### Task 2: Update globals.css with typography scale

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update @theme section**

Update the `--font-heading` to use the new variable:

```css
--font-heading: var(--font-heading);
--font-sans: var(--font-sans);
```

- [ ] **Step 2: Add heading utility classes**

Add after the @theme section:

```css
@layer utilities {
  .font-heading {
    font-family: var(--font-heading), serif;
  }
  
  h1,
  .h1 {
    font-family: var(--font-heading), serif;
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.2;
  }
  
  h2,
  .h2 {
    font-family: var(--font-heading), serif;
    font-size: 2rem;
    font-weight: 600;
    line-height: 1.25;
  }
  
  h3,
  .h3 {
    font-family: var(--font-heading), serif;
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.3;
  }
  
  h4,
  .h4 {
    font-family: var(--font-heading), serif;
    font-size: 1.25rem;
    font-weight: 500;
    line-height: 1.4;
  }
  
  .text-body {
    font-family: var(--font-sans), sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
  }
  
  .text-small {
    font-family: var(--font-sans), sans-serif;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add typography scale and heading utilities"
```

---

### Task 3: Verify the build compiles

**Files:**
- Test: Development build

- [ ] **Step 1: Run build command**

```bash
cd "C:\Users\sande\OneDrive\Desktop\SugerFinds" && npm run build
```

Expected: Build completes without errors

- [ ] **Step 2: Commit final**

```bash
git commit -m "feat: complete typography system"
```

---

**Plan complete.** Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**