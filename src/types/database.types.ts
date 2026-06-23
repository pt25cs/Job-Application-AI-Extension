export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: { created_at: string | null; event_type: string; id: string; metadata: Json | null; user_id: string }
        Insert: { created_at?: string | null; event_type: string; id?: string; metadata?: Json | null; user_id: string }
        Update: { created_at?: string | null; event_type?: string; id?: string; metadata?: Json | null; user_id?: string }
        Relationships: []
      }
      applications: {
        Row: { applied_at: string | null; ats_score: number | null; auto_filled: boolean | null; company: string; created_at: string | null; id: string; job_description: string | null; job_url: string; platform: string; role: string; status: string; tailored_resume_id: string | null; updated_at: string | null; user_id: string }
        Insert: { applied_at?: string | null; ats_score?: number | null; auto_filled?: boolean | null; company: string; created_at?: string | null; id?: string; job_description?: string | null; job_url: string; platform?: string; role: string; status?: string; tailored_resume_id?: string | null; updated_at?: string | null; user_id: string }
        Update: { applied_at?: string | null; ats_score?: number | null; auto_filled?: boolean | null; company?: string; created_at?: string | null; id?: string; job_description?: string | null; job_url?: string; platform?: string; role?: string; status?: string; tailored_resume_id?: string | null; updated_at?: string | null; user_id?: string }
        Relationships: [{ foreignKeyName: "applications_tailored_resume_id_fkey"; columns: ["tailored_resume_id"]; isOneToOne: false; referencedRelation: "resumes"; referencedColumns: ["id"] }]
      }
      contacts: {
        Row: { application_id: string | null; company: string | null; created_at: string | null; department: string | null; email: string | null; email_confidence: number | null; email_verified: boolean | null; first_name: string | null; full_name: string; id: string; is_alumni: boolean | null; last_name: string | null; linkedin_url: string | null; raw_data: Json | null; seniority: string | null; source: string | null; title: string | null; university: string | null; updated_at: string | null; user_id: string }
        Insert: { application_id?: string | null; company?: string | null; created_at?: string | null; department?: string | null; email?: string | null; email_confidence?: number | null; email_verified?: boolean | null; first_name?: string | null; full_name: string; id?: string; is_alumni?: boolean | null; last_name?: string | null; linkedin_url?: string | null; raw_data?: Json | null; seniority?: string | null; source?: string | null; title?: string | null; university?: string | null; updated_at?: string | null; user_id: string }
        Update: { application_id?: string | null; company?: string | null; created_at?: string | null; department?: string | null; email?: string | null; email_confidence?: number | null; email_verified?: boolean | null; first_name?: string | null; full_name?: string; id?: string; is_alumni?: boolean | null; last_name?: string | null; linkedin_url?: string | null; raw_data?: Json | null; seniority?: string | null; source?: string | null; title?: string | null; university?: string | null; updated_at?: string | null; user_id?: string }
        Relationships: [{ foreignKeyName: "contacts_application_id_fkey"; columns: ["application_id"]; isOneToOne: false; referencedRelation: "applications"; referencedColumns: ["id"] }]
      }
      job_fit_insights: {
        Row: { application_id: string; created_at: string | null; id: string; payload: Json; updated_at: string | null; user_id: string }
        Insert: { application_id: string; created_at?: string | null; id?: string; payload: Json; updated_at?: string | null; user_id: string }
        Update: { application_id?: string; created_at?: string | null; id?: string; payload?: Json; updated_at?: string | null; user_id?: string }
        Relationships: [{ foreignKeyName: "job_fit_insights_application_id_fkey"; columns: ["application_id"]; isOneToOne: true; referencedRelation: "applications"; referencedColumns: ["id"] }]
      }
      experiences: {
        Row: { bullets: Json | null; created_at: string | null; end_date: string | null; id: string; is_current: boolean | null; location: string | null; organization: string; skills: Json | null; sort_order: number | null; start_date: string | null; title: string; type: string; updated_at: string | null; user_id: string }
        Insert: { bullets?: Json | null; created_at?: string | null; end_date?: string | null; id?: string; is_current?: boolean | null; location?: string | null; organization: string; skills?: Json | null; sort_order?: number | null; start_date?: string | null; title: string; type: string; updated_at?: string | null; user_id: string }
        Update: { bullets?: Json | null; created_at?: string | null; end_date?: string | null; id?: string; is_current?: boolean | null; location?: string | null; organization?: string; skills?: Json | null; sort_order?: number | null; start_date?: string | null; title?: string; type?: string; updated_at?: string | null; user_id?: string }
        Relationships: []
      }
      outreach: {
        Row: { application_id: string | null; contact_id: string | null; created_at: string | null; email_body: string | null; email_html: string | null; email_subject: string | null; follow_up_at: string | null; follow_up_body: string | null; id: string; opened_at: string | null; resend_message_id: string | null; sent_at: string | null; status: string; updated_at: string | null; user_id: string }
        Insert: { application_id?: string | null; contact_id?: string | null; created_at?: string | null; email_body?: string | null; email_html?: string | null; email_subject?: string | null; follow_up_at?: string | null; follow_up_body?: string | null; id?: string; opened_at?: string | null; resend_message_id?: string | null; sent_at?: string | null; status?: string; updated_at?: string | null; user_id: string }
        Update: { application_id?: string | null; contact_id?: string | null; created_at?: string | null; email_body?: string | null; email_html?: string | null; email_subject?: string | null; follow_up_at?: string | null; follow_up_body?: string | null; id?: string; opened_at?: string | null; resend_message_id?: string | null; sent_at?: string | null; status?: string; updated_at?: string | null; user_id?: string }
        Relationships: [{ foreignKeyName: "outreach_application_id_fkey"; columns: ["application_id"]; isOneToOne: false; referencedRelation: "applications"; referencedColumns: ["id"] }, { foreignKeyName: "outreach_contact_id_fkey"; columns: ["contact_id"]; isOneToOne: false; referencedRelation: "contacts"; referencedColumns: ["id"] }]
      }
      profiles: {
        Row: { avatar_url: string | null; created_at: string | null; degree: string | null; email: string; field_of_study: string | null; full_name: string | null; github_url: string | null; graduation_year: number | null; headline: string | null; id: string; linkedin_url: string | null; location: string | null; onboarding_completed: boolean | null; phone: string | null; portfolio_url: string | null; summary: string | null; university: string | null; updated_at: string | null; years_of_experience: number | null }
        Insert: { avatar_url?: string | null; created_at?: string | null; degree?: string | null; email: string; field_of_study?: string | null; full_name?: string | null; github_url?: string | null; graduation_year?: number | null; headline?: string | null; id: string; linkedin_url?: string | null; location?: string | null; onboarding_completed?: boolean | null; phone?: string | null; portfolio_url?: string | null; summary?: string | null; university?: string | null; updated_at?: string | null; years_of_experience?: number | null }
        Update: { avatar_url?: string | null; created_at?: string | null; degree?: string | null; email?: string; field_of_study?: string | null; full_name?: string | null; github_url?: string | null; graduation_year?: number | null; headline?: string | null; id?: string; linkedin_url?: string | null; location?: string | null; onboarding_completed?: boolean | null; phone?: string | null; portfolio_url?: string | null; summary?: string | null; university?: string | null; updated_at?: string | null; years_of_experience?: number | null }
        Relationships: []
      }
      resumes: {
        Row: { application_id: string | null; ats_score: number | null; content: Json | null; created_at: string | null; file_path: string | null; file_size: number | null; id: string; is_primary: boolean | null; metadata: Json | null; title: string; type: string; updated_at: string | null; user_id: string }
        Insert: { application_id?: string | null; ats_score?: number | null; content?: Json | null; created_at?: string | null; file_path?: string | null; file_size?: number | null; id?: string; is_primary?: boolean | null; metadata?: Json | null; title: string; type?: string; updated_at?: string | null; user_id: string }
        Update: { application_id?: string | null; ats_score?: number | null; content?: Json | null; created_at?: string | null; file_path?: string | null; file_size?: number | null; id?: string; is_primary?: boolean | null; metadata?: Json | null; title?: string; type?: string; updated_at?: string | null; user_id?: string }
        Relationships: []
      }
      skills: {
        Row: { category: string; created_at: string | null; id: string; name: string; proficiency: string; user_id: string }
        Insert: { category?: string; created_at?: string | null; id?: string; name: string; proficiency?: string; user_id: string }
        Update: { category?: string; created_at?: string | null; id?: string; name?: string; proficiency?: string; user_id?: string }
        Relationships: []
      }
      user_settings: {
        Row: { ats_target_score: number | null; auto_discover_contacts: boolean | null; auto_optimize_on_detect: boolean | null; created_at: string | null; daily_outreach_limit: number | null; max_optimization_iterations: number | null; notifications_enabled: boolean | null; preferred_resume_template: string | null; theme: string | null; updated_at: string | null; user_id: string }
        Insert: { ats_target_score?: number | null; auto_discover_contacts?: boolean | null; auto_optimize_on_detect?: boolean | null; created_at?: string | null; daily_outreach_limit?: number | null; max_optimization_iterations?: number | null; notifications_enabled?: boolean | null; preferred_resume_template?: string | null; theme?: string | null; updated_at?: string | null; user_id: string }
        Update: { ats_target_score?: number | null; auto_discover_contacts?: boolean | null; auto_optimize_on_detect?: boolean | null; created_at?: string | null; daily_outreach_limit?: number | null; max_optimization_iterations?: number | null; notifications_enabled?: boolean | null; preferred_resume_template?: string | null; theme?: string | null; updated_at?: string | null; user_id?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      get_weekly_application_trend: {
        Args: { p_user_id: string; p_weeks: number }
        Returns: { count: number; week_start: string }[]
      }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Update"]
