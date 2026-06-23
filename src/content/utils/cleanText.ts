const BOILERPLATE_PATTERNS = [
  /cookie\s*policy/i,
  /privacy\s*policy/i,
  /terms\s*(of\s*(use|service))?/i,
  /all\s*rights\s*reserved/i,
  /copyright\s*©/i,
  /skip\s*to\s*(main\s*)?content/i,
  /back\s*to\s*top/i,
  /follow\s*us\s*on/i,
  /share\s*this\s*(job|posting)/i,
  /apply\s*now/i,
  /equal\s*opportunity\s*employer/i,
];

/** Strip HTML tags from a string. */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ');
}

/** Collapse multiple whitespace characters into a single space and trim. */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/** Remove lines that match known boilerplate patterns. */
export function removeBoilerplate(text: string): string {
  return text
    .split('\n')
    .filter((line) => !BOILERPLATE_PATTERNS.some((p) => p.test(line)))
    .join('\n');
}

/** Full pipeline: strip HTML → remove boilerplate → normalize whitespace. */
export function cleanText(raw: string): string {
  const stripped = stripHtml(raw);
  const deBoilerplated = removeBoilerplate(stripped);
  return normalizeWhitespace(deBoilerplated);
}
