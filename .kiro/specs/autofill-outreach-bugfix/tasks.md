# Implementation Plan

- [x] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - Autofill Fallback & Outreach Visibility
  - **CRITICAL**: These tests MUST FAIL on unfixed code — failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **GOAL**: Surface counterexamples that demonstrate both bugs exist
  - **Scoped PBT Approach**: Scope to concrete failing cases for reproducibility
  - Test 1a — Work fallback: call `resolveProfileValue('current_company', profile)` where `profile.experiences` has one work entry with `is_current = false`; assert result is not null
  - Test 1b — YOE derivation: call `resolveProfileValue('years_of_experience', profile)` where `profile.years_of_experience = null` and experiences has a work entry from 2020 to present; assert result is not null
  - Test 1c — Education flat-field: call `resolveProfileValue('graduation_year', profile)` where experiences is empty but `profile.graduation_year = 2020`; assert result is `"2020"`
  - Test 1d — Outreach entry point: render `DashboardPage` with a non-unknown detection result and a set `applicationId`; assert rendered output contains an outreach trigger element
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct — it proves the bugs exist)
  - Document counterexamples found to understand root cause
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Priority Behavior Unchanged
  - **IMPORTANT**: Follow observation-first methodology — observe UNFIXED code behavior first
  - Observe: `resolveProfileValue('current_company', profile)` with `is_current = true` entry returns that entry's organization
  - Observe: `resolveProfileValue('university', profile)` with `type === 'education'` entry returns that entry's organization
  - Observe: `resolveProfileValue('years_of_experience', profile)` with `profile.years_of_experience = 5` returns `"5"`
  - Observe: `DashboardPage` with `platform === 'unknown'` renders placeholder, no outreach entry point
  - Write property-based tests: for all profiles where `is_current = true` work entry exists, `current_company` and `current_title` return that entry's values (unchanged by fix)
  - Write property-based tests: for all profiles where `type === 'education'` entry exists, `university` and `degree` return that entry's values (unchanged by fix)
  - Write property-based tests: for all profiles where `years_of_experience` is non-null, result equals stored value as string (unchanged by fix)
  - Write example test: `DashboardPage` with `platform === 'unknown'` shows no outreach entry point
  - Verify all tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix autofill fallback and outreach visibility

  - [x] 3.1 Fix `resolveProfileValue` in `src/content/autofill/utils.ts`
    - Add `mostRecentWork` fallback: after finding `currentWork` (is_current = true), compute `mostRecentWork` by filtering work entries and sorting by `sort_order` desc then `start_date` desc; use `currentWork ?? mostRecentWork[0]`
    - Update `current_company` to use `mostRecentWork?.organization ?? null`
    - Update `current_title` to use `mostRecentWork?.title ?? null`
    - Add `graduation_year` fallback: derive from `latestEdu?.end_date` year, then fall back to `profile.graduation_year?.toString() ?? null`
    - Add `years_of_experience` derivation: when `profile.years_of_experience` is null, sum durations of work entries (start_date to end_date or now for is_current), convert to years, return as string or null if zero
    - `field_of_study` already reads from `profile.field_of_study` directly — no change needed
    - _Bug_Condition: isBugCondition_ExperienceFallback(X) — no is_current work entry, or no education entry, or years_of_experience null_
    - _Expected_Behavior: resolveProfileValue returns non-null for buggy inputs when flat/derived data exists_
    - _Preservation: profiles with is_current=true, education entries, or stored years_of_experience return identical results_
    - _Requirements: 2.3, 2.4, 2.5, 3.2, 3.3, 3.4_

  - [x] 3.2 Add outreach entry point in `src/sidepanel/pages/DashboardPage.tsx`
    - Import `OutreachPanel` from `../components/OutreachPanel`
    - Add `showOutreach` boolean state (default false)
    - Inside the `detection && detection.platform !== 'unknown'` block, after `OptimizationPanel`, add a toggle button (✉️ Outreach) and conditionally render `<OutreachPanel applicationId={applicationId ?? undefined} />` when `showOutreach` is true and `applicationId` is set
    - _Bug_Condition: isBugCondition_OutreachVisibility(X) — platform != 'unknown' AND currentRoute = '/'_
    - _Expected_Behavior: DashboardPage renders outreach entry point when job is detected_
    - _Preservation: non-job pages show no outreach entry point; /outreach route unchanged_
    - _Requirements: 2.1, 2.2, 3.1, 3.5_

  - [x] 3.3 Verify bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - Autofill Fallback & Outreach Visibility
    - **IMPORTANT**: Re-run the SAME tests from task 1 — do NOT write new tests
    - Run all four exploration tests from step 1 on FIXED code
    - **EXPECTED OUTCOME**: All tests PASS (confirms both bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Priority Behavior Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run all preservation tests from step 2 on FIXED code
    - **EXPECTED OUTCOME**: All tests PASS (confirms no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Checkpoint — Ensure all tests pass
  - Run the full test suite and confirm all tests pass
  - Ask the user if any questions arise
