export interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  github_url: string | null;
  university: string | null;
  degree: string | null;
  graduation_year: number | null;
  field_of_study: string | null;
  years_of_experience: number | null;
  headline: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  user_id: string;
  type: 'work' | 'project' | 'volunteer' | 'education';
  title: string;
  organization: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  bullets: string[];
  skills: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  category: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  type: 'base' | 'tailored';
  content: StructuredResume | null;
  file_path: string | null;
  file_size: number | null;
  application_id: string | null;
  ats_score: number | null;
  is_primary: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface StructuredResume {
  personal: {
    full_name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin_url?: string;
    portfolio_url?: string;
    github_url?: string;
  };
  summary: string;
  experience: Experience[];
  education: Experience[];
  skills: Skill[];
  projects: Experience[];
}
