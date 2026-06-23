# Design Document

## Overview

This design covers the combined ATS Platform Detection Engine, Auto-Fill System, and ATS Resume Optimization Loop. These three subsystems are implemented as a unified feature set sharing types, stores, and message channels.

The architecture follows the existing extension patterns: content scripts handle DOM interaction, the service worker routes messages and relays data, the side panel renders React UI, and Supabase Edge Functions handle server-side AI processing.

---

## Architecture

### System Interaction Flow

```
[ATS Page DOM]
     │
     ▼
[Content Script: Detection_Engine]
     │  DETECT_ATS_PLATFORM message
     ▼
[Service Worker: Message Router]
     │  stores JobDetectionResult
     │  relays to side panel
     ▼
[Side Panel: JobDetectionBanner]
     │  user clicks Auto-Fill
     ▼
[Service Worker: fetches profile + resume blob]
     │  AUTOFILL_FORM message with payload
     ▼
[Content Script: AutoFill_Engine]
     │  fills fields, returns FieldMapping[]
     ▼
[Side Panel: AutoFillReview]
     │  user triggers optimization
     ▼
[Supabase Edge Function: optimize-resume]
     │  Realtime progress → side panel
     ▼
[Side Panel: OptimizationPanel + ScoreBreakdown + ResumePreview]
```

### Module Boundaries

| Module | Location | Responsibility |
|--------|----------|----------------|
| Platform types | `src/types/platform.ts` | ATSPlatform, JobDetectionResult, PlatformAdapter, DOMFingerprint |
| AutoFill types | `src/types/autofill.ts` | FormField, FieldMapping, FieldCategory, AutoFillAdapter |
| Optimization types | `src/types/optimization.ts` | ATSOptimizationRequest/Response, ATSIteration, ATSScoreBreakdown |
| Detection store | `src/stores/detectionStore.ts` | Zustand store for current detection state |
| Optimization store | `src/stores/optimizationStore.ts` | Zustand store for optimization progress |
| Platform adapters | `src/content/adapters/` | Per-platform detection + extraction |
| Adapter registry | `src/content/adapters/registry.ts` | detectPlatform(), getAdapterByPlatform() |
| Text utilities | `src/content/utils/cleanText.ts` | stripHtml(), normalizeWhitespace() |
| AutoFill adapters | `src/content/autofill/adapters/` | Per-platform field discovery |
| Heuristic matcher | `src/content/autofill/heuristicMatcher.ts` | FIELD_PATTERNS, matchFieldToCategory() |
| Field filler | `src/content/autofill/fieldFiller.ts` | fillTextField(), fillSelectField(), attachFile() |
| AutoFill utils | `src/content/autofill/utils.ts` | findLabelForInput(), resolveProfileValue() |
| AutoFill engine | `src/content/autofill/autofillEngine.ts` | Main orchestrator |
| Optimization client | `src/lib/optimization.ts` | supabase.functions.invoke() wrapper |
| PDF generator | `src/lib/pdfGenerator.ts` | @react-pdf/renderer wrapper |
| Edge Function | `supabase/functions/optimize-resume/` | AI pipeline |
| Side panel components | `src/sidepanel/components/` | JobDetectionBanner, AutoFillButton, AutoFillReview, OptimizationPanel, ResumePreview, ScoreBreakdown |

---

## Data Models

### `src/types/platform.ts`

```typescript
export type ATSPlatform =
  | 'greenhouse'
  | 'lever'
  | 'workday'
  | 'ashby'
  | 'bamboohr'
  | 'icims'
  | 'taleo'
  | 'unknown';

export interface DOMFingerprint {
  selector: string;
  attribute?: string;
  value?: string;
}

export interface JobDetectionResult {
  platform: ATSPlatform;
  confidence: number;          // 0–1
  jobTitle: string | null;
  company: string | null;
  location: string | null;
  jobDescription: string | null;
  jobUrl: string;
  detectedAt: number;          // Date.now()
}

export interface PlatformAdapter {
  name: ATSPlatform;
  urlPatterns: RegExp[];
  domFingerprints: DOMFingerprint[];
  detectJob(doc: Document): boolean;
  extractJobTitle(doc: Document): string | null;
  extractCompany(doc: Document): string | null;
  extractLocation(doc: Document): string | null;
  extractJobDescription(doc: Document): string | null;
}
```

### `src/types/autofill.ts`

```typescript
export type FieldCategory =
  | 'first_name' | 'last_name' | 'full_name' | 'email' | 'phone'
  | 'location' | 'city' | 'state' | 'country' | 'zip'
  | 'linkedin_url' | 'github_url' | 'portfolio_url' | 'website'
  | 'current_company' | 'current_title' | 'years_of_experience'
  | 'university' | 'degree' | 'graduation_year' | 'field_of_study'
  | 'cover_letter' | 'salary_expectation' | 'start_date'
  | 'work_authorization' | 'gender' | 'ethnicity' | 'veteran_status'
  | 'disability_status' | 'pronouns' | 'resume_file' | 'unknown';

export type FieldType = 'text' | 'email' | 'tel' | 'url' | 'select' | 'radio' | 'checkbox' | 'file' | 'textarea' | 'number';

export interface FormField {
  element: HTMLElement;
  type: FieldType;
  category: FieldCategory;
  label: string | null;
  name: string | null;
  confidence: number;
}

export interface FieldMapping {
  field: FormField;
  value: string | File | null;
  status: 'filled' | 'skipped' | 'error';
  reason?: string;
  confidence: number;
}

export interface AutoFillAdapter {
  platform: ATSPlatform;
  discoverFields(doc: Document): FormField[];
  getNextPageButton(doc: Document): HTMLElement | null;
}
```

### `src/types/optimization.ts`

```typescript
import type { StructuredResume } from './profile';
import type { Experience } from './profile';

export interface ATSScoreBreakdown {
  keywordMatch: number;        // 0–100, weight 40%
  experienceRelevance: number; // 0–100, weight 25%
  skillsAlignment: number;     // 0–100, weight 20%
  quantification: number;      // 0–100, weight 15%
  total: number;               // weighted composite
}

export interface ATSIteration {
  iteration: number;
  score: ATSScoreBreakdown;
  resume: StructuredResume;
  keywords: string[];
  timestamp: number;
}

export interface ATSOptimizationRequest {
  userId: string;
  applicationId: string;
  baseResume: StructuredResume;
  experienceBank: Experience[];
  jobDescription: string;
  jobTitle: string;
  company: string;
  targetScore?: number;        // default 85
  maxIterations?: number;      // default 3
}

export interface ATSOptimizationResponse {
  applicationId: string;
  finalResume: StructuredResume;
  finalScore: ATSScoreBreakdown;
  iterations: ATSIteration[];
  success: boolean;
  error?: string;
}
```

---

## Detection Engine Design

### Detection Algorithm

```
Phase 1 — URL Pattern Matching (confidence: 0.8)
  For each registered adapter:
    Test adapter.urlPatterns against window.location.href
    If match → candidate platform found

Phase 2 — DOM Fingerprinting (confidence: 0.9+)
  For matched adapter:
    Test each adapter.domFingerprints selector against document
    If ≥ 50% of fingerprints match → confirmed

Phase 3 — Data Extraction
  Call adapter.extractJobTitle(document)
  Call adapter.extractCompany(document)
  Call adapter.extractLocation(document)
  Call adapter.extractJobDescription(document)
  Run cleanText() on job description
```

### Platform URL Patterns

| Platform | URL Pattern |
|----------|-------------|
| Greenhouse | `boards.greenhouse.io/*/jobs/*` |
| Lever | `jobs.lever.co/*/*` |
| Workday | `*.myworkdayjobs.com/*` |
| Ashby | `jobs.ashbyhq.com/*/*` |
| BambooHR | `*.bamboohr.com/jobs/*` |
| iCIMS | `*.icims.com/jobs/*` |
| Taleo | `*.taleo.net/careersection/*` |

### SPA Support (MutationObserver)

For Workday and other SPAs, a `MutationObserver` watches `document.body` for subtree changes. On significant DOM mutations (≥5 added nodes), detection re-runs with a 500ms debounce.

---

## Auto-Fill Engine Design

### Field Discovery Pipeline

```
1. Get platform adapter from registry (or use heuristic)
2. adapter.discoverFields(document) → FormField[]
3. For each FormField:
   a. resolveProfileValue(field.category, profileData) → value
   b. fillField(field, value) → FieldMapping
4. Return FieldMapping[]
```

### Heuristic Matcher

The `FIELD_PATTERNS` map associates each `FieldCategory` with arrays of regex patterns tested against:
- Input `name` attribute
- Input `id` attribute  
- Associated `<label>` text content
- `placeholder` attribute
- `aria-label` attribute

Matching is case-insensitive. The category with the highest number of pattern matches wins.

### React-Compatible Value Injection

```typescript
// For text/email/tel/url/textarea inputs:
const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
  window.HTMLInputElement.prototype, 'value'
)!.set!;
nativeInputValueSetter.call(element, value);
element.dispatchEvent(new Event('input', { bubbles: true }));
element.dispatchEvent(new Event('change', { bubbles: true }));
element.dispatchEvent(new Event('blur', { bubbles: true }));
```

### File Upload (DataTransfer API)

```typescript
const dt = new DataTransfer();
dt.items.add(resumeFile);
(fileInput as HTMLInputElement).files = dt.files;
fileInput.dispatchEvent(new Event('change', { bubbles: true }));
```

---

## Optimization Pipeline Design

### Edge Function Architecture

```
supabase/functions/optimize-resume/
├── index.ts       — Deno HTTP handler, orchestration loop
├── prompts.ts     — GPT prompt templates
├── scoring.ts     — scoreResume(), flattenResumeToText()
└── validation.ts  — validateAgainstExperienceBank()
```

### Optimization Loop

```
1. Extract keywords: GPT-4o-mini(jobDescription) → string[]
2. Score base resume: scoreResume(resume, keywords, jobDescription) → ATSScoreBreakdown
3. currentResume = baseResume
4. iterations = []
5. WHILE score.total < 85 AND iterations.length < maxIterations:
   a. model = iterations.length < maxIterations-1 ? 'gpt-4o-mini' : 'gpt-4o'
   b. rewrittenResume = rewriteBullets(currentResume, keywords, jobDescription, model)
   c. validated = validateAgainstExperienceBank(rewrittenResume, experienceBank)
   d. newScore = scoreResume(validated, keywords, jobDescription)
   e. iterations.push({ iteration, score: newScore, resume: validated, keywords, timestamp })
   f. broadcast via Realtime channel
   g. IF newScore.total > score.total: currentResume = validated; score = newScore
6. Return ATSOptimizationResponse
```

### Scoring Weights

```typescript
function computeTotal(breakdown: Omit<ATSScoreBreakdown, 'total'>): number {
  return (
    breakdown.keywordMatch * 0.40 +
    breakdown.experienceRelevance * 0.25 +
    breakdown.skillsAlignment * 0.20 +
    breakdown.quantification * 0.15
  );
}
```

### Hallucination Prevention

The validator extracts all company names, job titles, dates, and numeric metrics from the rewritten resume and checks each against the experience bank. Any bullet containing unrecognized entities is replaced with the original bullet from the base resume.

---

## Database Schema

### `applications` table

```sql
CREATE TABLE public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  job_url TEXT NOT NULL,
  job_description TEXT,
  platform TEXT NOT NULL DEFAULT 'unknown',
  tailored_resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  ats_score INTEGER,
  status TEXT NOT NULL DEFAULT 'detected'
    CHECK (status IN ('detected','optimizing','ready','applied','interviewing','rejected','offer','withdrawn')),
  auto_filled BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Side Panel Components

### `JobDetectionBanner`
- Reads from `detectionStore`
- Shows platform badge (colored by platform), job title, company
- Expandable section for full job description text
- "No job detected" empty state

### `AutoFillButton`
- Sends `AUTOFILL_FORM` message to service worker
- Loading spinner during fill
- Shows "N fields filled" summary on completion
- Disabled when no platform detected

### `AutoFillReview`
- Lists all `FieldMapping` results
- Yellow warning badge for confidence < 0.7
- Inline edit inputs that re-trigger fill on change

### `OptimizationPanel`
- Trigger button (disabled until job detected)
- Progress bar showing current iteration / maxIterations
- Live score display updating via Realtime subscription
- Before/after toggle view

### `ScoreBreakdown`
- Four category bars with labels, scores, and weights
- Animated fill on mount

### `ResumePreview`
- Renders `StructuredResume` as styled HTML
- "Download PDF" button calling `generateResumePDF()`

---

## Correctness Properties

### 1.1 Detection Confidence Monotonicity
Thoughts: When both URL pattern and DOM fingerprint match, confidence should be higher than URL-only match. This is a testable invariant.
Testable: yes - property

### 1.2 Clean Text Idempotence
Thoughts: Applying cleanText() twice should produce the same result as applying it once. Classic idempotence property.
Testable: yes - property

### 1.3 Field Category Coverage
Thoughts: The heuristic matcher should cover all 25+ defined FieldCategory values. Testable as an example/invariant.
Testable: yes - example

### 1.4 Score Computation Bounds
Thoughts: ATS score total should always be between 0 and 100 for any valid input. Testable as a property.
Testable: yes - property

### 1.5 Hallucination Prevention
Thoughts: After validation, no bullet should reference entities not in the experience bank. Testable as a property with generated inputs.
Testable: yes - property

### 1.6 Optimization Score Non-Regression
Thoughts: The best score across iterations should be >= the initial score. Testable as a property.
Testable: yes - property

### 1.7 FieldMapping Completeness
Thoughts: Every discovered FormField should appear in the returned FieldMapping[] with a status. Testable as an invariant.
Testable: yes - property
