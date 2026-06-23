import { create } from 'zustand';

interface AppState {
  initialized: boolean;
  setInitialized: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  initialized: false,
  setInitialized: (value) => set({ initialized: value }),
}));

export { useDetectionStore } from './detectionStore';
export { useOptimizationStore } from './optimizationStore';
export { useAuthStore } from './authStore';
export { useProfileStore } from './profileStore';
