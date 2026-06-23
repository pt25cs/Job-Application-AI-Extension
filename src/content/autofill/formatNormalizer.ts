/**
 * Format normalizer — generates ordered candidate values for fields that
 * have ambiguous formats across different ATS platforms.
 *
 * Candidates are ordered from most-common to least-common so the first
 * attempt is usually correct, minimising retries.
 */

import type { FieldCategory } from '@/types/autofill';

/** Categories that may need format cycling. */
export const AMBIGUOUS_CATEGORIES = new Set<FieldCategory>([
  'phone',
  'phone_country_code',
  'start_date',
  'graduation_year',
  'state',
  'country',
  'salary_expectation',
  'linkedin_url',
  'github_url',
  'portfolio_url',
  'website',
]);

// ── Phone ─────────────────────────────────────────────────────────────────────

function digitsOnly(s: string): string {
  return s.replace(/\D/g, '');
}

export function phoneFormats(raw: string): string[] {
  const digits = digitsOnly(raw);
  const local = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (local.length !== 10) return [raw];

  const area = local.slice(0, 3);
  const prefix = local.slice(3, 6);
  const line = local.slice(6);
  return [
    '(' + area + ') ' + prefix + '-' + line,
    area + '-' + prefix + '-' + line,
    area + '.' + prefix + '.' + line,
    area + prefix + line,
    '+1' + area + prefix + line,
    '+1 ' + area + ' ' + prefix + ' ' + line,
    '+1-' + area + '-' + prefix + '-' + line,
    '+1 (' + area + ') ' + prefix + '-' + line,
  ];
}

// ── Date ──────────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const MONTH_SHORT = MONTH_NAMES.map((m) => m.slice(0, 3));

export function dateFormats(raw: string): string[] {
  if (!raw) return [raw];

  let year: number | null = null;
  let month: number | null = null;
  let day: number | null = null;

  const isoMatch = raw.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (isoMatch) {
    year = parseInt(isoMatch[1]);
    month = parseInt(isoMatch[2]);
    day = isoMatch[3] ? parseInt(isoMatch[3]) : null;
  }

  const usMatch = raw.match(/^(\d{1,2})\/(\d{1,2}|\d{4})(?:\/(\d{4}))?$/);
  if (!isoMatch && usMatch) {
    if (usMatch[3]) {
      month = parseInt(usMatch[1]);
      day = parseInt(usMatch[2]);
      year = parseInt(usMatch[3]);
    } else if (parseInt(usMatch[2]) > 31) {
      month = parseInt(usMatch[1]);
      year = parseInt(usMatch[2]);
    }
  }

  const textMatch = raw.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!isoMatch && !usMatch && textMatch) {
    const mIdx = MONTH_NAMES.findIndex((m) => m.toLowerCase() === textMatch[1].toLowerCase());
    const mIdxShort = MONTH_SHORT.findIndex((m) => m.toLowerCase() === textMatch[1].toLowerCase());
    const mFound = mIdx >= 0 ? mIdx : mIdxShort;
    if (mFound >= 0) { month = mFound + 1; year = parseInt(textMatch[2]); }
  }

  if (!year) return [raw];
  if (!month) return [String(year)];

  const mm = String(month).padStart(2, '0');
  const dd = day ? String(day).padStart(2, '0') : null;
  const monthName = MONTH_NAMES[month - 1];
  const monthShort = MONTH_SHORT[month - 1];

  if (dd) {
    return [
      mm + '/' + dd + '/' + year,
      year + '-' + mm + '-' + dd,
      dd + '/' + mm + '/' + year,
      monthName + ' ' + dd + ', ' + year,
      monthShort + ' ' + dd + ', ' + year,
      dd + ' ' + monthName + ' ' + year,
    ];
  }
  return [
    mm + '/' + year,
    year + '-' + mm,
    monthName + ' ' + year,
    monthShort + ' ' + year,
    year + '/' + mm,
  ];
}

// ── State ─────────────────────────────────────────────────────────────────────

const STATE_MAP: Record<string, string> = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',
  CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',
  HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',
  KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',
  MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',
  MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',
  NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',
  OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',
  SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',
  VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',
  DC:'District of Columbia',
};
const STATE_REVERSE = Object.fromEntries(
  Object.entries(STATE_MAP).map(([abbr, full]) => [full.toLowerCase(), abbr]),
);

export function stateFormats(raw: string): string[] {
  const trimmed = raw.trim();
  const upper = trimmed.toUpperCase();
  if (STATE_MAP[upper]) return [upper, STATE_MAP[upper]];
  const abbr = STATE_REVERSE[trimmed.toLowerCase()];
  if (abbr) return [trimmed, abbr];
  return [trimmed];
}

// ── Country ───────────────────────────────────────────────────────────────────

const COUNTRY_ALIASES: Record<string, string[]> = {
  'United States': ['United States', 'United States of America', 'USA', 'US', 'U.S.', 'U.S.A.'],
  'United Kingdom': ['United Kingdom', 'UK', 'U.K.', 'Great Britain', 'Britain'],
  'Canada': ['Canada', 'CA'],
  'Australia': ['Australia', 'AU'],
  'India': ['India', 'IN'],
  'Germany': ['Germany', 'Deutschland', 'DE'],
  'France': ['France', 'FR'],
};

export function countryFormats(raw: string): string[] {
  const trimmed = raw.trim();
  for (const aliases of Object.values(COUNTRY_ALIASES)) {
    if (aliases.some((a) => a.toLowerCase() === trimmed.toLowerCase())) return aliases;
  }
  return [trimmed];
}

// ── Salary ────────────────────────────────────────────────────────────────────

export function salaryFormats(raw: string): string[] {
  const digits = raw.replace(/[^0-9.]/g, '');
  const num = parseFloat(digits);
  if (isNaN(num)) return [raw];
  const formatted = num.toLocaleString('en-US');
  return [
    digits,
    formatted,
    '$' + digits,
    '$' + formatted,
    digits + '/year',
    formatted + ' per year',
  ];
}

// ── URL ───────────────────────────────────────────────────────────────────────

export function urlFormats(raw: string): string[] {
  if (!raw) return [raw];
  const withProtocol = raw.startsWith('http') ? raw : 'https://' + raw;
  const withoutSlash = withProtocol.replace(/\/$/, '');
  return [withoutSlash, withoutSlash + '/'];
}

// ── Country dial code ─────────────────────────────────────────────────────────

export function countryCodeFormats(raw: string): string[] {
  const digits = raw.replace(/\D/g, '');
  const withPlus = raw.startsWith('+') ? raw : '+' + digits;
  return [withPlus, digits, raw].filter((v, i, a) => a.indexOf(v) === i);
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

export function getCandidates(category: FieldCategory, value: string): string[] {
  switch (category) {
    case 'phone':              return phoneFormats(value);
    case 'phone_country_code': return countryCodeFormats(value);
    case 'start_date':
    case 'graduation_year':    return dateFormats(value);
    case 'state':              return stateFormats(value);
    case 'country':            return countryFormats(value);
    case 'salary_expectation': return salaryFormats(value);
    case 'linkedin_url':
    case 'github_url':
    case 'portfolio_url':
    case 'website':            return urlFormats(value);
    default:                   return [value];
  }
}
