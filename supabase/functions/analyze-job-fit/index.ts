// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function callGemini(system: string, user: string, apiKey: string): Promise<string> {
  const url = `${GEMINI_API_URL}/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ parts: [{ text: user }] }],
      generationConfig: { temperature: 0.25, maxOutputTokens: 3500, responseMimeType: 'application/json' },
    }),
  });
  if (!res.ok) throw new Error(`Gemini error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
}

function parseJsonObject(raw: string): Record<string, unknown> {
  const trimmed = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try { return JSON.parse(trimmed); } catch {
    const m = trimmed.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Invalid JSON from model');
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not set' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: { userId: string; applicationId: string };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { userId, applicationId } = body;
  if (!userId || !applicationId) {
    return new Response(JSON.stringify({ error: 'userId and applicationId required' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: app, error: appErr } = await supabase
    .from('applications').select('id, user_id, company, role, job_description')
    .eq('id', applicationId).single();

  if (appErr || !app || app.user_id !== userId) {
    return new Response(JSON.stringify({ error: 'Application not found' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const jd = (app.job_description as string | null)?.trim() ?? '';
  if (!jd || jd.length < 40) {
    return new Response(
      JSON.stringify({ error: 'Job description is missing or too short. Open this job in a tab so the extension can capture it.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const { data: experiences, error: exErr } = await supabase
    .from('experiences')
    .select('id, type, title, organization, location, start_date, end_date, is_current, bullets, skills, sort_order')
    .eq('user_id', userId).order('sort_order', { ascending: true });

  if (exErr) {
    return new Response(JSON.stringify({ error: exErr.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: otherApps } = await supabase
    .from('applications').select('role, company, ats_score, status')
    .eq('user_id', userId).neq('id', applicationId)
    .order('updated_at', { ascending: false }).limit(12);

  const system = `You are an expert technical recruiter and resume strategist.
Return ONLY valid JSON with this shape:
{
  "jobSummary": string (2-4 sentences),
  "topKeywords": string[] (8-15 concrete skills/tools/topics from the JD),
  "alignedExperienceIds": string[] (UUIDs from the input experiences, best match first, max 6),
  "alignmentRationale": [{ "experienceId": string, "relevanceScore": number (0-100), "reason": string }],
  "recommendations": {
    "summary": string (one paragraph tailoring strategy),
    "experienceHighlights": [{ "experienceId": string, "tip": string }],
    "skillGaps": string[]
  },
  "marketTrendsNote": string (1-3 sentences comparing this role to the user's other applications)
}
Rules: Only use experience IDs that exist in the input. Be honest about gaps.`;

  const userPrompt = `JOB: ${app.role} at ${app.company}\n\nJOB DESCRIPTION:\n${jd}\n\nUSER EXPERIENCES:\n${JSON.stringify(experiences ?? [])}\n\nOTHER APPLICATIONS:\n${JSON.stringify(otherApps ?? [])}`;

  let payload: Record<string, unknown>;
  try {
    const raw = await callGemini(system, userPrompt, GEMINI_API_KEY);
    payload = parseJsonObject(raw);
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  payload.jobMeta = { company: app.company, role: app.role, applicationId };
  payload.analyzedAt = new Date().toISOString();

  const { data: saved, error: upErr } = await supabase
    .from('job_fit_insights')
    .upsert({ user_id: userId, application_id: applicationId, payload, updated_at: new Date().toISOString() }, { onConflict: 'application_id' })
    .select('id, payload, created_at, updated_at').single();

  if (upErr) {
    return new Response(JSON.stringify({ error: upErr.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true, insight: saved }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
