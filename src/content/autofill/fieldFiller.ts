/** React-compatible value injection helpers. */

const nativeInputSetter = Object.getOwnPropertyDescriptor(
  window.HTMLInputElement.prototype,
  'value',
)?.set;

const nativeTextareaSetter = Object.getOwnPropertyDescriptor(
  window.HTMLTextAreaElement.prototype,
  'value',
)?.set;

function dispatchEvents(el: HTMLElement) {
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('blur', { bubbles: true }));
}

/** Fill a text/email/tel/url/number input or textarea. */
export function fillTextField(el: HTMLElement, value: string): boolean {
  try {
    if (el instanceof HTMLTextAreaElement) {
      nativeTextareaSetter?.call(el, value);
      dispatchEvents(el);
      return true;
    }
    if (el instanceof HTMLInputElement) {
      nativeInputSetter?.call(el, value);
      dispatchEvents(el);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** Fill a <select> element by matching option text or value case-insensitively.
 *  Falls back to partial/contains match if no exact match found. */
export function fillSelectField(el: HTMLSelectElement, value: string): boolean {
  try {
    const lower = value.toLowerCase().trim();
    const options = Array.from(el.options);

    // 1. Exact match on value or text
    let option = options.find(
      (o) => o.value.toLowerCase() === lower || o.text.toLowerCase().trim() === lower,
    );

    // 2. Starts-with match
    if (!option) {
      option = options.find(
        (o) => o.text.toLowerCase().trim().startsWith(lower) || lower.startsWith(o.text.toLowerCase().trim()),
      );
    }

    // 3. Contains match (value contains option text or vice versa)
    if (!option) {
      option = options.find(
        (o) => o.text.toLowerCase().trim().includes(lower) || lower.includes(o.text.toLowerCase().trim()),
      );
    }

    if (!option) return false;
    el.value = option.value;
    dispatchEvents(el);
    return true;
  } catch {
    return false;
  }
}

/** Click the radio button whose label best matches the value.
 *  Handles native <input type="radio"> and ARIA role="radio" custom components. */
export function fillRadio(container: HTMLElement, value: string): boolean {
  try {
    const lower = value.toLowerCase().trim();

    // 1. Native radio inputs
    const radios = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
    for (const radio of radios) {
      const labelText = (
        radio.labels?.[0]?.textContent ??
        radio.getAttribute('aria-label') ??
        radio.value
      ).toLowerCase().trim();
      if (labelText === lower || labelText.startsWith(lower) || lower.startsWith(labelText)) {
        radio.click();
        dispatchEvents(radio);
        return true;
      }
    }

    // 2. ARIA role="radio" (Workday, custom components)
    const ariaRadios = Array.from(container.querySelectorAll<HTMLElement>('[role="radio"]'));
    for (const el of ariaRadios) {
      const labelText = (el.getAttribute('aria-label') ?? el.textContent ?? '').toLowerCase().trim();
      if (labelText === lower || labelText.startsWith(lower) || lower.startsWith(labelText)) {
        el.click();
        dispatchEvents(el);
        return true;
      }
    }

    // 3. Walk up to find the fieldset/group if container was just the input itself
    if (container instanceof HTMLInputElement || ariaRadios.length === 0) {
      const group = container.closest('fieldset, [role="radiogroup"], [role="group"]') as HTMLElement | null;
      if (group && group !== container) return fillRadio(group, value);
    }

    return false;
  } catch {
    return false;
  }
}

/** Check or uncheck a checkbox based on a truthy value string. */
export function fillCheckbox(el: HTMLInputElement, value: string): boolean {
  try {
    const truthy = /^(yes|true|1|on|checked)$/i.test(value.trim());
    if (el.checked !== truthy) {
      el.click();
      dispatchEvents(el);
    }
    return true;
  } catch {
    return false;
  }
}

/** Attach a File to a file input using the DataTransfer API. */
export function attachFile(el: HTMLInputElement, file: File): boolean {
  try {
    const dt = new DataTransfer();
    dt.items.add(file);
    el.files = dt.files;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  } catch {
    return false;
  }
}

// ── Validation-aware retry filler ─────────────────────────────────────────────

/** Selectors that indicate a field-level validation error on the page. */
const ERROR_SELECTORS = [
  '[aria-invalid="true"]',
  '[aria-describedby*="error"]',
  '.error',
  '.field-error',
  '.validation-error',
  '[class*="error"]',
  '[class*="invalid"]',
];

/**
 * Returns true if the element currently has a visible validation error
 * (aria-invalid, or a sibling/nearby error element appeared).
 */
function hasValidationError(el: HTMLElement): boolean {
  if (el.getAttribute('aria-invalid') === 'true') return true;

  // Check for error message siblings
  const parent = el.parentElement;
  if (!parent) return false;
  return ERROR_SELECTORS.some((sel) => {
    try { return !!parent.querySelector(sel); } catch { return false; }
  });
}

/**
 * Fills a text field and waits briefly to detect validation errors.
 * Returns true if the value was accepted (no error detected).
 */
async function tryFillAndValidate(el: HTMLElement, value: string): Promise<boolean> {
  const filled = fillTextField(el, value);
  if (!filled) return false;

  // Give the page a tick to run its own validation handlers
  await new Promise<void>((r) => setTimeout(r, 120));

  return !hasValidationError(el);
}

/**
 * Tries each candidate format in order, stopping at the first one that
 * doesn't trigger a validation error. Falls back to the first candidate
 * if all trigger errors (better than leaving the field empty).
 *
 * Returns { accepted: string; attemptedFormats: string[] }.
 */
export async function fillWithFormatRetry(
  el: HTMLElement,
  candidates: string[],
): Promise<{ accepted: string; attemptedFormats: string[] }> {
  const attempted: string[] = [];

  for (const candidate of candidates) {
    attempted.push(candidate);
    const ok = await tryFillAndValidate(el, candidate);
    if (ok) return { accepted: candidate, attemptedFormats: attempted };
  }

  // All formats triggered errors — use first candidate as best guess
  fillTextField(el, candidates[0]);
  return { accepted: candidates[0], attemptedFormats: attempted };
}
