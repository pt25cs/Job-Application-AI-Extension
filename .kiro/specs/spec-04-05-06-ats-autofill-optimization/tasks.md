# Tasks

## Part 1: Types & Stores

- [x] 1.1 Create src/types/platform.ts — ATSPlatform, JobDetectionResult, PlatformAdapter, DOMFingerprint
- [x] 1.2 Create src/types/autofill.ts — FormField, FieldMapping, FieldCategory, AutoFillAdapter
- [x] 1.3 Create src/types/optimization.ts — ATSOptimizationRequest/Response, ATSIteration, ATSScoreBreakdown
- [x] 1.4 Create src/stores/detectionStore.ts — Zustand store for detection state
- [x] 1.5 Create src/stores/optimizationStore.ts — Zustand store for optimization progress

## Part 2: Detection Engine

- [x] 2.1 Create src/content/utils/cleanText.ts — stripHtml(), normalizeWhitespace(), removeBoilerplate()
- [x] 2.2 Create src/content/adapters/greenhouse.ts — URL patterns, DOM fingerprints, extraction methods
- [x] 2.3 Create src/content/adapters/lever.ts
- [x] 2.4 Create src/content/adapters/workday.ts — SPA-aware with MutationObserver support
- [x] 2.5 Create src/content/adapters/ashby.ts
- [x] 2.6 Create src/content/adapters/bamboohr.ts
- [x] 2.7 Create src/content/adapters/icims.ts
- [x] 2.8 Create src/content/adapters/taleo.ts
- [x] 2.9 Create src/content/adapters/registry.ts — detectPlatform(), getAdapterByPlatform()
- [x] 2.10 Update src/content/index.ts — full detection flow with MutationObserver, FAB injection, AUTOFILL_FORM handler
- [x] 2.11 Update src/background/index.ts — DETECT_ATS_PLATFORM handler stores result; AUTOFILL_FORM handler fetches profile + resume blob and relays to content script

## Part 3: Auto-Fill System

- [x] 3.1 Create src/content/autofill/heuristicMatcher.ts — FIELD_PATTERNS map (25+ categories), matchFieldToCategory()
- [x] 3.2 Create src/content/autofill/fieldFiller.ts — fillTextField(), fillSelectField(), fillRadio(), fillCheckbox(), attachFile()
- [x] 3.3 Create src/content/autofill/utils.ts — findLabelForInput(), categorizeInputType(), resolveProfileValue()
- [x] 3.4 Create src/content/autofill/adapters/greenhouse.ts
- [x] 3.5 Create src/content/autofill/adapters/lever.ts
- [x] 3.6 Create src/content/autofill/adapters/workday.ts — multi-page navigation
- [x] 3.7 Create src/content/autofill/adapters/ashby.ts
- [x] 3.8 Create src/content/autofill/adapters/bamboohr.ts
- [x] 3.9 Create src/content/autofill/adapters/icims.ts
- [x] 3.10 Create src/content/autofill/adapters/taleo.ts
- [x] 3.11 Create src/content/autofill/autofillEngine.ts — main orchestrator

## Part 4: Optimization Pipeline

- [x] 4.1 Create supabase/migrations/003_create_applications.sql
- [x] 4.2 Create supabase/functions/optimize-resume/prompts.ts
- [x] 4.3 Create supabase/functions/optimize-resume/scoring.ts
- [x] 4.4 Create supabase/functions/optimize-resume/validation.ts
- [x] 4.5 Create supabase/functions/optimize-resume/index.ts — main Edge Function orchestrator
- [x] 4.6 Create src/lib/optimization.ts — client wrapper
- [x] 4.7 Create src/lib/pdfGenerator.ts — @react-pdf/renderer PDF generation

## Part 5: Side Panel Components

- [x] 5.1 Create src/sidepanel/components/JobDetectionBanner.tsx
- [x] 5.2 Create src/sidepanel/components/AutoFillButton.tsx
- [x] 5.3 Create src/sidepanel/components/AutoFillReview.tsx
- [x] 5.4 Create src/sidepanel/components/OptimizationPanel.tsx
- [x] 5.5 Create src/sidepanel/components/ResumePreview.tsx
- [x] 5.6 Create src/sidepanel/components/ScoreBreakdown.tsx
- [x] 5.7 Update src/sidepanel/App.tsx — integrate detection banner and optimization panel into dashboard route
- [x] 5.8 Update src/stores/index.ts — export detectionStore and optimizationStore
