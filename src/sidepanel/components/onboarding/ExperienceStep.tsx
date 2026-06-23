import { useState } from 'react';
import type { WizardData } from './OnboardingWizard';
import type { Experience } from '@/types/profile';
import { Button } from '@/sidepanel/components/ui/button';

type DraftExp = Omit<Experience, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

interface Props {
  data: WizardData;
  onChange: (partial: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const emptyExp = (): DraftExp => ({
  type: 'work',
  title: '',
  organization: '',
  location: '',
  start_date: '',
  end_date: '',
  is_current: false,
  bullets: [''],
  skills: [],
  sort_order: 0,
});

export function ExperienceStep({ data, onChange, onNext, onBack }: Props) {
  const [editing, setEditing] = useState<DraftExp | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const openNew = () => { setEditing(emptyExp()); setEditIndex(null); };
  const openEdit = (i: number) => { setEditing({ ...data.experiences[i] }); setEditIndex(i); };

  const save = () => {
    if (!editing) return;
    const list = [...data.experiences];
    if (editIndex !== null) {
      list[editIndex] = editing;
    } else {
      list.push({ ...editing, sort_order: list.length });
    }
    onChange({ experiences: list });
    setEditing(null);
    setEditIndex(null);
  };

  const remove = (i: number) => {
    onChange({ experiences: data.experiences.filter((_, idx) => idx !== i) });
  };

  const updateBullet = (i: number, val: string) => {
    if (!editing) return;
    const bullets = [...editing.bullets];
    bullets[i] = val;
    setEditing({ ...editing, bullets });
  };

  const addBullet = () => {
    if (!editing) return;
    setEditing({ ...editing, bullets: [...editing.bullets, ''] });
  };

  const removeBullet = (i: number) => {
    if (!editing) return;
    setEditing({ ...editing, bullets: editing.bullets.filter((_, idx) => idx !== i) });
  };

  if (editing) {
    return (
      <div className="p-4 space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">
          {editIndex !== null ? 'Edit Experience' : 'Add Experience'}
        </h2>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Type</label>
          <select
            className="input"
            value={editing.type}
            onChange={(e) => setEditing({ ...editing, type: e.target.value as DraftExp['type'] })}
          >
            <option value="work">Work</option>
            <option value="project">Project</option>
            <option value="volunteer">Volunteer</option>
            <option value="education">Education</option>
          </select>
        </div>

        <Field label="Title">
          <input className="input" value={editing.title}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            placeholder="Software Engineer" />
        </Field>

        <Field label="Organization">
          <input className="input" value={editing.organization}
            onChange={(e) => setEditing({ ...editing, organization: e.target.value })}
            placeholder="Acme Corp" />
        </Field>

        <Field label="Location">
          <input className="input" value={editing.location ?? ''}
            onChange={(e) => setEditing({ ...editing, location: e.target.value })}
            placeholder="Remote" />
        </Field>

        <div className="flex gap-2">
          <Field label="Start Date">
            <input className="input" value={editing.start_date ?? ''}
              onChange={(e) => setEditing({ ...editing, start_date: e.target.value })}
              placeholder="Jan 2022" />
          </Field>
          <Field label="End Date">
            <input className="input" value={editing.end_date ?? ''}
              onChange={(e) => setEditing({ ...editing, end_date: e.target.value })}
              placeholder="Present"
              disabled={editing.is_current} />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={editing.is_current}
            onChange={(e) => setEditing({ ...editing, is_current: e.target.checked, end_date: e.target.checked ? null : editing.end_date })} />
          Currently working here
        </label>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Bullet Points</label>
          {editing.bullets.map((b, i) => (
            <div key={i} className="flex gap-1">
              <input className="input flex-1" value={b}
                onChange={(e) => updateBullet(i, e.target.value)}
                placeholder="Describe an achievement..." />
              <button onClick={() => removeBullet(i)}
                className="text-gray-400 hover:text-red-500 px-1 text-lg leading-none">×</button>
            </div>
          ))}
          <button onClick={addBullet} className="text-sm text-blue-600 hover:underline">
            + Add bullet
          </button>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => { setEditing(null); setEditIndex(null); }}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={save}>
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Experience</h2>

      {data.experiences.length === 0 && (
        <p className="text-sm text-gray-500">No experiences added yet. Add your work history below.</p>
      )}

      <div className="space-y-2">
        {data.experiences.map((exp, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-3 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-800">{exp.title}</p>
              <p className="text-xs text-gray-500">{exp.organization} · {exp.type}</p>
              {exp.start_date && (
                <p className="text-xs text-gray-400">
                  {exp.start_date} – {exp.is_current ? 'Present' : (exp.end_date ?? '')}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(i)} className="text-xs text-blue-600 hover:underline">Edit</button>
              <button onClick={() => remove(i)} className="text-xs text-red-500 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full" onClick={openNew}>
        + Add Experience
      </Button>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onBack}>Back</Button>
        <Button className="flex-1" onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1 flex-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}
