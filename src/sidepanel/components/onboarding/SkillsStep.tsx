import { useState } from 'react';
import type { WizardData } from './OnboardingWizard';
import type { Skill } from '@/types/profile';
import { Button } from '@/sidepanel/components/ui/button';

type DraftSkill = Omit<Skill, 'id' | 'user_id' | 'created_at'>;

interface Props {
  data: WizardData;
  onChange: (partial: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PROFICIENCY_LEVELS: Skill['proficiency'][] = ['beginner', 'intermediate', 'advanced', 'expert'];

export function SkillsStep({ data, onChange, onNext, onBack }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Technical');
  const [proficiency, setProficiency] = useState<Skill['proficiency']>('intermediate');

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const already = data.skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase());
    if (already) return;
    const skill: DraftSkill = { name: trimmed, category, proficiency };
    onChange({ skills: [...data.skills, skill] });
    setName('');
  };

  const remove = (i: number) => {
    onChange({ skills: data.skills.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Skills</h2>

      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            className="input flex-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="e.g. TypeScript"
          />
          <input
            className="input w-28"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
          />
        </div>
        <div className="flex gap-2 items-center">
          <select
            className="input flex-1"
            value={proficiency}
            onChange={(e) => setProficiency(e.target.value as Skill['proficiency'])}
          >
            {PROFICIENCY_LEVELS.map((p) => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
          <Button onClick={add} className="shrink-0">Add</Button>
        </div>
      </div>

      {data.skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.skills.map((sk, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
            >
              {sk.name}
              <span className="text-blue-400">· {sk.proficiency}</span>
              <button onClick={() => remove(i)} className="ml-1 text-blue-400 hover:text-red-500">×</button>
            </span>
          ))}
        </div>
      )}

      {data.skills.length === 0 && (
        <p className="text-sm text-gray-500">No skills added yet.</p>
      )}

      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onBack}>Back</Button>
        <Button className="flex-1" onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}
