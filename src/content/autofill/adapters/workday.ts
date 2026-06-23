import type { AutoFillAdapter, FormField } from '@/types/autofill';
import { findLabelForInput, categorizeInputType, getGroupQuestionText } from '../utils';
import { matchFieldToCategory } from '../heuristicMatcher';

export const workdayAutoFillAdapter: AutoFillAdapter = {
  platform: 'workday',

  discoverFields(doc: Document): FormField[] {
    const fields: FormField[] = [];
    const inputs = doc.querySelectorAll<HTMLElement>(
      '[data-automation-id] input:not([type="hidden"]):not([type="submit"]), ' +
      '[data-automation-id] select, ' +
      '[data-automation-id] textarea, ' +
      // Workday custom radio components
      '[data-automation-id] [role="radio"]',
    );

    inputs.forEach((el) => {
      const label = findLabelForInput(el);
      const automationId = el.closest('[data-automation-id]')?.getAttribute('data-automation-id');
      const name = (el as HTMLInputElement).name ?? automationId ?? el.id ?? null;
      const type = categorizeInputType(el);
      const groupText = (type === 'radio' || el.getAttribute('role') === 'radio')
        ? getGroupQuestionText(el)
        : null;
      const signals = [label, name, el.getAttribute('placeholder'), automationId, groupText]
        .filter(Boolean) as string[];
      const { category, confidence } = matchFieldToCategory(signals);
      fields.push({ element: el, type, category, label: label ?? groupText, name, confidence });
    });

    return fields;
  },

  getNextPageButton(doc: Document): HTMLElement | null {
    return (
      doc.querySelector<HTMLElement>('[data-automation-id="bottom-navigation-next-button"]') ??
      doc.querySelector<HTMLElement>('button[data-automation-id*="next"]') ??
      null
    );
  },
};
