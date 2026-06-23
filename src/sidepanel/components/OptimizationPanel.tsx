import { useState } from 'react';
import { useOptimizationStore } from '@/stores/optimizationStore';
import { useDetectionStore } from '@/stores/detectionStore';
import { useAuthStore } from '@/stores/authStore';
import { startOptimization } from '@/lib/optimization';
import { ScoreBreakdown } from './ScoreBreakdown';
import { ResumePreview } from './ResumePreview';
import type { StructuredResume } from '@/types/profile';

interface OptimizationPanelProps {
  baseResume?: StructuredResume | null;
  applicationId?: string | null;
}

export function OptimizationPanel({ baseResume, applicationId }: OptimizationPanelProps) {
  const { user } = useAuthStore();
  const { result: detection } = useDetectionStore();
  const {
    isOptimizing,
    currentIteration,
    maxIterations,
    latestScore,
    finalResult,
    error,
  } = useOptimizationStore();

  const [showBefore, setShowBefore] = useState(false);

  const canOptimize =
    !!user &&
    !!detection &&
    detection.platform !== 'unknown' &&
    !!baseResume &&
    !!applicationId &&
    !isOptimizing;

  async function handleOptimize() {
    if (!canOptimize || !user || !baseResume || !applicationId || !detection) return;

    await startOptimization({
      userId: user.id,
      applicationId,
      baseResume,
      experienceBank: [],
      jobDescription: detection.jobDescription ?? '',
      jobTitle: detection.jobTitle ?? '',
      company: detection.company ?? '',
    });
  }

  const progress = maxIterations > 0 ? (currentIteration / maxIterations) * 100 : 0;

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Resume Optimization</h3>
        {latestScore && (
          <span className={`text-sm font-bold px-2 py-0.5 rounded-lg ${latestScore.total >= 85 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            {latestScore.total}/100
          </span>
        )}
      </div>

      {isOptimizing && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Iteration {currentIteration} of {maxIterations}</span>
            {latestScore && <span>Score: {latestScore.total}</span>}
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 text-center animate-pulse">
            Rewriting resume bullets…
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600">
          {error}
        </div>
      )}

      {finalResult && (
        <div className="space-y-3">
          <ScoreBreakdown score={finalResult.finalScore} />

          <div className="flex gap-2">
            <button
              onClick={() => setShowBefore(false)}
              className={`flex-1 rounded-xl py-1.5 text-xs font-medium transition-all ${
                !showBefore ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Optimized
            </button>
            <button
              onClick={() => setShowBefore(true)}
              className={`flex-1 rounded-xl py-1.5 text-xs font-medium transition-all ${
                showBefore ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Original
            </button>
          </div>

          <ResumePreview
            resume={showBefore ? baseResume ?? finalResult.finalResume : finalResult.finalResume}
          />
        </div>
      )}

      {!finalResult && !isOptimizing && (
        <button
          onClick={handleOptimize}
          disabled={!canOptimize}
          className="btn-secondary w-full"
        >
          <span>✨</span>
          Optimize Resume for This Job
        </button>
      )}

      {!canOptimize && !isOptimizing && !finalResult && (
        <p className="text-xs text-center text-slate-400">
          {!detection || detection.platform === 'unknown'
            ? 'Navigate to a job page first'
            : !baseResume
            ? 'Add experience entries in your profile to enable optimization'
            : !applicationId
            ? 'Saving job to your pipeline…'
            : 'Ready to optimize'}
        </p>
      )}
    </div>
  );
}
