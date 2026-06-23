import type { PlatformAdapter, DOMFingerprint } from '@/types/platform';
import { cleanText } from '../utils/cleanText';

export const workdayAdapter: PlatformAdapter = {
  name: 'workday',
  urlPatterns: [
    /[^.]+\.myworkdayjobs\.com/,
    /jnjcareers\.com/,
    /jobs\.jnj\.com/,
    /careers\.[a-z]+\.com\/.*workday/i,
  ],
  domFingerprints: [
    { selector: '[data-automation-id="jobPostingHeader"]' },
    { selector: '[data-automation-id="job-posting-details"]' },
    { selector: '.WGDC' },
  ] as DOMFingerprint[],

  detectJob(doc: Document): boolean {
    return (
      !!doc.querySelector('[data-automation-id="jobPostingHeader"]') ||
      !!doc.querySelector('[data-automation-id="job-posting-details"]') ||
      !!doc.querySelector('[data-automation-id="jobPostingDescription"]') ||
      // Application form pages (My Experience, Application Questions, etc.)
      !!doc.querySelector('[data-automation-id="workExperienceSection"]') ||
      !!doc.querySelector('[data-automation-id="educationSection"]') ||
      !!doc.querySelector('[data-automation-id="applicationQuestionnaire"]') ||
      !!doc.querySelector('.css-1q2dra3') ||
      // Generic Workday application form indicators
      !!doc.querySelector('[data-automation-id="legalNameSection_firstName"]') ||
      !!doc.querySelector('[data-automation-id="resumeSection"]')
    );
  },

  extractJobTitle(doc: Document): string | null {
    return (
      doc.querySelector('[data-automation-id="jobPostingHeader"]')?.textContent?.trim() ??
      doc.querySelector('h2[data-automation-id]')?.textContent?.trim() ??
      // Application form: job title often in a header or breadcrumb
      doc.querySelector('.css-1q2dra3 h2')?.textContent?.trim() ??
      doc.querySelector('h1')?.textContent?.trim() ??
      null
    );
  },

  extractCompany(doc: Document): string | null {
    return (
      doc.querySelector('[data-automation-id="company-name"]')?.textContent?.trim() ??
      doc.querySelector('.css-1q2dra3')?.textContent?.trim() ??
      // Fallback: extract from page title or domain
      doc.querySelector('[data-automation-id="headerTitle"]')?.textContent?.trim() ??
      null
    );
  },

  extractLocation(doc: Document): string | null {
    return (
      doc.querySelector('[data-automation-id="locations"]')?.textContent?.trim() ??
      doc.querySelector('[data-automation-id="job-posting-location"]')?.textContent?.trim() ??
      null
    );
  },

  extractJobDescription(doc: Document): string | null {
    const el =
      doc.querySelector('[data-automation-id="job-posting-details"]') ??
      doc.querySelector('[data-automation-id="jobPostingDescription"]') ??
      doc.querySelector('.css-cygeeu');
    if (!el) return null;
    return cleanText(el.innerHTML);
  },
};
