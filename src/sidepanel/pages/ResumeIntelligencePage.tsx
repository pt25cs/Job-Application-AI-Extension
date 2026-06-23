import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { fetchDashboardData } from '@/lib/dashboard';
import { fetchExperiences } from '@/lib/profile';
import {
  aggregateKeywordTrends,
  analyzeJobFit,
  fetchJobFitInsights,
  getPayload,
} from '@/lib/jobFit';
import { fetchAnalyticsSummary } from '@/lib/analytics';
import type { ApplicationSummary } from '@/stores/dashboardStore';
import type { Experience } from '@/types/profile';
import type { JobFitInsightRow, JobFitPayload } from '@/types/jobFit';

export function ResumeIntelligencePage() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [insights, setInsights] = useState<JobFitInsightRow[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [totalAppsStat, setTotalAppsStat] = useState<number | null>(null);
  const [avgAts, setAvgAts] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string>('');

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [apps, ins, ex, summary] = await Promise.all([
        fetchDashboardData(user.id),
        fetchJobFitInsights(user.id),
        fetchExperiences(user.id),
        fetchAnalyticsSummary(user.id),
      ]);
      setApplications(apps);
      setInsights(ins);
      setExperiences(ex);
      setTotalAppsStat(summary.totalApplications);
      setAvgAts(summary.averageAtsScore);
      setSelectedAppId((prev) => {
        if (prev && apps.some((a) => a.id === prev)) return prev;
        return apps[0]?.id ?? '';
      });
    } catch (e) {
      console.error(e);
      setError('Could not load data. Check Supabase and migration 005.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const insightForSelected = useMemo(
    () => insights.find((i) => i.application_id === selectedAppId),
    [insights, selectedAppId],
  );

  const payload: JobFitPayload | null = getPayload(insightForSelected);

  const expById = useMemo(() => {
    const m = new Map<string, Experience>();
    for (const e of experiences) m.set(e.id, e);
    return m;
  }, [experiences]);

  const keywordTrends = useMemo(() => aggregateKeywordTrends(insights), [insights]);

  async function handleAnalyze() {
    if (!user || !selectedAppId) return;
    setAnalyzing(true);
    setError(null);
    const res = await analyzeJobFit(user.id, selectedAppId);
    setAnalyzing(false);
    if (!res.success || !res.insight) {
      setError(res.error ?? 'Analysis failed');
      return;
    }
    setInsights((prev) => {
      const rest = prev.filter((i) => i.application_id !== selectedAppId);
      return [
        {
          id: res.insight!.id,
          user_id: user.id,
          application_id: selectedAppId,
          payload: res.insight!.payload as JobFitPayload,
          created_at: res.insight!.created_at ?? null,
          updated_at: res.insight!.updated_at ?? null,
        },
        ...rest,
      ];
    });
  }

  const selectedApp = applications.find((a) => a.id === selectedAppId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-slate-400">
        Loading intelligence…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-3 pb-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Resume intelligence</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          GPT reads each job description, ranks your CV experiences, saves recommendations, and surfaces trends across
          applications.
        </p>
      </div>

      {/* Cross-application trends */}
      <section className="rounded-xl border border-slate-200 bg-gradient-to-br from-indigo-50/80 to-white p-3 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-800">Trends (all applications)</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <TrendStat label="Roles tracked" value={totalAppsStat != null ? String(totalAppsStat) : '—'} />
          <TrendStat label="Avg ATS score" value={avgAts != null ? `${avgAts}` : '—'} />
          <TrendStat label="JD analyses saved" value={String(insights.length)} />
        </div>
        {keywordTrends.length > 0 ? (
          <div>
            <p className="text-[11px] font-medium text-slate-600 mb-1.5">Top recurring keywords (from GPT)</p>
            <div className="flex flex-wrap gap-1.5">
              {keywordTrends.map(({ keyword, count }) => (
                <span
                  key={keyword}
                  className="inline-flex items-center gap-1 rounded-full bg-white/90 border border-slate-200 px-2 py-0.5 text-[10px] text-slate-700"
                >
                  <span className="font-medium capitalize">{keyword}</span>
                  <span className="text-slate-400">×{count}</span>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500">Run an analysis below to start building keyword trends.</p>
        )}
      </section>

      {/* Per-job analysis */}
      <section className="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
        <h3 className="text-xs font-semibold text-slate-800">Analyze a job</h3>
        {applications.length === 0 ? (
          <p className="text-xs text-slate-500">Visit a job posting with the extension to create an application first.</p>
        ) : (
          <>
            <label className="block text-[11px] text-slate-500">Application</label>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs text-slate-900"
            >
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.company} — {a.role}
                </option>
              ))}
            </select>
            {selectedApp && (
              <p className="text-[10px] text-slate-400 truncate" title={selectedApp.job_url}>
                {selectedApp.job_url}
              </p>
            )}
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing || !selectedAppId}
              className="w-full rounded-lg bg-indigo-600 px-3 py-2.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {analyzing ? 'Analyzing with GPT…' : 'Run GPT job fit analysis'}
            </button>
            {error && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-2 py-2 text-[11px] text-amber-900">
                {error}
              </div>
            )}
          </>
        )}
      </section>

      {/* Results */}
      {payload && (
        <section className="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xs font-semibold text-slate-800">Recommendations (saved)</h3>
            {payload.analyzedAt && (
              <span className="text-[10px] text-slate-400">{new Date(payload.analyzedAt).toLocaleString()}</span>
            )}
          </div>

          {payload.jobSummary && (
            <div>
              <p className="text-[11px] font-medium text-slate-600 mb-1">Job summary</p>
              <p className="text-xs text-slate-800 leading-relaxed">{payload.jobSummary}</p>
            </div>
          )}

          {payload.topKeywords && payload.topKeywords.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-slate-600 mb-1">Keywords extracted from JD</p>
              <div className="flex flex-wrap gap-1">
                {payload.topKeywords.map((k) => (
                  <span key={k} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {payload.alignmentRationale && payload.alignmentRationale.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-slate-600 mb-1">Experiences that align best</p>
              <ul className="space-y-2">
                {payload.alignmentRationale.map((ar) => {
                  const ex = expById.get(ar.experienceId);
                  return (
                    <li key={ar.experienceId} className="rounded-lg border border-slate-100 bg-slate-50/80 p-2">
                      <div className="flex justify-between gap-2">
                        <span className="text-xs font-medium text-slate-900">
                          {ex ? `${ex.title} · ${ex.organization}` : ar.experienceId}
                        </span>
                        <span className="text-[10px] font-semibold text-indigo-600 shrink-0">{ar.relevanceScore}%</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">{ar.reason}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {payload.recommendations?.summary && (
            <div>
              <p className="text-[11px] font-medium text-slate-600 mb-1">Strategy</p>
              <p className="text-xs text-slate-800 leading-relaxed">{payload.recommendations.summary}</p>
            </div>
          )}

          {payload.recommendations?.experienceHighlights && payload.recommendations.experienceHighlights.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-slate-600 mb-1">Resume tips by experience</p>
              <ul className="space-y-1.5">
                {payload.recommendations.experienceHighlights.map((h) => {
                  const ex = expById.get(h.experienceId);
                  return (
                    <li key={h.experienceId} className="text-xs text-slate-700">
                      <span className="font-medium text-slate-900">{ex?.title ?? 'Experience'}: </span>
                      {h.tip}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {payload.recommendations?.skillGaps && payload.recommendations.skillGaps.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-slate-600 mb-1">Skill gaps to address</p>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5">
                {payload.recommendations.skillGaps.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </div>
          )}

          {payload.marketTrendsNote && (
            <div className="rounded-lg bg-violet-50 border border-violet-100 p-2">
              <p className="text-[11px] font-medium text-violet-900 mb-0.5">Vs your other applications</p>
              <p className="text-xs text-violet-950 leading-relaxed">{payload.marketTrendsNote}</p>
            </div>
          )}
        </section>
      )}

      {selectedAppId && !payload && !analyzing && applications.length > 0 && (
        <p className="text-center text-[11px] text-slate-400">No saved analysis for this job yet. Run GPT above.</p>
      )}
    </div>
  );
}

function TrendStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/90 border border-slate-100 py-2 px-1">
      <p className="text-[10px] text-slate-500 leading-tight">{label}</p>
      <p className="text-sm font-bold text-slate-900 mt-0.5">{value}</p>
    </div>
  );
}
