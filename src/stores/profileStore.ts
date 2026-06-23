import { create } from 'zustand';
import type { ProfileData, Experience, Skill, Resume } from '@/types/profile';
import {
  fetchProfile,
  updateProfile,
  fetchExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
  fetchSkills,
  upsertSkill,
  deleteSkill,
  fetchResumes,
} from '@/lib/profile';

interface ProfileStore {
  profile: ProfileData | null;
  experiences: Experience[];
  skills: Skill[];
  resumes: Resume[];
  isLoading: boolean;
  error: string | null;

  loadProfile: (userId: string) => Promise<void>;
  saveProfile: (userId: string, data: Partial<ProfileData>) => Promise<void>;

  loadExperiences: (userId: string) => Promise<void>;
  addExperience: (data: Omit<Experience, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  editExperience: (id: string, data: Partial<Experience>) => Promise<void>;
  removeExperience: (id: string) => Promise<void>;

  loadSkills: (userId: string) => Promise<void>;
  addSkill: (data: Omit<Skill, 'id' | 'created_at'>) => Promise<void>;
  removeSkill: (id: string) => Promise<void>;

  loadResumes: (userId: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  experiences: [],
  skills: [],
  resumes: [],
  isLoading: false,
  error: null,

  setError: (error) => set({ error }),

  loadProfile: async (userId) => {
    set({ isLoading: true, error: null });
    const profile = await fetchProfile(userId);
    if (!profile) {
      set({ isLoading: false, error: 'Failed to load profile' });
      return;
    }
    set({ profile, isLoading: false });
  },

  saveProfile: async (userId, data) => {
    set({ isLoading: true, error: null });
    const updated = await updateProfile(userId, data);
    if (!updated) {
      set({ isLoading: false, error: 'Failed to save profile' });
      return;
    }
    set({ profile: updated, isLoading: false });
  },

  loadExperiences: async (userId) => {
    const experiences = await fetchExperiences(userId);
    set({ experiences });
  },

  addExperience: async (data) => {
    const created = await createExperience(data);
    if (!created) { set({ error: 'Failed to add experience' }); return; }
    set((s) => ({ experiences: [...s.experiences, created] }));
  },

  editExperience: async (id, data) => {
    const updated = await updateExperience(id, data);
    if (!updated) { set({ error: 'Failed to update experience' }); return; }
    set((s) => ({
      experiences: s.experiences.map((e) => (e.id === id ? updated : e)),
    }));
  },

  removeExperience: async (id) => {
    const ok = await deleteExperience(id);
    if (!ok) { set({ error: 'Failed to delete experience' }); return; }
    set((s) => ({ experiences: s.experiences.filter((e) => e.id !== id) }));
  },

  loadSkills: async (userId) => {
    const skills = await fetchSkills(userId);
    set({ skills });
  },

  addSkill: async (data) => {
    const created = await upsertSkill(data);
    if (!created) { set({ error: 'Failed to add skill' }); return; }
    set((s) => {
      const existing = s.skills.find((sk) => sk.name === created.name && sk.user_id === created.user_id);
      if (existing) {
        return { skills: s.skills.map((sk) => (sk.id === existing.id ? created : sk)) };
      }
      return { skills: [...s.skills, created] };
    });
  },

  removeSkill: async (id) => {
    const ok = await deleteSkill(id);
    if (!ok) { set({ error: 'Failed to delete skill' }); return; }
    set((s) => ({ skills: s.skills.filter((sk) => sk.id !== id) }));
  },

  loadResumes: async (userId) => {
    const resumes = await fetchResumes(userId);
    set({ resumes });
  },
}));
