# Spec 10 — P2: Analytics, Settings & Polish

## Requirement

Build analytics dashboard (success rates, resume A/B performance, outreach response rates, weekly trends), settings page (ATS threshold, outreach limits, notifications, theme), rate limit management, error recovery UX, and onboarding tutorial flow.

## User Story

"As a power user who has applied to 200+ jobs, I want to see which resume versions get the most interviews and which outreach templates get the most replies so that I can refine my strategy."

## Success Criteria

- Analytics: applications/week, interview rate, ATS score distribution, outreach response rate
- Resume A/B: compare callback rates across tailored resume versions
- Settings: ATS target score, max iterations, daily outreach limit, notifications, theme
- Rate limit dashboard shows remaining API credits
- Onboarding tutorial highlights key features on first use

## Priority

P2 — Polish / Advanced. Essential for retention and product maturity, not for MVP.

## Dependencies

- All previous specs (reads data from all tables)

## Architecture

Reference: #[[file:masterplan.md]] — Spec 10, sections 10.2 through 10.7

### Database Schema

- `user_settings` table: user_id (PK), ats_target_score, max_optimization_iterations, daily_outreach_limit, notifications_enabled, auto_optimize_on_detect, auto_discover_contacts, preferred_resume_template, theme
- `analytics_events` table: id, user_id, event_type, metadata (JSONB), created_at
- Postgres function `get_weekly_application_trend(user_id, weeks)`
- RLS on both tables

### Analytics Aggregation

- Application funnel from applications table
- Weekly trend via Postgres function
- Resume A/B via grouping applications by tailored_resume_id
- Outreach funnel from outreach table

## Implementation Tasks

1. Run SQL migration: create user_settings, analytics_events tables, get_weekly_application_trend function
2. Create src/types/settings.ts and src/types/analytics.ts
3. Create src/stores/settingsStore.ts — load/save settings
4. Create src/lib/settings.ts — fetchSettings(), updateSettings()
5. Create src/lib/analytics.ts — fetchAnalyticsSummary(), getApplicationFunnel(), getWeeklyTrend(), getResumePerformance()
6. Create src/sidepanel/components/analytics/AnalyticsDashboard.tsx — summary cards
7. Create WeeklyTrendChart.tsx — bar chart (recharts or pure SVG)
8. Create ATSScoreDistribution.tsx — histogram
9. Create OutreachFunnel.tsx — funnel visualization
10. Create src/sidepanel/components/settings/SettingsPage.tsx — all preferences with debounced save
11. Create RateLimitDashboard.tsx — remaining API credits per service
12. Install driver.js, create src/sidepanel/components/onboarding/Tutorial.tsx — 6-step tutorial overlay
13. Create src/lib/analyticsTracker.ts — insert events from other specs
14. Update src/sidepanel/App.tsx — add Analytics and Settings navigation (within existing MemoryRouter per Spec 1)
15. Verify analytics accuracy with test data
