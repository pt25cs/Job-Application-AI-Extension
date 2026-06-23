import type { PlatformAdapter, DOMFingerprint } from '@/types/platform';
import { cleanText } from '../utils/cleanText';

export const ashbyAdapter: PlatformAdapter = {
  name: 'ashby',
  urlPatterns: [/jobs\.ashbyhq\.com\/[^/]+\/[a-f0-9-]{36}/],
  domFingerprints: [
    { selector: '[data-testid="job-title"]' },
    { selector: '.ashby-job-posting-brief-description' },
    { selector: '[class*="JobPosting"]' },
  ] as DOMFingerprint[],

  detectJob(doc: Document): boolean {
    return (
      !!doc.querySelector('[data-testid="job-title"]') ||
      !!doc.querySelector('.ashby-job-posting-brief-description')
    );
  },

  extractJobTitle(doc: Document): string | null {
    return (
      doc.querySelector('[data-testid="job-title"]')?.textContent?.trim() ??
      doc.querySelector('h1')?.textContent?.trim() ??
      null
    );
  },

  extractCompany(doc: Document): string | null {
    return (
      doc.querySelector('[data-testid="company-name"]')?.textContent?.trim() ??
      doc.querySelector('.ashby-job-posting-company-name')?.textContent?.trim() ??
      null
    );
  },

  extractLocation(doc: Document): string | null {
    return (
      doc.querySelector('[data-testid="job-location"]')?.textContent?.trim() ??
      doc.querySelector('.ashby-job-posting-brief-description-location')?.textContent?.trim() ??
      null
    );
  },

  extractJobDescription(doc: Document): string | null {
    const el =
      doc.querySelector('[data-testid="job-description"]') ??
      doc.querySelector('.ashby-job-posting-description') ??
      doc.querySelector('[class*="JobDescription"]');
    if (!el) return null;
    return cleanText(el.innerHTML);
  },
};
