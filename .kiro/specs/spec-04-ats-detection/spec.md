# Spec 4 — P0: ATS Platform Detection Engine

## Requirement

Build a content script-based detection engine that identifies supported ATS platforms (Greenhouse, Lever, Workday, Ashby, BambooHR, iCIMS, Taleo) via URL pattern matching and DOM fingerprinting, extracts job description text, and communicates results to the service worker and side panel. Uses a platform adapter registry pattern for extensibility.

## User Story

"As a job seeker browsing job listings, I want the extension to automatically detect when I'm on a supported job page and extract the job description so that I can trigger auto-fill and resume optimization with one click."

## Success Criteria

- Correctly identifies all 7 supported ATS platforms with >95% accuracy
- Job description text extracted cleanly (no navigation/footer/boilerplate)
- Detection triggers within 2 seconds of page load
- Side panel shows detected platform name, job title, and company
- False positive rate <1%

## Priority

P0 — Core MVP. Auto-fill and ATS optimization depend on platform detection.

## Dependencies

- Spec 1 (content script injection, message protocol)

## Architecture

Reference: #[[file:masterplan.md]] — Spec 4, sections 4.2 through 4.7

### Detection Algorithm

1. Phase 1 — URL Pattern Matching (fast, confidence 0.8)
2. Phase 2 — DOM Fingerprinting (confirmation, raises to 0.9+)
3. Phase 3 — Job Description Extraction via platform-specific selectors

### Platform Adapter Interface

Each adapter implements: name, urlPatterns[], domFingerprints[], detectJob(), extractJobDescription(), extractJobTitle(), extractCompany(), extractLocation()

### Key Types

- ATSPlatform: 'greenhouse' | 'lever' | 'workday' | 'ashby' | 'bamboohr' | 'icims' | 'taleo' | 'unknown'
- JobDetectionResult: platform, confidence, jobTitle, company, location, jobDescription, jobUrl, rawHtml, detectedAt
- PlatformAdapter interface, DOMFingerprint interface

## Implementation Tasks

1. Create src/types/platform.ts — ATSPlatform, JobDetectionResult, PlatformAdapter, DOMFingerprint types
2. Create src/stores/detectionStore.ts — Zustand detection store
3. Create src/content/adapters/greenhouse.ts — URL patterns, DOM fingerprints, extraction methods
4. Create src/content/adapters/lever.ts
5. Create src/content/adapters/workday.ts — with SPA-aware MutationObserver
6. Create src/content/adapters/ashby.ts
7. Create src/content/adapters/bamboohr.ts
8. Create src/content/adapters/icims.ts
9. Create src/content/adapters/taleo.ts
10. Create src/content/adapters/registry.ts — detectPlatform() and getAdapterByPlatform()
11. Update src/content/index.ts — full detection flow with MutationObserver for SPA support, FAB injection inside ShadowRoot (per Spec 1 CSS isolation requirement)
12. Update src/background/index.ts — handle DETECT_ATS_PLATFORM and GET_CURRENT_DETECTION messages
13. Create src/sidepanel/components/JobDetectionBanner.tsx — platform badge, job title, company, expandable JD (rendered inside MemoryRouter context per Spec 1)
14. Create src/content/utils/cleanText.ts — strip HTML, normalize whitespace, remove boilerplate
15. Verify on a Greenhouse job listing
