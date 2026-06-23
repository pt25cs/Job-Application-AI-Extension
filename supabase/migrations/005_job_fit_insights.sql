-- GPT job fit analysis: aligned experiences + stored recommendations per application

CREATE TABLE IF NOT EXISTS public.job_fit_insights (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id  UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  payload         JSONB NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (application_id)
);

CREATE INDEX IF NOT EXISTS job_fit_insights_user_id_idx ON public.job_fit_insights(user_id);

ALTER TABLE public.job_fit_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own job fit insights"
  ON public.job_fit_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own job fit insights"
  ON public.job_fit_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job fit insights"
  ON public.job_fit_insights FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own job fit insights"
  ON public.job_fit_insights FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER job_fit_insights_updated_at
  BEFORE UPDATE ON public.job_fit_insights
  FOR EACH ROW EXECUTE FUNCTION public.update_applications_updated_at();
