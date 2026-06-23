import { useState, useEffect } from 'react';
import type { ApplicationSummary } from '@/stores/dashboardStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import { updateApplicationStatus } from '@/lib/dashboard';
import { fetchOutreach } from '@/lib/outreach';
import { useAuthStore } from '@/stores/authStore';
import type { Outreach } from '@/types/outreach';

const STATUSES = ['detected', 'optimizing', 'ready', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn'];

interface Props {
  app: ApplicationSummary;
  onClose: () => void;
}

export function ApplicationDetail({ app, onClose }: Props) {
  const { user } = useAuthStore();
  const { updateApplication } = useDashboardStore();
  const [tab, setTab] = useState<'overview' | 'outreach'>('overview');
  const [outreachItems, setOutreachItems] = useState<Outreach[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchOutreach(user.id, app.id).then(setOutreachItems).catch(console.error);
  }, [user?.id, app.id]);

  async function handleStatusChange(status: string) {
    setUpdatingStatus(true);
    try {
      await updateApplicationStatus(app.id, status);
      updateApplication(app.id, { status });
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div>
          <p className="font-semibold text-sm text-gray-900">{app.company}</p>
          <p className="text-xs text-gray-500">{app.role}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
      </div>

      <div className="flex border-b border-gray-200">
        {(['overview', 'outreach'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 text-xs py-2 font-medium capitalize ${tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {tab === 'overview' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">ATS Score:</span>
              <span className="text-sm font-semibold text-gray-800">{app.ats_score != null ? `${app.ats_score}%` : '—'}</span>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Update Status</p>
              <div className="flex flex-wrap gap-1">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={updatingStatus || app.status === s}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      app.status === s
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-200 text-gray-600 hover:border-blue-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {app.job_description && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Job Description</p>
                <p className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-10">{app.job_description}</p>
              </div>
            )}
          </div>
        )}

        {tab === 'outreach' && (
          <div className="flex flex-col gap-2">
            {outreachItems.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">No outreach for this application.</p>
            )}
            {outreachItems.map((o) => (
              <div key={o.id} className="border border-gray-200 rounded p-2">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-medium text-gray-700">{o.email_subject ?? '(no subject)'}</p>
                  <span className="text-xs text-gray-400">{o.status}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{o.email_body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
