// Replaced Proxycurl (shut down Jan 2025) with LinkdAPI — drop-in replacement
// Docs: https://linkdapi.com/docs
import { isAlumni } from './alumni.ts';

export interface LinkdAPIEducation {
  school: string | null;
  degree: string | null;
  field_of_study: string | null;
}

export interface LinkdAPIProfile {
  education: LinkdAPIEducation[];
}

export async function getLinkedInProfile(
  linkedinUrl: string,
  apiKey: string,
): Promise<LinkdAPIProfile | null> {
  // LinkdAPI accepts a LinkedIn profile URL and returns structured profile data
  const url = new URL('https://api.linkdapi.com/v1/profile');
  url.searchParams.set('linkedin_url', linkedinUrl);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) return null;
  return res.json() as Promise<LinkdAPIProfile>;
}

export async function enrichWithAlumniStatus(
  contacts: Array<{ linkedin_url: string | null; [key: string]: unknown }>,
  userUniversity: string,
  apiKey: string,
): Promise<Array<{ is_alumni: boolean; university: string | null; [key: string]: unknown }>> {
  const results = [];
  const limit = Math.min(contacts.length, 10);

  for (let i = 0; i < limit; i++) {
    const contact = contacts[i];
    let alumni = false;
    let university: string | null = null;

    if (contact.linkedin_url) {
      try {
        const profile = await getLinkedInProfile(contact.linkedin_url as string, apiKey);
        if (profile?.education?.length) {
          for (const edu of profile.education) {
            const schoolName = edu.school ?? null;
            if (schoolName && isAlumni(schoolName, userUniversity)) {
              alumni = true;
              university = schoolName;
              break;
            }
          }
        }
      } catch {
        // skip on error
      }
    }

    results.push({ ...contact, is_alumni: alumni, university });
  }

  // Contacts beyond limit get no alumni enrichment
  for (let i = limit; i < contacts.length; i++) {
    results.push({ ...contacts[i], is_alumni: false, university: null });
  }

  return results;
}
