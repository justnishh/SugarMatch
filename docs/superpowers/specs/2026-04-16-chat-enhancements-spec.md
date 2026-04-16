# Chat & Match UX Enhancements Specification

> Date: April 16, 2026  
> Status: Draft  
> Features: Icebreakers, Activity Status, Profile Preview, Voice Messages

---

## Overview

Implement 4 chat and messaging UX improvements to enhance user engagement and conversation starters.

---

## Feature 1: Icebreakers

### Description
Pre-defined conversation starter suggestions shown when a match is made.

### UI/UX
- After mutual match, show modal with 3-5 suggestions
- Suggestions are role-appropriate (for seekers vs partners)
- Tap to insert into chat OR tap "Let them pick" to send

### Suggestions
**For Seeker:**
- "What's your idea of a perfect first date?"
- "Tell me about your last trip"
- "What are you looking for in a partner?"
- "What's your favorite restaurant in the city?"
- "Any exciting plans coming up?"

**For Partner:**
- "What's your idea of a perfect first date?"
- "Tell me about your latest vacation"
- "What's your typical weekend like?"
- "What's your favorite thing about being a partner?"
- "Any travel plans this year?"

### Implementation
- New table: `icebreakers` (id, role, text, created_at)
- Insert default icebreakers on app init
- Show in MatchModal after match

---

## Feature 2: Activity Status

### Description
Show online/offline/away status on profiles and in chat.

### States
- **Online**: Bright green dot - active in last 2 minutes
- **Away**: Yellow/amber dot - active 2-30 minutes ago
- **Offline**: Gray dot - no activity in 30+ minutes
- **Last Seen**: "Last seen 5 mins ago" / "Last seen 2 hours ago"

### Implementation
- Add `last_active_at` to users table
- Update on every page/navigation
- Show on:
  - Profile card (top-right corner)
  - Chat list (green dot next to avatar)
  - Chat header (in conversation)
- Presence system: Use Supabase Realtime subscriptions

---

## Feature 3: Quick Profile Preview

### Description
Tap profile photo in chat to view full profile without leaving.

### UI/UX
- Tap avatar in chat → opens full-screen overlay
- Shows: photos (swipeable), name/age, bio, conditions, distance
- "View Full Profile" button → navigates to full profile page
- Tap outside or X to close

### Implementation
- New overlay component: `ProfilePreviewModal`
- Opens with transition from tap position
- Fetches full profile data on open

---

## Feature 4: Voice Messages

### Description
Record and send voice messages in chat.

### UI/UX
- In ChatInput, long-press mic button (500ms) to record
- Release to send
- Slide up to cancel
- Show waveform visualization while recording
- Play button on sent message with duration and progress

### Technical
- Use MediaRecorder API
- Store as audio files in Supabase Storage
- Message type: "voice"
- Audio playback in MessageBubble

---

## Technical Implementation

### Database Changes
```sql
-- Icebreakers table
create table public.icebreakers (
  id uuid primary key default gen_random_uuid(),
  role text check (role in ('seeker', 'partner')),
  text text not null,
  created_at timestamptz default now()
);

-- Add last_active_at to users
alter table public.users add column last_active_at timestamptz;

-- Add message_type check for voice
-- (already has text, image, voice)
```

### File Structure
- `src/components/chat/IcebreakersModal.tsx` - New
- `src/components/chat/VoiceRecorder.tsx` - New
- `src/components/chat/MessageBubble.tsx` - Update for voice
- `src/components/chat/ChatInput.tsx` - Update for voice
- `src/components/profile/ProfilePreviewModal.tsx` - New
- `src/lib/hooks/usePresence.ts` - New
- `src/lib/actions/presence.ts` - New
- `src/app/(app)/chat/[matchId]/page.tsx` - Update
- `src/app/(app)/home/page.tsx` - Update for icebreakers
- Supabase functions/triggers for presence

---

## Dependencies
- react-audio-recorder (or native MediaRecorder)
- Supabase Realtime presence
- date-fns (for "last seen" formatting)

---

## Success Criteria
1. Icebreakers appear after every new match
2. Status shows accurately within 2-min window
3. Profile preview opens in <300ms
4. Voice messages play on any device