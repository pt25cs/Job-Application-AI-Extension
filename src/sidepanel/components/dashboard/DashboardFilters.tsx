import { useDashboardStore, type SortField } from '@/stores/dashboardStore';

const STATUSES = ['', 'detected', 'optimizing', 'ready', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn'];
const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'date', label: 'Date' },
  { value: 'ats_score', label: 'ATS Score' },
  { value: 'company', label: 'Company' },
];

export function DashboardFilters() {
  const { filters, sortBy, setFilters, setSortBy } = useDashboardStore();

  return (
    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex gap-2">
        <select
          className="flex-1 text-xs border border-gray-200 rounded px-2 py-1.5 bg-white"
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value })}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s === '' ? 'All statuses' : s}</option>
          ))}
        </select>

        <select
          className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortField)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>Sort: {o.label}</option>
          ))}
        </select>
      </div>

      <input
        type="text"
        placeholder="Filter by company…"
        className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white"
        value={filters.company}
        onChange={(e) => setFilters({ company: e.target.value })}
      />

      <div className="flex gap-2">
        <input
          type="date"
          className="flex-1 text-xs border border-gray-200 rounded px-2 py-1.5 bg-white"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ dateFrom: e.target.value })}
        />
        <input
          type="date"
          className="flex-1 text-xs border border-gray-200 rounded px-2 py-1.5 bg-white"
          value={filters.dateTo}
          onChange={(e) => setFilters({ dateTo: e.target.value })}
        />
      </div>
    </div>
  );
}
