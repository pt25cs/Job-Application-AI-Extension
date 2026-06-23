import type { PlatformAdapter, DOMFingerprint } from '@/types/platform';
import { cleanText } from '../utils/cleanText';

export const icimsAdapter: PlatformAdapter = {
  name: 'icims',
  urlPatterns: [/[^.]+\.icims\.com\/jobs\/\d+\//],
  domFingerprints: [
    { selector: '.iCIMS_JobTitle' },
    { selector: '.iCIMS_InfoMsg_Job' },
    { selector: '#iCIMS_Content' },
  ] as DOMFingerprint[],

  detectJob(doc: Document): boolean {
    return (
      !!doc.querySelector('.iCIMS_JobTitle') ||
      !!doc.querySelector('#iCIMS_Content')
    );
  },

  extractJobTitle(doc: Document): string | null {
    return (
      doc.querySelector('.iCIMS_JobTitle h1')?.textContent?.trim() ??
      doc.querySelector('.iCIMS_JobTitle')?.textContent?.trim() ??
      null
    );
  },

  extractCompany(doc: Document): string | null {
    return (
      doc.querySelector('.iCIMS_CompanyName')?.textContent?.trim() ??
      doc.querySelector('.company-name')?.textContent?.trim() ??
      null
    );
  },

  extractLocation(doc: Document): string | null {
    return (
      doc.querySelector('.iCIMS_JobHeaderField .iCIMS_InfoMsg')?.textContent?.trim() ??
      doc.querySelector('[class*="Location"]')?.textContent?.trim() ??
      null
    );
  },

  extractJobDescription(doc: Document): string | null {
    const el =
      doc.querySelector('.iCIMS_InfoMsg_Job') ??
      doc.querySelector('#iCIMS_Content .iCIMS_Expandable_Container');
    if (!el) return null;
    return cleanText(el.innerHTML);
  },
};
