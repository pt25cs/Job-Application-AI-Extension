export type ATSPlatform =
  | 'greenhouse'
  | 'lever'
  | 'workday'
  | 'ashby'
  | 'bamboohr'
  | 'icims'
  | 'taleo'
  | 'unknown';

export interface DOMFingerprint {
  selector: string;
  attribute?: string;
  value?: string;
}

export interface JobDetectionResult {
  platform: ATSPlatform;
  confidence: number;
  jobTitle: string | null;
  company: string | null;
  location: string | null;
  jobDescription: string | null;
  jobUrl: string;
  detectedAt: number;
}

export interface PlatformAdapter {
  name: ATSPlatform;
  urlPatterns: RegExp[];
  domFingerprints: DOMFingerprint[];
  detectJob(doc: Document): boolean;
  extractJobTitle(doc: Document): string | null;
  extractCompany(doc: Document): string | null;
  extractLocation(doc: Document): string | null;
  extractJobDescription(doc: Document): string | null;
}
