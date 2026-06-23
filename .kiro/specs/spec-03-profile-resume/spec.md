# Spec 3 — P0: User Profile & Resume Management

## Requirement

Build a comprehensive profile management system: multi-step onboarding wizard, structured resume data model, PDF upload to Supabase Storage, experience/project bank with CRUD, skills bank, and resume version history.

## User Story

"As a job seeker, I can fill out my professional profile once and upload my resume so that the extension can auto-fill applications and tailor my resume to any job description."

## Success Criteria

- Multi-step onboarding wizard (personal info → education → experience → skills → resume upload → review)
- Profile data persists in Supabase Postgres and is editable post-onboarding
- PDF resumes upload to Supabase Storage with progress indication
- Experience bank supports CRUD (add/edit/delete work entries, projects, skills)
- Resume version history shows all tailored versions
- `onboarding_completed` flag set to true after wizard completion

## Priority

P0 — Core MVP. Auto-fill (Spec 5) and ATS optimizer (Spec 6) require structured user data.

## Dependencies

- Spec 1 (shell), Spec 2 (auth)

## Architecture

Reference: #[[file:masterplan.md]] — Spec 3, sections 3.2 through 3.7

### Database Schema

- ALTER profiles table: add phone, location, linkedin_url, portfolio_url, github_url, university, degree, graduation_year, field_of_study, years_of_experience, headline, summary
- `experiences` table: id, user_id, type (work/project/volunteer/education), title, organization, location, dates, bullets (JSONB), skills (JSONB), sort_order
- `skills` table: id, user_id, name, category, proficiency. UNIQUE(user_id, name)
- `resumes` table: id, user_id, title, type (base/tailored), content (JSONB), file_path, file_size, application_id, ats_score, is_primary, metadata
- Supabase Storage bucket `resumes` with RLS: users can only access {user_id}/ folder
- All tables have RLS policies scoped to auth.uid()

### Key Types

- Experience, Skill, Resume, StructuredResume interfaces
- StructuredResume: personal, summary, experience[], education[], skills[], projects[]

## Implementation Tasks

1. Run SQL migration: alter profiles, create experiences/skills/resumes tables with RLS
2. Create Supabase Storage bucket `resumes` with storage RLS policies
3. Create src/types/profile.ts — Experience, Skill, Resume, StructuredResume interfaces
4. Create src/stores/profileStore.ts — Zustand profile store with CRUD actions
5. Create src/lib/profile.ts — data access functions (fetchProfile, updateProfile, CRUD experiences/skills, uploadResume, fetchResumes, getResumeDownloadUrl)
6. Create src/sidepanel/components/onboarding/OnboardingWizard.tsx — multi-step container with step indicator
7. Create PersonalInfoStep.tsx — name, email, phone, location, URLs
8. Create EducationStep.tsx — university, degree, field, graduation year (multiple entries)
9. Create ExperienceStep.tsx — dynamic work experience form with bullet editing
10. Create SkillsStep.tsx — categorized skill input with proficiency levels
11. Create ResumeUploadStep.tsx — drag-and-drop PDF upload with progress bar
12. Create ReviewStep.tsx — summary view with edit buttons per section
13. Create src/sidepanel/pages/ProfilePage.tsx — post-onboarding profile editor
14. Update src/sidepanel/App.tsx — route to OnboardingWizard if onboarding_completed === false (within existing MemoryRouter per Spec 1)
15. Regenerate Supabase TypeScript types
