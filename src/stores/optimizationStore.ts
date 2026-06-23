import { create } from 'zustand';
import type { ATSIteration, ATSOptimizationResponse, ATSScoreBreakdown } from '@/types/optimization';

interface OptimizationStore {
  isOptimizing: boolean;
  currentIteration: number;
  maxIterations: number;
  iterations: ATSIteration[];
  latestScore: ATSScoreBreakdown | null;
  finalResult: ATSOptimizationResponse | null;
  error: string | null;
  start: (maxIterations?: number) => void;
  updateIteration: (iteration: ATSIteration) => void;
  setFinalResult: (result: ATSOptimizationResponse) => void;
  setError: (error: string) => void;
  reset: () => void;
}

export const useOptimizationStore = create<OptimizationStore>((set) => ({
  isOptimizing: false,
  currentIteration: 0,
  maxIterations: 3,
  iterations: [],
  latestScore: null,
  finalResult: null,
  error: null,
  start: (maxIterations = 3) =>
    set({ isOptimizing: true, currentIteration: 0, maxIterations, iterations: [], latestScore: null, finalResult: null, error: null }),
  updateIteration: (iteration) =>
    set((s) => ({
      currentIteration: iteration.iteration,
      iterations: [...s.iterations, iteration],
      latestScore: iteration.score,
    })),
  setFinalResult: (result) =>
    set({ finalResult: result, isOptimizing: false, latestScore: result.finalScore }),
  setError: (error) => set({ error, isOptimizing: false }),
  reset: () =>
    set({ isOptimizing: false, currentIteration: 0, iterations: [], latestScore: null, finalResult: null, error: null }),
}));
