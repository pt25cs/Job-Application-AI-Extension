// deno-lint-ignore-file no-explicit-any
import type { ATSScoreBreakdown } from './types.ts';

export function flattenResumeToText(resume: any): string {
  const lines: string[] = [];

  if (resume.summary) lines.push(resume.summary);

  for (const exp of resume.experience ?? []) {
    lines.push(`${exp.title} at ${exp.organization}`);
    for (const bullet of exp.bullets ?? []) lines.push(bullet);
  }

  for (const edu of resume.education ?? []) {
    lines.push(`${edu.title} at ${edu.organization}`);
  }

  for (const skill of resume.skills ?? []) {
    lines.push(skill.name ?? skill);
  }

  for (const proj of resume.projects ?? []) {
    lines.push(`${proj.title}`);
    for (const bullet of proj.bullets ?? []) lines.push(bullet);
  }

  return lines.join('\n');
}

export function computeTotal(
  breakdown: Omit<ATSScoreBreakdown, 'total'>,
): number {
  return Math.round(
    breakdown.keywordMatch * 0.40 +
    breakdown.experienceRelevance * 0.25 +
    breakdown.skillsAlignment * 0.20 +
    breakdown.quantification * 0.15,
  );
}

export function parseScoreFromGPT(raw: string): ATSScoreBreakdown {
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const json = JSON.parse(cleaned);
    const clamp = (v: unknown) => Math.max(0, Math.min(100, Number(v) || 0));
    const breakdown = {
      keywordMatch: clamp(json.keywordMatch),
      experienceRelevance: clamp(json.experienceRelevance),
      skillsAlignment: clamp(json.skillsAlignment),
      quantification: clamp(json.quantification),
    };
    return { ...breakdown, total: computeTotal(breakdown) };
  } catch {
    return { keywordMatch: 0, experienceRelevance: 0, skillsAlignment: 0, quantification: 0, total: 0 };
  }
}
