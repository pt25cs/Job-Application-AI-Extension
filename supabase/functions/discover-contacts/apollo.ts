export interface ApolloContact {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  title: string;
  organization_name: string;
  linkedin_url: string | null;
  seniority: string | null;
  departments: string[] | null;
}

export async function searchApollo(company: string, apiKey: string): Promise<ApolloContact[]> {
  const body = {
    api_key: apiKey,
    q_organization_name: company,
    person_titles: ['recruiter', 'talent acquisition', 'hiring manager', 'engineering manager', 'hr manager'],
    per_page: 20,
    page: 1,
  };

  const res = await fetch('https://api.apollo.io/v1/mixed_people/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Apollo API error: ${res.status} ${await res.text()}`);
  }

  const json = await res.json() as { people?: ApolloContact[] };
  return (json.people ?? []).filter((p) => p.linkedin_url);
}
