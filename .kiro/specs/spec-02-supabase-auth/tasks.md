# Implementation Plan: Supabase Auth Integration

## Overview

Implement Google OAuth authentication for the AutoApply Chrome extension using Supabase Auth with PKCE flow. Tasks proceed from foundational types and utilities, through the auth store and module, to UI components and service worker integration, finishing with wiring everything together in App.tsx.

## Tasks

- [x] 1. Install dependencies and create foundational types
  - [x] 1.1 Install `fast-check` as a dev dependency
    - Run `npm install --save-dev fast-check`
  - [x] 1.2 Create `src/types/auth.ts` with the `UserProfile` interface
    - Define `UserProfile` with fields: `id`, `email`, `full_name`, `avatar_url`, `onboarding_completed`, `created_at`, `updated_at`
    - _Requirements: 7.4_

- [x] 2. Implement token parser utility
  - [x] 2.1 Create `src/utils/parseAuthTokens.ts`
    - Implement `parseAuthTokens(redirectUrl: string): ParseResult`
    - Define `ParsedTokens`, `ParseResult` types
    - Extract `access_token` and `refresh_token` from URL hash fragment
    - Return error result when hash fragment is missing or tokens are missing, identifying the specific missing token
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [ ]* 2.2 Write property test: Token parsing round-trip
    - **Property 1: Token parsing round-trip**
    - **Validates: Requirements 1.3, 8.1, 8.4**
    - Create `src/utils/__tests__/parseAuthTokens.property.test.ts`
    - Use `fast-check` to generate arbitrary access_token and refresh_token strings, construct a redirect URL, parse it, and assert extracted tokens match originals
    - Minimum 100 iterations
  - [ ]* 2.3 Write property test: Missing token error identification
    - **Property 2: Missing token error identification**
    - **Validates: Requirements 8.2**
    - In `src/utils/__tests__/parseAuthTokens.property.test.ts`
    - Use `fast-check` to generate URLs with only one of the two tokens, assert error result names the missing token
    - Minimum 100 iterations

- [x] 3. Implement auth store
  - [x] 3.1 Create `src/stores/authStore.ts`
    - Implement Zustand store with `user`, `session`, `isLoading`, `isAuthenticated`, `setSession`, `setUser`, `setLoading`, `clearAuth`
    - `isAuthenticated` derived from `session !== null`
    - _Requirements: 4.2, 4.3, 5.1, 5.2, 5.3_

- [x] 4. Implement auth module
  - [x] 4.1 Create `src/lib/auth.ts`
    - Implement `signInWithGoogle()`: call `supabase.auth.signInWithOAuth` with provider `google`, `redirectTo` from `chrome.identity.getRedirectURL()`, `skipBrowserRedirect: true`; launch web auth flow; parse tokens; call `setSession`; fetch profile; update auth store
    - Implement `signOut()`: call `supabase.auth.signOut()`, clear auth store even on failure
    - Implement `restoreSession()`: call `supabase.auth.getSession()`, fetch profile if session exists, set loading to false
    - Implement `fetchUserProfile(userId)`: query profiles table by user ID
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 6.1, 6.2, 6.5, 7.3_

- [x] 5. Checkpoint — Verify core logic
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement UI components
  - [x] 6.1 Create `src/sidepanel/components/LoginScreen.tsx`
    - Render "Sign in with Google" button that calls `signInWithGoogle()`
    - Show loading indicator and disable button while OAuth flow is in progress
    - Display error message on failure with retry capability
    - Include appropriate ARIA labels and keyboard navigation support
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 1.6_
  - [x] 6.2 Create `src/sidepanel/components/AuthGuard.tsx`
    - Read `isLoading` and `isAuthenticated` from auth store
    - Render loading indicator when `isLoading` is true
    - Render `<LoginScreen />` when not authenticated and not loading
    - Render `children` when authenticated
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ]* 6.3 Write property test: AuthGuard rendering correctness
    - **Property 3: AuthGuard rendering correctness**
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - Create `src/sidepanel/components/__tests__/AuthGuard.property.test.tsx`
    - Use `fast-check` to generate all boolean combinations of `isLoading` and `isAuthenticated`, assert exactly one of loading indicator, LoginScreen, or children renders
    - Minimum 100 iterations

- [x] 7. Update service worker for token refresh and auth state
  - [x] 7.1 Update `src/background/index.ts`
    - Import Supabase client
    - Add `scheduleTokenRefresh(expiresAt)` function: create `token-refresh` alarm firing 60 seconds before expiry
    - Add `clearTokenRefreshAlarm()` function
    - Add `chrome.alarms.onAlarm` listener: on `token-refresh` alarm, call `supabase.auth.refreshSession()`; on success reschedule alarm; on failure clear alarm
    - Subscribe to `supabase.auth.onAuthStateChange`: on `SIGNED_IN`/`TOKEN_REFRESHED` schedule alarm; on `SIGNED_OUT` clear alarm
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.3_

- [x] 8. Wire auth into the side panel app
  - [x] 8.1 Update `src/sidepanel/App.tsx`
    - Wrap all routes inside `<AuthGuard>`
    - Call `restoreSession()` on mount via `useEffect`
    - Subscribe to `onAuthStateChange` on mount, unsubscribe on unmount
    - _Requirements: 2.1, 2.5, 4.1, 4.4, 5.4_

- [x] 9. Create SQL migration for profiles table
  - [x] 9.1 Create `supabase/migrations/001_create_profiles.sql`
    - Create `public.profiles` table with columns: `id` (UUID PK, references auth.users ON DELETE CASCADE), `email` (TEXT NOT NULL), `full_name` (TEXT), `avatar_url` (TEXT), `onboarding_completed` (BOOLEAN DEFAULT FALSE), `created_at` (TIMESTAMPTZ DEFAULT NOW()), `updated_at` (TIMESTAMPTZ DEFAULT NOW())
    - Enable RLS on profiles table
    - Create SELECT policy: `auth.uid() = id`
    - Create UPDATE policy: `auth.uid() = id` with check `auth.uid() = id`
    - Create INSERT policy: `auth.uid() = id`
    - Create trigger function `handle_new_user()` that inserts a profile row from `auth.users` metadata on signup
    - Create trigger `on_auth_user_created` on `auth.users` AFTER INSERT
    - _Requirements: 7.1, 7.2, 7.4_

- [x] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- The Supabase client singleton in `src/lib/supabase.ts` already has `chromeStorageAdapter`, `autoRefreshToken`, `persistSession`, and `flowType: 'pkce'` configured
