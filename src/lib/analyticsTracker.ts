import { supabase } from '@/lib/supabase';

export async function trackEvent(
  userId: string,
  eventType: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase.from('analytics_events').insert({
    user_id: userId,
    event_type: eventType,
    metadata: metadata ?? null,
  });
  if (error) console.error('trackEvent error:', error.message);
}
