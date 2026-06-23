import type { FieldCategory, FieldType } from '@/types/autofill';
import type { ProfileData, Experience, Skill } from '@/types/profile';

export interface EnrichedProfile extends ProfileData {
  experiences?: Experience[];
  skills?: Skill[];
}

/** Find the label text associated with an input element. */
export function findLabelForInput(el: HTMLElement): string | null {
  // 1. aria-label
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel.trim();

  // 2. aria-labelledby
  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelEl = document.getElementById(labelledBy);
    if (labelEl) return labelEl.textContent?.trim() ?? null;
  }

  // 3. <label for="id">
  const id = el.id;
  if (id) {
    const label = document.querySelector<HTMLLabelElement>(`label[for="${id}"]`);
    if (label) return label.textContent?.trim() ?? null;
  }

  // 4. Wrapping <label>
  const parentLabel = el.closest('label');
  if (parentLabel) {
    // Clone and remove the input to get just the label text
    const clone = parentLabel.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('input,select,textarea').forEach((n) => n.remove());
    return clone.textContent?.trim() ?? null;
  }

  // 5. Preceding sibling text
  const prev = el.previousElementSibling;
  if (prev && ['LABEL', 'SPAN', 'DIV', 'P'].includes(prev.tagName)) {
    return prev.textContent?.trim() ?? null;
  }

  return null;
}

/** Map an HTML input type string to our FieldType union. */
export function categorizeInputType(el: HTMLElement): FieldType {
  if (el instanceof HTMLSelectElement) return 'select';
  if (el instanceof HTMLTextAreaElement) return 'textarea';
  if (el instanceof HTMLInputElement) {
    const t = el.type.toLowerCase();
    if (t === 'email') return 'email';
    if (t === 'tel') return 'tel';
    if (t === 'url') return 'url';
    if (t === 'number') return 'number';
    if (t === 'radio') return 'radio';
    if (t === 'checkbox') return 'checkbox';
    if (t === 'file') return 'file';
    return 'text';
  }
  return 'text';
}

/** Resolve a profile value for a given field category. */
export function resolveProfileValue(
  category: FieldCategory,
  profile: EnrichedProfile,
): string | null {
  const nameParts = (profile.full_name ?? '').split(' ');
  const firstName = nameParts[0] ?? '';
  const lastName = nameParts.slice(1).join(' ');

  const currentWork = profile.experiences?.find(
    (e) => e.type === 'work' && e.is_current,
  );
  // Fallback: most recent work entry by sort_order desc, then start_date desc
  const mostRecentWork = currentWork ?? profile.experiences
    ?.filter((e) => e.type === 'work')
    .sort((a, b) => {
      if (b.sort_order !== a.sort_order) return b.sort_order - a.sort_order;
      return (b.start_date ?? '').localeCompare(a.start_date ?? '');
    })[0];
  const latestEdu = profile.experiences?.find((e) => e.type === 'education');

  // Derive country code and local number from stored phone
  const rawPhone = profile.phone ?? '';
  const phoneCountryCode = rawPhone.match(/^\+(\d{1,3})/)?.[0] ?? '+1';
  // Strip country code for the local number field
  const localPhone = rawPhone.startsWith('+')
    ? rawPhone.replace(/^\+\d{1,3}[\s-]?/, '')
    : rawPhone;

  // Parse location string — supports both 4-part (street,city,state,country)
  // and 5-part (street,city,state,zip,country) formats
  const locParts = (profile.location ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  // Detect if part[3] looks like a zip (all digits / alphanumeric short) or a country name
  const looksLikeZip = (s: string) => /^\d{4,10}$|^[A-Z]\d[A-Z][\s-]?\d[A-Z]\d$/i.test(s.trim());
  let locStreet: string | null = locParts[0] ?? null;
  let locCity: string | null = locParts[1] ?? null;
  let locState: string | null = locParts[2] ?? null;
  let locZip: string | null = null;
  let locCountry: string | null = null;

  if (locParts.length >= 5) {
    // 5-part: street, city, state, zip, country
    locZip = locParts[3] ?? null;
    locCountry = locParts[4] ?? null;
  } else if (locParts.length === 4) {
    if (looksLikeZip(locParts[3])) {
      locZip = locParts[3];
      locCountry = null;
    } else {
      locCountry = locParts[3];
    }
  }

  const map: Partial<Record<FieldCategory, string | null>> = {
    first_name:          firstName || null,
    last_name:           lastName || null,
    full_name:           profile.full_name,
    email:               profile.email,
    phone:               localPhone || null,
    phone_country_code:  phoneCountryCode,
    phone_extension:     null,
    location:            profile.location,
    address_line1:       locStreet,
    address_line2:       null,
    city:                locCity,
    state:               locState,
    zip:                 locZip,
    country:             locCountry ?? 'United States',
    linkedin_url:        profile.linkedin_url,
    github_url:          profile.github_url,
    portfolio_url:       profile.portfolio_url,
    website:             profile.portfolio_url ?? profile.github_url,
    current_company:     mostRecentWork?.organization ?? null,
    current_title:       mostRecentWork?.title ?? null,
    years_of_experience: (() => {
      if (profile.years_of_experience != null) {
        return profile.years_of_experience.toString();
      }
      const workEntries = profile.experiences?.filter((e) => e.type === 'work') ?? [];
      if (!workEntries.length) return null;
      const totalMs = workEntries.reduce((sum, e) => {
        const start = e.start_date ? new Date(e.start_date).getTime() : null;
        const end = e.is_current
          ? Date.now()
          : e.end_date ? new Date(e.end_date).getTime() : null;
        if (start == null || end == null) return sum;
        return sum + Math.max(0, end - start);
      }, 0);
      const years = Math.round(totalMs / (1000 * 60 * 60 * 24 * 365));
      return years > 0 ? years.toString() : null;
    })(),
    university:          latestEdu?.organization ?? profile.university,
    degree:              latestEdu?.title ?? profile.degree,
    graduation_year:     (latestEdu?.end_date
      ? new Date(latestEdu.end_date).getFullYear().toString()
      : null) ?? profile.graduation_year?.toString() ?? null,
    field_of_study:      profile.field_of_study,
    cover_letter:        profile.summary,
    salary_expectation:  null,
    start_date:          null,
    work_authorization:  null,
    gender:              null,
    ethnicity:           null,
    veteran_status:      null,
    disability_status:   null,
    pronouns:            null,
    previous_employer:   'no',
    resume_file:         null,
    unknown:             null,
  };

  return map[category] ?? null;
}

/**
 * Extract surrounding question context for radio/checkbox groups.
 * Checks fieldset legend, then walks up the DOM for a text-bearing ancestor.
 */
export function getGroupQuestionText(el: HTMLElement): string | null {
  const fieldset = el.closest('fieldset');
  if (fieldset) {
    const legend = fieldset.querySelector('legend');
    if (legend) return legend.textContent?.trim() ?? null;
  }

  let node: HTMLElement | null = el.parentElement;
  for (let i = 0; i < 5 && node; i++) {
    const text = Array.from(node.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE ||
        (n.nodeType === Node.ELEMENT_NODE &&
          !['INPUT', 'SELECT', 'TEXTAREA'].includes((n as HTMLElement).tagName)))
      .map((n) => n.textContent?.trim())
      .filter(Boolean)
      .join(' ');
    if (text.length > 10) return text.slice(0, 300);
    node = node.parentElement;
  }
  return null;
}
