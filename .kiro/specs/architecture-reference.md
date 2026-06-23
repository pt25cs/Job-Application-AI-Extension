# AutoApply — Architecture Reference

This document contains the global architecture decisions, shared patterns, and appendices from the masterplan. All specs reference this document for shared context.

Source: #[[file:masterplan.md]]

---

## Technology Stack (Immutable)

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| Build | Vite | 5.x+ | Sub-second HMR, native ESM, Chrome extension support via `@crxjs/vite-plugin` |
| UI Framework | React | 18.x+ | Component model, concurrent features, massive ecosystem |
| Language | TypeScript | 5.x (strict) | Type safety across extension contexts, Supabase type generation |
| Extension API | Manifest V3 | — | Required by Chrome Web Store, service worker model |
| State | Zustand | 4.x+ | Minimal boilerplate, works in all extension contexts |
| Styling | TailwindCSS + shadcn/ui | 3.x / latest | Utility-first, tree-shakeable, accessible components |
| Backend | Supabase | — | Auth + Postgres + Edge Functions + Storage + Realtime |
| LLM | OpenAI GPT-4o / GPT-4o-mini | — | Structured output, function calling, cost tiering |
| Email | Resend | — | Developer-first transactional email, custom domain |
| Contact Data | Apollo.io + Proxycurl + Hunter.io | — | Bulk search, LinkedIn enrichment, email verification |

---

## Extension Context Model

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Browser Process                     │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ Service       │  │ Content       │  │ Side Panel          │ │
│  │ Worker        │  │ Scripts       │  │ (React App)         │ │
│  │               │  │               │  │                     │ │
│  │ • Lifecycle   │  │ • DOM access  │  │ • Primary UI        │ │
│  │ • Message     │  │ • Page        │  │ • Auth flows        │ │
│  │   routing     │  │   detection   │  │ • Profile mgmt      │ │
│  │ • Supabase    │  │ • Auto-fill   │  │ • Dashboard         │ │
│  │   client      │  │ • JD extract  │  │ • Outreach review   │ │
│  │ • Alarm API   │  │               │  │                     │ │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬──────────┘ │
│         │                  │                     │            │
│         └──────── chrome.runtime.sendMessage ────┘            │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │ HTTPS
                            ▼
┌───────────────────────────────────────────────────────────────┐
│                     Supabase Platform                          │
│  Auth │ Postgres │ Edge Functions │ Storage │ Realtime         │
└───────────────────────────────────────────────────────────────┘
```

---

## Supabase Client Singleton (Canonical Implementation)

Every spec that touches Supabase MUST import from this single shared module:

```typescript
// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const chromeStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    const result = await chrome.storage.local.get(key);
    return result[key] ?? null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await chrome.storage.local.set({ [key]: value });
  },
  removeItem: async (key: string): Promise<void> => {
    await chrome.storage.local.remove(key);
  },
};

export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: chromeStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      flowType: 'pkce',
    },
  }
);
```

---

## Message Passing Protocol

All inter-context communication uses typed messages:

```typescript
// src/types/messages.ts
type MessageType =
  | 'DETECT_ATS_PLATFORM'
  | 'EXTRACT_JOB_DESCRIPTION'
  | 'AUTOFILL_FORM'
  | 'GET_AUTH_SESSION'
  | 'OPEN_SIDE_PANEL'
  | 'OPTIMIZATION_STATUS'
  | 'OUTREACH_STATUS';

interface ExtensionMessage<T = unknown> {
  type: MessageType;
  payload: T;
  tabId?: number;
  timestamp: number;
}

interface ExtensionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
```

---

## Critical Architectural Constraints

These rules are IMMUTABLE across all specs:

1. Every Supabase table MUST have RLS policies. No exceptions.
2. All API keys (OpenAI, Apollo, Hunter, Proxycurl, Resend) MUST live as secrets in Supabase Edge Function environment variables. NEVER in the extension bundle.
3. The extension MUST work with Manifest V3 service workers (not persistent background pages).
4. All LLM calls MUST use structured output (JSON mode or function calling) to prevent hallucination.
5. The auto-fill system MUST use a platform adapter pattern — no monolithic switch statements.
6. The ATS optimization loop MUST be server-side (Edge Function), not client-side.
7. PDF generation for tailored resumes happens client-side (react-pdf or jspdf).
8. All Supabase client usage MUST use the custom chrome.storage.local adapter (not localStorage).
9. Supabase connection uses `@supabase/supabase-js` with PKCE auth flow and Edge Function invocation via `supabase.functions.invoke()`.

---

## Complete Database Schema (All Tables)

### profiles (Spec 2 + Spec 3)
```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  phone TEXT,
  location TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  github_url TEXT,
  university TEXT,
  degree TEXT,
  graduation_year INTEGER,
  field_of_study TEXT,
  years_of_experience INTEGER,
  headline TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### experiences (Spec 3)
```sql
CREATE TABLE public.experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('work', 'project', 'volunteer', 'education')),
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  bullets JSONB DEFAULT '[]'::jsonb,
  skills JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### skills (Spec 3)
```sql
CREATE TABLE public.skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('technical', 'language', 'framework', 'tool', 'soft_skill', 'other')),
  proficiency TEXT CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);
```

### resumes (Spec 3)
```sql
CREATE TABLE public.resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('base', 'tailored')),
  content JSONB,
  file_path TEXT,
  file_size INTEGER,
  application_id UUID,
  ats_score INTEGER,
  is_primary BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### applications (Spec 6)
```sql
CREATE TABLE public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  job_url TEXT,
  job_description TEXT,
  platform TEXT,
  tailored_resume_id UUID REFERENCES public.resumes(id),
  ats_score INTEGER,
  status TEXT DEFAULT 'detected' CHECK (status IN (
    'detected', 'optimizing', 'ready', 'applied', 'interviewing', 'rejected', 'offer', 'withdrawn'
  )),
  auto_filled BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### contacts (Spec 7)
```sql
CREATE TABLE public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  application_id UUID REFERENCES public.applications(id),
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  title TEXT,
  company TEXT NOT NULL,
  email TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  email_confidence INTEGER,
  linkedin_url TEXT,
  is_alumni BOOLEAN DEFAULT FALSE,
  university TEXT,
  seniority TEXT,
  department TEXT,
  source TEXT NOT NULL,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email)
);
```

### outreach (Spec 8)
```sql
CREATE TABLE public.outreach (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  application_id UUID REFERENCES public.applications(id),
  email_subject TEXT NOT NULL,
  email_body TEXT NOT NULL,
  email_html TEXT,
  status TEXT DEFAULT 'drafted' CHECK (status IN (
    'drafted', 'approved', 'sending', 'sent', 'follow_up_scheduled', 'follow_up_sent', 'replied', 'bounced'
  )),
  sent_at TIMESTAMPTZ,
  follow_up_at TIMESTAMPTZ,
  follow_up_body TEXT,
  resend_message_id TEXT,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### user_settings (Spec 10)
```sql
CREATE TABLE public.user_settings (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  ats_target_score INTEGER DEFAULT 85,
  max_optimization_iterations INTEGER DEFAULT 3,
  daily_outreach_limit INTEGER DEFAULT 20,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  auto_optimize_on_detect BOOLEAN DEFAULT FALSE,
  auto_discover_contacts BOOLEAN DEFAULT FALSE,
  preferred_resume_template TEXT DEFAULT 'professional',
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### analytics_events (Spec 10)
```sql
CREATE TABLE public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'application_created', 'application_status_changed', 'resume_optimized',
    'autofill_completed', 'contact_discovered', 'outreach_sent', 'outreach_replied',
    'interview_scheduled', 'offer_received'
  )),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Environment Variables

```env
# .env (extension build — committed as .env.example)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Supabase Edge Function Secrets (set via CLI or dashboard — NEVER committed)
OPENAI_API_KEY=sk-...
APOLLO_API_KEY=...
PROXYCURL_API_KEY=...
HUNTER_API_KEY=...
RESEND_API_KEY=re_...
```

---

## Dependency Manifest

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@supabase/supabase-js": "^2.45.0",
    "zustand": "^4.5.0",
    "@react-pdf/renderer": "^3.4.0",
    "lucide-react": "^0.400.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.4.0",
    "driver.js": "^1.3.0",
    "recharts": "^2.12.0"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "@vitejs/plugin-react": "^4.3.0",
    "@crxjs/vite-plugin": "^2.0.0-beta.25",
    "typescript": "^5.5.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/chrome": "^0.0.270",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## Edge Function Deployment

```bash
supabase functions deploy optimize-resume
supabase functions deploy discover-contacts
supabase functions deploy draft-outreach
supabase functions deploy send-outreach

supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set APOLLO_API_KEY=...
supabase secrets set PROXYCURL_API_KEY=...
supabase secrets set HUNTER_API_KEY=...
supabase secrets set RESEND_API_KEY=re_...
```

---

## Implementation Priority Matrix

| Spec | Priority | Depends On | Est. Effort | Cumulative |
|------|----------|-----------|-------------|------------|
| 1. Project Scaffolding | P0 | — | 1 day | 1 day |
| 2. Supabase Auth | P0 | Spec 1 | 1 day | 2 days |
| 3. Profile & Resume | P0 | Spec 1, 2 | 2 days | 4 days |
| 4. ATS Detection | P0 | Spec 1 | 2 days | 6 days |
| 5. Auto-Fill | P0 | Spec 1, 3, 4 | 3 days | 9 days |
| 6. ATS Optimization | P0 | Spec 1, 2, 3, 4 | 3 days | 12 days |
| 7. Contact Discovery | P1 | Spec 1, 2, 6 | 2 days | 14 days |
| 8. Outreach Dispatch | P1 | Spec 7 | 2 days | 16 days |
| 9. Dashboard | P1 | Spec 6 | 2 days | 18 days |
| 10. Analytics & Settings | P2 | All | 3 days | 21 days |

Total estimated build time: 21 engineering days (with Kiro agent acceleration)
