# Design Document

## Overview

This design implements the User Profile & Resume Management system (Spec 3) for the AutoApply Chrome extension. It adds a SQL migration, TypeScript types, a data access library, a Zustand store, a multi-step onboarding wizard, a post-onboarding profile editor, and routing integration into the existing side panel app.

## Architecture

The feature follows the existing layered architecture:

```
UI Components (React)
    ↓
Zustand Store (profileStore.ts)
    ↓
Data Access Layer (lib/profile.ts)
    ↓
Supabase Client (lib/supabase.ts)
    ↓
Supabase Postgres + Storage
```

All new components live under `src/sidepanel/`. Types live in `src/types/profile.ts`. The store lives in `src/stores/profileStore.ts`. The data access layer lives in `src/lib/profile.ts`.

## Components and Interfaces

### src/types/profile.ts

```typescript
export interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  github_url: string | null;
  university: string | null;
  degree: string | null;
  graduation_year: number | null;
  field_of_study: string | null;
  years_of_experience: number | null;
  headline: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  user_id: string;
  type: 'work' | 'project' | 'volunteer' | 'education';
  title: string;
  organization: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  bullets: string[];
  skills: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  category: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  type: 'base' | 'tailored';
  content: StructuredResume | null;
  file_path: string | null;
  file_size: number | null;
  application_id: string | null;
  ats_score: number | null;
  is_primary: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface StructuredResume {
  personal: {
    full_name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin_url?: string;
    portfolio_url?: string;
    github_url?: string;
  };
  summary: string;
  experience: Experience[];
  education: Experience[];
  skills: Skill[];
  projects: Experience[];
}
```

### src/lib/profile.ts

Data access functions wrapping Supabase queries. All functions return `{ data, error }` shaped results — never throw.

Key functions:
- `fetchProfile(userId)` → `ProfileData | null`
- `updateProfile(userId, partial)` → `ProfileData | null`
- `fetchExperiences(userId)` → `Experience[]`
- `createExperience(data)` → `Experience | null`
- `updateExperience(id, data)` → `Experience | null`
- `deleteExperience(id)` → `boolean`
- `fetchSkills(userId)` → `Skill[]`
- `upsertSkill(data)` → `Skill | null`
- `deleteSkill(id)` → `boolean`
- `uploadResume(userId, file, onProgress)` → `{ path: string } | null`
- `fetchResumes(userId)` → `Resume[]`
- `createResumeRecord(data)` → `Resume | null`

### src/stores/profileStore.ts

Zustand store with the following shape:

```typescript
interface ProfileStore {
  profile: ProfileData | null;
  experiences: Experience[];
  skills: Skill[];
  resumes: Resume[];
  isLoading: boolean;
  error: string | null;
  loadProfile: (userId: string) => Promise<void>;
  saveProfile: (userId: string, data: Partial<ProfileData>) => Promise<void>;
  loadExperiences: (userId: string) => Promise<void>;
  addExperience: (data: Omit<Experience, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  editExperience: (id: string, data: Partial<Experience>) => Promise<void>;
  removeExperience: (id: string) => Promise<void>;
  loadSkills: (userId: string) => Promise<void>;
  addSkill: (data: Omit<Skill, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  removeSkill: (id: string) => Promise<void>;
  loadResumes: (userId: string) => Promise<void>;
}
```

### Onboarding Wizard Component Tree

```
OnboardingWizard (manages step state, wizard data accumulation)
├── StepIndicator (shows current/total steps)
├── PersonalInfoStep
├── EducationStep
├── ExperienceStep
├── SkillsStep
├── ResumeUploadStep
└── ReviewStep
```

The wizard holds all form data in local state (`wizardData`) and only persists to Supabase on the final Review step confirmation. This avoids partial writes during navigation.

### File Locations

```
src/
├── types/
│   └── profile.ts                          (new)
├── lib/
│   └── profile.ts                          (new)
├── stores/
│   └── profileStore.ts                     (new)
├── sidepanel/
│   ├── App.tsx                             (updated)
│   ├── components/
│   │   └── onboarding/
│   │       ├── OnboardingWizard.tsx        (new)
│   │       ├── PersonalInfoStep.tsx        (new)
│   │       ├── EducationStep.tsx           (new)
│   │       ├── ExperienceStep.tsx          (new)
│   │       ├── SkillsStep.tsx              (new)
│   │       ├── ResumeUploadStep.tsx        (new)
│   │       └── ReviewStep.tsx              (new)
│   └── pages/
│       └── ProfilePage.tsx                 (new)
supabase/
└── migrations/
    └── 002_profile_resume.sql              (new)
```

## Data Models

### experiences table

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, default gen_random_uuid() |
| user_id | UUID | FK → auth.users, NOT NULL |
| type | TEXT | CHECK IN ('work','project','volunteer','education') |
| title | TEXT | NOT NULL |
| organization | TEXT | NOT NULL |
| location | TEXT | nullable |
| start_date | TEXT | nullable |
| end_date | TEXT | nullable |
| is_current | BOOLEAN | DEFAULT false |
| bullets | JSONB | DEFAULT '[]' |
| skills | JSONB | DEFAULT '[]' |
| sort_order | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### skills table

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → auth.users |
| name | TEXT | NOT NULL |
| category | TEXT | NOT NULL |
| proficiency | TEXT | CHECK IN ('beginner','intermediate','advanced','expert') |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

UNIQUE(user_id, name)

### resumes table

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → auth.users |
| title | TEXT | NOT NULL |
| type | TEXT | CHECK IN ('base','tailored') |
| content | JSONB | nullable |
| file_path | TEXT | nullable |
| file_size | INTEGER | nullable |
| application_id | UUID | nullable |
| ats_score | INTEGER | nullable |
| is_primary | BOOLEAN | DEFAULT false |
| metadata | JSONB | DEFAULT '{}' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

## Error Handling

- All `lib/profile.ts` functions catch Supabase errors and return `null` or `[]` with a console error log.
- The Profile_Store sets `error` state on failures so UI components can display messages.
- File upload validates type (PDF only) and size (≤ 10 MB) before calling Supabase Storage.
- The onboarding wizard shows per-field validation errors inline.

## Correctness Properties

1. WHEN `uploadResume` is called with a valid PDF, the returned storage path WHEN passed to `supabase.storage.from('resumes').getPublicUrl()` SHALL produce a valid URL (round-trip property).
2. WHEN `createExperience` is called and then `fetchExperiences` is called for the same user, the returned array SHALL contain the created experience (insert/contains property).
3. WHEN `deleteExperience(id)` is called, a subsequent `fetchExperiences` call SHALL NOT contain an experience with that id (delete/absent property).
4. WHEN `upsertSkill` is called twice with the same `(user_id, name)`, `fetchSkills` SHALL return exactly one skill with that name (idempotence/uniqueness property).
