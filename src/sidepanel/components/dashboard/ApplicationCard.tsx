import type { ApplicationSummary } from '@/stores/dashboardStore';

const STATUS_COLORS: Record<string, string> = {
  detected: 'bg-gray-100 text-gray-600',
  optimizing: 'bg-yellow-100 text-yellow-700',
  ready: 'bg-blue-100 text-blue-700',
  applied: 'bg-indigo-100 text-indigo-700',
  interviewing: 'bg-purple-100 text-purple-700',
  offer: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-500',
};

const ATS_COLOR = (score: number | null) => {
  if (score == null) return 'text-gray-400';
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-500';
};

interface Props {
  app: ApplicationSummary;
  onClick: (app: ApplicationSummary) => void;
}

export function ApplicationCard({ app, onClick }: Props) {
  const statusClass = STATUS_COLORS[app.status] ?? 'bg-gray-100 text-gray-600';
  const date = new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <button
      onClick={() => onClick(app)}
      className="w-full text-left border border-gray-200 rounded-lg p-3 bg-white hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sm text-gray-900 truncate">{app.company}</p>
          <p className="text-xs text-gray-500 truncate">{app.role}</p>
        </div>
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${statusClass}`}>
          {app.status}
        </span>
      </div>

      <div className="flex items-center gap-3 mt-2 text-xs">
        <span className={`font-semibold ${ATS_COLOR(app.ats_score)}`}>
          {app.ats_score != null ? `${app.ats_score}%` : '—'}
        </span>
        <span className="text-gray-400">·</span>
        <span className="text-gray-500">{app.outreach_count} outreach</span>
        <span className="text-gray-400">·</span>
        <span className="text-gray-400">{date}</span>
      </div>
    </button>
  );
}
