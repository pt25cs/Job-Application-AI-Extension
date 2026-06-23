# Refined Masterplan Prompt (for generating masterplan.md)

---

Act as the world's elite technical entrepreneur and principal software architect out of Silicon Valley, holding advanced degrees from Carnegie Mellon, Stanford, MIT, and UC Berkeley. You are architecting a revolutionary Chrome sidebar extension (Vite + React + TypeScript) that automates the entire job application and professional networking lifecycle — a vastly superior evolution of tools like Simplify, LazyApply, and Jobright.

Your sole output MUST be a relentlessly detailed, technically exhaustive `masterplan.md` file (targeting 1500+ lines of profound technical depth). This masterplan serves as the strict, unambiguous architectural and implementation blueprint for an AI coding agent named Kiro. Every architectural decision must be justified. Every data structure must be defined. Every algorithm must be specified step-by-step.

---

## Full-Stack Dogma & Technology Constraints

The system is built on two pillars that MUST be respected throughout every spec:

**Frontend (Chrome Extension):**
- Vite 5+ build toolchain with `@crxjs/vite-plugin` for HMR during development
- React 18+ with TypeScript (strict mode) for all UI (sidebar panel, popups, options page)
- Chrome Extension Manifest V3 (service workers, not background pages)
- Zustand for client-side state management (lightweight, no boilerplate)
- TailwindCSS + shadcn/ui for all UI components
- Content scripts for DOM interaction (auto-fill, page detection)
- Side panel API (`chrome.sidePanel`) as the primary UI surface

**Backend (Supabase Platform):**
- Supabase Auth (Google OAuth + magic link, PKCE flow for extension)
- Supabase Postgres (all persistent data — profiles, resumes, applications, contacts, outreach)
- Supabase Edge Functions (Deno runtime) for all server-side orchestration (ATS loop, contact discovery, outreach dispatch)
- Supabase Storage (resume PDFs, cover letters, generated documents)
- Supabase Realtime (push status updates to extension sidebar)
- Custom `chrome.storage.local` adapter for Supabase session persistence in extension context

**External API Integrations:**
- OpenAI GPT-4o-mini (bulk resume rewrites, draft generation) + GPT-4o (final-pass quality)
- Proxycurl API (LinkedIn profile enrichment without scraping)
- Apollo.io API (bulk people search by company + title + seniority)
- Hunter.io API (email finding + deliverability verification)
- Resend API (transactional email dispatch with custom domain support)
- Google Custom Search API (fallback recruiter/career page discovery)

---

## Core Application Workflow

**Step 0 — Initialization & Onboarding:**
Secure user onboarding where users authenticate via Google OAuth (Supabase Auth with PKCE flow), pre-fill a comprehensive professional profile, upload base resumes (stored in Supabase Storage), input extensive historical experiences/projects as structured JSON, and optionally link their LinkedIn profile URL. All data persists in Supabase Postgres with row-level security (RLS) policies scoped to `auth.uid()`.

**Step 1 — Job Detection & Auto-Fill:**
Real-time DOM monitoring via content scripts. When a user navigates to a supported job listing (Greenhouse, Lever, Workday, Ashby, BambooHR, iCIMS, Taleo), the extension detects the ATS platform via URL pattern matching + DOM fingerprinting, injects a sidebar prompt, and automatically maps and auto-fills application form fields using the stored profile. Field mapping uses a platform-specific adapter pattern with fallback heuristic matching (label text analysis, input name/id patterns, aria attributes).

**Step 2 — ATS Optimization Pipeline:**
A seamless, one-shot pipeline triggered after job detection. The system: (1) parses the job description from the page DOM, (2) extracts keywords/requirements via LLM, (3) matches against the user's base resume + experience bank, (4) runs an iterative ATS grading loop (evaluate → rewrite → regrade) via Supabase Edge Function calling OpenAI, (5) generates a bespoke, keyword-optimized resume as structured JSON, (6) renders to PDF via client-side generation, (7) stores the tailored version in Supabase Storage. The loop runs up to N iterations (configurable, default 3) or until the ATS score exceeds the threshold (default 85/100).

**Step 3 — Automated Connection Farming:**
The ultimate merger of mass applying and targeted networking. After application submission (or in parallel), a Supabase Edge Function: (1) queries Apollo.io for 5+ recruiters, hiring managers, or employees at the target company filtered by seniority and title, (2) cross-references with the user's university via Proxycurl to identify alumni, (3) verifies discovered email addresses via Hunter.io, (4) drafts highly personalized "coffee chat" cold emails via GPT-4o using the contact's background + the job posting as context, (5) presents drafts in the sidebar for user review/edit, (6) dispatches approved emails via Resend API, (7) tracks outreach status (drafted → sent → opened → replied → follow_up) in Supabase Postgres with Realtime subscriptions pushing updates to the sidebar.

---

## Required Document Structure

Break down the entire system into exactly **10 granular Implementation Specs** formatted for ingestion by the Kiro coding agent. Every spec must be strictly categorized by priority:

- **P0** = Core MVP (extension must not ship without this)
- **P1** = Feature Enhancement (ships in v1.1, high user value)
- **P2** = Polish / Advanced (competitive differentiation, ships in v1.2+)

### The 10 Specs (in implementation order):

1. **P0 — Project Scaffolding & Extension Shell** — Vite + React + TypeScript + Manifest V3 + side panel + TailwindCSS + shadcn/ui + build pipeline + Chrome Web Store packaging
2. **P0 — Supabase Auth Integration** — Google OAuth with PKCE flow, chrome.storage.local session adapter, auth state management, protected routes, token refresh
3. **P0 — User Profile & Resume Management** — Profile CRUD, structured resume data model (JSON schema), base resume upload to Supabase Storage, experience/project bank, resume version history
4. **P0 — ATS Platform Detection Engine** — Content script injection, URL pattern matching, DOM fingerprinting for Greenhouse/Lever/Workday/Ashby, platform adapter registry, job description extraction
5. **P0 — Auto-Fill System** — Platform-specific field mapping adapters, heuristic fallback matcher (label/name/aria analysis), form field population, file upload handling (resume attachment), multi-page form navigation
6. **P0 — ATS Resume Optimization Loop** — Edge Function orchestration, JD keyword extraction prompt, resume tailoring prompt chain, iterative score→rewrite→rescore loop, structured output parsing, PDF generation, storage of tailored versions
7. **P1 — Contact Discovery & Enrichment Pipeline** — Apollo.io people search integration, Proxycurl alumni cross-reference, Hunter.io email verification, contact deduplication, Supabase storage of contact graph
8. **P1 — Outreach Drafting & Dispatch** — GPT-4o personalized email generation, template system with variable injection, Resend API integration, outreach status tracking, Realtime subscription for status updates in sidebar
9. **P1 — Application Tracking Dashboard** — Sidebar view of all applications, status pipeline (pending → applied → interviewing → offer/rejected), ATS scores, outreach stats, filtering/sorting, Realtime updates
10. **P2 — Analytics, Settings & Polish** — Application success rate analytics, resume version A/B performance tracking, rate limit management across APIs, user preferences/settings page, error recovery UX, onboarding tutorial flow

---

### Required Depth for EACH of the 10 Specs

For every spec, you MUST include ALL of the following sections with exhaustive technical detail:

**1. Priority & Objective**
- P0/P1/P2 classification with justification
- Exact goal of the module in one paragraph
- User story: "As a [user], I can [action] so that [outcome]"
- Success criteria (measurable)

**2. Architecture & Tech Stack**
- Which extension contexts are involved (service worker, content script, side panel, popup, options page)
- Vite configuration specifics (plugins, entry points, build targets)
- Manifest V3 permissions required (list exact permissions and why)
- Module boundaries and dependency graph relative to other specs
- Supabase services used (Auth, Database, Storage, Edge Functions, Realtime — specify which)

**3. Database Schema & Data Structures**
- Exact Supabase Postgres table definitions (CREATE TABLE SQL) with column types, constraints, foreign keys, indexes
- RLS policies (CREATE POLICY SQL) scoped to auth.uid()
- TypeScript interfaces/types for all data flowing between extension ↔ Supabase
- Zustand store slice definitions (state shape + actions)
- chrome.storage.local key schemas where applicable

**4. Logic & Algorithms**
- Step-by-step pseudocode or detailed algorithm description for every non-trivial operation
- For ATS loop: exact prompt templates with variable placeholders, scoring rubric, iteration logic, exit conditions
- For auto-fill: DOM traversal strategy, selector generation, platform-specific adapter interface
- For contact discovery: API call sequence, deduplication logic, alumni matching algorithm
- For outreach: email template structure, personalization variable extraction, send scheduling logic

**5. API Integration Details**
- Exact API endpoints, HTTP methods, request/response schemas for every external API call
- Authentication method for each API (API key header, OAuth, etc.)
- Rate limit specifications and backoff strategies per API
- Cost implications and optimization strategies (e.g., GPT-4o-mini for drafts, GPT-4o for final pass only)
- Error response handling for each API

**6. Edge Cases, Error Handling & Security**
- DOM layout change mitigation (graceful degradation, fallback selectors, user-assisted mapping)
- LLM hallucination prevention (structured output schemas, JSON mode, validation layers)
- Network failure recovery (retry with exponential backoff, offline queue)
- Secure credential handling (no API keys in content scripts, all secrets in Edge Functions)
- RLS policy enforcement (every table must have policies, no public access)
- CORS and CSP considerations for extension context
- Rate limit exhaustion UX (inform user, queue remaining work)

**7. Kiro Implementation Steps**
- A numbered, exhaustive, ordered list of exact steps the Kiro AI agent must execute to build this spec
- Each step must specify: file path to create/modify, function/component name, dependencies to install, and the exact purpose
- Steps must be atomic (one clear action per step) and independently verifiable
- Include test file creation steps where critical (auth flows, ATS scoring, field mapping)

---

## Critical Constraints for the Masterplan

- Every Supabase table MUST have RLS policies. No exceptions.
- All API keys (OpenAI, Apollo, Hunter, Proxycurl, Resend) MUST live as secrets in Supabase Edge Function environment variables. NEVER in the extension bundle.
- The extension MUST work with Manifest V3 service workers (not persistent background pages).
- All LLM calls MUST use structured output (JSON mode or function calling) to prevent hallucination in resume content.
- The auto-fill system MUST use a platform adapter pattern — no monolithic switch statement. Each ATS platform gets its own adapter module implementing a shared interface.
- The ATS optimization loop MUST be server-side (Edge Function), not client-side, to protect API keys and enable longer execution times.
- PDF generation for tailored resumes should happen client-side (using react-pdf or jspdf) to avoid server-side rendering complexity.
- All Supabase client usage in the extension MUST use the custom chrome.storage.local adapter for session persistence (not localStorage, which doesn't exist in service workers).
- The masterplan must reference the Supabase connection pattern using `@supabase/supabase-js` with the chrome storage adapter, PKCE auth flow, and Edge Function invocation via `supabase.functions.invoke()`.

---

Output ONLY the masterplan.md file. No preamble, no summary, no commentary outside the document. Begin the document with a title, version, date, and table of contents, then proceed directly into the 10 specs.
