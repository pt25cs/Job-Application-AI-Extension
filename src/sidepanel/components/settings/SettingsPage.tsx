import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { fetchSettings, updateSettings } from '@/lib/settings';
import { RateLimitDashboard } from './RateLimitDashboard';
import type { UserSettingsUpdate } from '@/types/settings';

export function SettingsPage() {
  const { user } = useAuthStore();
  const { settings, setSettings, patchSettings } = useSettingsStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchSettings(user.id).then(setSettings).catch(console.error);
  }, [user?.id]);

  function handleChange(patch: UserSettingsUpdate) {
    patchSettings(patch);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!user) return;
      try {
        const updated = await updateSettings(user.id, patch);
        setSettings(updated);
      } catch (err) {
        console.error('Settings save error:', err);
      }
    }, 500);
  }

  if (!settings) {
    return <div className="flex items-center justify-center h-32 text-sm text-gray-400">Loading settings…</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-3">
      <h2 className="text-sm font-semibold text-gray-800">Settings</h2>

      <RateLimitDashboard />

      <Section title="Optimization">
        <NumberField
          label="ATS Target Score"
          value={settings.ats_target_score}
          min={0} max={100}
          onChange={(v) => handleChange({ ats_target_score: v })}
        />
        <NumberField
          label="Max Optimization Iterations"
          value={settings.max_optimization_iterations}
          min={1} max={10}
          onChange={(v) => handleChange({ max_optimization_iterations: v })}
        />
        <Toggle
          label="Auto-optimize on detect"
          value={settings.auto_optimize_on_detect}
          onChange={(v) => handleChange({ auto_optimize_on_detect: v })}
        />
      </Section>

      <Section title="Outreach">
        <NumberField
          label="Daily Outreach Limit"
          value={settings.daily_outreach_limit}
          min={1} max={100}
          onChange={(v) => handleChange({ daily_outreach_limit: v })}
        />
        <Toggle
          label="Auto-discover contacts"
          value={settings.auto_discover_contacts}
          onChange={(v) => handleChange({ auto_discover_contacts: v })}
        />
      </Section>

      <Section title="Preferences">
        <Toggle
          label="Notifications enabled"
          value={settings.notifications_enabled}
          onChange={(v) => handleChange({ notifications_enabled: v })}
        />
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-600">Theme</label>
          <select
            className="text-xs border border-gray-200 rounded px-2 py-1"
            value={settings.theme}
            onChange={(e) => handleChange({ theme: e.target.value as 'light' | 'dark' })}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white flex flex-col gap-3">
      <p className="text-xs font-semibold text-gray-700">{title}</p>
      {children}
    </div>
  );
}

function NumberField({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs text-gray-600">{label}</label>
      <input
        type="number"
        min={min} max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-16 text-xs border border-gray-200 rounded px-2 py-1 text-right"
      />
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs text-gray-600">{label}</label>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-9 h-5 rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-200'}`}
        role="switch"
        aria-checked={value}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-4' : ''}`}
        />
      </button>
    </div>
  );
}
