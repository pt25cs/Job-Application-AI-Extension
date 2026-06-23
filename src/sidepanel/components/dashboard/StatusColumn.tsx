import type { ApplicationSummary } from '@/stores/dashboardStore';
import { ApplicationCard } from './ApplicationCard';

interface Props {
  status: string;
  applications: ApplicationSummary[];
  onSelect: (app: ApplicationSummary) => void;
}

const STATUS_LABELS: Record<string, string> = {
  detected: 'Detected',
  optimizing: 'Optimizing',
  ready: 'Ready',
  applied: 'Applied',
  interviewing: 'Interviewing',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export function StatusColumn({ status, applications, onSelect }: Props) {
  if (applications.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {STATUS_LABELS[status] ?? status}
        </h4>
        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
          {applications.length}
        </span>
      </div>
      {applications.map((app) => (
        <ApplicationCard key={app.id} app={app} onClick={onSelect} />
      ))}
    </div>
  );
}
