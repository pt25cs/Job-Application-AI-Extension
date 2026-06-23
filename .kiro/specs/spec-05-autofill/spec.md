# Spec 5 — P0: Auto-Fill System

## Requirement

Build a platform-specific auto-fill system that maps user profile data to application form fields on supported ATS platforms. Uses the adapter pattern (extending Spec 4's platform adapters) with a heuristic fallback matcher. Handles text inputs, dropdowns, radio buttons, checkboxes, file uploads (resume attachment), and multi-page form navigation.

## User Story

"As a job seeker on a Greenhouse application page, I can click one button and have all my personal info, work history, education, and resume automatically filled into the form — so that I can apply in seconds instead of minutes."

## Success Criteria

- Auto-fill correctly populates >90% of standard form fields on Greenhouse and Lever
- Resume PDF attached via file input programmatically
- Dropdown selections (country, state, degree type) correctly matched
- Multi-page forms (Workday) navigated and filled sequentially
- User can review and edit any auto-filled field before submission
- Fallback heuristic matcher handles unknown layouts with >70% accuracy

## Priority

P0 — Core MVP. This is the primary value proposition and "wow moment."

## Dependencies

- Spec 1 (shell), Spec 3 (profile data), Spec 4 (platform detection + adapters)

## Architecture

Reference: #[[file:masterplan.md]] — Spec 5, sections 5.2 through 5.7

### Auto-Fill Pipeline

1. User clicks "Auto-Fill" → message to service worker
2. Service worker fetches profile + downloads resume blob from Supabase Storage
3. Relays to content script
4. Content script: get adapter → discoverFields() → mapFields() → fillField() for each
5. Resume attached via DataTransfer API
6. Results sent back to side panel

### Heuristic Field Matcher

Pattern-based matching using label text, input name/id, aria attributes, and placeholder text against a comprehensive FIELD_PATTERNS map covering 25+ field categories.

### React-Compatible Value Injection

Uses native input value setter to bypass React's synthetic event system, dispatches input/change/blur events.

### Key Types

- FormField, FieldMapping, FieldCategory (25+ categories), AutoFillAdapter interface

## Implementation Tasks

1. Create src/types/autofill.ts — FormField, FieldMapping, FieldCategory, AutoFillAdapter types
2. Create src/content/autofill/heuristicMatcher.ts — FIELD_PATTERNS map and matchFieldToCategory()
3. Create src/content/autofill/fieldFiller.ts — fillTextField(), fillSelectField(), attachFile() with React-compatible events
4. Create src/content/autofill/utils.ts — findLabelForInput(), categorizeInputType(), resolveProfileValue()
5. Create src/content/autofill/adapters/greenhouse.ts
6. Create src/content/autofill/adapters/lever.ts
7. Create src/content/autofill/adapters/workday.ts — multi-page navigation
8. Create src/content/autofill/adapters/ashby.ts
9. Create src/content/autofill/adapters/bamboohr.ts
10. Create src/content/autofill/adapters/icims.ts
11. Create src/content/autofill/adapters/taleo.ts
12. Create src/content/autofill/autofillEngine.ts — main orchestrator
13. Update src/content/index.ts — AUTOFILL_FORM message handler
14. Update src/background/index.ts — relay profile data + resume blob to content script
15. Create src/sidepanel/components/AutoFillButton.tsx — trigger, loading state, results summary
16. Create src/sidepanel/components/AutoFillReview.tsx — mapped fields with confidence scores and edit buttons
17. Verify on Greenhouse job listing
