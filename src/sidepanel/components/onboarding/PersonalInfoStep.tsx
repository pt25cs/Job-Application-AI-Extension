import type { WizardData } from './OnboardingWizard';
import { Button } from '@/sidepanel/components/ui/button';

interface Props {
  data: WizardData;
  email: string;
  onChange: (partial: Partial<WizardData>) => void;
  onNext: () => void;
}

export function PersonalInfoStep({ data, email, onChange, onNext }: Props) {
  const urlError = (val: string) => val.length > 0 && !val.startsWith('http');

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Personal Info</h2>

      <Field label="Full Name">
        <input
          className="input"
          value={data.full_name}
          onChange={(e) => onChange({ full_name: e.target.value })}
          placeholder="Jane Smith"
        />
      </Field>

      <Field label="Email">
        <input className="input bg-gray-50 cursor-not-allowed" value={email} readOnly />
      </Field>

      <Field label="Headline">
        <input
          className="input"
          value={data.headline}
          onChange={(e) => onChange({ headline: e.target.value })}
          placeholder="Senior Software Engineer"
        />
      </Field>

      <Field label="Phone">
        <input
          className="input"
          value={data.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="+1 555 000 0000"
        />
      </Field>

      {/* Address — visually grouped */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-2">
        <div>
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Address</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Used to auto-fill address fields on job applications
          </p>
        </div>
        <Field label="Street Address">
          <input
            className="input"
            value={data.street}
            onChange={(e) => onChange({ street: e.target.value })}
            placeholder="123 Main St"
          />
        </Field>
        <div className="flex gap-2">
          <Field label="City">
            <input
              className="input"
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="New York"
            />
          </Field>
          <Field label="State" className="w-24 shrink-0">
            <input
              className="input"
              value={data.state}
              onChange={(e) => onChange({ state: e.target.value })}
              placeholder="NY"
              maxLength={3}
            />
          </Field>
        </div>
        <div className="flex gap-2">
          <Field label="ZIP Code" className="w-28 shrink-0">
            <input
              className="input"
              value={data.zip}
              onChange={(e) => onChange({ zip: e.target.value })}
              placeholder="10001"
              maxLength={10}
            />
          </Field>
          <Field label="Country">
            <input
              className="input"
              value={data.country}
              onChange={(e) => onChange({ country: e.target.value })}
              placeholder="USA"
            />
          </Field>
        </div>
      </div>

      <Field label="LinkedIn URL">
        <input
          className="input"
          value={data.linkedin_url}
          onChange={(e) => onChange({ linkedin_url: e.target.value })}
          placeholder="https://linkedin.com/in/yourname"
        />
        {urlError(data.linkedin_url) && (
          <p className="text-xs text-red-500 mt-0.5">Must start with https://</p>
        )}
      </Field>

      <Field label="GitHub URL">
        <input
          className="input"
          value={data.github_url}
          onChange={(e) => onChange({ github_url: e.target.value })}
          placeholder="https://github.com/yourname"
        />
        {urlError(data.github_url) && (
          <p className="text-xs text-red-500 mt-0.5">Must start with https:// or leave blank</p>
        )}
      </Field>

      <Field label="Portfolio URL">
        <input
          className="input"
          value={data.portfolio_url}
          onChange={(e) => onChange({ portfolio_url: e.target.value })}
          placeholder="https://yoursite.com"
        />
        {urlError(data.portfolio_url) && (
          <p className="text-xs text-red-500 mt-0.5">Must start with https:// or leave blank</p>
        )}
      </Field>

      <Field label="Summary">
        <textarea
          className="input min-h-[80px] resize-none"
          value={data.summary}
          onChange={(e) => onChange({ summary: e.target.value })}
          placeholder="Brief professional summary..."
        />
      </Field>

      <div className="pt-2">
        <Button className="w-full" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1 ${className ?? 'w-full'}`}>
      <label className="text-sm font-medium text-gray-700">
        {label}
        {hint && <span className="ml-1 text-xs text-gray-400 font-normal">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}
