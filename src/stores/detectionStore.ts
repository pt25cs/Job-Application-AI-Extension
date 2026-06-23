import { create } from 'zustand';
import type { JobDetectionResult } from '@/types/platform';

interface DetectionStore {
  result: JobDetectionResult | null;
  isDetecting: boolean;
  setResult: (result: JobDetectionResult | null) => void;
  setDetecting: (detecting: boolean) => void;
  reset: () => void;
}

export const useDetectionStore = create<DetectionStore>((set) => ({
  result: null,
  isDetecting: false,
  setResult: (result) => set({ result, isDetecting: false }),
  setDetecting: (isDetecting) => set({ isDetecting }),
  reset: () => set({ result: null, isDetecting: false }),
}));
