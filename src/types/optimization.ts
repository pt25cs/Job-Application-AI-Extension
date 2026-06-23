import type { StructuredResume, Experience } from './profile';

export interface ATSScoreBreakdown {
  keywordMatch: number;        // 0–100, weight 40%
  experienceRelevance: number; // 0–100, weight 25%
  skillsAlignment: number;     // 0–100, weight 20%
  quantification: number;      // 0–100, weight 15%
  total: number;               // weighted composite 0–100
}

export interface ATSIteration {
  iteration: number;
  score: ATSScoreBreakdown;
  resume: StructuredResume;
  keywords: string[];
  timestamp: number;
}

export interface ATSOptimizationRequest {
  userId: string;
  applicationId: string;
  baseResume: StructuredResume;
  experienceBank: Experience[];
  jobDescription: string;
  jobTitle: string;
  company: string;
  targetScore?: number;    // default 85
  maxIterations?: number;  // default 3
}

export interface ATSOptimizationResponse {
  applicationId: string;
  finalResume: StructuredResume;
  finalScore: ATSScoreBreakdown;
  iterations: ATSIteration[];
  success: boolean;
  error?: string;
}
