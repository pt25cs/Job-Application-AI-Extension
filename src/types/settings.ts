export interface UserSettings {
  user_id: string;
  ats_target_score: number;
  max_optimization_iterations: number;
  daily_outreach_limit: number;
  notifications_enabled: boolean;
  auto_optimize_on_detect: boolean;
  auto_discover_contacts: boolean;
  preferred_resume_template: string;
  theme: 'light' | 'dark';
  created_at: string;
  updated_at: string;
}

export type UserSettingsUpdate = Partial<Omit<UserSettings, 'user_id' | 'created_at' | 'updated_at'>>;
