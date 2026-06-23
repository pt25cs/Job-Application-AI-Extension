# Tasks

## Task List

- [x] 1. SQL migration: alter profiles, create experiences/skills/resumes tables with RLS and storage bucket policy
- [x] 2. Create src/types/profile.ts — ProfileData, Experience, Skill, Resume, StructuredResume interfaces
- [x] 3. Create src/lib/profile.ts — data access functions for profile, experiences, skills, resumes, and file upload
- [x] 4. Create src/stores/profileStore.ts — Zustand profile store with CRUD actions
- [x] 5. Create OnboardingWizard.tsx with step indicator and wizard data state
  - [x] 5.1 Create src/sidepanel/components/onboarding/OnboardingWizard.tsx
  - [x] 5.2 Create src/sidepanel/components/onboarding/PersonalInfoStep.tsx
  - [x] 5.3 Create src/sidepanel/components/onboarding/EducationStep.tsx
  - [x] 5.4 Create src/sidepanel/components/onboarding/ExperienceStep.tsx
  - [x] 5.5 Create src/sidepanel/components/onboarding/SkillsStep.tsx
  - [x] 5.6 Create src/sidepanel/components/onboarding/ResumeUploadStep.tsx
  - [x] 5.7 Create src/sidepanel/components/onboarding/ReviewStep.tsx
- [x] 6. Create src/sidepanel/pages/ProfilePage.tsx — post-onboarding profile editor
- [x] 7. Update src/sidepanel/App.tsx — route to OnboardingWizard if onboarding_completed === false
