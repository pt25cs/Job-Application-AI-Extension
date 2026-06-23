# Bugfix Requirements Document

## Introduction

Two related usability and correctness bugs affect the AutoApply Chrome extension:

1. **Outreach visibility bug** — The cold email / outreach feature is buried in a dedicated nav tab (`/outreach`) with no contextual entry point from the main apply flow. Users on a job page have no indication that outreach is available, and the `OutreachPanel` rendered at `/outreach` shows no application context (no `applicationId` prop), so it loads all outreach items globally rather than those tied to the current job. The feature is effectively invisible to users who don't already know it exists.

2. **Experience autofill bug** — The autofill engine fails to correctly resolve work experience fields (`current_company`, `current_title`) when the user's current job does not have `is_current = true` set, and fails to resolve education fields (`university`, `degree`, `field_of_study`, `graduation_year`) when the `experiences` array is empty or contains no `type === 'education'` entries. In both cases the fields are silently skipped (filled with `null`) even though the profile has the data stored in flat `ProfileData` fields.

---

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user is on a job listing page and the apply flow is active THEN the system shows no outreach entry point, making the outreach feature undiscoverable from the primary workflow

1.2 WHEN the `/outreach` route is navigated to directly THEN the system renders `OutreachPanel` without an `applicationId`, causing it to load all outreach items with no job context

1.3 WHEN the autofill engine resolves `current_company` or `current_title` and no experience entry has `is_current = true` THEN the system returns `null` for those fields even when the profile has a current employer stored in flat profile fields

1.4 WHEN the autofill engine resolves `university`, `degree`, `field_of_study`, or `graduation_year` and the `experiences` array contains no entry with `type === 'education'` THEN the system returns `null` for those fields even when the profile has education data stored in flat `ProfileData` fields (`profile.university`, `profile.degree`, etc.)

1.5 WHEN the autofill engine resolves `years_of_experience` and `profile.years_of_experience` is `null` THEN the system returns `null` for that field even when experience entries exist that could be used to derive a value

### Expected Behavior (Correct)

2.1 WHEN a user is on a job listing page and a job has been detected THEN the system SHALL surface an outreach entry point (e.g. a button or link) within the apply flow panel so users can discover and access the feature without navigating away

2.2 WHEN the outreach panel is opened from the apply flow context THEN the system SHALL pass the current `applicationId` to `OutreachPanel` so outreach items are scoped to that job

2.3 WHEN the autofill engine resolves `current_company` or `current_title` and no experience entry has `is_current = true` THEN the system SHALL fall back to the most recent work experience entry (highest `sort_order` or latest `start_date`) before returning `null`

2.4 WHEN the autofill engine resolves `university`, `degree`, `field_of_study`, or `graduation_year` and no `type === 'education'` experience entry exists THEN the system SHALL fall back to the flat `ProfileData` fields (`profile.university`, `profile.degree`, `profile.field_of_study`, `profile.graduation_year`) before returning `null`

2.5 WHEN the autofill engine resolves `years_of_experience` and `profile.years_of_experience` is `null` but work experience entries exist THEN the system SHALL derive a value by summing the durations of work experience entries and return it as a string

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user navigates to the `/outreach` tab directly THEN the system SHALL CONTINUE TO render the outreach panel (global view, no applicationId) as it does today

3.2 WHEN the autofill engine resolves `current_company` or `current_title` and an experience entry with `is_current = true` exists THEN the system SHALL CONTINUE TO use that entry's values (existing priority behavior is correct)

3.3 WHEN the autofill engine resolves `university` or `degree` and a `type === 'education'` experience entry exists THEN the system SHALL CONTINUE TO use that entry's values (existing priority behavior is correct)

3.4 WHEN the autofill engine resolves `years_of_experience` and `profile.years_of_experience` is set THEN the system SHALL CONTINUE TO use that stored value

3.5 WHEN a user is on a non-job page (platform === 'unknown') THEN the system SHALL CONTINUE TO show the placeholder state in the apply panel with no outreach entry point

3.6 WHEN outreach items are drafted and sent THEN the system SHALL CONTINUE TO update item status in real time via the existing Supabase Realtime subscription

---

## Bug Condition Pseudocode

### Bug 1 — Outreach Visibility

```pascal
FUNCTION isBugCondition_OutreachVisibility(X)
  INPUT: X of type { platform: string; currentRoute: string }
  OUTPUT: boolean

  RETURN X.platform != 'unknown' AND X.currentRoute = '/'
END FUNCTION

// Property: Fix Checking
FOR ALL X WHERE isBugCondition_OutreachVisibility(X) DO
  ui ← renderDashboardPage'(X)
  ASSERT ui CONTAINS outreach_entry_point
END FOR

// Property: Preservation Checking
FOR ALL X WHERE NOT isBugCondition_OutreachVisibility(X) DO
  ASSERT renderDashboardPage(X) = renderDashboardPage'(X)
END FOR
```

### Bug 2 — Experience Autofill Fallback

```pascal
FUNCTION isBugCondition_ExperienceFallback(X)
  INPUT: X of type { category: FieldCategory; profile: EnrichedProfile }
  OUTPUT: boolean

  is_work_field   ← X.category IN ['current_company', 'current_title']
  is_edu_field    ← X.category IN ['university', 'degree', 'field_of_study', 'graduation_year']
  no_current_work ← NOT EXISTS e IN X.profile.experiences WHERE e.type='work' AND e.is_current=true
  no_edu_entry    ← NOT EXISTS e IN X.profile.experiences WHERE e.type='education'

  RETURN (is_work_field AND no_current_work) OR (is_edu_field AND no_edu_entry)
END FUNCTION

// Property: Fix Checking
FOR ALL X WHERE isBugCondition_ExperienceFallback(X) DO
  result ← resolveProfileValue'(X.category, X.profile)
  ASSERT result != null OR flat_profile_field_is_also_null(X)
END FOR

// Property: Preservation Checking
FOR ALL X WHERE NOT isBugCondition_ExperienceFallback(X) DO
  ASSERT resolveProfileValue(X.category, X.profile) = resolveProfileValue'(X.category, X.profile)
END FOR
```
