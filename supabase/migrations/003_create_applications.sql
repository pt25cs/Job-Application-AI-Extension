-- Migration: 003_create_applications
-- Creates the applications table for tracking job applications

CREATE TABLE IF NOT EXISTS public.applications (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company             TEXT NOT NULL,
  role                TEXT NOT NULL,
  job_url             TEXT NOT NULL,
  job_description     TEXT,
  platform            TEXT NOT NULL DEFAULT 'unknown',
  tailored_resume_id  UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  ats_score           INTEGER,
  status              TEXT NOT NULL DEFAULT 'detected'
    CHECK (status IN ('detected','optimizing','ready','applied','interviewing','rejected','offer','withdrawn')),
  auto_filled         BOOLEAN DEFAULT FALSE,
  applied_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS applications_user_id_idx ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS applications_status_idx ON public.applications(status);

-- RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON public.applications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON public.applications FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_applications_updated_at();
