import { useState } from 'react';
import { useDetectionStore } from '@/stores/detectionStore';
import type { ATSPlatform } from '@/types/platform';

const PLATFORM_STYLES: Record<ATSPlatform, { bg: string; text: string; dot: string }> = {
  greenhouse: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  lever:      { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  workday:    { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  ashby:      { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
  bamboohr:   { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500' },
  icims:      { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  taleo:      { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  unknown:    { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-400' },
};

const PLATFORM_LABELS: Record<ATSPlatform, string> = {
  greenhouse: 'Greenhouse', lever: 'Lever', workday: 'Workday', ashby: 'Ashby',
  bamboohr: 'BambooHR', icims: 'iCIMS', taleo: 'Taleo', unknown: 'Unknown',
};

export function JobDetectionBanner() {
  const { result, isDetecting } = useDetectionStore();
  const [expanded, setExpanded] = useState(false);

  if (isDetecting) {
    return (
      <div className="card p-4 flex items-center gap-3">
        <div className="h-3 w-3 rounded-full bg-indigo-400 animate-pulse" />
        <span className="text-sm text-slate-500">Detecting job page…</span>
      </div>
    );
  }

  if (!result || result.platform === 'unknown') {
    return (
      <div className="card border-dashed p-4 text-center">
        <p className="text-sm text-slate-400">No job detected on this page</p>
      </div>
    );
  }

  const style = PLATFORM_STYLES[result.platform];
  const label = PLATFORM_LABELS[result.platform];

  return (
    <div className="card-elevated overflow-hidden">
      <div className="p-4 flex items-start gap-3">
        <div className={`mt-0.5 flex items-center gap-1.5 rounded-full ${style.bg} px-2.5 py-1 shrink-0`}>
          <div className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          <span className={`text-[11px] font-semibold ${style.text}`}>{label}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{result.jobTitle ?? 'Job Detected'}</p>
          {result.company && <p className="text-xs text-slate-500 truncate mt-0.5">{result.company}</p>}
          {result.location && <p className="text-[11px] text-slate-400 truncate">{result.location}</p>}
        </div>
      </div>

      {result.jobDescription && (
        <>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="w-full px-4 py-2 text-xs text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 border-t border-slate-100 text-left transition-colors font-medium"
          >
            {expanded ? '▲ Hide description' : '▼ Show description'}
          </button>
          {expanded && (
            <div className="px-4 pb-4 pt-1 text-xs text-slate-600 max-h-48 overflow-y-auto whitespace-pre-wrap border-t border-slate-100 leading-relaxed">
              {result.jobDescription}
            </div>
          )}
        </>
      )}
    </div>
  );
}
