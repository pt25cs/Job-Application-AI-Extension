import { create } from 'zustand';
import type { UserSettings, UserSettingsUpdate } from '@/types/settings';

interface SettingsStore {
  settings: UserSettings | null;
  isLoading: boolean;
  setSettings: (s: UserSettings) => void;
  patchSettings: (patch: UserSettingsUpdate) => void;
  setLoading: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,
  isLoading: false,
  setSettings: (settings) => set({ settings }),
  patchSettings: (patch) =>
    set((s) => ({ settings: s.settings ? { ...s.settings, ...patch } : s.settings })),
  setLoading: (v) => set({ isLoading: v }),
}));
