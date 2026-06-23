import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { fetchAnalyticsSummary, getWeeklyTrend, getATSDistribution, getOutreachFunnel } from '@/lib/analytics';
import type { AnalyticsSummary, WeeklyTrend, ATSBucket, FunnelStage } from '@/types/analytics';
import { WeeklyTrendChart } from './WeeklyTrendChart';
import { ATSScoreDistribution } from './ATSScoreDistribution';
import { OutreachFunnel } from './OutreachFunnel';

export function AnalyticsDashboard() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trend, setTrend] = useState<WeeklyTrend[]>([]);
  const [atsDist, setAtsDist] = useState<ATSBucket[]>([]);
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      fetchAnalyticsSummary(user.id),
      getWeeklyTrend(user.id, 8),
      getATSDistribution(user.id),
      getOutreachFunnel(user.id),
    ])
      .then(([s, t, a, f]) => {
        setSummary(s);
        setTrend(t);
        setAtsDist(a);
        setFunnel(f);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return <div className="flex items-center justify-center h-32 text-sm text-gray-400">Loading analytics…</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-3">
      <h2 className="text-sm font-semibold text-gray-800">Analytics</h2>

      {summary && (
        <div className="grid grid-cols-2 gap-2">
          <SummaryCard label="Total Applications" value={String(summary.totalApplications)} />
          <SummaryCard label="Interview Rate" value={`${summary.interviewRate}%`} />
          <SummaryCard label="Avg ATS Score" value={`${summary.averageAtsScore}%`} />
          <SummaryCard label="Response Rate" value={`${summary.outreachResponseRate}%`} />
        </div>
      )}

      <WeeklyTrendChart data={trend} />
      <ATSScoreDistribution data={atsDist} />
      <OutreachFunnel data={funnel} />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}
