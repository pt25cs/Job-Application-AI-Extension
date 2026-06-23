# Requirements Document

## Introduction

This combined spec covers four interconnected features that transform AutoApply from a single-page optimizer into a full job-search platform: (1) Contact Discovery & Enrichment — automatically finding recruiters and alumni at target companies; (2) Outreach Drafting & Dispatch — generating, reviewing, and sending personalized cold emails with follow-up scheduling; (3) Application Tracking Dashboard — a pipeline view of all applications with real-time updates; and (4) Analytics, Settings & Polish — usage analytics, user preferences, and an onboarding tutorial.

## Glossary

- **ContactDiscovery**: The Supabase Edge Function that orchestrates Apollo.io, Proxycurl, and Hunter.io to find and enrich contacts.
- **Contact**: A recruiter, hiring manager, or alumni stored in the `contacts` table.
- **OutreachDrafter**: The Supabase Edge Function that calls GPT-4o to generate personalized email drafts.
- **OutreachSender**: The Supabase Edge Function that dispatches approved emails via the Resend API.
- **Outreach**: A single email record stored in the `outreach` table.
- **Dashboard**: The React component that renders all applications in a pipeline view.
- **ApplicationSummary**: A denormalized view of an application joined with outreach counts.
- **AnalyticsDashboard**: The React component that renders usage charts and funnel metrics.
- **SettingsPage**: The React component that allows users to configure preferences.
- **ServiceWorker**: The Chrome extension background service worker (`src/background/index.ts`).
- **SidePanel**: The Chrome extension side panel React app (`src/sidepanel/`).
- **Supabase**: The backend-as-a-service platform providing Postgres, Auth, Storage, Realtime, and Edge Functions.

---

## Requirements

### Requirement 1: Contact Discovery Pipeline

**User Story:** As a job seeker who just applied to a company, I want the extension to automatically find recruiters and alumni at that company with verified emails, so that I can network my way to a referral.

#### Acceptance Criteria

1. WHEN a user triggers contact discovery for an application, THE ContactDiscovery SHALL query Apollo.io for up to 20 recruiters and hiring managers at the target company.
2. WHEN Apollo.io returns results, THE ContactDiscovery SHALL filter contacts to those that have a LinkedIn URL.
3. WHEN filtered contacts are available, THE ContactDiscovery SHALL call Proxycurl for up to 10 contacts to cross-reference alumni status against the user's university.
4. WHEN Proxycurl returns education data, THE ContactDiscovery SHALL mark a contact as `is_alumni = true` if the contact's university matches the user's university using normalized name comparison.
5. WHEN contacts have been enriched, THE ContactDiscovery SHALL call Hunter.io to find and verify email addresses for each contact.
6. WHEN storing contacts, THE ContactDiscovery SHALL deduplicate records using the UNIQUE(user_id, email) constraint, upserting on conflict.
7. THE ContactDiscovery SHALL complete a full discovery run within 10 seconds for a single company.
8. WHEN the discovery run completes, THE ContactDiscovery SHALL return at least 1 contact with a verified email for companies with a public LinkedIn presence.
9. IF any external API call fails, THEN THE ContactDiscovery SHALL log the error, skip that contact, and continue processing remaining contacts.
10. THE ContactDiscovery SHALL require the secrets APOLLO_API_KEY, PROXYCURL_API_KEY, and HUNTER_API_KEY to be set in the Edge Function environment.

### Requirement 2: Contact Data Model

**User Story:** As a developer, I want a well-structured contacts table, so that contact data is consistently stored and queryable.

#### Acceptance Criteria

1. THE Supabase database SHALL contain a `contacts` table with columns: id (UUID PK), user_id (UUID FK), application_id (UUID FK), full_name, first_name, last_name, title, company, email, email_verified (boolean), email_confidence (integer), linkedin_url, is_alumni (boolean), university, seniority, department, source, raw_data (JSONB), created_at, updated_at.
2. THE `contacts` table SHALL enforce a UNIQUE constraint on (user_id, email).
3. THE `contacts` table SHALL have Row Level Security policies that restrict all operations to the authenticated user matching user_id.

### Requirement 3: Contact Discovery UI

**User Story:** As a job seeker, I want to see discovered contacts in the side panel, so that I can review who to reach out to.

#### Acceptance Criteria

1. WHEN contact discovery is in progress, THE SidePanel SHALL display a loading indicator with progress text.
2. WHEN contacts are loaded, THE SidePanel SHALL render a ContactCard for each contact showing: full name, title, company, email, alumni badge (if applicable), and LinkedIn link.
3. WHEN a contact has `is_alumni = true`, THE ContactCard SHALL display a highlighted alumni badge.
4. THE ContactDiscoveryPanel SHALL provide a "Discover Contacts" button that triggers the discovery Edge Function for the current application.

### Requirement 4: Outreach Drafting

**User Story:** As a job seeker, I want personalized cold emails drafted for each contact, so that I can review and send them with minimal effort.

#### Acceptance Criteria

1. WHEN a user requests email drafts, THE OutreachDrafter SHALL generate a personalized email subject, body, and follow-up body for each contact using GPT-4o with temperature 0.7.
2. WHEN generating email content, THE OutreachDrafter SHALL include the sender's profile, the recipient's title and company, and the alumni flag in the prompt context.
3. WHEN drafts are generated, THE OutreachDrafter SHALL store each draft in the `outreach` table with status `drafted`.
4. THE OutreachDrafter SHALL require the secret OPENAI_API_KEY to be set in the Edge Function environment.

### Requirement 5: Outreach Data Model

**User Story:** As a developer, I want a well-structured outreach table, so that email status is consistently tracked.

#### Acceptance Criteria

1. THE Supabase database SHALL contain an `outreach` table with columns: id (UUID PK), user_id (UUID FK), contact_id (UUID FK), application_id (UUID FK), email_subject, email_body, email_html, status, sent_at, follow_up_at, follow_up_body, resend_message_id, opened_at, created_at, updated_at.
2. THE `outreach` table status column SHALL only accept values: drafted, approved, sending, sent, follow_up_scheduled, follow_up_sent, replied, bounced.
3. THE `outreach` table SHALL have Row Level Security policies that restrict all operations to the authenticated user matching user_id.

### Requirement 6: Outreach Dispatch & Tracking

**User Story:** As a job seeker, I want to review, edit, and send approved emails, so that I control what goes out under my name.

#### Acceptance Criteria

1. WHEN a user approves an outreach draft, THE SidePanel SHALL update the outreach status to `approved`.
2. WHEN a user clicks send on an approved outreach, THE OutreachSender SHALL dispatch the email via the Resend API and update status to `sent`.
3. WHEN an email is sent, THE ServiceWorker SHALL schedule a `chrome.alarms` follow-up alarm 5 days after the send timestamp.
4. WHEN the follow-up alarm fires, THE ServiceWorker SHALL update the outreach status to `follow_up_scheduled`.
5. THE OutreachSender SHALL enforce a rate limit of maximum 20 emails per user per day, returning an error if the limit is exceeded.
6. IF the Resend API returns a bounce error, THEN THE OutreachSender SHALL update the outreach status to `bounced`.
7. THE OutreachSender SHALL require the secret RESEND_API_KEY to be set in the Edge Function environment.

### Requirement 7: Outreach UI

**User Story:** As a job seeker, I want a clear outreach panel in the side panel, so that I can manage all my drafts in one place.

#### Acceptance Criteria

1. THE OutreachPanel SHALL display a "Draft All" button that triggers draft generation for all contacts with verified emails.
2. THE OutreachPanel SHALL render an OutreachDraftCard for each outreach record showing: recipient name, subject, editable body, status badge, and approve/send/discard actions.
3. WHEN outreach status changes via Supabase Realtime, THE OutreachPanel SHALL update the displayed status without a full page reload.
4. THE OutreachPanel SHALL display a summary of sent, pending, and bounced counts.

### Requirement 8: Application Tracking Dashboard

**User Story:** As a job seeker who has applied to 50+ jobs, I want a dashboard showing every application's status, ATS score, and networking progress, so that I can prioritize follow-ups and track my pipeline.

#### Acceptance Criteria

1. THE Dashboard SHALL display all applications for the authenticated user grouped by status column.
2. WHEN rendering an application, THE ApplicationCard SHALL display: company name, role title, ATS score, outreach count, and application date.
3. WHEN a user changes an application's status via the UI, THE Dashboard SHALL update the application record in Supabase and reflect the change immediately.
4. WHEN the Supabase Realtime subscription receives an application update, THE Dashboard SHALL re-render the affected card without a full reload.
5. THE DashboardFilters SHALL allow filtering by status, company name (text search), and date range.
6. THE DashboardFilters SHALL allow sorting by date, ATS score, and company name.
7. WHEN a user clicks an ApplicationCard, THE Dashboard SHALL display the ApplicationDetail expanded view showing: job description, resume preview, outreach list, and status action buttons.

### Requirement 9: Dashboard Data

**User Story:** As a developer, I want an efficient data fetching layer for the dashboard, so that the UI loads quickly.

#### Acceptance Criteria

1. THE `dashboard.ts` library SHALL fetch applications joined with outreach counts in a single aggregated query.
2. WHEN the Dashboard mounts, THE Dashboard SHALL subscribe to Supabase Realtime on the `applications` table filtered by user_id.
3. WHEN the Dashboard unmounts, THE Dashboard SHALL unsubscribe from the Realtime channel.

### Requirement 10: Analytics

**User Story:** As a power user who has applied to 200+ jobs, I want to see which resume versions get the most interviews and which outreach templates get the most replies, so that I can refine my strategy.

#### Acceptance Criteria

1. THE AnalyticsDashboard SHALL display summary cards for: total applications, interview rate (%), average ATS score, and outreach response rate (%).
2. THE WeeklyTrendChart SHALL render a bar chart of applications submitted per week for the past N weeks using SVG.
3. THE ATSScoreDistribution SHALL render a histogram of ATS scores across all applications.
4. THE OutreachFunnel SHALL render a funnel visualization showing counts at each outreach status stage.
5. WHEN analytics data is fetched, THE `analytics.ts` library SHALL call the Postgres function `get_weekly_application_trend(user_id, weeks)` for trend data.
6. THE `analyticsTracker.ts` module SHALL provide an `trackEvent(userId, eventType, metadata)` function that inserts a record into the `analytics_events` table.

### Requirement 11: Analytics & Settings Data Model

**User Story:** As a developer, I want well-structured settings and analytics tables, so that user preferences and events are consistently stored.

#### Acceptance Criteria

1. THE Supabase database SHALL contain a `user_settings` table with columns: user_id (UUID PK FK), ats_target_score (integer), max_optimization_iterations (integer), daily_outreach_limit (integer), notifications_enabled (boolean), auto_optimize_on_detect (boolean), auto_discover_contacts (boolean), preferred_resume_template (text), theme (text), created_at, updated_at.
2. THE Supabase database SHALL contain an `analytics_events` table with columns: id (UUID PK), user_id (UUID FK), event_type (text), metadata (JSONB), created_at.
3. THE Supabase database SHALL contain a Postgres function `get_weekly_application_trend(p_user_id UUID, p_weeks INTEGER)` that returns weekly application counts.
4. THE `user_settings` table SHALL have Row Level Security policies restricting all operations to the authenticated user matching user_id.
5. THE `analytics_events` table SHALL have Row Level Security policies restricting all operations to the authenticated user matching user_id.

### Requirement 12: Settings Page

**User Story:** As a user, I want to configure my preferences, so that the extension behaves according to my workflow.

#### Acceptance Criteria

1. THE SettingsPage SHALL allow the user to set: ATS target score, max optimization iterations, daily outreach limit, notifications enabled toggle, auto-optimize on detect toggle, auto-discover contacts toggle, preferred resume template, and theme.
2. WHEN a setting is changed, THE SettingsPage SHALL debounce the save operation by 500ms before persisting to Supabase.
3. WHEN settings are loaded, THE SettingsPage SHALL pre-populate all fields with the user's current settings.
4. IF no settings record exists for the user, THEN THE `settings.ts` library SHALL insert a default settings record.

### Requirement 13: Onboarding Tutorial

**User Story:** As a new user, I want a guided tutorial on first use, so that I understand how to use the extension's key features.

#### Acceptance Criteria

1. WHEN a user completes onboarding and has not yet seen the tutorial, THE SidePanel SHALL display a driver.js tutorial overlay.
2. THE Tutorial SHALL guide the user through 6 steps highlighting: job detection, ATS optimization, contact discovery, outreach drafting, the dashboard, and analytics.
3. WHEN the tutorial is dismissed or completed, THE SidePanel SHALL store a flag in localStorage so the tutorial does not show again.

### Requirement 14: Navigation

**User Story:** As a user, I want to navigate between the dashboard, analytics, and settings, so that I can access all features.

#### Acceptance Criteria

1. THE SidePanel App.tsx SHALL include routes for `/analytics` and `/settings` in addition to existing routes.
2. THE SidePanel SHALL provide navigation controls to reach `/analytics` and `/settings` from the main dashboard view.
