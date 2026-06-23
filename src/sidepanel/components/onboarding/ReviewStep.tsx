import type { WizardData } from './OnboardingWizard';
import { Button } from '@/sidepanel/components/ui/button';

interface Props {
  data: WizardData;
  email: string;
  onBack: () => void;
  onFinish: () => void;
  isSaving: boolean;
  saveError: string | null;
}

export function ReviewStep({ data, email, onBack, onFinish, isSaving, saveError }: Props) {
  return (
    <div className="p-4 space-y-5">
      <h2 className="text-lg font-semibold text-gray-800">Review Your Profile</h2>

      <Section title="Personal Info">
        <Row label="Name" value={data.full_name} />
        <Row label="Email" value={email} />
        <Row label="Headline" value={data.headline} />
        <Row label="Phone" value={data.phone} />
        <Row label="Location" value={data.location} />
        <Row label="LinkedIn" value={data.linkedin_url} />
        <Row label="GitHub" value={data.github_url} />
        <Row label="Portfolio" value={data.portfolio_url} />
        {data.summary && <Row label="Summary" value={data.summary} />}
      </Section>

      <Section title="Education">
        <Row label="University" value={data.university} />
        <Row label="Degree" value={data.degree} />
        <Row label="Field" value={data.field_of_study} />
        <Row label="Graduation" value={data.graduation_year} />
      </Section>

      <Section title={`Experience (${data.experiences.length})`}>
        {data.experiences.length === 0 ? (
          <p className="text-xs text-gray-400">None added</p>
        ) : (
          data.experiences.map((exp, i) => (
            <div key={i} className="text-sm">
              <span className="font-medium">{exp.title}</span>
              <span className="text-gray-500"> at {exp.organization}</span>
            </div>
          ))
        )}
      </Section>

      <Section title={`Skills (${data.skills.length})`}>
        {data.skills.length === 0 ? (
          <p className="text-xs text-gray-400">None added</p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {data.skills.map((sk, i) => (
              <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                {sk.name}
              </span>
            ))}
          </div>
        )}
      </Section>

      <Section title="Resume">
        {data.resumeFile ? (
          <p className="text-sm text-gray-700">{data.resumeFile.name}</p>
        ) : (
          <p className="text-xs text-gray-400">No file uploaded</p>
        )}
      </Section>

      {saveError && (
        <p className="text-sm text-red-600 bg-red-50 rounded p-2">{saveError}</p>
      )}

      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onBack} disabled={isSaving}>
          Back
        </Button>
        <Button className="flex-1" onClick={onFinish} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Complete Setup'}
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h3>
      <div className="bg-gray-50 rounded-lg p-3 space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-500 w-24 shrink-0">{label}</span>
      <span className="text-gray-800 break-all">{value}</span>
    </div>
  );
}
