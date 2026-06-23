/**
 * Bug Condition Exploration Tests
 * Property 1: Bug Condition — Autofill Fallback & Outreach Visibility
 *
 * CRITICAL: These tests MUST FAIL on unfixed code.
 * Failure confirms the bugs exist. Do NOT fix the code until task 2 is complete.
 *
 * Run: vitest --run src/content/autofill/__tests__/resolveProfileValue.bug.test.ts
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { resolveProfileValue } from '../utils';
import type { EnrichedProfile } from '../utils';
import type { Experience } from '@/types/profile';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeWorkEntry(overrides: Partial<Experience> = {}): Experience {
  return {
    id: 'w1',
    user_id: 'u1',
    type: 'work',
    title: 'Software Engineer',
    organization: 'Acme Corp',
    location: null,
    start_date: '2020-01-01',
    end_date: null,
    is_current: false,
    bullets: [],
    skills: [],
    sort_order: 1,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2020-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeBaseProfile(overrides: Partial<EnrichedProfile> = {}): EnrichedProfile {
  return {
    id: 'u1',
    email: 'test@example.com',
    full_name: 'Jane Doe',
    avatar_url: null,
    onboarding_completed: true,
    phone: null,
    location: null,
    linkedin_url: null,
    portfolio_url: null,
    github_url: null,
    university: null,
    degree: null,
    graduation_year: null,
    field_of_study: null,
    years_of_experience: null,
    headline: null,
    summary: null,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2020-01-01T00:00:00Z',
    experiences: [],
    skills: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Test 1a — Work fallback: no is_current entry but work entries exist
// Bug condition: is_work_field AND no_current_work
// Expected (after fix): returns most recent work entry's organization/title
// ---------------------------------------------------------------------------
describe('Property 1: Bug Condition — Work field fallback', () => {
  it('1a: current_company returns non-null when work entry exists but is_current=false', () => {
    const profile = makeBaseProfile({
      experiences: [makeWorkEntry({ is_current: false, organization: 'Acme Corp' })],
    });
    const result = resolveProfileValue('current_company', profile);
    // EXPECTED TO FAIL on unfixed code (returns null)
    expect(result).not.toBeNull();
    expect(result).toBe('Acme Corp');
  });

  it('1a: current_title returns non-null when work entry exists but is_current=false', () => {
    const profile = makeBaseProfile({
      experiences: [makeWorkEntry({ is_current: false, title: 'Software Engineer' })],
    });
    const result = resolveProfileValue('current_title', profile);
    // EXPECTED TO FAIL on unfixed code (returns null)
    expect(result).not.toBeNull();
    expect(result).toBe('Software Engineer');
  });

  it('1a PBT: for any non-empty work entry list with no is_current, current_company is non-null when organization is set', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            organization: fc.string({ minLength: 1, maxLength: 50 }),
            title: fc.string({ minLength: 1, maxLength: 50 }),
            sort_order: fc.integer({ min: 0, max: 100 }),
            start_date: fc.option(fc.constant('2019-01-01'), { nil: null }),
          }),
          { minLength: 1, maxLength: 5 },
        ),
        (entries) => {
          const experiences: Experience[] = entries.map((e, i) => makeWorkEntry({
            id: `w${i}`,
            organization: e.organization,
            title: e.title,
            sort_order: e.sort_order,
            start_date: e.start_date,
            is_current: false,
          }));
          const profile = makeBaseProfile({ experiences });
          const result = resolveProfileValue('current_company', profile);
          // Should return the most recent entry's organization, not null
          expect(result).not.toBeNull();
        },
      ),
      { numRuns: 50 },
    );
  });
});

// ---------------------------------------------------------------------------
// Test 1b — YOE derivation: years_of_experience null but work entries exist
// Bug condition: is_yoe_field AND yoe_null
// Expected (after fix): returns derived year count as string
// ---------------------------------------------------------------------------
describe('Property 1: Bug Condition — years_of_experience derivation', () => {
  it('1b: years_of_experience returns non-null when profile value is null but work entry has start_date', () => {
    const profile = makeBaseProfile({
      years_of_experience: null,
      experiences: [makeWorkEntry({ start_date: '2020-01-01', end_date: '2024-01-01', is_current: false })],
    });
    const result = resolveProfileValue('years_of_experience', profile);
    // EXPECTED TO FAIL on unfixed code (returns null)
    expect(result).not.toBeNull();
  });

  it('1b: years_of_experience returns null when no work entries and profile value is null', () => {
    const profile = makeBaseProfile({ years_of_experience: null, experiences: [] });
    const result = resolveProfileValue('years_of_experience', profile);
    // This should remain null — no data to derive from
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Test 1c — Education flat-field: no education experience but flat fields set
// Bug condition: is_edu_field AND no_edu_entry
// Expected (after fix): returns flat profile field values
// ---------------------------------------------------------------------------
describe('Property 1: Bug Condition — Education flat-field fallback', () => {
  it('1c: graduation_year returns string value from flat profile when no education experience exists', () => {
    const profile = makeBaseProfile({
      graduation_year: 2020,
      experiences: [],
    });
    const result = resolveProfileValue('graduation_year', profile);
    // EXPECTED TO FAIL on unfixed code (graduation_year already reads profile.graduation_year — may pass)
    // This confirms the partial fix gap for graduation_year via latestEdu path
    expect(result).toBe('2020');
  });

  it('1c: field_of_study returns flat profile value when no education experience exists', () => {
    const profile = makeBaseProfile({
      field_of_study: 'Computer Science',
      experiences: [],
    });
    const result = resolveProfileValue('field_of_study', profile);
    // field_of_study already reads profile.field_of_study — should pass even on unfixed code
    expect(result).toBe('Computer Science');
  });

  it('1c PBT: for any profile with no education entries but non-null graduation_year, result is non-null', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1970, max: 2030 }),
        (year) => {
          const profile = makeBaseProfile({ graduation_year: year, experiences: [] });
          const result = resolveProfileValue('graduation_year', profile);
          expect(result).not.toBeNull();
          expect(result).toBe(year.toString());
        },
      ),
      { numRuns: 50 },
    );
  });
});
