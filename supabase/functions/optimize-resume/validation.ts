// deno-lint-ignore-file no-explicit-any

/**
 * Validates a rewritten resume against the original experience bank.
 * Replaces any bullet that references unknown entities with the original bullet.
 */
export function validateAgainstExperienceBank(
  rewrittenResume: any,
  experienceBank: any[],
): any {
  // Build a set of known entities from the experience bank
  const knownEntities = new Set<string>();

  for (const exp of experienceBank) {
    if (exp.organization) knownEntities.add(exp.organization.toLowerCase());
    if (exp.title) knownEntities.add(exp.title.toLowerCase());
    if (exp.location) knownEntities.add(exp.location.toLowerCase());

    // Extract numbers/metrics from original bullets
    for (const bullet of exp.bullets ?? []) {
      const numbers = String(bullet).match(/\d+[%x]?/g) ?? [];
      numbers.forEach((n) => knownEntities.add(n));
    }
  }

  // Build original bullet lookup: org+title → bullets[]
  const originalBullets = new Map<string, string[]>();
  for (const exp of experienceBank) {
    const key = `${exp.organization}|${exp.title}`.toLowerCase();
    originalBullets.set(key, exp.bullets ?? []);
  }

  // Validate each experience entry in the rewritten resume
  const validated = JSON.parse(JSON.stringify(rewrittenResume));

  for (const exp of validated.experience ?? []) {
    const key = `${exp.organization}|${exp.title}`.toLowerCase();
    const originals = originalBullets.get(key) ?? [];

    exp.bullets = (exp.bullets ?? []).map((bullet: string, idx: number) => {
      if (containsHallucination(bullet, knownEntities, experienceBank)) {
        return originals[idx] ?? bullet;
      }
      return bullet;
    });
  }

  return validated;
}

function containsHallucination(
  bullet: string,
  knownEntities: Set<string>,
  experienceBank: any[],
): boolean {
  // Check for numbers that don't appear in the original experience bank
  const numbers = bullet.match(/\b\d{2,}\b/g) ?? [];
  for (const num of numbers) {
    let found = false;
    for (const exp of experienceBank) {
      const allText = [
        ...(exp.bullets ?? []),
        exp.title,
        exp.organization,
      ].join(' ');
      if (allText.includes(num)) { found = true; break; }
    }
    if (!found && parseInt(num) > 10) return true;
  }

  return false;
}
