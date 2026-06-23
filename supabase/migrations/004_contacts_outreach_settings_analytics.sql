-- Migration: 004_contacts_outreach_settings_analytics
-- Creates contacts, outreach, user_settings, analytics_events tables
-- and get_weekly_application_trend function

-- ============================================================
-- contacts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contacts (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  application_id    UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  full_name         TEXT NOT NULL,
  first_name        TEXT,
  last_name         TEXT,
  title             TEXT,
  company           TEXT,
  email             TEXT,
  email_verified    BOOLEAN DEFAULT FALSE,
  email_confidence  INTEGER,
  linkedin_url      TEXT,
  is_alumni         BOOLEAN DEFAULT FALSE,
  university        TEXT,
  seniority         TEXT,
  department        TEXT,
  source            TEXT,
  raw_data          JSONB,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email)
);

CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS contacts_application_id_idx ON public.contacts(application_id);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_select" ON public.contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "contacts_insert" ON public.contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contacts_update" ON public.contacts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contacts_delete" ON public.contacts FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_contacts_updated_at();

-- ============================================================
-- outreach
-- ============================================================
CREATE TABLE IF NOT EXISTS public.outreach (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id          UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  application_id      UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  email_subject       TEXT,
  email_body          TEXT,
  email_html          TEXT,
  status              TEXT NOT NULL DEFAULT 'drafted'
    CHECK (status IN ('drafted','approved','sending','sent','follow_up_scheduled','follow_up_sent','replied','bounced')),
  sent_at             TIMESTAMPTZ,
  follow_up_at        TIMESTAMPTZ,
  follow_up_body      TEXT,
  resend_message_id   TEXT,
  opened_at           TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS outreach_user_id_idx ON public.outreach(user_id);
CREATE INDEX IF NOT EXISTS outreach_application_id_idx ON public.outreach(application_id);
CREATE INDEX IF NOT EXISTS outreach_status_idx ON public.outreach(status);

ALTER TABLE public.outreach ENABLE ROW LEVEL SECURITY;

CREATE POLICY "outreach_select" ON public.outreach FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "outreach_insert" ON public.outreach FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "outreach_update" ON public.outreach FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "outreach_delete" ON public.outreach FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_outreach_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER outreach_updated_at
  BEFORE UPDATE ON public.outreach
  FOR EACH ROW EXECUTE FUNCTION public.update_outreach_updated_at();

-- ============================================================
-- user_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id                     UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  ats_target_score            INTEGER DEFAULT 80,
  max_optimization_iterations INTEGER DEFAULT 3,
  daily_outreach_limit        INTEGER DEFAULT 20,
  notifications_enabled       BOOLEAN DEFAULT TRUE,
  auto_optimize_on_detect     BOOLEAN DEFAULT FALSE,
  auto_discover_contacts      BOOLEAN DEFAULT FALSE,
  preferred_resume_template   TEXT DEFAULT 'default',
  theme                       TEXT DEFAULT 'light',
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_select" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "settings_insert" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "settings_update" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_user_settings_updated_at();

-- ============================================================
-- analytics_events
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type  TEXT NOT NULL,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS analytics_events_type_idx ON public.analytics_events(event_type);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics_select" ON public.analytics_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "analytics_insert" ON public.analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- get_weekly_application_trend
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_weekly_application_trend(p_user_id UUID, p_weeks INTEGER)
RETURNS TABLE(week_start DATE, count BIGINT) AS $$
  SELECT
    date_trunc('week', created_at)::DATE AS week_start,
    COUNT(*) AS count
  FROM public.applications
  WHERE user_id = p_user_id
    AND created_at >= NOW() - (p_weeks || ' weeks')::INTERVAL
  GROUP BY 1
  ORDER BY 1;
$$ LANGUAGE sql STABLE;
