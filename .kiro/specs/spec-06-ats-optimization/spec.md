# Spec 6 — P0: ATS Resume Optimization Loop

## Requirement

Build a server-side iterative optimization pipeline (Supabase Edge Function) that takes a user's base resume + experience bank and a parsed job description, extracts target keywords, rewrites resume bullets to incorporate those keywords, scores against an ATS rubric, and repeats until score ≥ threshold (default 85/100) or max iterations (default 3). Final resume stored as structured JSON, rendered to PDF client-side, uploaded to Supabase Storage.

## User Story

"As a job seeker, I want my resume automatically rewritten to match each job description's keywords so that I pass ATS screening filters and get more interviews."

## Success Criteria

- Edge Function returns tailored resume with ATS score ≥85
- Optimization loop completes in <30 seconds for 3 iterations
- Generated resume preserves factual accuracy (no fabricated experience)
- PDF renders cleanly with professional formatting
- Tailored resume stored and linked to application record
- User can view before/after comparison in side panel

## Priority

P0 — Core MVP. Resume tailoring is the highest-impact feature for interview conversion.

## Dependencies

- Spec 1 (shell), Spec 2 (auth), Spec 3 (profile/resume data), Spec 4 (JD extraction)

## Architecture

Reference: #[[file:masterplan.md]] — Spec 6, sections 6.2 through 6.7

### Database Schema

- `applications` table: id, user_id, company, role, job_url, job_description, platform, tailored_resume_id, ats_score, status (detected→optimizing→ready→applied→interviewing→rejected→offer→withdrawn), auto_filled, applied_at, timestamps
- RLS policies scoped to auth.uid()

### ATS Scoring Algorithm (weights)

- Keyword Match: 40% — % of JD keywords found in resume
- Experience Relevance: 25% — alignment with role requirements
- Skills Alignment: 20% — technical skills match
- Quantification: 15% — use of metrics/numbers in bullets

### Edge Function Flow

1. Extract keywords from JD via GPT-4o-mini
2. Score base resume
3. Iteration loop: rewrite (GPT-4o-mini for drafts, GPT-4o for final) → validate (hallucination check) → rescore
4. Broadcast progress via Supabase Realtime
5. Return tailored resume + score + iterations

### Hallucination Prevention

Every rewritten resume validated against original experience bank. Fabricated companies/titles/dates are rejected.

### Cost per optimization: ~$0.03

## Implementation Tasks

1. Run SQL migration: create applications table with RLS
2. Create src/types/optimization.ts — ATSOptimizationRequest/Response, ATSIteration, ATSScoreBreakdown
3. Create Edge Function supabase/functions/optimize-resume/index.ts — main orchestrator
4. Create supabase/functions/optimize-resume/prompts.ts — keyword extraction + rewrite prompt templates
5. Create supabase/functions/optimize-resume/scoring.ts — scoreResume() and flattenResumeToText()
6. Create supabase/functions/optimize-resume/validation.ts — hallucination checker
7. Create src/lib/optimization.ts — client wrapper calling supabase.functions.invoke()
8. Create src/lib/pdfGenerator.ts — generateResumePDF() using @react-pdf/renderer
9. Create src/stores/optimizationStore.ts — isOptimizing, currentIteration, iterations[], finalResult
10. Create src/sidepanel/components/OptimizationPanel.tsx — trigger, progress bar, score gauge, before/after
11. Create src/sidepanel/components/ResumePreview.tsx — styled HTML preview of StructuredResume
12. Create src/sidepanel/components/ScoreBreakdown.tsx — visual score category breakdown
13. Wire Supabase Realtime subscription for optimization progress
14. After optimization: generate PDF client-side, upload to Storage, insert resumes record
15. Deploy Edge Function, set OPENAI_API_KEY secret
16. Verify end-to-end optimization on a detected job page
