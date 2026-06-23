import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { supabase } from '@/lib/supabase';

export function RateLimitDashboard() {
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();
  const [sentToday, setSentToday] = useState(0);

  useEffect(() => {
    if (!user) return;
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);

    supabase
      .from('outreach')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'sent')
      .gte('sent_at', dayStart.toISOString())
      .then(({ count }) => setSentToday(count ?? 0));
  }, [user?.id]);

  const limit = settings?.daily_outreach_limit ?? 20;
  const remaining = Math.max(limit - sentToday, 0);
  const pct = Math.min((sentToday / limit) * 100, 100);

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      <p className="text-xs font-medium text-gray-600 mb-2">Daily Outreach Limit</p>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>{sentToday} sent today</span>
        <span>{remaining} remaining</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">Limit: {limit} emails/day</p>
    </div>
  );
}
