import { supabase } from '@/lib/supabase';
import type { UserSettings, UserSettingsUpdate } from '@/types/settings';

const DEFAULTS: Omit<UserSettings, 'user_id' | 'created_at' | 'updated_at'> = {
  ats_target_score: 80,
  max_optimization_iterations: 3,
  daily_outreach_limit: 20,
  notifications_enabled: true,
  auto_optimize_on_detect: false,
  auto_discover_contacts: false,
  preferred_resume_template: 'default',
  theme: 'light',
};

export async function fetchSettings(userId: string): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (!data) {
    // Insert defaults
    const { data: inserted, error: insertError } = await supabase
      .from('user_settings')
      .insert({ user_id: userId, ...DEFAULTS })
      .select()
      .single();
    if (insertError) throw new Error(insertError.message);
    return inserted as UserSettings;
  }

  return data as UserSettings;
}

export async function updateSettings(userId: string, patch: UserSettingsUpdate): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, ...patch, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as UserSettings;
}
