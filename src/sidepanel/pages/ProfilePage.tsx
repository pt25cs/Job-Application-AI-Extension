import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import { uploadResume, createResumeRecord, getResumeDownloadUrl } from '@/lib/profile';
import { Button } from '@/sidepanel/components/ui/button';
import type { Experience, Skill } from '@/types/profile';

const MAX_SIZE = 10 * 1024 * 1024;

export function ProfilePage() {
  const { user } = useAuthStore();
  const {
    profile, experiences, skills, resumes,
    loadProfile, saveProfile, loadExperiences, loadSkills, loadResumes,
    addExperience, editExperience, removeExperience,
    addSkill, removeSkill,
    error, setError,
  } = useProfileStore();

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Local editable state for personal/education fields
  const [form, setForm] = useState({
    full_name: '', headline: '', phone: '',
    street: '', city: '', state: '', zip: '', country: 'USA',
    linkedin_url: '', github_url: '', portfolio_url: '', summary: '',
    university: '', degree: '', field_of_study: '', graduation_year: '',
  });

  useEffect(() => {
    if (!user) return;
    loadProfile(user.id);
    loadExperiences(user.id);
    loadSkills(user.id);
    loadResumes(user.id);
  }, [user?.id]);

  useEffect(() => {
    if (!profile) return;
    // Parse stored location string back into parts
    const parts = (profile.location ?? '').split(',').map((s) => s.trim());
    const isUrl = (v: string | null) => v && v !== 'NA' && v !== 'N/A' && v.startsWith('http');
    setForm({
      full_name: profile.full_name ?? '',
      headline: profile.headline ?? '',
      phone: profile.phone ?? '',
      street: parts[0] ?? '',
      city: parts[1] ?? '',
      state: parts[2] ?? '',
      zip: parts[3] ?? '',
      country: parts[4] ?? 'USA',
      linkedin_url: isUrl(profile.linkedin_url) ? profile.linkedin_url! : '',
      github_url: isUrl(profile.github_url) ? profile.github_url! : '',
      portfolio_url: isUrl(profile.portfolio_url) ? profile.portfolio_url! : '',
      summary: profile.summary ?? '',
      university: profile.university ?? '',
      degree: profile.degree ?? '',
      field_of_study: profile.field_of_study ?? '',
      graduation_year: profile.graduation_year?.toString() ?? '',
    });
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaveSuccess(false);
    setError(null);
    // Reconstruct location string from parts
    const locationParts = [form.street, form.city, form.state, form.zip, form.country].filter(Boolean);
    const location = locationParts.length > 0 ? locationParts.join(', ') : null;
    // Sanitize URLs — clear if not a valid URL
    const sanitizeUrl = (v: string) => v.startsWith('http') ? v : null;
    await saveProfile(user.id, {
      full_name: form.full_name || null,
      headline: form.headline || null,
      phone: form.phone || null,
      location,
      linkedin_url: sanitizeUrl(form.linkedin_url),
      github_url: sanitizeUrl(form.github_url),
      portfolio_url: sanitizeUrl(form.portfolio_url),
      summary: form.summary || null,
      university: form.university || null,
      degree: form.degree || null,
      field_of_study: form.field_of_study || null,
      graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
    });
    // Check store error after save completes
    const storeError = useProfileStore.getState().error;
    if (!storeError) setSaveSuccess(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.type !== 'application/pdf') { setUploadError('Only PDF files are supported'); return; }
    if (file.size > MAX_SIZE) { setUploadError('File must be under 10 MB'); return; }
    setUploadError(null);
    setUploadProgress(0);
    const result = await uploadResume(user.id, file, setUploadProgress);
    if (!result) { setUploadError('Upload failed'); setUploadProgress(null); return; }
    await createResumeRecord({
      user_id: user.id,
      title: file.name,
      type: 'base',
      content: null,
      file_path: result.path,
      file_size: file.size,
      application_id: null,
      ats_score: null,
      is_primary: false,
      metadata: {},
    });
    setUploadProgress(null);
    loadResumes(user.id);
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-100">
        <h1 className="text-lg font-semibold text-gray-800">Profile</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Personal Info */}
        <Section title="Personal Info">
          <Field label="Full Name">
            <input className="input" value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </Field>
          <Field label="Headline">
            <input className="input" value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })} />
          </Field>
          <Field label="Phone" hint="+1 555 000 0000">
            <input className="input" value={form.phone} placeholder="+1 555 000 0000"
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-2">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Address</p>
              <p className="text-xs text-blue-600 mt-0.5">Used to auto-fill address fields on job applications</p>
            </div>
            <Field label="Street Address">
              <input className="input" value={form.street} placeholder="123 Main St"
                onChange={(e) => setForm({ ...form, street: e.target.value })} />
            </Field>
            <div className="flex gap-2">
              <Field label="City">
                <input className="input" value={form.city} placeholder="New York"
                  onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </Field>
              <div className="w-24 shrink-0">
                <Field label="State">
                  <input className="input" value={form.state} placeholder="NY" maxLength={3}
                    onChange={(e) => setForm({ ...form, state: e.target.value })} />
                </Field>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-28 shrink-0">
                <Field label="ZIP Code">
                  <input className="input" value={form.zip} placeholder="10001" maxLength={10}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })} />
                </Field>
              </div>
              <Field label="Country">
                <input className="input" value={form.country} placeholder="USA"
                  onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </Field>
            </div>
          </div>
          <Field label="LinkedIn URL" hint="Must start with https://">
            <input className="input" value={form.linkedin_url} placeholder="https://linkedin.com/in/yourname"
              onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} />
            {form.linkedin_url && !form.linkedin_url.startsWith('http') && (
              <p className="text-xs text-red-500 mt-0.5">Must start with https://</p>
            )}
          </Field>
          <Field label="GitHub URL" hint="Leave blank if none">
            <input className="input" value={form.github_url} placeholder="https://github.com/yourname"
              onChange={(e) => setForm({ ...form, github_url: e.target.value })} />
            {form.github_url && !form.github_url.startsWith('http') && (
              <p className="text-xs text-red-500 mt-0.5">Must start with https:// or leave blank</p>
            )}
          </Field>
          <Field label="Portfolio URL" hint="Leave blank if none">
            <input className="input" value={form.portfolio_url} placeholder="https://yoursite.com"
              onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })} />
            {form.portfolio_url && !form.portfolio_url.startsWith('http') && (
              <p className="text-xs text-red-500 mt-0.5">Must start with https:// or leave blank</p>
            )}
          </Field>
          <Field label="Summary">
            <textarea className="input min-h-[72px] resize-none" value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          </Field>
        </Section>

        {/* Education */}
        <Section title="Education">
          <Field label="University">
            <input className="input" value={form.university}
              onChange={(e) => setForm({ ...form, university: e.target.value })} />
          </Field>
          <Field label="Degree">
            <input className="input" value={form.degree}
              onChange={(e) => setForm({ ...form, degree: e.target.value })} />
          </Field>
          <Field label="Field of Study">
            <input className="input" value={form.field_of_study}
              onChange={(e) => setForm({ ...form, field_of_study: e.target.value })} />
          </Field>
          <Field label="Graduation Year">
            <input className="input" type="number" value={form.graduation_year}
              onChange={(e) => setForm({ ...form, graduation_year: e.target.value })} />
          </Field>
        </Section>

        {saveSuccess && <p className="text-sm text-green-600">Profile saved.</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button className="w-full" onClick={handleSave}>Save Profile</Button>

        {/* Experience Bank */}
        <Section title="Experience Bank">
          <ExperienceBank
            experiences={experiences}
            userId={user?.id ?? ''}
            onAdd={addExperience}
            onEdit={editExperience}
            onDelete={removeExperience}
          />
        </Section>

        {/* Skills Bank */}
        <Section title="Skills Bank">
          <SkillsBank
            skills={skills}
            userId={user?.id ?? ''}
            onAdd={addSkill}
            onDelete={removeSkill}
          />
        </Section>

        {/* Resumes */}
        <Section title="Resumes">
          <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
          <Button variant="outline" className="w-full mb-3" onClick={() => fileRef.current?.click()}>
            Upload PDF Resume
          </Button>
          {uploadProgress !== null && (
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
              <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          )}
          {uploadError && <p className="text-sm text-red-600 mb-2">{uploadError}</p>}
          {resumes.length === 0 && <p className="text-xs text-gray-400">No resumes uploaded yet.</p>}
          <div className="space-y-2">
            {resumes.map((r) => (
              <div key={r.id} className="flex justify-between items-center border border-gray-200 rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{r.title}</p>
                  <p className="text-xs text-gray-500">
                    {r.type} · {r.file_size ? `${(r.file_size / 1024).toFixed(0)} KB` : ''} · {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                {r.file_path && (
                  <a
                    href={getResumeDownloadUrl(r.file_path)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Download
                  </a>
                )}
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">
        {label}
        {hint && <span className="ml-1 text-gray-400 font-normal">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

// ── Experience Bank ───────────────────────────────────────────────────────────

type DraftExp = Omit<Experience, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

function ExperienceBank({
  experiences, userId, onAdd, onEdit, onDelete,
}: {
  experiences: Experience[];
  userId: string;
  onAdd: (d: Omit<Experience, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onEdit: (id: string, d: Partial<Experience>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState<(DraftExp & { id?: string }) | null>(null);

  const emptyExp = (): DraftExp => ({
    type: 'work', title: '', organization: '', location: '',
    start_date: '', end_date: '', is_current: false,
    bullets: [''], skills: [], sort_order: experiences.length,
  });

  const save = async () => {
    if (!editing) return;
    if (editing.id) {
      await onEdit(editing.id, editing);
    } else {
      await onAdd({ ...editing, user_id: userId });
    }
    setEditing(null);
  };

  if (editing) {
    return (
      <div className="space-y-3 border border-gray-200 rounded-lg p-3">
        <Field label="Type">
          <select className="input" value={editing.type}
            onChange={(e) => setEditing({ ...editing, type: e.target.value as DraftExp['type'] })}>
            <option value="work">Work</option>
            <option value="project">Project</option>
            <option value="volunteer">Volunteer</option>
            <option value="education">Education</option>
          </select>
        </Field>
        <Field label="Title">
          <input className="input" value={editing.title}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
        </Field>
        <Field label="Organization">
          <input className="input" value={editing.organization}
            onChange={(e) => setEditing({ ...editing, organization: e.target.value })} />
        </Field>
        <Field label="Location">
          <input className="input" value={editing.location ?? ''} placeholder="City, State"
            onChange={(e) => setEditing({ ...editing, location: e.target.value })} />
        </Field>
        <div className="flex gap-2">
          <Field label="Start">
            <input className="input" value={editing.start_date ?? ''} placeholder="2022-06"
              onChange={(e) => setEditing({ ...editing, start_date: e.target.value })} />
          </Field>
          <Field label="End">
            <input className="input" value={editing.end_date ?? ''} placeholder="2024-01"
              onChange={(e) => setEditing({ ...editing, end_date: e.target.value })}
              disabled={editing.is_current} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={editing.is_current}
            onChange={(e) => setEditing({ ...editing, is_current: e.target.checked })} />
          Current
        </label>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>Cancel</Button>
          <Button className="flex-1" onClick={save}>Save</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {experiences.map((exp) => (
        <div key={exp.id} className="flex justify-between items-start border border-gray-200 rounded-lg p-3">
          <div>
            <p className="text-sm font-medium text-gray-800">{exp.title}</p>
            <p className="text-xs text-gray-500">{exp.organization} · {exp.type}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing({ ...exp })} className="text-xs text-blue-600 hover:underline">Edit</button>
            <button onClick={() => onDelete(exp.id)} className="text-xs text-red-500 hover:underline">Delete</button>
          </div>
        </div>
      ))}
      <Button variant="outline" className="w-full" onClick={() => setEditing(emptyExp())}>
        + Add Experience
      </Button>
    </div>
  );
}

// ── Skills Bank ───────────────────────────────────────────────────────────────

function SkillsBank({
  skills, userId, onAdd, onDelete,
}: {
  skills: Skill[];
  userId: string;
  onAdd: (d: Omit<Skill, 'id' | 'created_at'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Technical');
  const [proficiency, setProficiency] = useState<Skill['proficiency']>('intermediate');

  const add = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await onAdd({ name: trimmed, category, proficiency, user_id: userId });
    setName('');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input className="input flex-1" value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Skill name" />
        <input className="input w-24" value={category}
          onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
        <select className="input w-28" value={proficiency}
          onChange={(e) => setProficiency(e.target.value as Skill['proficiency'])}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="expert">Expert</option>
        </select>
        <Button onClick={add} className="shrink-0">Add</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((sk) => (
          <span key={sk.id} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
            {sk.name}
            <span className="text-blue-400">· {sk.proficiency}</span>
            <button onClick={() => onDelete(sk.id)} className="ml-1 text-blue-400 hover:text-red-500">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}
