import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { updateProfile, createExperience, upsertSkill, uploadResume, createResumeRecord } from '@/lib/profile';
import { PersonalInfoStep } from './PersonalInfoStep';
import { EducationStep } from './EducationStep';
import { ExperienceStep } from './ExperienceStep';
import { SkillsStep } from './SkillsStep';
import { ResumeUploadStep } from './ResumeUploadStep';
import { ReviewStep } from './ReviewStep';
import type { Experience, Skill } from '@/types/profile';

export interface WizardData {
  // Personal
  full_name: string;
  phone: string;
  location: string; // computed on save: "street, city, state, zip, country"
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  linkedin_url: string;
  portfolio_url: string;
  github_url: string;
  headline: string;
  summary: string;
  // Education
  university: string;
  degree: string;
  field_of_study: string;
  graduation_year: string;
  // Experience
  experiences: Omit<Experience, 'id' | 'user_id' | 'created_at' | 'updated_at'>[];
  // Skills
  skills: Omit<Skill, 'id' | 'user_id' | 'created_at'>[];
  // Resume
  resumeFile: File | null;
}

const STEPS = ['Personal Info', 'Education', 'Experience', 'Skills', 'Resume', 'Review'];

const defaultWizardData: WizardData = {
  full_name: '',
  phone: '',
  location: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  country: 'USA',
  linkedin_url: '',
  portfolio_url: '',
  github_url: '',
  headline: '',
  summary: '',
  university: '',
  degree: '',
  field_of_study: '',
  graduation_year: '',
  experiences: [],
  skills: [],
  resumeFile: null,
};

export function OnboardingWizard() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>({
    ...defaultWizardData,
    full_name: user?.full_name ?? '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const update = (partial: Partial<WizardData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleFinish = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      // Save profile fields
      const locationParts = [data.street, data.city, data.state, data.zip, data.country].filter(Boolean);
      const location = locationParts.length > 0 ? locationParts.join(', ') : null;
      await updateProfile(user.id, {
        full_name: data.full_name || null,
        phone: data.phone || null,
        location,
        linkedin_url: data.linkedin_url || null,
        portfolio_url: data.portfolio_url || null,
        github_url: data.github_url || null,
        headline: data.headline || null,
        summary: data.summary || null,
        university: data.university || null,
        degree: data.degree || null,
        field_of_study: data.field_of_study || null,
        graduation_year: data.graduation_year ? parseInt(data.graduation_year) : null,
        onboarding_completed: true,
      });

      // Save experiences
      for (const exp of data.experiences) {
        await createExperience({ ...exp, user_id: user.id });
      }

      // Save skills
      for (const skill of data.skills) {
        await upsertSkill({ ...skill, user_id: user.id });
      }

      // Upload resume if provided
      if (data.resumeFile) {
        const result = await uploadResume(user.id, data.resumeFile);
        if (result) {
          await createResumeRecord({
            user_id: user.id,
            title: data.resumeFile.name,
            type: 'base',
            content: null,
            file_path: result.path,
            file_size: data.resumeFile.size,
            application_id: null,
            ats_score: null,
            is_primary: true,
            metadata: {},
          });
        }
      }

      // Update auth store so routing picks up the change
      setUser({ ...user, onboarding_completed: true });
      navigate('/');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Step indicator */}
      <div className="px-4 pt-4 pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="text-xs font-medium text-gray-700">{STEPS[step]}</span>
        </div>
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        {step === 0 && (
          <PersonalInfoStep
            data={data}
            email={user?.email ?? ''}
            onChange={update}
            onNext={next}
          />
        )}
        {step === 1 && (
          <EducationStep data={data} onChange={update} onNext={next} onBack={back} />
        )}
        {step === 2 && (
          <ExperienceStep data={data} onChange={update} onNext={next} onBack={back} />
        )}
        {step === 3 && (
          <SkillsStep data={data} onChange={update} onNext={next} onBack={back} />
        )}
        {step === 4 && (
          <ResumeUploadStep data={data} onChange={update} onNext={next} onBack={back} />
        )}
        {step === 5 && (
          <ReviewStep
            data={data}
            email={user?.email ?? ''}
            onBack={back}
            onFinish={handleFinish}
            isSaving={isSaving}
            saveError={saveError}
          />
        )}
      </div>
    </div>
  );
}
