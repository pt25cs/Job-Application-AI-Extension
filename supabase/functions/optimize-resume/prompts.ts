export function buildKeywordExtractionPrompt(jobDescription: string): string {
  return `Extract the most important ATS keywords from this job description. Return a JSON array of strings only.
Focus on: technical skills, tools, frameworks, methodologies, certifications, and role-specific terms.
Limit to 30 keywords maximum. Return only the JSON array, no explanation.

Job Description:
${jobDescription.slice(0, 4000)}`;
}

export function buildRewritePrompt(
  resumeText: string,
  keywords: string[],
  jobDescription: string,
  jobTitle: string,
): string {
  return `You are an expert resume writer. Rewrite the resume bullets below to better match the job description.

RULES:
1. Only use facts from the original resume — do NOT invent companies, titles, dates, or metrics
2. Incorporate these keywords naturally: ${keywords.slice(0, 20).join(', ')}
3. Use strong action verbs and quantify achievements where the original already has numbers
4. Keep each bullet under 150 characters
5. Return the rewritten bullets as a JSON array of strings in the same order as the input

Target Role: ${jobTitle}

Job Description (excerpt):
${jobDescription.slice(0, 2000)}

Original Bullets:
${resumeText}

Return ONLY a JSON array of rewritten bullet strings.`;
}

export function buildScoringPrompt(
  resumeText: string,
  keywords: string[],
  jobDescription: string,
): string {
  return `Score this resume against the job description on a scale of 0-100 for each category.
Return a JSON object with keys: keywordMatch, experienceRelevance, skillsAlignment, quantification.
Each value must be an integer 0-100.

Keywords to match: ${keywords.join(', ')}

Job Description (excerpt):
${jobDescription.slice(0, 1500)}

Resume:
${resumeText.slice(0, 3000)}

Return ONLY the JSON object.`;
}
