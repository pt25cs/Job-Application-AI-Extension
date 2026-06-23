# Spec 8 — P1: Outreach Drafting & Dispatch

## Requirement

Build an outreach system that generates personalized coffee chat emails using GPT-4o, presents drafts for user review/editing in the sidebar, dispatches approved emails via Resend API, and tracks outreach status with Realtime updates. Includes follow-up scheduling.

## User Story

"As a job seeker, I want personalized cold emails drafted for each recruiter the extension found so that I can review, edit, and send them with one click to maximize my chances of getting a referral."

## Success Criteria

- GPT-4o generates contextually relevant, non-generic emails per contact
- User can review, edit, and approve each email before sending
- Emails sent via Resend with custom domain support
- Outreach status (drafted → sent → follow_up) tracked in real-time
- Follow-up reminders scheduled 5 days after initial send

## Priority

P1 — Feature Enhancement. Closes the networking loop opened by Spec 7.

## Dependencies

- Spec 7 (contact discovery provides the contacts to email)

## Architecture

Reference: #[[file:masterplan.md]] — Spec 8, sections 8.2 through 8.7

### Database Schema

- `outreach` table: id, user_id, contact_id, application_id, email_subject, email_body, email_html, status (drafted→approved→sending→sent→follow_up_scheduled→follow_up_sent→replied→bounced), sent_at, follow_up_at, follow_up_body, resend_message_id, opened_at, timestamps
- RLS policies scoped to auth.uid()

### Email Drafting

- GPT-4o with temperature 0.7 (creative)
- Prompt includes: sender profile, recipient background, alumni flag, target role
- Generates: subject, body, follow-up body
- Cost per draft: ~$0.01, 5 contacts: ~$0.05

### Outreach Pipeline

1. Draft emails for all contacts with verified emails
2. Present in sidebar for review/edit
3. User approves → send via Resend API
4. Track status, schedule follow-up alarm (5 days)

### Spam Prevention

- Rate limit: max 20 emails/day per user
- Custom domain with SPF/DKIM/DMARC

## Implementation Tasks

1. Run SQL migration: create outreach table with RLS
2. Create src/types/outreach.ts — Outreach, OutreachDraftRequest/Response
3. Create Edge Function supabase/functions/draft-outreach/index.ts — GPT-4o email generation
4. Create Edge Function supabase/functions/send-outreach/index.ts — Resend dispatch + status update
5. Create src/lib/outreach.ts — client wrappers
6. Create src/stores/outreachStore.ts — outreachItems[], isDrafting, isSending
7. Create src/sidepanel/components/OutreachDraftCard.tsx — editable email card with approve/discard/send
8. Create src/sidepanel/components/OutreachPanel.tsx — "Draft All", card list, "Send All Approved", status summary
9. Wire Realtime subscription for outreach status updates
10. Update src/background/index.ts — follow-up alarm scheduling on send
11. Set Edge Function secret: RESEND_API_KEY
12. Verify: draft, review, send, confirm delivery
