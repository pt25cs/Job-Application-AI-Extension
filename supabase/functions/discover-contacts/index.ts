import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { searchApollo } from './apollo.ts';
import { enrichWithAlumniStatus } from './proxycurl.ts';
import { findEmail } from './hunter.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, applicationId, company, userUniversity } = await req.json() as {
      userId: string;
      applicationId: string;
      company: string;
      userUniversity?: string;
    };

    const apolloKey = Deno.env.get('APOLLO_API_KEY') ?? '';
    const linkdapiKey = Deno.env.get('LINKDAPI_KEY') ?? '';
    const hunterKey = Deno.env.get('HUNTER_API_KEY') ?? '';

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // 1. Apollo search
    const apolloContacts = await searchApollo(company, apolloKey);

    // 2. Alumni enrichment via LinkdAPI (replaced Proxycurl which shut down Jan 2025)
    const enriched = await enrichWithAlumniStatus(
      apolloContacts.map((c) => ({
        first_name: c.first_name,
        last_name: c.last_name,
        full_name: c.name,
        title: c.title,
        company: c.organization_name,
        linkedin_url: c.linkedin_url,
        seniority: c.seniority,
        department: c.departments?.[0] ?? null,
        raw_data: c,
      })),
      userUniversity ?? '',
      linkdapiKey,
    );

    // 3. Hunter email finding
    const withEmails = await Promise.all(
      enriched.map(async (contact) => {
        try {
          const result = await findEmail(
            contact.first_name as string,
            contact.last_name as string,
            company,
            hunterKey,
          );
          return {
            ...contact,
            email: result.email,
            email_verified: result.verified,
            email_confidence: result.score,
          };
        } catch {
          return { ...contact, email: null, email_verified: false, email_confidence: 0 };
        }
      }),
    );

    // 4. Upsert into contacts table
    const rows = withEmails
      .filter((c) => c.email)
      .map((c) => ({
        user_id: userId,
        application_id: applicationId,
        full_name: c.full_name,
        first_name: c.first_name,
        last_name: c.last_name,
        title: c.title,
        company: c.company,
        email: c.email,
        email_verified: c.email_verified,
        email_confidence: c.email_confidence,
        linkedin_url: c.linkedin_url,
        is_alumni: c.is_alumni,
        university: c.university,
        seniority: c.seniority,
        department: c.department,
        source: 'apollo',
        raw_data: c.raw_data,
      }));

    const { data: upserted, error } = await supabase
      .from('contacts')
      .upsert(rows, { onConflict: 'user_id,email' })
      .select();

    if (error) throw new Error(error.message);

    const contacts = upserted ?? [];
    const verifiedCount = contacts.filter((c: { email_verified: boolean }) => c.email_verified).length;
    const alumniCount = contacts.filter((c: { is_alumni: boolean }) => c.is_alumni).length;

    return new Response(
      JSON.stringify({ contacts, totalFound: contacts.length, verifiedCount, alumniCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
