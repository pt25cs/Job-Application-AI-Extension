# Spec 2 — P0: Supabase Auth Integration

## Requirement

Implement Google OAuth authentication using Supabase Auth with the PKCE flow adapted for Chrome extensions. Persist sessions in `chrome.storage.local`, auto-refresh tokens, protect all sidebar routes behind auth state, and handle the OAuth redirect flow within the extension context.

## User Story

"As a new user, I can sign in with my Google account in one click so that my profile and application data are securely stored and accessible across sessions."

## Success Criteria

- User can click "Sign in with Google" and complete OAuth flow
- Session persists across extension restarts (service worker termination/restart)
- Token auto-refreshes before expiry without user intervention
- Unauthenticated users see only the login screen; all other routes are protected
- Sign-out clears all local session data and redirects to login

## Priority

P0 — Core MVP. Every feature beyond the shell requires user identity.

## Dependencies

- Spec 1 (project shell, Supabase client singleton)

## Architecture

Reference: #[[file:masterplan.md]] — Spec 2, sections 2.2 through 2.7
Reference: #[[file:.kiro/specs/architecture-reference.md]] — Supabase Client Singleton

### Database Schema

- `profiles` table (extends auth.users) with RLS policies scoped to auth.uid()
- Trigger `on_auth_user_created` auto-creates profile row on signup
- Fields: id, email, full_name, avatar_url, onboarding_completed, created_at, updated_at

### Key Algorithms

- OAuth PKCE flow via chrome.identity.launchWebAuthFlow
- Session restoration from chrome.storage.local on sidebar mount
- Token refresh via chrome.alarms in service worker
- Auth state broadcast via supabase.auth.onAuthStateChange

## Implementation Tasks

1. Create src/types/auth.ts — UserProfile and AuthState interfaces
2. Create src/stores/authStore.ts — Zustand auth store (user, session, isLoading, isAuthenticated, setters)
3. Create src/lib/auth.ts — signInWithGoogle(), signOut(), restoreSession(), fetchUserProfile()
4. Create src/sidepanel/components/AuthGuard.tsx — protected route wrapper
5. Create src/sidepanel/components/LoginScreen.tsx — Google sign-in button with loading state
6. Update src/sidepanel/App.tsx — wrap routes in AuthGuard (within existing MemoryRouter per Spec 1), call restoreSession() on mount, subscribe to onAuthStateChange
7. Update src/background/index.ts — add token-refresh alarm listener, auth state change listener for alarm scheduling
8. Create src/utils/parseAuthTokens.ts — extract access_token and refresh_token from redirect URL hash
9. Add error boundary around auth flow in LoginScreen.tsx
10. Run SQL migration: create profiles table, RLS policies, and on_auth_user_created trigger
