# Spec 7 — P1: Contact Discovery & Enrichment Pipeline

## Requirement

Build a server-side contact discovery pipeline (Supabase Edge Function) that queries Apollo.io for recruiters/hiring managers at a target company, cross-references Proxycurl for alumni connections, verifies emails via Hunter.io, deduplicates, and stores the enriched contact graph in Supabase Postgres.

## User Story

"As a job seeker who just applied to Google, I want the extension to automatically find 5+ recruiters and alumni at Google with verified emails so that I can network my way to a referral."

## Success Criteria

- Returns 5+ contacts per company with >80% email verification rate
- Alumni from user's university flagged and prioritized
- Contact deduplication prevents storing same person twice
- Results appear in side panel within 10 seconds
- API costs per discovery run stay under $0.15

## Priority

P1 — Feature Enhancement. The competitive differentiator. Ships after core apply flow works.

## Dependencies

- Spec 1 (shell), Spec 2 (auth), Spec 6 (applications table)

## Architecture

Reference: #[[file:masterplan.md]] — Spec 7, sections 7.2 through 7.7

### Database Schema

- `contacts` table: id, user_id, application_id, full_name, first/last_name, title, company, email, email_verified, email_confidence, linkedin_url, is_alumni, university, seniority, department, source, raw_data (JSONB). UNIQUE(user_id, email)
- RLS policies scoped to auth.uid()

### Discovery Algorithm

1. Apollo.io people search (recruiters, hiring managers, 20 results)
2. Filter by quality (must have LinkedIn URL)
3. Proxycurl alumni cross-reference (top 10, $0.01/call)
4. Hunter.io email finding + verification
5. Deduplicate via UNIQUE constraint
6. Store in contacts table

### Alumni Matching

University name normalization + Levenshtein distance + alias map (CMU, MIT, UCB, etc.)

### API Costs

- Apollo: free tier 10k credits/month
- Proxycurl: $0.01/call, max 10 = $0.10
- Hunter: 25 free/month, $49/mo for 500

## Implementation Tasks

1. Run SQL migration: create contacts table with RLS
2. Create src/types/contacts.ts — Contact, ContactDiscoveryRequest/Response
3. Create Edge Function supabase/functions/discover-contacts/index.ts — main orchestrator
4. Create discover-contacts/apollo.ts — Apollo.io API client
5. Create discover-contacts/proxycurl.ts — Proxycurl client with alumni matching
6. Create discover-contacts/hunter.ts — Hunter.io email finder + verifier
7. Create discover-contacts/alumni.ts — isAlumni() with university normalization
8. Create src/lib/contacts.ts — client wrapper
9. Create src/stores/contactsStore.ts — contacts[], isDiscovering, discoveryProgress
10. Create src/sidepanel/components/ContactCard.tsx — name, title, email, alumni badge, LinkedIn link
11. Create src/sidepanel/components/ContactDiscoveryPanel.tsx — trigger, progress, contact list
12. Set Edge Function secrets: APOLLO_API_KEY, PROXYCURL_API_KEY, HUNTER_API_KEY
13. Verify: discover contacts for a known company
