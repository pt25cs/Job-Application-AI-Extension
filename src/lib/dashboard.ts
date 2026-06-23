import { supabase } from '@/lib/supabase';
import type { ApplicationSummary } from '@/stores/dashboardStore';

export async function fetchDashboardData(userId: string): Promise<ApplicationSummary[]> {
  // Fetch applications with outreach counts via a join
  const { data, error } = await supabase
    .from('applications')
    .select(`
      id, user_id, company, role, job_url, job_description, platform,
      ats_score, status, auto_filled, applied_at, created_at, updated_at,
      outreach(count)
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);

  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => {
    const outreachArr = row['outreach'] as Array<{ count: number }> | null;
    const outreach_count = outreachArr?.[0]?.count ?? 0;
    return { ...row, outreach_count } as ApplicationSummary;
  });
}

export async function updateApplicationStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}
