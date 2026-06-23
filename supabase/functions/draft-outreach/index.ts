import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

async function callGemini(system: string, user: string, apiKey: string): Promise<string> {
  const url = `${GEMINI_API_URL}/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ parts: [{ text: user }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1500, responseMimeType: 'application/json' },
    }),
  });
  if (!res.ok) throw new Error(`Gemini error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { userId, applicationId, contactIds } = await req.json();
    const geminiKey = Deno.env.get('GEMINI_API_KEY') ?? '';
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

    const { data: contacts, error: cErr } = await supabase.from('contacts').select('*').in('id', contactIds);
    if (cErr) throw new Error(cErr.message);

    const { data: profile } = await supabase.from('profiles').select('full_name, headline, university').eq('id', userId).maybeSingle();
    const { data: application } = await supabase.from('applications').select('company, role, job_description').eq('id', applicationId).maybeSingle();

    const drafted = [];
    for (const contact of contacts ?? []) {
      try {
        const senderName = profile?.full_name ?? 'a job seeker';
        const senderUniversity = profile?.university ?? '';
        const recipientName = contact.first_name ?? contact.full_name ?? 'there';
        const company = application?.company ?? contact.company ?? 'your company';
        const role = application?.role ?? 'a position';
        const isAlumni = contact.is_alumni === true;

        const system = 'You are a professional email writer. Respond with JSON: { "subject": string, "body": string, "follow_up_body": string }';
        const prompt = `Write a cold networking email from ${senderName}${senderUniversity ? ` (${senderUniversity} alum)` : ''} to ${recipientName}, a ${contact.title ?? 'professional'} at ${company}.${isAlumni ? ` Both attended ${senderUniversity} — mention this.` : ''} Interested in the ${role} role. Under 150 words. Ask for a 15-min coffee chat. Also write a brief follow-up for 5 days later.`;

        const raw = await callGemini(system, prompt, geminiKey);
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const content = JSON.parse(cleaned);

        const { data: outreach, error: oErr } = await supabase.from('outreach').insert({
          user_id: userId, contact_id: contact.id, application_id: applicationId,
          email_subject: content.subject, email_body: content.body,
          follow_up_body: content.follow_up_body, status: 'drafted',
        }).select().single();
        if (!oErr && outreach) drafted.push(outreach);
      } catch { /* skip failed contact */ }
    }

    return new Response(JSON.stringify({ drafted, count: drafted.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
