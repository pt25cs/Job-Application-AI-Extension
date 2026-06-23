import { supabase } from '@/lib/supabase';
import type { ProfileData, Experience, Skill, Resume } from '@/types/profile';

// ── Profile ──────────────────────────────────────────────────────────────────

export async function fetchProfile(userId: string): Promise<ProfileData | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) { console.error('fetchProfile:', error); return null; }
  return data as ProfileData;
}

export async function updateProfile(
  userId: string,
  updates: Partial<ProfileData>,
): Promise<ProfileData | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) { console.error('updateProfile:', error); return null; }
  return data as ProfileData;
}

// ── Experiences ───────────────────────────────────────────────────────────────

export async function fetchExperiences(userId: string): Promise<Experience[]> {
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });
  if (error) { console.error('fetchExperiences:', error); return []; }
  return (data ?? []) as Experience[];
}

export async function createExperience(
  exp: Omit<Experience, 'id' | 'created_at' | 'updated_at'>,
): Promise<Experience | null> {
  const { data, error } = await supabase
    .from('experiences')
    .insert(exp)
    .select()
    .single();
  if (error) { console.error('createExperience:', error); return null; }
  return data as Experience;
}

export async function updateExperience(
  id: string,
  updates: Partial<Experience>,
): Promise<Experience | null> {
  const { data, error } = await supabase
    .from('experiences')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('updateExperience:', error); return null; }
  return data as Experience;
}

export async function deleteExperience(id: string): Promise<boolean> {
  const { error } = await supabase.from('experiences').delete().eq('id', id);
  if (error) { console.error('deleteExperience:', error); return false; }
  return true;
}

// ── Skills ────────────────────────────────────────────────────────────────────

export async function fetchSkills(userId: string): Promise<Skill[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('user_id', userId)
    .order('category', { ascending: true });
  if (error) { console.error('fetchSkills:', error); return []; }
  return (data ?? []) as Skill[];
}

export async function upsertSkill(
  skill: Omit<Skill, 'id' | 'created_at'>,
): Promise<Skill | null> {
  const { data, error } = await supabase
    .from('skills')
    .upsert(skill, { onConflict: 'user_id,name' })
    .select()
    .single();
  if (error) { console.error('upsertSkill:', error); return null; }
  return data as Skill;
}

export async function deleteSkill(id: string): Promise<boolean> {
  const { error } = await supabase.from('skills').delete().eq('id', id);
  if (error) { console.error('deleteSkill:', error); return false; }
  return true;
}

// ── Resumes ───────────────────────────────────────────────────────────────────

export async function fetchResumes(userId: string): Promise<Resume[]> {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchResumes:', error); return []; }
  return (data ?? []) as Resume[];
}

export async function createResumeRecord(
  record: Omit<Resume, 'id' | 'created_at' | 'updated_at'>,
): Promise<Resume | null> {
  const { data, error } = await supabase
    .from('resumes')
    .insert(record)
    .select()
    .single();
  if (error) { console.error('createResumeRecord:', error); return null; }
  return data as Resume;
}

export async function uploadResume(
  userId: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<{ path: string } | null> {
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.type !== 'application/pdf') {
    console.error('uploadResume: only PDF files are supported');
    return null;
  }
  if (file.size > MAX_SIZE) {
    console.error('uploadResume: file must be under 10 MB');
    return null;
  }

  const path = `${userId}/${Date.now()}_${file.name}`;

  // Supabase Storage JS client doesn't expose upload progress natively,
  // so we simulate 0→100 around the upload call.
  onProgress?.(10);
  const { error } = await supabase.storage.from('resumes').upload(path, file, {
    contentType: 'application/pdf',
    upsert: false,
  });
  if (error) { console.error('uploadResume:', error); return null; }
  onProgress?.(100);
  return { path };
}

export function getResumeDownloadUrl(path: string): string {
  const { data } = supabase.storage.from('resumes').getPublicUrl(path);
  return data.publicUrl;
}
