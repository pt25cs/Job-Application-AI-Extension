import type { PlatformAdapter, DOMFingerprint } from '@/types/platform';
import { cleanText } from '../utils/cleanText';

export const leverAdapter: PlatformAdapter = {
  name: 'lever',
  urlPatterns: [/jobs\.lever\.co\/[^/]+\/[a-f0-9-]{36}/],
  domFingerprints: [
    { selector: '.posting-headline' },
    { selector: '.posting-categories' },
    { selector: '[data-qa="posting-name"]' },
  ] as DOMFingerprint[],

  detectJob(doc: Document): boolean {
    return (
      !!doc.querySelector('.posting-headline') ||
      !!doc.querySelector('[data-qa="posting-name"]')
    );
  },

  extractJobTitle(doc: Document): string | null {
    return (
      doc.querySelector('[data-qa="posting-name"]')?.textContent?.trim() ??
      doc.querySelector('.posting-headline h2')?.textContent?.trim() ??
      doc.querySelector('h2')?.textContent?.trim() ??
      null
    );
  },

  extractCompany(doc: Document): string | null {
    // Lever URLs contain company slug; extract from URL as fallback
    const match = window.location.hostname.match(/jobs\.lever\.co/) &&
      window.location.pathname.match(/^\/([^/]+)\//);
    return (
      doc.querySelector('.main-header-logo img')?.getAttribute('alt') ??
      (match ? match[1] : null)
    );
  },

  extractLocation(doc: Document): string | null {
    return (
      doc.querySelector('.posting-categories .location')?.textContent?.trim() ??
      doc.querySelector('[data-qa="posting-location"]')?.textContent?.trim() ??
      null
    );
  },

  extractJobDescription(doc: Document): string | null {
    const el =
      doc.querySelector('.posting-description') ??
      doc.querySelector('[data-qa="job-description"]') ??
      doc.querySelector('.section-wrapper');
    if (!el) return null;
    return cleanText(el.innerHTML);
  },
};
