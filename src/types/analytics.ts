export interface AnalyticsSummary {
  totalApplications: number;
  interviewRate: number;       // percentage 0-100
  averageAtsScore: number;
  outreachResponseRate: number; // percentage 0-100
}

export interface WeeklyTrend {
  week_start: string; // ISO date
  count: number;
}

export interface ATSBucket {
  range: string; // e.g. "60-70"
  count: number;
}

export interface FunnelStage {
  status: string;
  count: number;
}

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
