# Spec 9 — P1: Application Tracking Dashboard

## Requirement

Build a sidebar dashboard displaying all applications in a pipeline view (detected → optimizing → ready → applied → interviewing → offer/rejected), with ATS scores, outreach stats, filtering/sorting, and real-time updates via Supabase Realtime.

## User Story

"As a job seeker who has applied to 50+ jobs this week, I want a dashboard showing every application's status, ATS score, and networking progress so that I can prioritize follow-ups and track my pipeline."

## Success Criteria

- Dashboard shows all applications grouped by status
- Each card shows: company, role, ATS score, outreach count, date
- User can manually update application status
- Real-time updates when optimization completes or outreach status changes
- Filter by status, company, date range
- Sort by date, ATS score, company name

## Priority

P1 — Feature Enhancement. Transforms AutoApply from fire-and-forget into a daily-use platform.

## Dependencies

- Spec 6 (applications table), reads from Specs 7-8 (contacts, outreach)

## Architecture

Reference: #[[file:masterplan.md]] — Spec 9, sections 9.2 through 9.7

### Data Fetching

Single aggregated query joining applications with outreach counts. Supabase Realtime subscription on applications table filtered by user_id.

### Status Pipeline

detected → optimizing → ready → applied → interviewing → offer/rejected/withdrawn

## Implementation Tasks

1. Create src/stores/dashboardStore.ts — ApplicationSummary[], filters, sorting, CRUD actions
2. Create src/lib/dashboard.ts — fetchDashboardData() with aggregated outreach counts
3. Create src/sidepanel/components/dashboard/ApplicationCard.tsx — company logo (Clearbit), role, status badge, ATS score, outreach count, date
4. Create src/sidepanel/components/dashboard/StatusColumn.tsx — single status group
5. Create src/sidepanel/components/dashboard/DashboardFilters.tsx — status dropdown, company search, date range, sort toggle
6. Create src/sidepanel/components/dashboard/Dashboard.tsx — main view with Realtime subscription
7. Create src/sidepanel/components/dashboard/ApplicationDetail.tsx — expanded view with JD, resume preview, outreach list, status buttons
8. Update src/sidepanel/App.tsx — set Dashboard as default authenticated view (within existing MemoryRouter per Spec 1)
9. Wire Supabase Realtime subscription for live updates
10. Verify with test applications
