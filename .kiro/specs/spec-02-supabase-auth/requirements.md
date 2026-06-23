# Requirements Document

## Introduction

This feature implements Google OAuth authentication using Supabase Auth with the PKCE flow adapted for Chrome extensions. It persists sessions in `chrome.storage.local`, auto-refreshes tokens via service worker alarms, protects all sidebar routes behind auth state, and handles the OAuth redirect flow within the extension context. A `profiles` table in Supabase Postgres auto-populates on signup via a database trigger, with Row Level Security scoped to the authenticated user.

## Glossary

- **Auth_Module**: The set of authentication helper functions (`src/lib/auth.ts`) that orchestrate sign-in, sign-out, session restoration, and profile fetching using the Supabase client singleton
- **Auth_Store**: The Zustand store (`src/stores/authStore.ts`) that holds the current user profile, session, loading state, and authentication status for reactive UI updates
- **Auth_Guard**: A React wrapper component (`src/sidepanel/components/AuthGuard.tsx`) that conditionally renders child routes only when the user is authenticated, showing a login screen or loading indicator otherwise
- **Login_Screen**: The side panel UI component (`src/sidepanel/components/LoginScreen.tsx`) displaying the Google sign-in button, app branding, and loading/error states during the OAuth flow
- **PKCE_Flow**: Proof Key for Code Exchange — an OAuth 2.0 extension that prevents authorization code interception; used here because Chrome extensions cannot securely store client secrets
- **OAuth_Redirect_URL**: The URL returned by `chrome.identity.getRedirectURL()` in the format `https://<extension-id>.chromiumapp.org/`, used as the OAuth callback destination
- **Token_Refresh_Alarm**: A `chrome.alarms` alarm named `token-refresh` scheduled in the Service_Worker to trigger a Supabase session refresh before the access token expires
- **Profiles_Table**: The `public.profiles` Postgres table that extends `auth.users` with application-specific fields (full_name, avatar_url, onboarding_completed), protected by Row Level Security
- **Session**: A Supabase Auth session object containing `access_token`, `refresh_token`, `expires_at`, and user metadata, persisted via the `chromeStorageAdapter` to `chrome.storage.local`
- **Service_Worker**: The Manifest V3 background script (`src/background/index.ts`) that manages extension lifecycle events, message routing, and alarm-based token refresh
- **Side_Panel**: The primary React-based UI surface (`src/sidepanel/`) rendered in Chrome's built-in side panel
- **Token_Parser**: A utility module (`src/utils/parseAuthTokens.ts`) that extracts `access_token` and `refresh_token` from the URL hash fragment returned by `chrome.identity.launchWebAuthFlow`

## Requirements

### Requirement 1: Google OAuth Sign-In via PKCE Flow

**User Story:** As a new user, I want to sign in with my Google account in one click so that my profile and application data are securely stored and accessible across sessions.

#### Acceptance Criteria

1. WHEN the user clicks the "Sign in with Google" button on the Login_Screen, THE Auth_Module SHALL call `supabase.auth.signInWithOAuth` with provider `google`, `redirectTo` set to the OAuth_Redirect_URL from `chrome.identity.getRedirectURL()`, and `skipBrowserRedirect` set to `true`
2. WHEN `supabase.auth.signInWithOAuth` returns a consent URL, THE Auth_Module SHALL open the Google consent screen by calling `chrome.identity.launchWebAuthFlow` with the consent URL and `interactive: true`
3. WHEN `chrome.identity.launchWebAuthFlow` resolves with a redirect URL, THE Token_Parser SHALL extract the `access_token` and `refresh_token` from the URL hash fragment
4. WHEN the Token_Parser has extracted valid tokens, THE Auth_Module SHALL call `supabase.auth.setSession` with the extracted `access_token` and `refresh_token` to establish the authenticated session
5. WHEN `supabase.auth.setSession` succeeds, THE Auth_Module SHALL fetch the user profile from the Profiles_Table and update the Auth_Store with the session and user profile
6. IF `chrome.identity.launchWebAuthFlow` fails or is cancelled by the user, THEN THE Login_Screen SHALL display a descriptive error message and a retry button
7. IF `supabase.auth.setSession` fails with invalid tokens, THEN THE Auth_Module SHALL clear any partial auth state from the Auth_Store and the Login_Screen SHALL display an error message

### Requirement 2: Session Persistence and Restoration

**User Story:** As a returning user, I want my session to persist across extension restarts so that I do not have to sign in again each time Chrome restarts or the service worker terminates.

#### Acceptance Criteria

1. WHEN the Side_Panel mounts, THE Auth_Module SHALL call `supabase.auth.getSession()` to attempt session restoration from `chrome.storage.local` via the `chromeStorageAdapter`
2. WHEN `supabase.auth.getSession()` returns a valid, non-expired session, THE Auth_Module SHALL set the session in the Auth_Store, fetch the user profile from the Profiles_Table, and set `isLoading` to `false`
3. WHEN `supabase.auth.getSession()` returns an expired session, THE Supabase client SHALL auto-refresh the session using the stored refresh token (via `autoRefreshToken: true` configuration)
4. WHEN `supabase.auth.getSession()` returns no session, THE Auth_Module SHALL set `isLoading` to `false` in the Auth_Store, causing the Auth_Guard to render the Login_Screen
5. WHILE the Auth_Module is restoring the session, THE Auth_Guard SHALL display a loading indicator instead of the Login_Screen or protected routes

### Requirement 3: Automatic Token Refresh

**User Story:** As an active user, I want my access token to refresh automatically before it expires so that I am never interrupted by an unexpected sign-out.

#### Acceptance Criteria

1. WHEN a new session is established or refreshed, THE Service_Worker SHALL create a Token_Refresh_Alarm scheduled to fire 60 seconds before the session `expires_at` timestamp
2. WHEN the Token_Refresh_Alarm fires, THE Service_Worker SHALL call `supabase.auth.refreshSession()` to obtain a new access token
3. WHEN `supabase.auth.refreshSession()` succeeds, THE Service_Worker SHALL reschedule the Token_Refresh_Alarm for the new session expiry minus 60 seconds
4. IF `supabase.auth.refreshSession()` fails, THEN THE Service_Worker SHALL clear the Token_Refresh_Alarm and the Auth_Module SHALL set the Auth_Store to an unauthenticated state, causing the Auth_Guard to render the Login_Screen with a "Session expired, please sign in again" message
5. WHEN the user signs out, THE Service_Worker SHALL clear the Token_Refresh_Alarm

### Requirement 4: Auth State Change Listener

**User Story:** As a user with multiple extension contexts open, I want auth state changes to propagate automatically so that all UI surfaces reflect the current authentication status.

#### Acceptance Criteria

1. WHEN the Side_Panel mounts, THE Auth_Module SHALL subscribe to `supabase.auth.onAuthStateChange` to listen for `SIGNED_IN`, `SIGNED_OUT`, and `TOKEN_REFRESHED` events
2. WHEN an `onAuthStateChange` event fires with event `SIGNED_IN` or `TOKEN_REFRESHED`, THE Auth_Module SHALL update the Auth_Store with the new session
3. WHEN an `onAuthStateChange` event fires with event `SIGNED_OUT`, THE Auth_Module SHALL clear the Auth_Store (user, session, isAuthenticated) and the Auth_Guard SHALL render the Login_Screen
4. WHEN the Side_Panel unmounts, THE Auth_Module SHALL unsubscribe from the `onAuthStateChange` listener to prevent memory leaks

### Requirement 5: Protected Route Guard

**User Story:** As a product owner, I want unauthenticated users to see only the login screen so that application data and features are inaccessible without a valid session.

#### Acceptance Criteria

1. WHILE `isLoading` is `true` in the Auth_Store, THE Auth_Guard SHALL render a loading indicator and not render the Login_Screen or any protected child routes
2. WHILE `isAuthenticated` is `false` in the Auth_Store and `isLoading` is `false`, THE Auth_Guard SHALL render the Login_Screen instead of any protected child routes
3. WHILE `isAuthenticated` is `true` in the Auth_Store, THE Auth_Guard SHALL render the protected child routes (dashboard, onboarding, profile, applications, outreach, settings)
4. THE Auth_Guard SHALL wrap all routes inside the existing `MemoryRouter` in `src/sidepanel/App.tsx`

### Requirement 6: Sign-Out

**User Story:** As a signed-in user, I want to sign out so that my session is cleared and no one else can access my data from this browser.

#### Acceptance Criteria

1. WHEN the user triggers sign-out, THE Auth_Module SHALL call `supabase.auth.signOut()` to clear the session from the Supabase client and `chrome.storage.local`
2. WHEN `supabase.auth.signOut()` completes, THE Auth_Module SHALL clear the Auth_Store (set user to null, session to null, isAuthenticated to false)
3. WHEN sign-out completes, THE Service_Worker SHALL clear the Token_Refresh_Alarm
4. WHEN sign-out completes, THE Auth_Guard SHALL render the Login_Screen
5. IF `supabase.auth.signOut()` fails, THEN THE Auth_Module SHALL still clear the Auth_Store and local session data to ensure the user is logged out locally

### Requirement 7: User Profile Auto-Creation and Retrieval

**User Story:** As a new user completing OAuth sign-in for the first time, I want my profile to be automatically created so that I can immediately use the application without manual setup.

#### Acceptance Criteria

1. WHEN a new user signs up via Google OAuth, THE Profiles_Table trigger `on_auth_user_created` SHALL insert a new row with the user's `id`, `email`, `full_name`, and `avatar_url` extracted from the Google OAuth metadata
2. THE Profiles_Table SHALL enforce Row Level Security so that each user can only SELECT, UPDATE, and INSERT their own profile row, identified by `auth.uid() = id`
3. WHEN the Auth_Module fetches a user profile, THE Auth_Module SHALL query the Profiles_Table filtered by the authenticated user's ID and return a `UserProfile` object
4. THE Profiles_Table SHALL include the fields: `id` (UUID, primary key, references auth.users), `email` (TEXT, not null), `full_name` (TEXT, nullable), `avatar_url` (TEXT, nullable), `onboarding_completed` (BOOLEAN, default false), `created_at` (TIMESTAMPTZ, default now), `updated_at` (TIMESTAMPTZ, default now)

### Requirement 8: Auth Token URL Parsing

**User Story:** As a developer, I want a dedicated utility to parse OAuth tokens from redirect URLs so that token extraction is testable and reusable.

#### Acceptance Criteria

1. WHEN given a redirect URL containing an `access_token` and `refresh_token` in the hash fragment, THE Token_Parser SHALL extract and return both tokens as an object
2. IF the redirect URL hash fragment is missing `access_token` or `refresh_token`, THEN THE Token_Parser SHALL return an error indicating which token is missing
3. IF the redirect URL has no hash fragment, THEN THE Token_Parser SHALL return an error indicating no tokens were found
4. FOR ALL valid redirect URLs containing both tokens in the hash fragment, parsing the URL and reconstructing a URL with the parsed tokens SHALL produce equivalent token values (round-trip property)

### Requirement 9: Login Screen UI

**User Story:** As a new user opening the extension for the first time, I want a clear and inviting login screen so that I understand what the extension does and how to get started.

#### Acceptance Criteria

1. THE Login_Screen SHALL display a "Sign in with Google" button that calls the Auth_Module `signInWithGoogle()` function when clicked
2. WHILE the OAuth flow is in progress, THE Login_Screen SHALL disable the sign-in button and display a loading indicator
3. WHEN the OAuth flow fails, THE Login_Screen SHALL display the error message returned by the Auth_Module and re-enable the sign-in button
4. THE Login_Screen SHALL be accessible, with the sign-in button having appropriate ARIA labels and keyboard navigation support