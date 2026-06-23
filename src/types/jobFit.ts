export interface JobFitAlignmentRationale {
  experienceId: string;
  relevanceScore: number;
  reason: string;
}

export interface JobFitRecommendations {
  summary: string;
  experienceHighlights: { experienceId: string; tip: string }[];
  skillGaps: string[];
}

export interface JobFitPayload {
  jobSummary?: string;
  topKeywords?: string[];
  alignedExperienceIds?: string[];
  alignmentRationale?: JobFitAlignmentRationale[];
  recommendations?: JobFitRecommendations;
  marketTrendsNote?: string;
  jobMeta?: { company: string; role: string; applicationId: string };
  analyzedAt?: string;
}

export interface JobFitInsightRow {
  id: string;
  user_id: string;
  application_id: string;
  payload: JobFitPayload;
  created_at: string | null;
  updated_at: string | null;
}

export interface AnalyzeJobFitResponse {
  success: boolean;
  insight?: {
    id: string;
    payload: JobFitPayload;
    created_at: string | null;
    updated_at: string | null;
  };
  error?: string;
}
