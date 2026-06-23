import type { AutoFillAdapter, FormField } from '@/types/autofill';
import { findLabelForInput, categorizeInputType, getGroupQuestionText } from '../utils';
import { matchFieldToCategory } from '../heuristicMatcher';

export const leverAutoFillAdapter: AutoFillAdapter = {
  platform: 'lever',

  discoverFields(doc: Document): FormField[] {
    const fields: FormField[] = [];
    const inputs = doc.querySelectorAll<HTMLElement>(
      '.application-form input:not([type="hidden"]):not([type="submit"]), ' +
      '.application-form select, ' +
      '.application-form textarea',
    );

    inputs.forEach((el) => {
      const label = findLabelForInput(el);
      const name = (el as HTMLInputElement).name ?? el.id ?? null;
      const type = categorizeInputType(el);
      const groupText = type === 'radio' ? getGroupQuestionText(el) : null;
      const signals = [label, name, el.getAttribute('placeholder'), el.getAttribute('aria-label'), groupText]
        .filter(Boolean) as string[];
      const { category, confidence } = matchFieldToCategory(signals);
      fields.push({ element: el, type, category, label: label ?? groupText, name, confidence });
    });

    return fields;
  },

  getNextPageButton(_doc: Document): HTMLElement | null {
    return null;
  },
};
