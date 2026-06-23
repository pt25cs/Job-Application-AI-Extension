export interface HunterEmailResult {
  email: string | null;
  score: number;
  verified: boolean;
}

export async function findEmail(
  firstName: string,
  lastName: string,
  company: string,
  apiKey: string,
): Promise<HunterEmailResult> {
  const url = new URL('https://api.hunter.io/v2/email-finder');
  url.searchParams.set('first_name', firstName);
  url.searchParams.set('last_name', lastName);
  url.searchParams.set('company', company);
  url.searchParams.set('api_key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) return { email: null, score: 0, verified: false };

  const json = await res.json() as { data?: { email?: string; score?: number } };
  const email = json.data?.email ?? null;
  const score = json.data?.score ?? 0;

  if (!email) return { email: null, score: 0, verified: false };

  // Verify the found email
  const verified = await verifyEmail(email, apiKey);
  return { email, score, verified };
}

async function verifyEmail(email: string, apiKey: string): Promise<boolean> {
  const url = new URL('https://api.hunter.io/v2/email-verifier');
  url.searchParams.set('email', email);
  url.searchParams.set('api_key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) return false;

  const json = await res.json() as { data?: { status?: string } };
  return json.data?.status === 'valid';
}
