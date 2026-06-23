import type { ATSScoreBreakdown } from '@/types/optimization';

interface ScoreBreakdownProps {
  score: ATSScoreBreakdown;
}

const CATEGORIES = [
  { key: 'keywordMatch' as const,        label: 'Keyword Match',        weight: '40%' },
  { key: 'experienceRelevance' as const, label: 'Experience Relevance', weight: '25%' },
  { key: 'skillsAlignment' as const,     label: 'Skills Alignment',     weight: '20%' },
  { key: 'quantification' as const,      label: 'Quantification',       weight: '15%' },
];

function scoreColor(value: number): string {
  if (value >= 80) return 'bg-green-500';
  if (value >= 60) return 'bg-yellow-400';
  return 'bg-red-400';
}

export function ScoreBreakdown({ score }: ScoreBreakdownProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700">ATS Score Breakdown</span>
        <span className={`text-lg font-bold ${score.total >= 85 ? 'text-green-600' : score.total >= 65 ? 'text-yellow-500' : 'text-red-500'}`}>
          {score.total}
        </span>
      </div>

      <div className="space-y-2">
        {CATEGORIES.map(({ key, label, weight }) => {
          const value = score[key];
          return (
            <div key={key}>
              <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                <span>{label}</span>
                <span className="text-gray-400">{weight} · <span className="font-medium text-gray-700">{value}</span></span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${scoreColor(value)}`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
