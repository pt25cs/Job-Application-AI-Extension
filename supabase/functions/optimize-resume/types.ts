// Shared types for the Edge Function (Deno-compatible, no imports from src/)

export interface ATSScoreBreakdown {
  keywordMatch: number;
  experienceRelevance: number;
  skillsAlignment: number;
  quantification: number;
  total: number;
}

export interface ATSIteration {
  iteration: number;
  score: ATSScoreBreakdown;
  resume: unknown;
  keywords: string[];
  timestamp: number;
}

export interface ATSOptimizationRequest {
  userId: string;
  applicationId: string;
  baseResume: unknown;
  experienceBank: unknown[];
  jobDescription: string;
  jobTitle: string;
  company: string;
  targetScore?: number;
  maxIterations?: number;
}
