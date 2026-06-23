import { supabase } from '@/lib/supabase';
import type { JobFitInsightRow, JobFitPayload, AnalyzeJobFitResponse } from '@/types/jobFit';

export async function fetchJobFitInsights(userId: string): Promise<JobFitInsightRow[]> {
  const { data, error } = await supabase
    .from('job_fit_insights')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('fetchJobFitInsights:', error);
    return [];
  }
  return (data ?? []) as JobFitInsightRow[];
}

export async function analyzeJobFit(userId: string, applicationId: string): Promise<AnalyzeJobFitResponse> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  // Use raw fetch so we can read the actual error body on non-2xx responses
  const supabaseUrl = (supabase as unknown as { supabaseUrl: string }).supabaseUrl
    ?? import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/analyze-job-fit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ userId, applicationId }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = (json as { error?: string }).error
        ?? `Edge Function error ${res.status}`;
      return { success: false, error: msg };
    }

    return json as AnalyzeJobFitResponse;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

/** Merge keyword frequency across saved analyses for trend visualization */
export function aggregateKeywordTrends(insights: JobFitInsightRow[], limit = 12): { keyword: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const row of insights) {
    const p = row.payload as JobFitPayload;
    const kws = p.topKeywords ?? [];
    for (const k of kws) {
      const key = k.trim().toLowerCase();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getPayload(row: JobFitInsightRow | undefined): JobFitPayload | null {
  if (!row?.payload) return null;
  return row.payload as JobFitPayload;
}
