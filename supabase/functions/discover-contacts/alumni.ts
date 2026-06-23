// University alias normalization map
const ALIASES: Record<string, string> = {
  'cmu': 'carnegie mellon university',
  'carnegie mellon': 'carnegie mellon university',
  'mit': 'massachusetts institute of technology',
  'ucb': 'university of california berkeley',
  'uc berkeley': 'university of california berkeley',
  'cal': 'university of california berkeley',
  'ucla': 'university of california los angeles',
  'usc': 'university of southern california',
  'nyu': 'new york university',
  'bu': 'boston university',
  'bc': 'boston college',
  'gt': 'georgia institute of technology',
  'gatech': 'georgia institute of technology',
  'georgia tech': 'georgia institute of technology',
  'uw': 'university of washington',
  'umich': 'university of michigan',
  'uiuc': 'university of illinois urbana-champaign',
  'purdue': 'purdue university',
  'penn': 'university of pennsylvania',
  'upenn': 'university of pennsylvania',
  'columbia': 'columbia university',
  'cornell': 'cornell university',
  'yale': 'yale university',
  'harvard': 'harvard university',
  'stanford': 'stanford university',
  'duke': 'duke university',
  'northwestern': 'northwestern university',
  'vanderbilt': 'vanderbilt university',
  'rice': 'rice university',
  'dartmouth': 'dartmouth college',
  'brown': 'brown university',
};

function normalize(name: string): string {
  const lower = name.toLowerCase().trim();
  return ALIASES[lower] ?? lower;
}

export function isAlumni(contactUniversity: string | null | undefined, userUniversity: string | null | undefined): boolean {
  if (!contactUniversity || !userUniversity) return false;
  const a = normalize(contactUniversity);
  const b = normalize(userUniversity);
  return a === b || a.includes(b) || b.includes(a);
}
