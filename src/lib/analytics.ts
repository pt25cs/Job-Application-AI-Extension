import { supabase } from '@/lib/supabase';
import type { AnalyticsSummary, WeeklyTrend, ATSBucket, FunnelStage } from '@/types/analytics';

export async function fetchAnalyticsSummary(userId: string): Promise<AnalyticsSummary> {
  const { data: apps, error: appsErr } = await supabase
    .from('applications')
    .select('status, ats_score')
    .eq('user_id', userId);
  if (appsErr) throw new Error(appsErr.message);

  const { data: outreachData, error: outErr } = await supabase
    .from('outreach')
    .select('status')
    .eq('user_id', userId);
  if (outErr) throw new Error(outErr.message);

  const total = apps?.length ?? 0;
  const interviews = apps?.filter((a) => ['interviewing', 'offer'].includes(a.status)).length ?? 0;
  const scores = apps?.map((a) => a.ats_score).filter((s): s is number => s != null) ?? [];
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const totalOutreach = outreachData?.length ?? 0;
  const replied = outreachData?.filter((o) => o.status === 'replied').length ?? 0;
  const responseRate = totalOutreach > 0 ? Math.round((replied / totalOutreach) * 100) : 0;

  return {
    totalApplications: total,
    interviewRate: total > 0 ? Math.round((interviews / total) * 100) : 0,
    averageAtsScore: avgScore,
    outreachResponseRate: responseRate,
  };
}

export async function getWeeklyTrend(userId: string, weeks = 8): Promise<WeeklyTrend[]> {
  const { data, error } = await supabase.rpc('get_weekly_application_trend', {
    p_user_id: userId,
    p_weeks: weeks,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as WeeklyTrend[];
}

export async function getATSDistribution(userId: string): Promise<ATSBucket[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('ats_score')
    .eq('user_id', userId)
    .not('ats_score', 'is', null);
  if (error) throw new Error(error.message);

  const buckets: Record<string, number> = {};
  for (const row of data ?? []) {
    const score = row.ats_score as number;
    const low = Math.floor(score / 10) * 10;
    const key = `${low}-${low + 9}`;
    buckets[key] = (buckets[key] ?? 0) + 1;
  }

  return Object.entries(buckets)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([range, count]) => ({ range, count }));
}

export async function getOutreachFunnel(userId: string): Promise<FunnelStage[]> {
  const { data, error } = await supabase
    .from('outreach')
    .select('status')
    .eq('user_id', userId);
  if (error) throw new Error(error.message);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }

  const order = ['drafted', 'approved', 'sent', 'follow_up_sent', 'replied', 'bounced'];
  return order
    .filter((s) => counts[s] != null)
    .map((status) => ({ status, count: counts[status] }));
}
