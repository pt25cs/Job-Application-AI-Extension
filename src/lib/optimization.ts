import { supabase } from '@/lib/supabase';
import type { ATSOptimizationRequest, ATSOptimizationResponse, ATSIteration } from '@/types/optimization';
import { useOptimizationStore } from '@/stores/optimizationStore';

export async function startOptimization(
  request: ATSOptimizationRequest,
): Promise<ATSOptimizationResponse> {
  const store = useOptimizationStore.getState();
  store.start(request.maxIterations ?? 3);

  // Subscribe to Realtime progress
  const channelName = `optimization:${request.userId}:${request.applicationId}`;
  const channel = supabase.channel(channelName);

  channel.on('broadcast', { event: 'progress' }, ({ payload }) => {
    if (payload.type === 'iteration') {
      store.updateIteration(payload.iteration as ATSIteration);
    }
  });

  await channel.subscribe();

  try {
    // Explicitly get the current session token — chrome.storage adapter may not
    // have hydrated the in-memory session by the time functions.invoke is called
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

    // Use raw fetch to get the actual error body on non-2xx responses
    const res = await fetch(`${supabaseUrl}/functions/v1/optimize-resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(request),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = (json as { error?: string }).error ?? `Edge Function error ${res.status}`;
      throw new Error(msg);
    }

    const data = json as ATSOptimizationResponse;
    if (!data) throw new Error('No response from optimization function');

    store.setFinalResult(data);
    return data;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    store.setError(msg);
    throw err;
  } finally {
    await supabase.removeChannel(channel);
  }
}

/** Upsert an application record when a job is detected. */
export async function upsertApplication(params: {
  userId: string;
  company: string;
  role: string;
  jobUrl: string;
  jobDescription: string | null;
  platform: string;
}): Promise<string | null> {
  // Ensure we have a non-empty URL to use as the unique key
  const jobUrl = params.jobUrl?.trim() || `unknown-${params.userId}-${Date.now()}`;

  const { data, error } = await supabase
    .from('applications')
    .upsert(
      {
        user_id: params.userId,
        company: params.company,
        role: params.role,
        job_url: jobUrl,
        job_description: params.jobDescription,
        platform: params.platform,
        status: 'detected',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,job_url' },
    )
    .select('id')
    .single();

  if (error) {
    console.error('upsertApplication:', error);
    // Fallback: try to fetch existing row by user_id + job_url
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', params.userId)
      .eq('job_url', jobUrl)
      .single();
    return existing?.id ?? null;
  }
  return data?.id ?? null;
}
