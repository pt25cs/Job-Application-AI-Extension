# Autofill & Outreach Bugfix Design

## Overview

Two bugs are addressed in this fix:

**Bug 1 — Outreach Visibility**: The `OutreachPanel` is only reachable via a dedicated `/outreach` nav tab. When a user is actively on a job listing page with a detected job, there is no contextual entry point in the apply flow (`DashboardPage`). Additionally, the `/outreach` route renders `OutreachPanel` with no `applicationId` prop, so it always loads all outreach items globally rather than scoping to the current job.

**Bug 2 — Experience Autofill Fallback**: `resolveProfileValue` in `src/content/autofill/utils.ts` silently returns `null` for work fields (`current_company`, `current_title`) when no experience entry has `is_current = true`, and for education fields (`university`, `degree`, `field_of_study`, `graduation_year`) when no `type === 'education'` experience entry exists — even when the data is available in flat `ProfileData` fields or as the most recent work entry. `years_of_experience` also returns `null` when `profile.years_of_experience` is unset but derivable from work entry dates.

Both fixes are minimal and targeted: no new data models, no new routes, no changes to existing behavior for the non-buggy input paths.

---

## Glossary

- **Bug_Condition (C)**: The set of inputs that trigger the defective behavior
- **Property (P)**: The correct behavior that must hold for all inputs in C
- **Preservation**: Existing correct behavior that must remain unchanged for all inputs not in C
- **`resolveProfileValue`**: The function in `src/content/autofill/utils.ts` that maps a `FieldCategory` to a string value from the user's `EnrichedProfile`
- **`EnrichedProfile`**: `ProfileData` extended with optional `experiences` and `skills` arrays (defined in `utils.ts`)
- **`currentWork`**: The work experience entry with `is_current = true`, used as the primary source for `current_company` / `current_title`
- **`latestEdu`**: The first experience entry with `type === 'education'`, used as the primary source for education fields
- **`DashboardPage`**: The apply-flow page at route `/` in `src/sidepanel/pages/DashboardPage.tsx`
- **`applicationId`**: The Supabase row ID for the current job application, upserted when a job is detected

---

## Bug Details

### Bug 1 — Outreach Visibility

The bug manifests when a user is on a job listing page (platform is detected, not `'unknown'`) and the apply flow panel is active. The `DashboardPage` renders `AutoFillButton`, `AutoFillReview`, and `OptimizationPanel` for detected jobs, but no outreach entry point. The `OutreachPanel` is only accessible via the `/outreach` nav tab, which renders it without an `applicationId`.

**Formal Specification:**
```
FUNCTION isBugCondition_OutreachVisibility(X)
  INPUT: X of type { platform: string; currentRoute: string }
  OUTPUT: boolean

  RETURN X.platform != 'unknown' AND X.currentRoute = '/'
END FUNCTION
```

**Examples:**
- User navigates to a Greenhouse job posting → job detected → apply panel shows AutoFill and Optimization but no way to draft outreach emails for this job
- User clicks the "Outreach" nav tab → `OutreachPanel` renders with no `applicationId` → loads all outreach items across all jobs, no job context
- User is on a non-job page (platform = `'unknown'`) → placeholder state shown → no outreach entry point expected (correct behavior, not a bug)

### Bug 2 — Experience Autofill Fallback

The bug manifests in `resolveProfileValue` when the `experiences` array does not contain the expected entry type. The current implementation uses short-circuit `?.find()` with no fallback:

```typescript
// Current (buggy) code in utils.ts
const currentWork = profile.experiences?.find(
  (e) => e.type === 'work' && e.is_current,
);
const latestEdu = profile.experiences?.find((e) => e.type === 'education');

// ...
current_company: currentWork?.organization ?? null,  // null if no is_current entry
current_title:   currentWork?.title ?? null,          // null if no is_current entry
university:      latestEdu?.organization ?? profile.university,  // falls back (partially correct)
degree:          latestEdu?.title ?? profile.degree,             // falls back (partially correct)
graduation_year: profile.graduation_year?.toString() ?? null,    // no experience fallback
field_of_study:  profile.field_of_study,                         // no experience fallback
years_of_experience: profile.years_of_experience?.toString() ?? null,  // no derivation
```

Note: `university` and `degree` already have a flat-field fallback, but `field_of_study` and `graduation_year` do not. `current_company` and `current_title` have no fallback at all.

**Formal Specification:**
```
FUNCTION isBugCondition_ExperienceFallback(X)
  INPUT: X of type { category: FieldCategory; profile: EnrichedProfile }
  OUTPUT: boolean

  is_work_field   <- X.category IN ['current_company', 'current_title']
  is_edu_field    <- X.category IN ['university', 'degree', 'field_of_study', 'graduation_year']
  is_yoe_field    <- X.category = 'years_of_experience'
  no_current_work <- NOT EXISTS e IN X.profile.experiences WHERE e.type='work' AND e.is_current=true
  no_edu_entry    <- NOT EXISTS e IN X.profile.experiences WHERE e.type='education'
  yoe_null        <- X.profile.years_of_experience IS NULL

  RETURN (is_work_field AND no_current_work)
      OR (is_edu_field AND no_edu_entry)
      OR (is_yoe_field AND yoe_null)
END FUNCTION
```

**Examples:**
- Profile has `organization: "Acme Corp"` on a work entry with `is_current = false` → `current_company` returns `null` instead of `"Acme Corp"`
- Profile has `profile.university = "MIT"` but `experiences` array is empty → `field_of_study` returns `null` even though `profile.field_of_study = "Computer Science"` is set
- Profile has two work entries spanning 2020–2024 but `years_of_experience` is `null` → field returns `null` instead of derived `"4"`
- Profile has a work entry with `is_current = true` → `current_company` returns that entry's organization (correct, not a bug)

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Navigating to `/outreach` directly must continue to render `OutreachPanel` (global view, no `applicationId`)
- When a work experience entry with `is_current = true` exists, `current_company` and `current_title` must continue to use that entry
- When a `type === 'education'` experience entry exists, `university` and `degree` must continue to use that entry
- When `profile.years_of_experience` is set (non-null), that stored value must be returned as-is
- On non-job pages (platform `=== 'unknown'`), `DashboardPage` must continue to show the placeholder state with no outreach entry point
- Outreach realtime subscription behavior (Supabase channel, status updates) must remain unchanged

**Scope:**
All inputs where the bug condition does NOT hold are completely unaffected. This includes:
- Profiles with a current work entry (`is_current = true`)
- Profiles with education experience entries
- Profiles with `years_of_experience` explicitly set
- All non-work, non-education field categories in `resolveProfileValue`
- The `/outreach` global route

---

## Hypothesized Root Cause

### Bug 1 — Outreach Visibility

1. **Missing contextual render in `DashboardPage`**: The conditional block that renders `AutoFillButton`, `AutoFillReview`, and `OptimizationPanel` for detected jobs does not include an outreach entry point. The `applicationId` state is already computed in `DashboardPage` but never passed to any outreach component.

2. **Route renders `OutreachPanel` without props**: In `App.tsx`, the `/outreach` route is `<Route path="/outreach" element={<OutreachPanel />} />` with no `applicationId` prop. This is intentional for the global view but means there is no way to render it with job context from the nav.

### Bug 2 — Experience Autofill Fallback

1. **No fallback for `current_company` / `current_title`**: `currentWork` is `undefined` when no entry has `is_current = true`. The map entries use `currentWork?.organization ?? null` with no secondary lookup for the most recent work entry.

2. **Incomplete flat-field fallback for education**: `university` and `degree` already fall back to flat fields, but `field_of_study` and `graduation_year` do not — they only read from `profile.field_of_study` and `profile.graduation_year` directly (which is correct), but the `latestEdu` path for `graduation_year` is missing entirely.

3. **No derivation for `years_of_experience`**: When `profile.years_of_experience` is `null`, the engine returns `null` immediately. Work experience entries with `start_date` / `end_date` are never consulted.

---

## Correctness Properties

Property 1: Bug Condition — Outreach Entry Point in Apply Flow

_For any_ UI state where a job has been detected (platform is not `'unknown'`) and the apply flow route (`/`) is active, the fixed `DashboardPage` SHALL render an outreach entry point element that is visible to the user and, when activated, opens `OutreachPanel` with the current `applicationId`.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation — Global Outreach Route Unchanged

_For any_ navigation to the `/outreach` route directly, the fixed app SHALL continue to render `OutreachPanel` in global mode (no `applicationId` scoping), producing the same output as before the fix.

**Validates: Requirements 3.1**

Property 3: Bug Condition — Work Field Fallback to Most Recent Entry

_For any_ `EnrichedProfile` where no work experience entry has `is_current = true` but at least one work entry exists, the fixed `resolveProfileValue` for `current_company` and `current_title` SHALL return the most recent work entry's `organization` and `title` respectively (most recent = highest `sort_order`, or latest `start_date` as tiebreaker), rather than `null`.

**Validates: Requirements 2.3**

Property 4: Bug Condition — Education Field Fallback to Flat ProfileData

_For any_ `EnrichedProfile` where `experiences` contains no `type === 'education'` entry but flat `ProfileData` fields (`university`, `degree`, `field_of_study`, `graduation_year`) are non-null, the fixed `resolveProfileValue` SHALL return those flat field values rather than `null`.

**Validates: Requirements 2.4**

Property 5: Bug Condition — Derive years_of_experience from Work Entries

_For any_ `EnrichedProfile` where `profile.years_of_experience` is `null` but work experience entries with `start_date` exist, the fixed `resolveProfileValue` for `years_of_experience` SHALL return a non-null string representing the total years of work experience derived from entry durations.

**Validates: Requirements 2.5**

Property 6: Preservation — Existing Priority Behavior Unchanged

_For any_ `EnrichedProfile` where the bug condition does NOT hold (i.e., a `is_current = true` work entry exists, or an education experience entry exists, or `years_of_experience` is set), the fixed `resolveProfileValue` SHALL produce exactly the same result as the original function.

**Validates: Requirements 3.2, 3.3, 3.4**

---

## Fix Implementation

### Changes Required

**File 1**: `src/content/autofill/utils.ts`

**Function**: `resolveProfileValue`

**Specific Changes**:

1. **Add most-recent work entry fallback**: After finding `currentWork` (is_current = true), add a secondary lookup for the most recent work entry by `sort_order` descending, then `start_date` descending. Use this as fallback for `current_company` and `current_title`.

   ```typescript
   const currentWork = profile.experiences?.find(
     (e) => e.type === 'work' && e.is_current,
   );
   const mostRecentWork = currentWork ?? profile.experiences
     ?.filter((e) => e.type === 'work')
     .sort((a, b) => {
       if (b.sort_order !== a.sort_order) return b.sort_order - a.sort_order;
       return (b.start_date ?? '').localeCompare(a.start_date ?? '');
     })[0];
   ```

2. **Add flat-field fallback for `field_of_study` and `graduation_year`**: The education experience entry (`latestEdu`) is already used for `university` and `degree`. Extend the same pattern to `field_of_study` (map to `latestEdu?.skills[0]` is wrong — use a dedicated field) and `graduation_year`.

   ```typescript
   // In the map:
   graduation_year: (latestEdu?.end_date
     ? new Date(latestEdu.end_date).getFullYear().toString()
     : null) ?? profile.graduation_year?.toString() ?? null,
   field_of_study: profile.field_of_study,  // already correct; latestEdu has no field_of_study
   ```

   Note: `Experience` has no `field_of_study` column — the flat `profile.field_of_study` is the only source. The existing code is correct for this field; no change needed.

3. **Derive `years_of_experience` from work entries**: When `profile.years_of_experience` is null, sum durations of work experience entries.

   ```typescript
   years_of_experience: (() => {
     if (profile.years_of_experience != null) {
       return profile.years_of_experience.toString();
     }
     const workEntries = profile.experiences?.filter((e) => e.type === 'work') ?? [];
     if (!workEntries.length) return null;
     const totalMs = workEntries.reduce((sum, e) => {
       const start = e.start_date ? new Date(e.start_date).getTime() : null;
       const end = e.is_current ? Date.now() : (e.end_date ? new Date(e.end_date).getTime() : null);
       if (start == null || end == null) return sum;
       return sum + Math.max(0, end - start);
     }, 0);
     const years = Math.round(totalMs / (1000 * 60 * 60 * 24 * 365));
     return years > 0 ? years.toString() : null;
   })(),
   ```

4. **Update `current_company` and `current_title` to use `mostRecentWork`**:

   ```typescript
   current_company: mostRecentWork?.organization ?? null,
   current_title:   mostRecentWork?.title ?? null,
   ```

---

**File 2**: `src/sidepanel/pages/DashboardPage.tsx`

**Specific Changes**:

1. **Add outreach entry point in the detected-job block**: Inside the `detection && detection.platform !== 'unknown'` conditional, add an outreach button/section after `OptimizationPanel`. It should be a simple button that opens a collapsible `OutreachPanel` inline, passing `applicationId`.

   ```tsx
   {applicationId && (
     <OutreachPanel applicationId={applicationId} />
   )}
   ```

   Or, if a toggle is preferred to avoid loading outreach on every job page visit:

   ```tsx
   const [showOutreach, setShowOutreach] = useState(false);
   // ...
   <button onClick={() => setShowOutreach((v) => !v)} className="...">
     ✉️ Outreach
   </button>
   {showOutreach && applicationId && (
     <OutreachPanel applicationId={applicationId} />
   )}
   ```

2. **Import `OutreachPanel`** at the top of `DashboardPage.tsx`.

---

## Testing Strategy

### Validation Approach

Two-phase approach: first run exploratory tests on unfixed code to confirm the root cause, then verify the fix and preservation.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate both bugs on unfixed code. Confirm or refute the root cause hypotheses.

**Test Plan**: Write unit tests against the current `resolveProfileValue` and render tests against the current `DashboardPage`. Run on unfixed code to observe failures.

**Test Cases**:

1. **Work fallback test** (will fail on unfixed code): Call `resolveProfileValue('current_company', profile)` where `profile.experiences` contains one work entry with `is_current = false`. Assert result is not null.

2. **Education flat-field test** (will fail on unfixed code): Call `resolveProfileValue('graduation_year', profile)` where `experiences` is empty but `profile.graduation_year = 2020`. Assert result is `"2020"`. *(Note: `university` and `degree` already fall back — this confirms the partial fix gap.)*

3. **YOE derivation test** (will fail on unfixed code): Call `resolveProfileValue('years_of_experience', profile)` where `profile.years_of_experience = null` and `experiences` has a work entry from 2020 to present. Assert result is not null.

4. **Outreach entry point test** (will fail on unfixed code): Render `DashboardPage` with a non-unknown detection result. Assert the rendered output contains an outreach trigger element.

**Expected Counterexamples**:
- `resolveProfileValue('current_company', ...)` returns `null` when no `is_current` entry exists
- `resolveProfileValue('years_of_experience', ...)` returns `null` when `profile.years_of_experience` is null
- `DashboardPage` renders no outreach entry point even when `applicationId` is set

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed functions produce the expected behavior.

**Pseudocode:**
```
FOR ALL X WHERE isBugCondition_ExperienceFallback(X) DO
  result <- resolveProfileValue'(X.category, X.profile)
  ASSERT result != null OR flat_profile_field_is_also_null(X)
END FOR

FOR ALL X WHERE isBugCondition_OutreachVisibility(X) DO
  ui <- renderDashboardPage'(X)
  ASSERT ui CONTAINS outreach_entry_point
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed functions produce the same result as the original.

**Pseudocode:**
```
FOR ALL X WHERE NOT isBugCondition_ExperienceFallback(X) DO
  ASSERT resolveProfileValue(X.category, X.profile)
       = resolveProfileValue'(X.category, X.profile)
END FOR

FOR ALL X WHERE NOT isBugCondition_OutreachVisibility(X) DO
  ASSERT renderDashboardPage(X) = renderDashboardPage'(X)
END FOR
```

**Testing Approach**: Property-based testing is recommended for `resolveProfileValue` preservation because the input space (all `FieldCategory` × `EnrichedProfile` combinations) is large and edge cases are easy to miss. For `DashboardPage`, example-based tests cover the two discrete states (detected / not detected).

**Test Cases**:
1. **is_current=true preservation**: Profile with `is_current = true` work entry → `current_company` and `current_title` return same values before and after fix
2. **Education entry preservation**: Profile with `type === 'education'` experience → `university` and `degree` return same values before and after fix
3. **Stored YOE preservation**: Profile with `years_of_experience = 5` → returns `"5"` before and after fix
4. **Non-job page preservation**: `DashboardPage` with `platform === 'unknown'` → no outreach entry point, same placeholder state
5. **Global outreach route preservation**: `/outreach` route renders `OutreachPanel` without `applicationId`

### Unit Tests

- `resolveProfileValue('current_company', ...)` with no `is_current` entry but work entries present → returns most recent entry's organization
- `resolveProfileValue('current_title', ...)` with no `is_current` entry → returns most recent entry's title
- `resolveProfileValue('graduation_year', ...)` with no education experience but `profile.graduation_year` set → returns string value
- `resolveProfileValue('years_of_experience', ...)` with null stored value and work entries → returns derived year count
- `resolveProfileValue('years_of_experience', ...)` with null stored value and no work entries → returns null
- `DashboardPage` with detected job → renders outreach entry point
- `DashboardPage` with `platform === 'unknown'` → no outreach entry point

### Property-Based Tests

- Generate random `EnrichedProfile` values where no work entry has `is_current = true` but work entries exist → `current_company` is never null when `mostRecentWork.organization` is non-null
- Generate random `EnrichedProfile` values where `is_current = true` work entry exists → `current_company` result is identical before and after fix (preservation)
- Generate random `EnrichedProfile` values with no education experience entries but non-null flat education fields → all four education categories return non-null values
- Generate random `EnrichedProfile` values with education experience entries → `university` and `degree` results are identical before and after fix (preservation)
- Generate random work entry arrays with `start_date` values → derived `years_of_experience` is a positive integer string

### Integration Tests

- Full autofill flow on a mocked Greenhouse form with a profile that has no `is_current` work entry → `current_company` and `current_title` fields are filled
- `DashboardPage` with detected job → clicking outreach entry point renders `OutreachPanel` with correct `applicationId`
- `/outreach` route → `OutreachPanel` renders in global mode, loads all outreach items
