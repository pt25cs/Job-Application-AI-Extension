# Design Document

## Overview

This design covers the implementation of four features: Contact Discovery & Enrichment, Outreach Drafting & Dispatch, Application Tracking Dashboard, and Analytics/Settings/Polish. All features share a single Supabase Postgres migration, a set of TypeScript type files, Zustand stores, library modules, Edge Functions, and React components within the existing Chrome extension side panel.

## Architecture

The system follows the existing layered architecture:
- **Database layer**: Supabase Postgres with RLS
- **Edge Functions**: Deno-based serverless functions for external API calls
- **Library layer** (`src/lib/`): Client-side wrappers calling Supabase
- **Store layer** (`src/stores/`): Zustand state management
- **UI layer** (`src/sidepanel/`): React components

## Database Schema

### Migration: `004_contacts_outreach_settings_analytics.sql`

```sql
-- contacts table
CREATE TABLE public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  title TEXT,
  company TEXT,
  email TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  email_confidence INTEGER,
  linkedin_url TEXT,
  is_alumni BOOLEAN DEFAULT FALSE,
  university TEXT,
  seniority TEXT,
  department TEXT,
  source TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email)
);

-- outreach table
CREATE TABLE public.outreach (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  email_subject TEXT,
  email_body TEXT,
  email_html TEXT,
  status TEXT NOT NULL DEFAULT 'drafted'
    CHECK (status IN ('drafted','approved','sending','sent','follow_up_scheduled','follow_up_sent','replied','bounced')),
  sent_at TIMESTAMPTZ,
  follow_up_at TIMESTAMPTZ,
  follow_up_body TEXT,
  resend_message_id TEXT,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_settings table
CREATE TABLE public.user_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  ats_target_score INTEGER DEFAULT 80,
  max_optimization_iterations INTEGER DEFAULT 3,
  daily_outreach_limit INTEGER DEFAULT 20,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  auto_optimize_on_detect BOOLEAN DEFAULT FALSE,
  auto_discover_contacts BOOLEAN DEFAULT FALSE,
  preferred_resume_template TEXT DEFAULT 'default',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- analytics_events table
CREATE TABLE public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- get_weekly_application_trend function
CREATE OR REPLACE FUNCTION public.get_weekly_application_trend(p_user_id UUID, p_weeks INTEGER)
RETURNS TABLE(week_start DATE, count BIGINT) AS $$
  SELECT
    date_trunc('week', created_at)::DATE AS week_start,
    COUNT(*) AS count
  FROM public.applications
  WHERE user_id = p_user_id
    AND created_at >= NOW() - (p_weeks || ' weeks')::INTERVAL
  GROUP BY 1
  ORDER BY 1;
$$ LANGUAGE sql STABLE;
```

## TypeScript Types

### `src/types/contacts.ts`
- `Contact` interface matching the contacts table
- `ContactDiscoveryRequest` with userId, applicationId, company, userUniversity
- `ContactDiscoveryResponse` with contacts array and metadata

### `src/types/outreach.ts`
- `OutreachStatus` union type
- `Outreach` interface matching the outreach table
- `OutreachDraftRequest` / `OutreachDraftResponse`

### `src/types/settings.ts`
- `UserSettings` interface matching user_settings table

### `src/types/analytics.ts`
- `AnalyticsSummary`, `WeeklyTrend`, `FunnelStage` interfaces

## Edge Functions

### `supabase/functions/discover-contacts/`

**index.ts** — Orchestrator:
1. Parse request body (userId, applicationId, company, userUniversity)
2. Call `searchApollo(company)` → raw contacts
3. Filter to contacts with LinkedIn URL
4. Call `enrichWithProxycurl(contacts, userUniversity)` → alumni flags
5. Call `findEmails(contacts)` via Hunter.io
6. Upsert into contacts table
7. Return enriched contacts

**apollo.ts** — Apollo.io people search using `/v1/people/search` endpoint, returns name, title, linkedin_url, company.

**proxycurl.ts** — Proxycurl `/proxycurl/api/v2/linkedin` endpoint, extracts education, calls `isAlumni()`.

**hunter.ts** — Hunter.io `/v2/email-finder` and `/v2/email-verifier` endpoints.

**alumni.ts** — `isAlumni(contactUniversity, userUniversity)` using lowercased substring match and alias map (CMU→carnegie mellon, MIT→massachusetts institute of technology, UCB/Cal→university of california berkeley).

### `supabase/functions/draft-outreach/index.ts`

1. Parse request (userId, applicationId, contactIds)
2. Fetch contacts from DB
3. Fetch user profile for sender context
4. For each contact: call OpenAI GPT-4o with structured prompt
5. Insert outreach records with status `drafted`
6. Return drafted outreach IDs

### `supabase/functions/send-outreach/index.ts`

1. Parse request (userId, outreachId)
2. Check daily send count (max 20)
3. Fetch outreach + contact records
4. Call Resend API to send email
5. Update outreach status to `sent`, set sent_at
6. Return success + resend_message_id

## Library Modules

### `src/lib/contacts.ts`
- `discoverContacts(req)` — invokes discover-contacts Edge Function
- `fetchContacts(userId, applicationId)` — queries contacts table

### `src/lib/outreach.ts`
- `draftOutreach(req)` — invokes draft-outreach Edge Function
- `sendOutreach(outreachId)` — invokes send-outreach Edge Function
- `fetchOutreach(userId, applicationId)` — queries outreach table
- `updateOutreachStatus(id, status)` — updates status field

### `src/lib/dashboard.ts`
- `fetchDashboardData(userId)` — single query joining applications with outreach counts via Supabase `.select()` with embedded count

### `src/lib/settings.ts`
- `fetchSettings(userId)` — fetches or creates default settings
- `updateSettings(userId, partial)` — upserts settings

### `src/lib/analytics.ts`
- `fetchAnalyticsSummary(userId)` — aggregates from applications + outreach tables
- `getWeeklyTrend(userId, weeks)` — calls get_weekly_application_trend RPC
- `getATSDistribution(userId)` — groups applications by ats_score buckets
- `getOutreachFunnel(userId)` — counts outreach by status

### `src/lib/analyticsTracker.ts`
- `trackEvent(userId, eventType, metadata?)` — inserts into analytics_events

## Zustand Stores

### `src/stores/contactsStore.ts`
```ts
{ contacts: Contact[], isDiscovering: boolean, discoveryProgress: string, setContacts, setDiscovering, setProgress }
```

### `src/stores/outreachStore.ts`
```ts
{ outreachItems: Outreach[], isDrafting: boolean, isSending: boolean, setItems, updateItem, setDrafting, setSending }
```

### `src/stores/dashboardStore.ts`
```ts
{ applications: ApplicationSummary[], filters: DashboardFilters, sortBy: SortField, setApplications, updateApplication, setFilters, setSortBy }
```

### `src/stores/settingsStore.ts`
```ts
{ settings: UserSettings | null, isLoading: boolean, setSettings, updateSettings }
```

## React Components

### Contact Components
- **ContactCard** — displays name, title, email, alumni badge, LinkedIn link
- **ContactDiscoveryPanel** — "Discover Contacts" button, progress indicator, list of ContactCards

### Outreach Components
- **OutreachDraftCard** — editable subject/body textarea, status badge, approve/send/discard buttons
- **OutreachPanel** — "Draft All" button, list of OutreachDraftCards, send summary

### Dashboard Components
- **ApplicationCard** — company, role, ATS score badge, outreach count, date, status badge
- **StatusColumn** — header with status label + count, list of ApplicationCards
- **DashboardFilters** — status dropdown, company text input, date range pickers, sort toggle
- **Dashboard** — main view, groups applications by status, Realtime subscription
- **ApplicationDetail** — expanded view with tabs: Overview, Resume, Outreach, Actions

### Analytics Components
- **AnalyticsDashboard** — 4 summary cards + charts
- **WeeklyTrendChart** — pure SVG bar chart
- **ATSScoreDistribution** — SVG histogram
- **OutreachFunnel** — SVG funnel

### Settings Components
- **SettingsPage** — form with all preference fields, debounced save
- **RateLimitDashboard** — shows daily outreach remaining

### Onboarding
- **Tutorial** — driver.js 6-step overlay, localStorage flag `autoapply:tutorial_seen`

## App.tsx Updates

Add routes:
```tsx
<Route path="/analytics" element={<AnalyticsDashboard />} />
<Route path="/settings" element={<SettingsPage />} />
<Route path="/outreach" element={<OutreachPanel />} />
```

Replace `<DashboardPage />` at `/` with `<Dashboard />`.

Add bottom navigation bar with icons for: Home (Dashboard), Outreach, Analytics, Settings.

## Background Service Worker Updates

Add alarm handler for outreach follow-ups:
```ts
if (alarm.name.startsWith('followup:')) {
  const outreachId = alarm.name.split(':')[1];
  // update outreach status to follow_up_scheduled
}
```

## Correctness Properties

1. Round-trip: A contact upserted with a given email can be fetched back with the same email (insert → select returns same record).
2. Idempotence: Running contact discovery twice for the same company produces the same set of contacts (deduplication via UNIQUE constraint).
3. Invariant: The daily outreach count for a user never exceeds `daily_outreach_limit` within a 24-hour window.
4. Metamorphic: Filtering the dashboard by a status S returns a subset of all applications where every item has status S.
5. Round-trip: Settings saved via `updateSettings` can be fetched back via `fetchSettings` with identical values.
