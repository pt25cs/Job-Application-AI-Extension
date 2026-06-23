import { create } from 'zustand';

export interface ApplicationSummary {
  id: string;
  user_id: string;
  company: string;
  role: string;
  job_url: string;
  job_description: string | null;
  platform: string;
  ats_score: number | null;
  status: string;
  auto_filled: boolean;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
  outreach_count: number;
}

export interface DashboardFilters {
  status: string;
  company: string;
  dateFrom: string;
  dateTo: string;
}

export type SortField = 'date' | 'ats_score' | 'company';

interface DashboardStore {
  applications: ApplicationSummary[];
  filters: DashboardFilters;
  sortBy: SortField;
  isLoading: boolean;
  setApplications: (apps: ApplicationSummary[]) => void;
  updateApplication: (id: string, patch: Partial<ApplicationSummary>) => void;
  setFilters: (f: Partial<DashboardFilters>) => void;
  setSortBy: (s: SortField) => void;
  setLoading: (v: boolean) => void;
}

const defaultFilters: DashboardFilters = { status: '', company: '', dateFrom: '', dateTo: '' };

export const useDashboardStore = create<DashboardStore>((set) => ({
  applications: [],
  filters: defaultFilters,
  sortBy: 'date',
  isLoading: false,
  setApplications: (applications) => set({ applications }),
  updateApplication: (id, patch) =>
    set((s) => ({
      applications: s.applications.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    })),
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  setSortBy: (sortBy) => set({ sortBy }),
  setLoading: (v) => set({ isLoading: v }),
}));
