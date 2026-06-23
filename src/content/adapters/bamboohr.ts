import type { PlatformAdapter, DOMFingerprint } from '@/types/platform';
import { cleanText } from '../utils/cleanText';

export const bamboohrAdapter: PlatformAdapter = {
  name: 'bamboohr',
  urlPatterns: [/[^.]+\.bamboohr\.com\/jobs\/\d+/],
  domFingerprints: [
    { selector: '.BambooHR-ATS-board' },
    { selector: '[data-testid="job-title"]' },
    { selector: '.BambooHR-ATS-Jobs-Item' },
  ] as DOMFingerprint[],

  detectJob(doc: Document): boolean {
    return (
      !!doc.querySelector('.BambooHR-ATS-board') ||
      !!doc.querySelector('[class*="BambooHR-ATS"]')
    );
  },

  extractJobTitle(doc: Document): string | null {
    return (
      doc.querySelector('.BambooHR-ATS-Jobs-Item-Title')?.textContent?.trim() ??
      doc.querySelector('h2.BambooHR-ATS-Jobs-Item-Title')?.textContent?.trim() ??
      doc.querySelector('h1')?.textContent?.trim() ??
      null
    );
  },

  extractCompany(doc: Document): string | null {
    return (
      doc.querySelector('.BambooHR-ATS-Company-Name')?.textContent?.trim() ??
      doc.querySelector('.company-name')?.textContent?.trim() ??
      null
    );
  },

  extractLocation(doc: Document): string | null {
    return (
      doc.querySelector('.BambooHR-ATS-Jobs-Item-Location')?.textContent?.trim() ??
      doc.querySelector('[class*="Location"]')?.textContent?.trim() ??
      null
    );
  },

  extractJobDescription(doc: Document): string | null {
    const el =
      doc.querySelector('.BambooHR-ATS-Jobs-Item-Description') ??
      doc.querySelector('[class*="Description"]');
    if (!el) return null;
    return cleanText(el.innerHTML);
  },
};
