import { supabase } from '@/lib/supabase';
import type { Contact, ContactDiscoveryRequest, ContactDiscoveryResponse } from '@/types/contacts';

export async function discoverContacts(req: ContactDiscoveryRequest): Promise<ContactDiscoveryResponse> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

  const res = await fetch(`${supabaseUrl}/functions/v1/discover-contacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': anonKey,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(req),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((json as { error?: string }).error ?? `Edge Function error ${res.status}`);
  }
  return json as ContactDiscoveryResponse;
}

export async function fetchContacts(userId: string, applicationId?: string): Promise<Contact[]> {
  let query = supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId)
    .order('is_alumni', { ascending: false })
    .order('email_confidence', { ascending: false });

  if (applicationId) {
    query = query.eq('application_id', applicationId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Contact[];
}
