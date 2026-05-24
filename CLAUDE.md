# SugarMatch — Project Guidelines

@AGENTS.md

## Tech Stack

- **Framework**: Next.js 16 (App Router, RSC, Server Actions)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4 + CSS variables (OKLCH)
- **UI Library**: shadcn/ui (base-nova style, radix primitives)
- **Icons**: lucide-react
- **Animations**: Framer Motion
- **State**: Zustand (client), Server Actions (mutations)
- **Database**: Supabase (PostgreSQL + RLS + Realtime + Storage)
- **Auth**: Supabase Auth (email/password + Google/Facebook OAuth)
- **Deployment**: Vercel (free tier)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth flow (splash, login, register, onboarding)
│   ├── (app)/              # Main app (home, chat, profile, settings, etc.)
│   ├── admin/              # Admin panel
│   └── api/                # API routes (OAuth callback)
├── components/
│   ├── ui/                 # shadcn/ui primitives (button, card, dialog, etc.)
│   ├── features/           # Feature-specific components
│   │   ├── discovery/      # Swipe cards, match modal
│   │   ├── chat/           # Messages, input, voice recorder
│   │   ├── profile/        # Profile card, preview modal
│   │   ├── onboarding/     # Step indicator, photo uploader
│   │   └── premium/        # Premium gates, subscription UI
│   └── layout/             # Layout components (nav, mobile view, ad banners)
├── lib/
│   ├── supabase/           # Supabase client/server/middleware
│   ├── actions/            # Server actions (profile, discovery, swipe, chat)
│   └── utils.ts            # Shared utilities (cn helper)
├── hooks/                  # Client-side hooks (realtime, premium, geolocation)
├── stores/                 # Zustand stores
├── types/                  # TypeScript type definitions
│   └── database.ts         # Supabase generated types
└── config/                 # App constants, premium tiers, feature flags
```

## Frontend Design Skill

Create distinctive, production-grade interfaces. Avoid generic "AI slop" aesthetics.

### Design Principles

1. **Bold Aesthetic Direction**: Every UI decision must be intentional. SugarMatch uses a luxury/refined + playful dating aesthetic — rose/pink gradients, Playfair Display headings, Inter body text.

2. **Typography**: Use `font-heading` (Playfair Display) for display text and `font-sans` (Inter) for body. Never fall back to generic system fonts.

3. **Color & Theme**: Commit to the rose/pink palette with sharp accents. Use CSS variables for consistency. Dark mode support via `next-themes`.

4. **Motion**: Use Framer Motion for page transitions, card swipes, match celebrations. Focus on high-impact moments — staggered reveals on page load, spring physics on swipe gestures.

5. **Spatial Composition**: Mobile-first (393px viewport). Generous padding, card-based layouts, bottom navigation. Overlap and depth via shadows and z-index layering.

6. **Backgrounds & Texture**: Rose gradient backgrounds, subtle noise textures, glassmorphism on cards. Never flat solid white/gray.

### Anti-Patterns (NEVER do these)

- Generic font stacks (Arial, Roboto, system-ui)
- Purple-on-white gradient clichés
- Cookie-cutter card layouts without personality
- Animations without purpose
- Flat, textureless backgrounds

## shadcn/ui Skill

### Pattern Enforcement

- **Forms**: Use `FieldGroup` pattern — Label + Input + description/error grouped semantically
- **Option Sets**: Use `ToggleGroup` for mutually exclusive choices (e.g., role selection)
- **Semantic Colors**: Use `--primary`, `--destructive`, `--muted` etc. Never hardcode hex values in components
- **Component Discovery**: Run `npx shadcn add <component>` to add new primitives

### Configuration (components.json)

- Style: `base-nova`
- Base library: `radix`
- Icon library: `lucide`
- Aliases: `@/components`, `@/components/ui`, `@/lib`, `@/hooks`

### CLI Commands

```bash
npx shadcn add <component>     # Add a component
npx shadcn add --all           # Add all components
npx shadcn diff                # Check for updates
npx shadcn info --json         # Project config
```

## Coding Conventions

### File Naming
- Components: `PascalCase.tsx` (e.g., `SwipeCard.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `usePremium.ts`)
- Actions: `camelCase.ts` (e.g., `discovery.ts`)
- Types: `camelCase.ts` (e.g., `database.ts`)
- Pages: `page.tsx` (Next.js convention)

### Component Patterns
- Use `"use client"` only when needed (hooks, event handlers, browser APIs)
- Prefer Server Components by default
- Co-locate loading.tsx and error.tsx with page.tsx
- Use Server Actions for mutations (forms, data writes)

### Import Order
1. React/Next.js
2. Third-party libraries
3. `@/components/ui/*`
4. `@/components/features/*`
5. `@/lib/*` and `@/hooks/*`
6. `@/types/*`
7. Relative imports

### State Management
- **Server state**: Server Components + Server Actions
- **Client state**: Zustand stores in `src/stores/`
- **Realtime**: Supabase Realtime subscriptions via custom hooks
- **Form state**: React Hook Form or controlled components

## Mobile-First PWA

- Viewport locked to 393px max-width
- Bottom navigation (sticky within container)
- Touch-optimized interactions (swipe gestures, tap targets ≥44px)
- PWA manifest + service worker ready
- No horizontal scroll
