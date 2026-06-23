import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore, type ApplicationSummary } from '@/stores/dashboardStore';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { StatusColumn } from './StatusColumn';
import { DashboardFilters } from './DashboardFilters';
import { ApplicationDetail } from './ApplicationDetail';

const STATUS_ORDER = ['detected', 'optimizing', 'ready', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn'];

export function Dashboard() {
  const { user } = useAuthStore();
  const { applications, filters, sortBy, setApplications, updateApplication } = useDashboardStore();
  const [selected, setSelected] = useState<ApplicationSummary | null>(null);
  const navigate = useNavigate();
  const profileIncomplete = user && !user.onboarding_completed;

  // Realtime: INSERT is handled in AppShell so the header updates on Apply; UPDATE keeps rows fresh here
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('dashboard:applications')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'applications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          updateApplication(payload.new.id as string, payload.new as Partial<ApplicationSummary>);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, updateApplication]);

  const filtered = useMemo(() => {
    let list = [...applications];

    if (filters.status) list = list.filter((a) => a.status === filters.status);
    if (filters.company) list = list.filter((a) => a.company.toLowerCase().includes(filters.company.toLowerCase()));
    if (filters.dateFrom) list = list.filter((a) => a.created_at >= filters.dateFrom);
    if (filters.dateTo) list = list.filter((a) => a.created_at <= filters.dateTo + 'T23:59:59');

    list.sort((a, b) => {
      if (sortBy === 'ats_score') return (b.ats_score ?? 0) - (a.ats_score ?? 0);
      if (sortBy === 'company') return a.company.localeCompare(b.company);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return list;
  }, [applications, filters, sortBy]);

  const grouped = useMemo(() => {
    const map: Record<string, ApplicationSummary[]> = {};
    for (const app of filtered) {
      if (!map[app.status]) map[app.status] = [];
      map[app.status].push(app);
    }
    return map;
  }, [filtered]);

  if (selected) {
    return (
      <div className="h-full flex flex-col">
        <ApplicationDetail app={selected} onClose={() => setSelected(null)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      {profileIncomplete && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm">
          <span className="text-blue-800">Complete your profile to enable auto-fill</span>
          <button
            onClick={() => navigate('/profile')}
            className="text-blue-600 font-medium hover:underline ml-2 shrink-0"
          >
            Set up →
          </button>
        </div>
      )}

      <DashboardFilters />

      {filtered.length === 0 && (
        <div className="text-center text-sm text-gray-400 py-8">
          <p className="text-2xl mb-2">📋</p>
          <p>No applications yet. Navigate to a job listing to get started.</p>
        </div>
      )}

      {STATUS_ORDER.filter((s) => grouped[s]?.length).map((status) => (
        <StatusColumn
          key={status}
          status={status}
          applications={grouped[status]}
          onSelect={setSelected}
        />
      ))}
    </div>
  );
}
