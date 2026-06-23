import type { WizardData } from './OnboardingWizard';
import { Button } from '@/sidepanel/components/ui/button';

interface Props {
  data: WizardData;
  onChange: (partial: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function EducationStep({ data, onChange, onNext, onBack }: Props) {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Education</h2>

      <Field label="University / School">
        <input
          className="input"
          value={data.university}
          onChange={(e) => onChange({ university: e.target.value })}
          placeholder="MIT"
        />
      </Field>

      <Field label="Degree">
        <input
          className="input"
          value={data.degree}
          onChange={(e) => onChange({ degree: e.target.value })}
          placeholder="Bachelor of Science"
        />
      </Field>

      <Field label="Field of Study">
        <input
          className="input"
          value={data.field_of_study}
          onChange={(e) => onChange({ field_of_study: e.target.value })}
          placeholder="Computer Science"
        />
      </Field>

      <Field label="Graduation Year">
        <input
          className="input"
          type="number"
          min="1950"
          max="2040"
          value={data.graduation_year}
          onChange={(e) => onChange({ graduation_year: e.target.value })}
          placeholder="2024"
        />
      </Field>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button className="flex-1" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}
