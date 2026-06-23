import type { ATSBucket } from '@/types/analytics';

interface Props {
  data: ATSBucket[];
}

export function ATSScoreDistribution({ data }: Props) {
  if (!data.length) return <p className="text-xs text-gray-400 text-center py-4">No ATS data yet.</p>;

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div>
      <p className="text-xs font-medium text-gray-600 mb-2">ATS Score Distribution</p>
      <div className="flex flex-col gap-1">
        {data.map((bucket) => (
          <div key={bucket.range} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-12 shrink-0">{bucket.range}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(bucket.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-4 text-right">{bucket.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
