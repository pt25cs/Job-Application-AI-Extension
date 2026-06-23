import type { FieldCategory } from '@/types/autofill';

type PatternMap = Record<FieldCategory, RegExp[]>;

export const FIELD_PATTERNS: PatternMap = {
  // ── Name ──────────────────────────────────────────────────────────────────
  first_name:          [/first[\s_-]?name/i, /given[\s_-]?name/i, /\bfname\b/i],
  last_name:           [/last[\s_-]?name/i, /family[\s_-]?name/i, /\bsurname\b/i, /\blname\b/i],
  full_name:           [/full[\s_-]?name/i, /your[\s_-]?name/i, /^name$/i, /legal[\s_-]?name/i],

  // ── Contact ───────────────────────────────────────────────────────────────
  email:               [/\be[\s_-]?mail\b/i, /email[\s_-]?address/i],
  // phone must not match "phone extension" or "country phone code"
  phone:               [
    /\bphone[\s_-]?number\b/i,
    /\bmobile[\s_-]?number\b/i,
    /\bcell[\s_-]?number\b/i,
    /\btelephone[\s_-]?number\b/i,
    /\bphone\b(?![\s_-]?(ext|extension|country|code|type))/i,
    /\bmobile\b(?![\s_-]?(country|code))/i,
    /\bcell\b/i,
    /(?<![a-z])tel(?![a-z])/i,
  ],
  phone_country_code:  [
    /country[\s_-]?(phone[\s_-]?)?code/i,
    /dialing[\s_-]?code/i,
    /country[\s_-]?dial/i,
    /intl[\s_-]?code/i,
    /country[\s_-]?prefix/i,
    /calling[\s_-]?code/i,
  ],
  phone_extension:     [/\bextension\b/i, /\bext\b/i, /phone[\s_-]?ext/i],

  // ── Address ───────────────────────────────────────────────────────────────
  // "location" only for generic location fields, not structured address
  location:            [/^location$/i, /^current[\s_-]?location$/i],
  address_line1:       [
    /address[\s_-]?line[\s_-]?1/i,
    /street[\s_-]?address/i,
    /^address[\s_-]?1$/i,
    /^address$/i,
    /mailing[\s_-]?address/i,
    /home[\s_-]?address/i,
  ],
  address_line2:       [/address[\s_-]?line[\s_-]?2/i, /\bapt\b/i, /\bsuite\b/i, /\bunit\b/i, /^address[\s_-]?2$/i],
  city:                [/^city$/i, /city[\s_-]?name/i, /\btown\b/i, /municipality/i],
  // state must not match "state of mind", "sales region", etc.
  state:               [/^state$/i, /\bprovince\b/i, /state[\s_-]?province/i, /^state[\s_-]?\//i],
  country:             [/^country$/i, /\bnation\b/i, /country[\s_-]?of[\s_-]?residence/i],
  zip:                 [/\bzip\b/i, /postal[\s_-]?code/i, /\bpostcode\b/i, /zip[\s_-]?code/i],

  // ── Social / Web ──────────────────────────────────────────────────────────
  linkedin_url:        [/linkedin/i, /linked[\s_-]?in/i],
  github_url:          [/github/i, /git[\s_-]?hub/i],
  portfolio_url:       [/portfolio/i, /personal[\s_-]?site/i, /personal[\s_-]?website/i],
  website:             [/\bwebsite\b/i, /web[\s_-]?site/i, /^url$/i, /^site$/i, /personal[\s_-]?url/i],

  // ── Work ──────────────────────────────────────────────────────────────────
  // employer/organization only when NOT in an education context
  current_company:     [
    /current[\s_-]?company/i,
    /current[\s_-]?employer/i,
    /company[\s_-]?name/i,
    /employer[\s_-]?name/i,
    /\bemployer\b(?![\s_-]?(id|ein|tax))/i,
  ],
  current_title:       [
    /current[\s_-]?title/i,
    /current[\s_-]?job[\s_-]?title/i,
    /job[\s_-]?title/i,
    /\bposition[\s_-]?title\b/i,
    /\btitle\b(?![\s_-]?(of|mr|ms|dr|prof))/i,
  ],
  years_of_experience: [
    /years[\s_-]?of[\s_-]?experience/i,
    /experience[\s_-]?years/i,
    /\byoe\b/i,
    /how[\s_-]?many[\s_-]?years/i,
    /total[\s_-]?experience/i,
    /years[\s_-]?experience/i,
  ],

  // ── Education ─────────────────────────────────────────────────────────────
  university:          [
    /\buniversity\b/i,
    /\bcollege\b/i,
    /school[\s_-]?name/i,
    /\binstitution\b/i,
    /alma[\s_-]?mater/i,
    /educational[\s_-]?institution/i,
  ],
  degree:              [
    /\bdegree\b(?![\s_-]?of)/i,
    /education[\s_-]?level/i,
    /highest[\s_-]?education/i,
    /highest[\s_-]?degree/i,
    /academic[\s_-]?degree/i,
  ],
  graduation_year:     [/graduation[\s_-]?year/i, /grad[\s_-]?year/i, /year[\s_-]?of[\s_-]?graduation/i, /expected[\s_-]?graduation/i],
  field_of_study:      [/field[\s_-]?of[\s_-]?study/i, /\bmajor\b/i, /\bconcentration\b/i, /\bdiscipline\b/i, /area[\s_-]?of[\s_-]?study/i],

  // ── Application ───────────────────────────────────────────────────────────
  cover_letter:        [/cover[\s_-]?letter/i, /covering[\s_-]?letter/i, /letter[\s_-]?of[\s_-]?motivation/i],
  salary_expectation:  [/salary[\s_-]?expect/i, /desired[\s_-]?salary/i, /expected[\s_-]?salary/i, /pay[\s_-]?expect/i, /compensation[\s_-]?expect/i],
  start_date:          [/start[\s_-]?date/i, /available[\s_-]?(to[\s_-]?)?start/i, /earliest[\s_-]?start/i, /availability[\s_-]?date/i],
  work_authorization:  [
    /work[\s_-]?auth/i,
    /authorized[\s_-]?to[\s_-]?work/i,
    /\bvisa[\s_-]?(status|type|required|sponsorship)\b/i,
    /require[\s_-]?sponsorship/i,
    /eligible[\s_-]?to[\s_-]?work/i,
    /right[\s_-]?to[\s_-]?work/i,
    /work[\s_-]?permit/i,
  ],

  // ── EEO / Compliance ──────────────────────────────────────────────────────
  // gender must not match "sexual orientation"
  gender:              [/^gender$/i, /gender[\s_-]?identity/i, /\bsex\b(?!ual)/i],
  ethnicity:           [/\bethnicity\b/i, /\brace\b(?![\s_-]?(car|track|condition))/i, /ethnic[\s_-]?background/i, /racial[\s_-]?group/i],
  veteran_status:      [/veteran[\s_-]?status/i, /\bveteran\b/i, /military[\s_-]?status/i, /armed[\s_-]?forces/i],
  disability_status:   [/disability[\s_-]?status/i, /\bdisability\b/i, /\bdisabled\b/i, /accommodation[\s_-]?request/i],
  pronouns:            [/\bpronoun/i, /preferred[\s_-]?pronoun/i],

  // ── Files ─────────────────────────────────────────────────────────────────
  resume_file:         [/\bresume\b/i, /\bcv\b/i, /curriculum[\s_-]?vitae/i, /upload[\s_-]?resume/i, /attach[\s_-]?resume/i],

  // ── Behavioural yes/no ────────────────────────────────────────────────────
  previous_employer:   [
    /previously[\s_-]?employed/i,
    /former[\s_-]?employee/i,
    /worked[\s_-]?(here|for[\s_-]?us|at[\s_-]?this)/i,
    /employed[\s_-]?with/i,
    /employment[\s_-]?with/i,
    /ever[\s_-]?work(ed)?[\s_-]?(for|at|with)/i,
    /prior[\s_-]?employ/i,
    /\brehire\b/i,
  ],

  unknown:             [],
};

/**
 * Specificity tiebreaker — more-specific categories win over generic ones
 * when raw pattern scores are equal.
 */
const SPECIFICITY: Partial<Record<FieldCategory, number>> = {
  phone_country_code: 3,
  phone_extension:    3,
  phone:              2,
  address_line1:      2,
  address_line2:      2,
  linkedin_url:       2,
  github_url:         2,
  portfolio_url:      2,
  current_company:    1,
  current_title:      1,
  previous_employer:  2,
};

/** Returns the FieldCategory with the most pattern matches for the given text signals. */
export function matchFieldToCategory(
  signals: string[],
): { category: FieldCategory; confidence: number } {
  const scores = new Map<FieldCategory, number>();
  const combined = signals.join(' ');

  for (const [category, patterns] of Object.entries(FIELD_PATTERNS) as [FieldCategory, RegExp[]][]) {
    if (category === 'unknown') continue;
    let score = 0;
    for (const pattern of patterns) {
      if (pattern.test(combined)) score++;
    }
    if (score > 0) scores.set(category, score);
  }

  if (scores.size === 0) return { category: 'unknown', confidence: 0 };

  const best = [...scores.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return (SPECIFICITY[b[0]] ?? 0) - (SPECIFICITY[a[0]] ?? 0);
  })[0];

  // Confidence: based on whether ANY pattern matched (binary) + bonus for multiple hits.
  // A single match on a short signal list is still high confidence — the category is correct.
  // Scale: 1 hit = 0.80, 2 hits = 0.90, 3+ hits = 1.0
  const hits = best[1];
  const confidence = hits >= 3 ? 1.0 : hits === 2 ? 0.9 : 0.8;

  return { category: best[0], confidence };
}
