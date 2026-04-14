# SugarMatch (SugerFinds)

A full-stack dating app connecting Sugar Seekers with Sugar Partners. Built with Next.js, Supabase, and Tailwind CSS. Mobile-first PWA with zero deployment cost.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **UI Components**: shadcn/ui + Framer Motion animations
- **Backend**: Next.js Server Actions + Supabase
- **Database**: Supabase PostgreSQL with Row Level Security
- **Auth**: Supabase Auth (email/password)
- **Real-time Chat**: Supabase Realtime (WebSocket subscriptions)
- **Storage**: Supabase Storage (photos, chat media)
- **Deployment**: Vercel (free tier)

## Features

- Tinder-style swipe cards with drag gestures
- Role-based registration (Sugar Seeker / Sugar Partner)
- Smart matching algorithm (role separation, gender filter, distance, condition scoring)
- Real-time chat with read receipts and image sharing
- "Liked You" screen (blurred for free, clear for premium)
- Notifications with real-time updates
- Profile management with photo upload/reorder
- Settings (age range, distance, privacy)
- Admin panel (dashboard, user management, reports)
- Premium subscription UI (payment integration placeholder)
- PWA installable on mobile

## Setup

### 1. Install Dependencies

```bash
cd SugerFinds
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Copy your project URL and anon key from Settings > API

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Database Schema

1. Go to Supabase Dashboard > SQL Editor
2. Copy contents of `supabase/schema.sql`
3. Run the SQL to create all tables, policies, functions, and storage buckets

### 5. Enable Realtime

In Supabase Dashboard > Database > Replication, ensure `messages`, `notifications`, and `matches` tables have realtime enabled.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Splash, login, registration, onboarding
│   ├── (app)/            # Main app (home, chat, profile, settings, etc.)
│   └── admin/            # Admin panel (dashboard, users, reports)
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── onboarding/       # Step indicator, photo uploader, profile preview
│   ├── discovery/        # Swipe card, match modal
│   ├── chat/             # Message bubble, chat input
│   ├── profile/          # Profile card
│   └── nav/              # Bottom navigation
├── lib/
│   ├── supabase/         # Client, server, middleware
│   ├── actions/          # Server actions (profile, discovery, swipe, chat)
│   └── hooks/            # Real-time hooks (messages, notifications)
└── types/
    └── database.ts       # TypeScript types
```

## Admin Access

To access the admin panel at `/admin`, set `is_admin = true` on a user in Supabase:

```sql
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
```

## Deploy to Vercel (Free)

```bash
npx vercel
```

Set the environment variables in Vercel project settings.
