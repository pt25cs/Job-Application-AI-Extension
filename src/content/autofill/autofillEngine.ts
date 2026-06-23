import type { FieldMapping, FormField, AutoFillAdapter } from '@/types/autofill';
import type { JobDetectionResult } from '@/types/platform';
import { fillTextField, fillSelectField, fillRadio, fillCheckbox, attachFile, fillWithFormatRetry } from './fieldFiller';
import { resolveProfileValue, categorizeInputType, findLabelForInput, getGroupQuestionText, type EnrichedProfile } from './utils';
import { matchFieldToCategory } from './heuristicMatcher';
import { AMBIGUOUS_CATEGORIES, getCandidates } from './formatNormalizer';
import { greenhouseAutoFillAdapter } from './adapters/greenhouse';
import { leverAutoFillAdapter } from './adapters/lever';
import { workdayAutoFillAdapter } from './adapters/workday';
import { ashbyAutoFillAdapter } from './adapters/ashby';
import { bamboohrAutoFillAdapter } from './adapters/bamboohr';
import { icimsAutoFillAdapter } from './adapters/icims';
import { taleoAutoFillAdapter } from './adapters/taleo';

const AUTOFILL_ADAPTERS: AutoFillAdapter[] = [
  greenhouseAutoFillAdapter,
  leverAutoFillAdapter,
  workdayAutoFillAdapter,
  ashbyAutoFillAdapter,
  bamboohrAutoFillAdapter,
  icimsAutoFillAdapter,
  taleoAutoFillAdapter,
];

function getAutoFillAdapter(platform: string): AutoFillAdapter | null {
  return AUTOFILL_ADAPTERS.find((a) => a.platform === platform) ?? null;
}

/** Discover fields using heuristic fallback when no adapter or too few fields found. */
function discoverFieldsHeuristic(doc: Document): FormField[] {
  const fields: FormField[] = [];
  const inputs = doc.querySelectorAll<HTMLElement>(
    'form input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), ' +
    'form select, form textarea',
  );

  inputs.forEach((el) => {
    const label = findLabelForInput(el);
    const name = (el as HTMLInputElement).name ?? el.id ?? null;
    const type = categorizeInputType(el);

    // For radio/checkbox, also pull in the surrounding question text
    const groupText = type === 'radio' ? getGroupQuestionText(el) : null;

    const signals = [label, name, el.getAttribute('placeholder'), el.getAttribute('aria-label'), groupText]
      .filter(Boolean) as string[];
    const { category, confidence } = matchFieldToCategory(signals);
    fields.push({ element: el, type, category, label: label ?? groupText, name, confidence });
  });

  return fields;
}

async function fillField(field: FormField, value: string | File | null): Promise<FieldMapping> {
  if (value === null) {
    return { field, value: null, status: 'skipped', reason: 'No profile value', confidence: field.confidence };
  }

  try {
    let filled = false;

    if (field.type === 'file' && value instanceof File) {
      filled = attachFile(field.element as HTMLInputElement, value);
      return { field, value, status: filled ? 'filled' : 'skipped', confidence: field.confidence };
    }

    if (field.type === 'select') {
      filled = fillSelectField(field.element as HTMLSelectElement, String(value));
      return { field, value, status: filled ? 'filled' : 'skipped', confidence: field.confidence };
    }

    if (field.type === 'radio') {
      filled = fillRadio(field.element.closest('fieldset') ?? field.element, String(value));
      return { field, value, status: filled ? 'filled' : 'skipped', confidence: field.confidence };
    }

    if (field.type === 'checkbox') {
      filled = fillCheckbox(field.element as HTMLInputElement, String(value));
      return { field, value, status: filled ? 'filled' : 'skipped', confidence: field.confidence };
    }

    // Text-like fields — use format retry for ambiguous categories
    const strValue = String(value);
    if (AMBIGUOUS_CATEGORIES.has(field.category)) {
      const candidates = getCandidates(field.category, strValue);
      const { accepted, attemptedFormats } = await fillWithFormatRetry(field.element, candidates);
      return {
        field,
        value: accepted,
        status: 'filled',
        confidence: field.confidence,
        acceptedFormat: accepted,
        attemptedFormats: attemptedFormats.length > 1 ? attemptedFormats : undefined,
      };
    }

    filled = fillTextField(field.element, strValue);
    return {
      field,
      value: strValue,
      status: filled ? 'filled' : 'skipped',
      reason: filled ? undefined : 'Fill operation returned false',
      confidence: field.confidence,
    };
  } catch (err) {
    return { field, value, status: 'error', reason: String(err), confidence: 0 };
  }
}
/** Wait for a DOM change after clicking next page button. */
function waitForPageChange(timeout = 3000): Promise<void> {
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      observer.disconnect();
      resolve();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => { observer.disconnect(); resolve(); }, timeout);
  });
}

export async function runAutoFill(
  profileData: unknown,
  resumeBlob: ArrayBuffer | null,
  detection: JobDetectionResult | null,
): Promise<FieldMapping[]> {
  const profile = profileData as EnrichedProfile;
  const platform = detection?.platform ?? 'unknown';

  let adapter = getAutoFillAdapter(platform);
  let fields = adapter ? adapter.discoverFields(document) : [];

  // Fallback to heuristic if adapter missing or too few fields
  if (fields.length < 3) {
    fields = discoverFieldsHeuristic(document);
    adapter = null;
  }

  // Deduplicate by element reference (adapter + heuristic may overlap)
  const seen = new Set<HTMLElement>();
  fields = fields.filter((f) => {
    if (seen.has(f.element)) return false;
    seen.add(f.element);
    return true;
  });

  // Build resume File from blob if available
  let resumeFile: File | null = null;
  if (resumeBlob) {
    resumeFile = new File([resumeBlob], 'resume.pdf', { type: 'application/pdf' });
  }

  const mappings: FieldMapping[] = [];

  for (const field of fields) {
    let value: string | File | null;

    if (field.category === 'resume_file') {
      value = resumeFile;
    } else {
      value = resolveProfileValue(field.category, profile);
    }

    mappings.push(await fillField(field, value));
  }

  // Multi-page navigation (Workday, iCIMS, Taleo)
  if (adapter) {
    let nextBtn = adapter.getNextPageButton(document);
    let pageCount = 0;
    while (nextBtn && pageCount < 10) {
      nextBtn.click();
      await waitForPageChange();
      const nextFields = adapter.discoverFields(document);
      for (const field of nextFields) {
        const value = field.category === 'resume_file'
          ? resumeFile
          : resolveProfileValue(field.category, profile);
        mappings.push(await fillField(field, value));
      }
      nextBtn = adapter.getNextPageButton(document);
      pageCount++;
    }
  }

  return mappings;
}
