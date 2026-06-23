import type { PlatformAdapter, DOMFingerprint } from '@/types/platform';
import { cleanText } from '../utils/cleanText';

export const greenhouseAdapter: PlatformAdapter = {
  name: 'greenhouse',
  urlPatterns: [
    /boards\.greenhouse\.io\/[^/]+\/jobs\/\d+/,
    /greenhouse\.io\/[^/]+\/jobs\/\d+/,
  ],
  domFingerprints: [
    { selector: '#app_body' },
    { selector: '.app-body' },
    { selector: 'meta[name="greenhouse"]' },
    { selector: '[data-source="greenhouse"]' },
    { selector: '#header .company-name' },
  ] as DOMFingerprint[],

  detectJob(doc: Document): boolean {
    return (
      !!doc.querySelector('#app_body') ||
      !!doc.querySelector('.app-body') ||
      !!doc.querySelector('#header .company-name')
    );
  },

  extractJobTitle(doc: Document): string | null {
    return (
      doc.querySelector('.app-title')?.textContent?.trim() ??
      doc.querySelector('h1.job-title')?.textContent?.trim() ??
      doc.querySelector('h1')?.textContent?.trim() ??
      null
    );
  },

  extractCompany(doc: Document): string | null {
    return (
      doc.querySelector('.company-name')?.textContent?.trim() ??
      doc.querySelector('#header .company-name')?.textContent?.trim() ??
      null
    );
  },

  extractLocation(doc: Document): string | null {
    return (
      doc.querySelector('.location')?.textContent?.trim() ??
      doc.querySelector('.job-location')?.textContent?.trim() ??
      null
    );
  },

  extractJobDescription(doc: Document): string | null {
    const el =
      doc.querySelector('#content') ??
      doc.querySelector('.job-description') ??
      doc.querySelector('#job_description');
    if (!el) return null;
    return cleanText(el.innerHTML);
  },
};
