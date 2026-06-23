// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  buildKeywordExtractionPrompt,
  buildRewritePrompt,
  buildScoringPrompt,
} from './prompts.ts';
import { flattenResumeToText, parseScoreFromGPT } from './scoring.ts';
import { validateAgainstExperienceBank } from './validation.ts';
import type { ATSOptimizationRequest, ATSIteration } from './types.ts';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

async function callGemini(prompt: string, model: string, apiKey: string): Promise<string> {
  const url = `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 2000 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' },
    });
  }

  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  let body: ATSOptimizationRequest;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const {
    userId, applicationId, baseResume, experienceBank,
    jobDescription, jobTitle, company,
    targetScore = 85, maxIterations = 3,
  } = body;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const channelName = `optimization:${userId}:${applicationId}`;
  const broadcast = async (payload: unknown) => {
    await supabase.channel(channelName).send({ type: 'broadcast', event: 'progress', payload });
  };

  try {
    // Step 1: Extract keywords
    const keywordRaw = await callGemini(
      buildKeywordExtractionPrompt(jobDescription), 'gemini-2.0-flash', GEMINI_API_KEY,
    );
    let keywords: string[] = [];
    try {
      const cleaned = keywordRaw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      keywords = JSON.parse(cleaned);
    } catch { keywords = []; }

    // Step 2: Score base resume
    const baseText = flattenResumeToText(baseResume);
    const baseScoreRaw = await callGemini(
      buildScoringPrompt(baseText, keywords, jobDescription), 'gemini-2.0-flash', GEMINI_API_KEY,
    );
    let currentScore = parseScoreFromGPT(baseScoreRaw);
    let currentResume: any = baseResume;
    const iterations: ATSIteration[] = [];

    await broadcast({ type: 'start', keywords, baseScore: currentScore });

    // Step 3: Optimization loop
    for (let i = 0; i < maxIterations; i++) {
      if (currentScore.total >= targetScore) break;

      const model = 'gemini-2.0-flash';
      const resumeText = flattenResumeToText(currentResume);

      const rewriteRaw = await callGemini(
        buildRewritePrompt(resumeText, keywords, jobDescription, jobTitle), model, GEMINI_API_KEY,
      );

      let rewrittenBullets: string[] = [];
      try {
        const cleaned = rewriteRaw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        rewrittenBullets = JSON.parse(cleaned);
      } catch { rewrittenBullets = []; }

      const rewrittenResume: any = JSON.parse(JSON.stringify(currentResume));
      let bulletIdx = 0;
      for (const exp of rewrittenResume.experience ?? []) {
        exp.bullets = (exp.bullets ?? []).map(() => rewrittenBullets[bulletIdx++] ?? '');
      }

      const validated = validateAgainstExperienceBank(rewrittenResume, experienceBank as any[]);

      const newText = flattenResumeToText(validated);
      const newScoreRaw = await callGemini(
        buildScoringPrompt(newText, keywords, jobDescription), 'gemini-2.0-flash', GEMINI_API_KEY,
      );
      const newScore = parseScoreFromGPT(newScoreRaw);

      const iteration: ATSIteration = {
        iteration: i + 1, score: newScore, resume: validated, keywords, timestamp: Date.now(),
      };
      iterations.push(iteration);
      await broadcast({ type: 'iteration', iteration });

      if (newScore.total > currentScore.total) {
        currentScore = newScore;
        currentResume = validated;
      }
    }

    await supabase.from('applications')
      .update({ ats_score: currentScore.total, status: 'ready', updated_at: new Date().toISOString() })
      .eq('id', applicationId);

    const response = { applicationId, finalResume: currentResume, finalScore: currentScore, iterations, success: true };
    await broadcast({ type: 'complete', result: response });

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    await broadcast({ type: 'error', error: errMsg });
    return new Response(JSON.stringify({ success: false, error: errMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
