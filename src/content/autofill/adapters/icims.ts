import type { AutoFillAdapter, FormField } from '@/types/autofill';
import { findLabelForInput, categorizeInputType, getGroupQuestionText } from '../utils';
import { matchFieldToCategory } from '../heuristicMatcher';

export const icimsAutoFillAdapter: AutoFillAdapter = {
  platform: 'icims',

  discoverFields(doc: Document): FormField[] {
    const fields: FormField[] = [];
    const inputs = doc.querySelectorAll<HTMLElement>(
      '#iCIMS_Content input:not([type="hidden"]):not([type="submit"]), ' +
      '#iCIMS_Content select, ' +
      '#iCIMS_Content textarea',
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

  getNextPageButton(doc: Document): HTMLElement | null {
    return doc.querySelector<HTMLElement>('.iCIMS_NavButton_Next') ?? null;
  },
};
