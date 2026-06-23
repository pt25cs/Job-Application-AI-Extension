import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useDashboardStore } from '@/stores/dashboardStore';

function initialsFrom(name: string | null, email: string): string {
  const base = name?.trim() || email.split('@')[0] || '?';
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

export function ExtensionShellHeader() {
  const { user } = useAuthStore();
  const applications = useDashboardStore((s) => s.applications);
  const pipelineLoading = useDashboardStore((s) => s.isLoading);
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/onboarding' || !user) return null;

  const displayName = user.full_name?.trim() || user.email.split('@')[0];
  const initials = initialsFrom(user.full_name, user.email);
  const pipelineCount = applications.length;

  return (
    <header className="shrink-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-white">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <span className="text-sm font-bold">A</span>
            </div>
            <span className="text-sm font-bold tracking-tight">AutoApply</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Settings"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="flex w-full items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-3 py-2.5 text-left transition-all hover:bg-white/15"
        >
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="h-10 w-10 shrink-0 rounded-full border-2 border-white/30 object-cover" />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-xs text-white/60">{user.email}</p>
          </div>
          {user.onboarding_completed === false && (
            <span className="shrink-0 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-900">Setup</span>
          )}
        </button>
      </div>

      <div className="bg-white/5 px-4 py-2">
        <button
          type="button"
          onClick={() => navigate('/applications')}
          className="flex w-full items-center justify-between text-xs text-white/70 hover:text-white transition-colors"
        >
          <span>{pipelineLoading ? 'Loading pipeline…' : 'Application pipeline'}</span>
          {!pipelineLoading && (
            <span className="font-bold text-white tabular-nums">
              {pipelineCount} {pipelineCount === 1 ? 'role' : 'roles'}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
