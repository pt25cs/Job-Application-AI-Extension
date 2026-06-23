import type { ATSPlatform, JobDetectionResult, PlatformAdapter } from '@/types/platform';
import { greenhouseAdapter } from './greenhouse';
import { leverAdapter } from './lever';
import { workdayAdapter } from './workday';
import { ashbyAdapter } from './ashby';
import { bamboohrAdapter } from './bamboohr';
import { icimsAdapter } from './icims';
import { taleoAdapter } from './taleo';

const ADAPTERS: PlatformAdapter[] = [
  greenhouseAdapter,
  leverAdapter,
  workdayAdapter,
  ashbyAdapter,
  bamboohrAdapter,
  icimsAdapter,
  taleoAdapter,
];

export function getAdapterByPlatform(platform: ATSPlatform): PlatformAdapter | null {
  return ADAPTERS.find((a) => a.name === platform) ?? null;
}

export function detectPlatform(url: string, doc: Document): JobDetectionResult {
  const base: JobDetectionResult = {
    platform: 'unknown',
    confidence: 0,
    jobTitle: null,
    company: null,
    location: null,
    jobDescription: null,
    jobUrl: url,
    detectedAt: Date.now(),
  };

  for (const adapter of ADAPTERS) {
    const urlMatch = adapter.urlPatterns.some((p) => p.test(url));
    if (!urlMatch) continue;

    let confidence = 0.8;

    // DOM fingerprinting
    const matched = adapter.domFingerprints.filter((fp) => {
      const el = doc.querySelector(fp.selector);
      if (!el) return false;
      if (fp.attribute && fp.value) {
        return el.getAttribute(fp.attribute) === fp.value;
      }
      return true;
    });

    if (adapter.domFingerprints.length > 0) {
      const ratio = matched.length / adapter.domFingerprints.length;
      confidence = ratio >= 0.5 ? 0.9 + ratio * 0.1 : 0.8;
    }

    if (!adapter.detectJob(doc)) {
      confidence = Math.min(confidence, 0.7);
    }

    return {
      platform: adapter.name,
      confidence,
      jobTitle: adapter.extractJobTitle(doc),
      company: adapter.extractCompany(doc),
      location: adapter.extractLocation(doc),
      jobDescription: adapter.extractJobDescription(doc),
      jobUrl: url,
      detectedAt: Date.now(),
    };
  }

  return base;
}
