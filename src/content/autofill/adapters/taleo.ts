import type { AutoFillAdapter, FormField } from '@/types/autofill';
import { findLabelForInput, categorizeInputType, getGroupQuestionText } from '../utils';
import { matchFieldToCategory } from '../heuristicMatcher';

export const taleoAutoFillAdapter: AutoFillAdapter = {
  platform: 'taleo',

  discoverFields(doc: Document): FormField[] {
    const fields: FormField[] = [];
    const inputs = doc.querySelectorAll<HTMLElement>(
      '#requisitionDescriptionInterface input:not([type="hidden"]):not([type="submit"]), ' +
      '#requisitionDescriptionInterface select, ' +
      '#requisitionDescriptionInterface textarea, ' +
      'form input:not([type="hidden"]):not([type="submit"]), ' +
      'form select, form textarea',
    );

    const seen = new Set<HTMLElement>();
    inputs.forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
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
    return (
      doc.querySelector<HTMLElement>('input[name="next"]') ??
      doc.querySelector<HTMLElement>('button.taleo-next') ??
      null
    );
  },
};
