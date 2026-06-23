import type { WeeklyTrend } from '@/types/analytics';

interface Props {
  data: WeeklyTrend[];
}

export function WeeklyTrendChart({ data }: Props) {
  if (!data.length) return <p className="text-xs text-gray-400 text-center py-4">No data yet.</p>;

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const barWidth = Math.floor(200 / data.length) - 4;

  return (
    <div>
      <p className="text-xs font-medium text-gray-600 mb-2">Applications per Week</p>
      <svg width="100%" viewBox={`0 0 ${data.length * (barWidth + 4)} 80`} className="overflow-visible">
        {data.map((d, i) => {
          const barH = Math.max((d.count / maxCount) * 60, 2);
          const x = i * (barWidth + 4);
          const y = 60 - barH;
          const label = new Date(d.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return (
            <g key={d.week_start}>
              <rect x={x} y={y} width={barWidth} height={barH} rx={2} fill="#3b82f6" />
              <text x={x + barWidth / 2} y={75} textAnchor="middle" fontSize={7} fill="#9ca3af">{label}</text>
              {d.count > 0 && (
                <text x={x + barWidth / 2} y={y - 2} textAnchor="middle" fontSize={8} fill="#374151">{d.count}</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
