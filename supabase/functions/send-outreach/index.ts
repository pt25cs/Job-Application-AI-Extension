import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { outreachId } = await req.json() as { outreachId: string };

    const resendKey = Deno.env.get('RESEND_API_KEY') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Fetch outreach record
    const { data: outreach, error: oErr } = await supabase
      .from('outreach')
      .select('*, contacts(*)')
      .eq('id', outreachId)
      .single();
    if (oErr || !outreach) throw new Error('Outreach not found');

    const userId = outreach.user_id;

    // Check daily rate limit (max 20 per user per day)
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('outreach')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'sent')
      .gte('sent_at', dayStart.toISOString());

    if ((count ?? 0) >= 20) {
      return new Response(
        JSON.stringify({ error: 'Daily outreach limit of 20 emails reached' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Fetch user profile for sender email
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .maybeSingle();

    const contact = outreach.contacts as Record<string, string> | null;
    const toEmail = contact?.email;
    if (!toEmail) throw new Error('Contact has no email');

    // Update status to sending
    await supabase
      .from('outreach')
      .update({ status: 'sending', updated_at: new Date().toISOString() })
      .eq('id', outreachId);

    // Send via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: profile?.email ?? 'noreply@autoapply.app',
        to: [toEmail],
        subject: outreach.email_subject,
        text: outreach.email_body,
        html: outreach.email_html ?? `<p>${outreach.email_body?.replace(/\n/g, '<br>')}</p>`,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      // Check for bounce
      if (resendRes.status === 422) {
        await supabase
          .from('outreach')
          .update({ status: 'bounced', updated_at: new Date().toISOString() })
          .eq('id', outreachId);
        throw new Error(`Email bounced: ${errText}`);
      }
      throw new Error(`Resend error: ${resendRes.status} ${errText}`);
    }

    const resendJson = await resendRes.json() as { id: string };
    const sentAt = new Date().toISOString();
    const followUpAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

    await supabase
      .from('outreach')
      .update({
        status: 'sent',
        sent_at: sentAt,
        follow_up_at: followUpAt,
        resend_message_id: resendJson.id,
        updated_at: sentAt,
      })
      .eq('id', outreachId);

    return new Response(
      JSON.stringify({ resend_message_id: resendJson.id, sent_at: sentAt, follow_up_at: followUpAt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
