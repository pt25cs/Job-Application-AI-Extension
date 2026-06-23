import { supabase } from '@/lib/supabase';
import type { Outreach, OutreachDraftRequest, OutreachDraftResponse, OutreachStatus } from '@/types/outreach';

async function invokeEdgeFunction<T>(name: string, body: unknown): Promise<T> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

  const res = await fetch(`${supabaseUrl}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': anonKey,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((json as { error?: string }).error ?? `Edge Function error ${res.status}`);
  }
  return json as T;
}

export async function draftOutreach(req: OutreachDraftRequest): Promise<OutreachDraftResponse> {
  return invokeEdgeFunction<OutreachDraftResponse>('draft-outreach', req);
}

export async function sendOutreach(outreachId: string): Promise<{ resend_message_id: string }> {
  return invokeEdgeFunction<{ resend_message_id: string }>('send-outreach', { outreachId });
}

export async function fetchOutreach(userId: string, applicationId?: string): Promise<Outreach[]> {
  let query = supabase
    .from('outreach')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (applicationId) {
    query = query.eq('application_id', applicationId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Outreach[];
}

export async function updateOutreachStatus(id: string, status: OutreachStatus): Promise<void> {
  const { error } = await supabase
    .from('outreach')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updateOutreachBody(id: string, subject: string, body: string): Promise<void> {
  const { error } = await supabase
    .from('outreach')
    .update({ email_subject: subject, email_body: body, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}
