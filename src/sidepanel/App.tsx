import { useEffect } from 'react';
import { MemoryRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { restoreSession } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import { supabase } from '@/lib/supabase';
import { fetchDashboardData } from '@/lib/dashboard';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { Tutorial } from './components/onboarding/Tutorial';
import { ExtensionShellHeader } from './components/ExtensionShellHeader';
import { ProfilePage } from './pages/ProfilePage';
import { Dashboard } from './components/dashboard/Dashboard';
import { DashboardPage } from './pages/DashboardPage';
import { OutreachPanel } from './components/OutreachPanel';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { SettingsPage } from './components/settings/SettingsPage';
import { ResumeIntelligencePage } from './pages/ResumeIntelligencePage';

const NAV_ITEMS = [
  { path: '/', label: 'Apply', icon: '🎯' },
  { path: '/applications', label: 'Pipeline', icon: '📋' },
  { path: '/insights', label: 'Intel', icon: '🧠' },
  { path: '/outreach', label: 'Outreach', icon: '✉️' },
  { path: '/analytics', label: 'Analytics', icon: '📊' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === '/onboarding') return null;

  return (
    <nav className="flex border-t border-slate-200/80 bg-white shrink-0 shadow-[0_-1px_3px_rgba(0,0,0,0.04)]">
      {NAV_ITEMS.map((item) => {
        const active = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex-1 flex flex-col items-center py-2.5 text-[10px] font-medium transition-all ${
              active
                ? 'text-indigo-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className={`text-lg leading-none mb-0.5 ${active ? 'scale-110' : ''} transition-transform`}>{item.icon}</span>
            <span>{item.label}</span>
            {active && <div className="mt-1 h-0.5 w-4 rounded-full bg-indigo-600" />}
          </button>
        );
      })}
    </nav>
  );
}

function AppShell() {
  const user = useAuthStore((s) => s.user);
  const setApplications = useDashboardStore((s) => s.setApplications);
  const setLoading = useDashboardStore((s) => s.setLoading);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    setLoading(true);
    fetchDashboardData(user.id)
      .then((apps) => {
        if (!cancelled) setApplications(apps);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, setApplications, setLoading]);

  // Keep pipeline count in sync when Apply tab creates a row (Pipeline may not be mounted)
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('shell-applications-insert')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'applications', filter: `user_id=eq.${user.id}` },
        () => {
          fetchDashboardData(user.id).then(setApplications).catch(console.error);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, setApplications]);

  return (
    <div className="flex flex-col h-screen">
      <Tutorial />
      <ExtensionShellHeader />
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/applications" element={<Dashboard />} />
          <Route path="/onboarding" element={<OnboardingWizard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/insights" element={<ResumeIntelligencePage />} />
          <Route path="/outreach" element={<OutreachPanel />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    restoreSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const store = useAuthStore.getState();
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          store.setSession(session);
        }
        if (event === 'SIGNED_OUT') {
          store.clearAuth();
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthGuard>
        <AppShell />
      </AuthGuard>
    </MemoryRouter>
  );
}
