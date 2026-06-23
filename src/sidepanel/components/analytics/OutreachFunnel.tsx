import type { FunnelStage } from '@/types/analytics';

interface Props {
  data: FunnelStage[];
}

const STAGE_COLORS: Record<string, string> = {
  drafted: '#e5e7eb',
  approved: '#bfdbfe',
  sent: '#93c5fd',
  follow_up_sent: '#818cf8',
  replied: '#34d399',
  bounced: '#fca5a5',
};

export function OutreachFunnel({ data }: Props) {
  if (!data.length) return <p className="text-xs text-gray-400 text-center py-4">No outreach data yet.</p>;

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div>
      <p className="text-xs font-medium text-gray-600 mb-2">Outreach Funnel</p>
      <div className="flex flex-col gap-1">
        {data.map((stage, i) => {
          const pct = (stage.count / maxCount) * 100;
          const marginPct = ((100 - pct) / 2);
          return (
            <div key={stage.status} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-24 shrink-0 capitalize">{stage.status.replace(/_/g, ' ')}</span>
              <div className="flex-1 flex justify-center">
                <div
                  className="h-5 rounded flex items-center justify-center text-xs font-medium text-gray-700"
                  style={{
                    width: `${pct}%`,
                    minWidth: 24,
                    marginLeft: `${marginPct}%`,
                    backgroundColor: STAGE_COLORS[stage.status] ?? '#e5e7eb',
                  }}
                >
                  {stage.count}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
