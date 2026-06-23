/**
 * Preservation Property Tests
 * Property 2: Preservation — Existing Priority Behavior Unchanged
 *
 * These tests MUST PASS on UNFIXED code.
 * They capture baseline behavior that must not regress after the fix.
 *
 * Run: vitest --run src/content/autofill/__tests__/resolveProfileValue.preservation.test.ts
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
    is_current: true,
    bullets: [],
    skills: [],
    sort_order: 1,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2020-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeEduEntry(overrides: Partial<Experience> = {}): Experience {
  return {
    id: 'e1',
    user_id: 'u1',
    type: 'education',
    title: 'Bachelor of Science',
    organization: 'MIT',
    location: null,
    start_date: '2016-09-01',
    end_date: '2020-05-01',
    is_current: false,
    bullets: [],
    skills: [],
    sort_order: 0,
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
    university: 'Fallback University',
    degree: 'Fallback Degree',
    graduation_year: 2019,
    field_of_study: 'Fallback Field',
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
// Preservation 1: is_current=true work entry — current_company/title unchanged
// Requirements: 3.2
// ---------------------------------------------------------------------------
describe('Property 2: Preservation — is_current=true work entry takes priority', () => {
  it('current_company returns is_current entry organization when it exists', () => {
    const profile = makeBaseProfile({
      experiences: [makeWorkEntry({ is_current: true, organization: 'Current Corp' })],
    });
    expect(resolveProfileValue('current_company', profile)).toBe('Current Corp');
  });

  it('current_title returns is_current entry title when it exists', () => {
    const profile = makeBaseProfile({
      experiences: [makeWorkEntry({ is_current: true, title: 'Lead Engineer' })],
    });
    expect(resolveProfileValue('current_title', profile)).toBe('Lead Engineer');
  });

  it('PBT: for any profile with is_current=true work entry, current_company equals that entry organization', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (org, title) => {
          const profile = makeBaseProfile({
            experiences: [
              makeWorkEntry({ is_current: true, organization: org, title }),
              makeWorkEntry({ id: 'w2', is_current: false, organization: 'Other Corp', sort_order: 99 }),
            ],
          });
          expect(resolveProfileValue('current_company', profile)).toBe(org);
          expect(resolveProfileValue('current_title', profile)).toBe(title);
        },
      ),
      { numRuns: 50 },
    );
  });
});

// ---------------------------------------------------------------------------
// Preservation 2: education experience entry — university/degree unchanged
// Requirements: 3.3
// ---------------------------------------------------------------------------
describe('Property 2: Preservation — education experience entry takes priority', () => {
  it('university returns education entry organization when it exists', () => {
    const profile = makeBaseProfile({
      university: 'Flat University',
      experiences: [makeEduEntry({ organization: 'Experience University' })],
    });
    expect(resolveProfileValue('university', profile)).toBe('Experience University');
  });

  it('degree returns education entry title when it exists', () => {
    const profile = makeBaseProfile({
      degree: 'Flat Degree',
      experiences: [makeEduEntry({ title: 'Master of Science' })],
    });
    expect(resolveProfileValue('degree', profile)).toBe('Master of Science');
  });

  it('PBT: for any profile with education experience entry, university equals that entry organization', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (org, title) => {
          const profile = makeBaseProfile({
            university: 'Flat University',
            degree: 'Flat Degree',
            experiences: [makeEduEntry({ organization: org, title })],
          });
          expect(resolveProfileValue('university', profile)).toBe(org);
          expect(resolveProfileValue('degree', profile)).toBe(title);
        },
      ),
      { numRuns: 50 },
    );
  });
});

// ---------------------------------------------------------------------------
// Preservation 3: stored years_of_experience is returned as-is
// Requirements: 3.4
// ---------------------------------------------------------------------------
describe('Property 2: Preservation — stored years_of_experience returned as-is', () => {
  it('returns stored years_of_experience as string when set', () => {
    const profile = makeBaseProfile({ years_of_experience: 5 });
    expect(resolveProfileValue('years_of_experience', profile)).toBe('5');
  });

  it('PBT: for any non-null years_of_experience, result equals stored value as string', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 50 }),
        (yoe) => {
          const profile = makeBaseProfile({
            years_of_experience: yoe,
            experiences: [
              makeWorkEntry({ start_date: '2010-01-01', end_date: '2015-01-01', is_current: false }),
            ],
          });
          expect(resolveProfileValue('years_of_experience', profile)).toBe(yoe.toString());
        },
      ),
      { numRuns: 50 },
    );
  });
});

// ---------------------------------------------------------------------------
// Preservation 4: all other field categories unaffected
// Requirements: 3.2, 3.3, 3.4
// ---------------------------------------------------------------------------
describe('Property 2: Preservation — unrelated field categories unchanged', () => {
  it('email, full_name, phone, linkedin_url are unaffected by experience data', () => {
    const profile = makeBaseProfile({
      email: 'jane@example.com',
      full_name: 'Jane Doe',
      phone: '+1 555-1234',
      linkedin_url: 'https://linkedin.com/in/jane',
      experiences: [makeWorkEntry({ is_current: false })],
    });
    expect(resolveProfileValue('email', profile)).toBe('jane@example.com');
    expect(resolveProfileValue('full_name', profile)).toBe('Jane Doe');
    expect(resolveProfileValue('linkedin_url', profile)).toBe('https://linkedin.com/in/jane');
  });

  it('PBT: for any profile, non-work/edu field categories return same value regardless of experience array', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.includes('@')),
        fc.boolean(),
        (email, hasWork) => {
          const baseProfile = makeBaseProfile({ email, experiences: [] });
          const withWork = makeBaseProfile({
            email,
            experiences: hasWork ? [makeWorkEntry({ is_current: false })] : [],
          });
          // email should be identical regardless of experience data
          expect(resolveProfileValue('email', baseProfile)).toBe(
            resolveProfileValue('email', withWork),
          );
        },
      ),
      { numRuns: 50 },
    );
  });
});
