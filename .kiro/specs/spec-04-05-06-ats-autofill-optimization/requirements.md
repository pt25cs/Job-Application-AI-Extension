# Requirements Document

## Introduction

This combined spec covers three tightly coupled P0 features for the AutoApply Chrome extension:

1. **ATS Platform Detection Engine** — content script detects supported ATS platforms via URL pattern matching and DOM fingerprinting, extracts job description data, and communicates results to the service worker and side panel.
2. **Auto-Fill System** — maps user profile data to ATS form fields using platform-specific adapters and a heuristic fallback matcher, handling all input types including file uploads.
3. **ATS Resume Optimization Loop** — a Supabase Edge Function iteratively rewrites resume bullets to match job description keywords, scores against an ATS rubric, and generates a tailored PDF resume.

These three features form the core value proposition of AutoApply and are deeply interdependent: detection feeds auto-fill and optimization; optimization produces the resume that auto-fill attaches.

## Glossary

- **ATS**: Applicant Tracking System — software used by employers to manage job applications (e.g., Greenhouse, Lever, Workday).
- **Detection_Engine**: The content script subsystem responsible for identifying ATS platforms and extracting job data.
- **Platform_Adapter**: A module implementing the `PlatformAdapter` interface for a specific ATS platform.
- **Adapter_Registry**: The module that maps detected platforms to their corresponding `Platform_Adapter` instances.
- **AutoFill_Engine**: The content script orchestrator that discovers form fields, maps profile data, and fills inputs.
- **Heuristic_Matcher**: The fallback field-matching algorithm using label text, name/id attributes, and ARIA attributes.
- **Optimization_Pipeline**: The Supabase Edge Function that iteratively rewrites and scores a resume against a job description.
- **Experience_Bank**: The user's full set of `Experience` records stored in Supabase, used as the ground truth for hallucination prevention.
- **ATS_Score**: A 0–100 composite score measuring how well a resume matches a job description across four weighted categories.
- **FAB**: Floating Action Button — the AutoApply trigger button injected into ATS pages via ShadowRoot.
- **ShadowRoot**: An isolated DOM subtree used for CSS encapsulation of the FAB.
- **Realtime_Channel**: A Supabase Realtime subscription channel used to broadcast optimization progress.
- **StructuredResume**: The typed JSON representation of a resume as defined in `src/types/profile.ts`.

---

## Requirements

### Requirement 1: ATS Platform Detection

**User Story:** As a job seeker browsing job listings, I want the extension to automatically detect when I'm on a supported ATS job page so that I can trigger auto-fill and resume optimization with one click.

#### Acceptance Criteria

1. WHEN the content script initializes on a page, THE Detection_Engine SHALL evaluate the current URL against known ATS URL patterns within 2 seconds of `document_idle`.
2. WHEN a URL pattern match is found, THE Detection_Engine SHALL perform DOM fingerprinting to confirm the platform and raise confidence to ≥ 0.9.
3. THE Adapter_Registry SHALL support the following platforms: Greenhouse, Lever, Workday, Ashby, BambooHR, iCIMS, and Taleo.
4. WHEN a platform is confirmed, THE Detection_Engine SHALL extract the job title, company name, location, and job description text from the page DOM using platform-specific selectors.
5. WHEN job description text is extracted, THE Detection_Engine SHALL strip HTML tags, normalize whitespace, and remove navigation/footer boilerplate before storing the result.
6. WHEN a supported platform is detected, THE Detection_Engine SHALL inject the FAB into the page inside a ShadowRoot for CSS isolation.
7. IF the FAB host element already exists in the DOM, THEN THE Detection_Engine SHALL skip injection to prevent duplicates.
8. WHEN a Workday or other SPA page navigates without a full page reload, THE Detection_Engine SHALL use a MutationObserver to re-run detection on DOM changes.
9. WHEN detection completes, THE Detection_Engine SHALL send a `DETECT_ATS_PLATFORM` message to the service worker with the `JobDetectionResult` payload.
10. IF no supported platform is detected, THEN THE Detection_Engine SHALL send a `DETECT_ATS_PLATFORM` message with `platform: 'unknown'` and `confidence: 0`.
11. THE Detection_Engine SHALL achieve a false positive rate of less than 1% across supported platforms.

---

### Requirement 2: Job Detection Side Panel Banner

**User Story:** As a job seeker, I want to see the detected job details in the side panel so that I know the extension has recognized the current page before I trigger any actions.

#### Acceptance Criteria

1. WHEN a `JobDetectionResult` with a known platform is received by the side panel, THE JobDetectionBanner SHALL display the platform name, job title, and company name.
2. WHEN the user expands the banner, THE JobDetectionBanner SHALL display the full extracted job description text.
3. WHILE no platform has been detected on the current tab, THE JobDetectionBanner SHALL display a "No job detected" placeholder state.
4. IF the detected platform is `'unknown'`, THEN THE JobDetectionBanner SHALL display the placeholder state rather than partial data.

---

### Requirement 3: Auto-Fill Execution

**User Story:** As a job seeker on an ATS application page, I want to click one button and have all my personal info, work history, education, and resume automatically filled into the form so that I can apply in seconds.

#### Acceptance Criteria

1. WHEN the user clicks the Auto-Fill button, THE AutoFill_Engine SHALL fetch the user's `ProfileData`, `Experience[]`, `Skill[]`, and primary resume blob from Supabase before filling any fields.
2. WHEN a platform adapter is available for the detected platform, THE AutoFill_Engine SHALL use the platform-specific `discoverFields()` method to enumerate form fields.
3. WHEN no platform adapter is available or `discoverFields()` returns fewer than 3 fields, THE AutoFill_Engine SHALL fall back to the Heuristic_Matcher.
4. THE Heuristic_Matcher SHALL match form fields against at least 25 field categories including: first name, last name, email, phone, location, LinkedIn URL, GitHub URL, portfolio URL, current company, current title, years of experience, university, degree, graduation year, field of study, cover letter, salary expectation, start date, work authorization, gender, ethnicity, veteran status, disability status, pronouns, and resume file.
5. WHEN filling a text input, THE AutoFill_Engine SHALL use the native input value setter and dispatch `input`, `change`, and `blur` events to ensure React-controlled inputs update correctly.
6. WHEN filling a `<select>` dropdown, THE AutoFill_Engine SHALL set the value and dispatch a `change` event, matching options case-insensitively.
7. WHEN filling radio button groups, THE AutoFill_Engine SHALL click the radio input whose label text best matches the profile value.
8. WHEN filling checkboxes, THE AutoFill_Engine SHALL click the checkbox if the profile value indicates affirmative.
9. WHEN attaching a resume file, THE AutoFill_Engine SHALL use the DataTransfer API to programmatically set the file on the file input and dispatch a `change` event.
10. WHEN auto-fill completes, THE AutoFill_Engine SHALL return a `FieldMapping[]` result with confidence scores for each filled field.
11. IF a field cannot be filled due to an unsupported input type or missing profile data, THEN THE AutoFill_Engine SHALL record the field in the result with `status: 'skipped'` and a reason.
12. WHEN Workday multi-page forms are encountered, THE AutoFill_Engine SHALL fill the current page, click the "Next" button, wait for the next page to render, and continue filling until all pages are complete.

---

### Requirement 4: Auto-Fill Review UI

**User Story:** As a job seeker, I want to review and edit any auto-filled field before submitting so that I can correct mistakes and ensure accuracy.

#### Acceptance Criteria

1. WHEN auto-fill completes, THE AutoFillReview component SHALL display each filled field with its label, filled value, and confidence score.
2. WHEN a field has a confidence score below 0.7, THE AutoFillReview component SHALL highlight it with a warning indicator.
3. WHEN the user edits a value in the review panel, THE AutoFill_Engine SHALL re-fill that specific field on the page with the updated value.
4. THE AutoFillButton component SHALL display a loading state while auto-fill is in progress and a summary (e.g., "23 fields filled") upon completion.

---

### Requirement 5: Resume Optimization Pipeline

**User Story:** As a job seeker, I want my resume automatically rewritten to match each job description's keywords so that I pass ATS screening filters and get more interviews.

#### Acceptance Criteria

1. WHEN the user triggers optimization, THE Optimization_Pipeline SHALL accept a `ATSOptimizationRequest` containing the user's `StructuredResume`, `Experience_Bank`, and extracted job description text.
2. THE Optimization_Pipeline SHALL extract target keywords from the job description using GPT-4o-mini before beginning any rewrite iteration.
3. THE Optimization_Pipeline SHALL score the resume against the job description using a weighted rubric: keyword match (40%), experience relevance (25%), skills alignment (20%), and quantification (15%).
4. WHEN the ATS_Score is below 85 and fewer than 3 iterations have been completed, THE Optimization_Pipeline SHALL rewrite resume bullets using GPT-4o-mini for draft iterations and GPT-4o for the final iteration.
5. WHEN the ATS_Score reaches 85 or higher, THE Optimization_Pipeline SHALL stop iterating and return the current result.
6. WHEN 3 iterations have been completed without reaching score 85, THE Optimization_Pipeline SHALL return the best result achieved.
7. AFTER each rewrite, THE Optimization_Pipeline SHALL validate every rewritten bullet against the original Experience_Bank to detect hallucinations.
8. IF a rewritten bullet references a company, title, date, or metric not present in the Experience_Bank, THEN THE Optimization_Pipeline SHALL reject that bullet and retain the original.
9. THE Optimization_Pipeline SHALL broadcast progress after each iteration via a Supabase Realtime channel using the format `optimization:{userId}:{applicationId}`.
10. THE Optimization_Pipeline SHALL complete all iterations within 30 seconds.
11. THE Optimization_Pipeline SHALL store each iteration's score breakdown in the `ATSIteration[]` array of the response.

---

### Requirement 6: Optimization Progress & Results UI

**User Story:** As a job seeker, I want to see real-time progress and a before/after comparison of my optimized resume so that I can understand what changed and download the result.

#### Acceptance Criteria

1. WHEN optimization is in progress, THE OptimizationPanel component SHALL display the current iteration number, a progress bar, and the latest ATS_Score.
2. WHEN optimization completes, THE OptimizationPanel component SHALL display the final ATS_Score and a before/after comparison of the resume.
3. THE ScoreBreakdown component SHALL display the four scoring categories (keyword match, experience relevance, skills alignment, quantification) with individual scores and weights.
4. THE ResumePreview component SHALL render the `StructuredResume` as a styled HTML preview inside the side panel.
5. WHEN the user clicks "Download PDF", THE ResumePreview component SHALL generate a PDF using `@react-pdf/renderer` and trigger a browser download.
6. WHEN optimization completes, THE Optimization_Pipeline SHALL insert a record into the `resumes` table with `type: 'tailored'` and link it to the `applications` record.

---

### Requirement 7: Application Tracking

**User Story:** As a job seeker, I want each job I interact with to be automatically tracked so that I can manage my application pipeline.

#### Acceptance Criteria

1. WHEN a job is detected on a supported ATS platform, THE Detection_Engine SHALL upsert a record in the `applications` table with `status: 'detected'`, the job URL, title, company, and platform.
2. WHEN optimization is triggered for a detected job, THE Optimization_Pipeline SHALL update the `applications` record `status` to `'optimizing'` and link the tailored resume upon completion with `status: 'ready'`.
3. THE `applications` table SHALL enforce Row Level Security so that users can only read and write their own records.
4. THE `applications` table SHALL support the following status values: `detected`, `optimizing`, `ready`, `applied`, `interviewing`, `rejected`, `offer`, `withdrawn`.
