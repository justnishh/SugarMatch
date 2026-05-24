# OAuth Authentication Design

**Date:** 2026-04-20
**Topic:** OAuth Authentication Integration

## Overview

Integrate OAuth authentication (Google, Facebook) into the existing Supabase-based authentication system while maintaining the current email/password login flow and custom UI.

## OAuth Providers

- **Google** - For users with Gmail accounts
- **Facebook** - For users with Facebook accounts

Both providers will be configured in the Supabase dashboard with the appropriate redirect URLs.

## Authentication Flow

### Login Page
- Display "Sign in with Google" and "Sign in with Facebook" buttons alongside existing email/password form
- Buttons use Supabase OAuth endpoint to initiate the auth flow
- On successful OAuth login, user is redirected back to the app via callback URL

### Callback Handling
- Create a route handler at `/api/auth/callback` to process OAuth responses
- On success, redirect to the intended page (or home page)
- On failure, show error message

### Account Linking
- OAuth sign-ups create new accounts by default
- Users can link OAuth providers to existing accounts via Settings page
- Linking requires password verification for security

## Data Model

No changes to existing database schema. Supabase Auth handles OAuth user data internally.

## Implementation Details

### Supabase Configuration
1. Enable Google and Facebook providers in Supabase Auth settings
2. Set redirect URL to: `https://yoursite.com/api/auth/callback`
3. Configure OAuth client IDs and secrets from respective developer consoles

### Frontend Changes
1. **Login Page** (`src/app/(auth)/login/page.tsx`):
   - Add OAuth buttons with Supabase OAuth URLs
   - Handle loading states and errors

2. **Callback Route** (`src/app/api/auth/callback/route.ts`):
   - Process OAuth response from Supabase
   - Set session cookie and redirect

3. **Settings Page** (future enhancement):
   - Add "Link Account" section for OAuth providers
   - Require password confirmation before linking

## Success Criteria

- [ ] User can sign up/sign in with Google
- [ ] User can sign up/sign in with Facebook
- [ ] Existing email/password login continues to work
- [ ] OAuth users are created as new Supabase users
- [ ] Session persistence works across page reloads
- [ ] Error handling for failed OAuth attempts
- [ ] Responsive design for mobile and desktop

## Files to Create/Modify

### Create:
- `src/app/api/auth/callback/route.ts` - OAuth callback handler

### Modify:
- `src/app/(auth)/login/page.tsx` - Add OAuth buttons
- `src/app/(auth)/layout.tsx` - Ensure proper layout for auth pages
- `src/lib/supabase/client.ts` - No changes needed (uses existing client)

## Environment Variables

Add to `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` (already exists)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (already exists)
- No additional OAuth secrets needed (handled by Supabase)

## Security Considerations

- OAuth state parameter prevents CSRF attacks
- Redirect URI validation in Supabase
- HTTPS required for OAuth in production
- Rate limiting handled by Supabase