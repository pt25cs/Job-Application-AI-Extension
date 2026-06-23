import type { PlatformAdapter, DOMFingerprint } from '@/types/platform';
import { cleanText } from '../utils/cleanText';

export const taleoAdapter: PlatformAdapter = {
  name: 'taleo',
  urlPatterns: [/[^.]+\.taleo\.net\/careersection\/.+\/jobdetail\.ftl/],
  domFingerprints: [
    { selector: '#requisitionDescriptionInterface' },
    { selector: '.taleo-job-title' },
    { selector: '[id*="requisition"]' },
  ] as DOMFingerprint[],

  detectJob(doc: Document): boolean {
    return (
      !!doc.querySelector('#requisitionDescriptionInterface') ||
      !!doc.querySelector('[id*="requisition"]')
    );
  },

  extractJobTitle(doc: Document): string | null {
    return (
      doc.querySelector('.taleo-job-title')?.textContent?.trim() ??
      doc.querySelector('#requisitionDescriptionInterface h1')?.textContent?.trim() ??
      doc.querySelector('h1')?.textContent?.trim() ??
      null
    );
  },

  extractCompany(doc: Document): string | null {
    return (
      doc.querySelector('.taleo-company-name')?.textContent?.trim() ??
      doc.querySelector('.company-name')?.textContent?.trim() ??
      null
    );
  },

  extractLocation(doc: Document): string | null {
    return (
      doc.querySelector('.taleo-job-location')?.textContent?.trim() ??
      doc.querySelector('[class*="location"]')?.textContent?.trim() ??
      null
    );
  },

  extractJobDescription(doc: Document): string | null {
    const el =
      doc.querySelector('#requisitionDescriptionInterface') ??
      doc.querySelector('.taleo-job-description');
    if (!el) return null;
    return cleanText(el.innerHTML);
  },
};
