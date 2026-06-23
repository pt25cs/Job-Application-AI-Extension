# AutoApply — Master Technical Blueprint

**Version:** 1.1.0
**Date:** April 11, 2026
**Codename:** Project Catalyst
**Document owner:** Architecture Team — Silicon Valley HQ

**Purpose:** This document is the single source of truth for **product intent, delivery, commercial assumptions, risk posture, and technical implementation**. Specs 1–10 remain implementation-ready for engineering; sections below establish **team accountability, schedule credibility, market positioning, economics, and existential risks** so reviewers can evaluate a real program—not only an agent-oriented build plan.

---

## Table of Contents

### Program & business context

- [Team plan, parallel workstreams, and sprint milestones](#team-plan-parallel-workstreams-and-sprint-milestones)
- [User validation & evidence](#user-validation--evidence)
- [Competitive positioning matrix](#competitive-positioning-matrix)
- [Monetization & unit economics](#monetization--unit-economics)
- [Risk register](#risk-register)

### Technical specifications

1. [Spec 1 — P0: Project Scaffolding & Extension Shell](#spec-1--p0-project-scaffolding--extension-shell)
2. [Spec 2 — P0: Supabase Auth Integration](#spec-2--p0-supabase-auth-integration)
3. [Spec 3 — P0: User Profile & Resume Management](#spec-3--p0-user-profile--resume-management)
4. [Spec 4 — P0: ATS Platform Detection Engine](#spec-4--p0-ats-platform-detection-engine)
5. [Spec 5 — P0: Auto-Fill System](#spec-5--p0-auto-fill-system)
6. [Spec 6 — P0: ATS Resume Optimization Loop](#spec-6--p0-ats-resume-optimization-loop)
7. [Spec 7 — P1: Contact Discovery & Enrichment Pipeline](#spec-7--p1-contact-discovery--enrichment-pipeline)
8. [Spec 8 — P1: Outreach Drafting & Dispatch](#spec-8--p1-outreach-drafting--dispatch)
9. [Spec 9 — P1: Application Tracking Dashboard](#spec-9--p1-application-tracking-dashboard)
10. [Spec 10 — P2: Analytics, Settings & Polish](#spec-10--p2-analytics-settings--polish)

---

## Team plan, parallel workstreams, and sprint milestones

### Core roles (accountability)

| Role | Primary ownership | Notes |
|------|-------------------|--------|
| **Product / Program** | Scope, prioritization (P0 vs P1), stakeholder comms, hackathon submission narrative | Part-time acceptable if one engineer owns a lightweight backlog |
| **Tech lead — extension** | Manifest V3, side panel, content scripts, `chrome.*` APIs, Chrome Web Store packaging | Pairs with extension engineer on message protocol |
| **Engineer — extension & client** | React side panel, Zustand, platform adapters (Spec 4–5), PDF/render flows | Highest parallel load in P0 |
| **Engineer — backend & Edge Functions** | Supabase schema, RLS, Edge Functions (Specs 6–8), secrets, Realtime channels | Can overlap with extension on API contracts |
| **Design / UX (fractional)** | Onboarding, dashboard density, outreach review UX | Not required week one; needed before store listing |

Headcount assumption for a credible P0: **minimum three contributors** (e.g. product + two engineers, or two engineers + fractional design). A single developer can implement the stack sequentially; **calendar time** then dominates (see Appendix D).

### Parallel workstreams

Workstreams are intentionally **decoupled** after Spec 2 so two engineers rarely block each other:

| Workstream | Specs | Can run in parallel once… |
|------------|-------|---------------------------|
| **A — Shell & auth** | 1, 2 | After repo exists |
| **B — Profile & assets** | 3 | After 2 (auth for RLS) |
| **C — ATS detection & autofill** | 4, 5 | After 1; **5** needs 3 + 4 |
| **D — Optimization & AI** | 6 | After 2, 3, 4 |
| **E — Networking & comms** | 7, 8 | After 6 (job context stable) |
| **F — Dashboards & polish** | 9, 10 | After 6 (9); 10 after major features |

**Rule:** Engineer 1 owns **A → C → D** spine; Engineer 2 owns **B** then joins **D** Edge Functions or **E** after P0 merge window—exact split is team-dependent.

### Sprint milestones (calendar-oriented)

Sprints are **two calendar weeks** each. Durations below assume **human team execution** with AI-assisted coding—not “wall-clock = model latency.”

| Sprint | Dates (illustrative) | Deliverable | Exit criteria |
|--------|----------------------|-------------|---------------|
| **Sprint 0** | Week 0 | Repo, CI, `.env.example`, design tokens | `npm run dev` loads unpacked extension; side panel blank shell |
| **Sprint 1** | Weeks 1–2 | Specs **1–2** complete | Google OAuth works; session survives reload |
| **Sprint 2** | Weeks 3–4 | Specs **3–4** complete | Profile + resume upload; ATS adapter registry detects ≥2 platforms |
| **Sprint 3** | Weeks 5–6 | Specs **5–6** complete | Autofill demo on one ATS; optimization Edge Function + Realtime progress |
| **Sprint 4** | Weeks 7–8 | **P0 hardening** | E2E path: sign in → profile → detect job → optimize → export; store-readiness review |
| **Sprint 5** | Weeks 9–10 | Specs **7–8** | Discovery + draft + send behind feature flags |
| **Sprint 6** | Weeks 11–12 | Specs **9–10** | Dashboard + analytics + settings; rate-limit UX |

**P0-only target:** End of **Sprint 4** (eight calendar weeks) for a **reviewable MVP** (Specs 1–6 production-ready with QA), assuming dedicated part-time or full-time engineering—not the **~21 nominal engineering days** serial sum applied to P0 alone (see Appendix D).

---

## User validation & evidence

This blueprint is **strong on architecture** and **honest on validation**: we do not claim statistically significant user studies inside this document. We **do** commit to the following **evidence ladder** so the product thesis is testable:

| Stage | Activity | Success signal |
|-------|----------|----------------|
| **Alpha (internal + 5–10 users)** | Scripted apply + optimize on 3 ATS families (Workday, Greenhouse-family, Ashby) | Task completion without support; no P0 bugs |
| **Beta (20–40 job seekers)** | 2-week diary: applications submitted, optimization used, outreach sent | ≥60% would recommend; qualitative friction log |
| **Hackathon / judging** | Live demo + architecture walkthrough | Reviewer confidence in feasibility and differentiation |

Artifacts stored outside this file: interview notes, session recordings (with consent), and a lightweight **insight summary** linked from the repo README in later revisions.

---

## Competitive positioning matrix

| Dimension | **LinkedIn Easy Apply** | **Simplify** | **LazyApply** | **AutoApply (this product)** |
|-----------|-------------------------|--------------|---------------|-------------------------------|
| **Primary surface** | LinkedIn-hosted flows | Browser extension + web | Browser extension | Chrome extension + side panel |
| **Autofill / one-click** | Strong within LinkedIn ecosystem | Broad site support | Emphasis on speed / volume | Multi-ATS adapters + explicit user triggers |
| **Resume intelligence** | Minimal (profile-driven) | Limited; varies by plan | Often generic | **ATS-scored iterative rewrite** (Spec 6) with experience bank |
| **Networking / outreach** | InMail (paid); no job-specific recruiter finder | Not core | Varies | **Discovery + drafted outreach** (Specs 7–8) tied to application |
| **Pipeline visibility** | Basic “saved jobs” | Application tracking features | Tracking / automation focus | **Kanban + Realtime** (Spec 9) |
| **Data posture** | LinkedIn-controlled | Third-party extension trust model | Similar | **User-owned** Supabase account; RLS; secrets server-side |
| **Moat thesis** | Distribution | Brand + UX | Automation claims | **Optimization loop + enrichment graph + transparency** |

**Positioning statement:** AutoApply competes not on “most sites autofilled per minute” alone but on **quality of the application artifact** (ATS-aligned resume + traceability) and **downstream networking** tied to the same application context—areas where Easy Apply is weak and generic autofill tools under-invest.

---

## Monetization & unit economics

### Model (v1 hypothesis)

| Tier | Price (indicative) | Included | Purpose |
|------|-------------------|----------|---------|
| **Free** | $0 | Limited optimizations / month (GPT-4o-mini-heavy); no or capped contact discovery | Acquisition; funnel to paid |
| **Pro** | $15–25 / month | Higher optimization caps; GPT-4o on final pass; discovery runs/month; outreach sends | Core revenue |
| **Team / campus (future)** | Custom | Shared seats, admin, SSO | Not in P0 scope |

Annual prepay discount (e.g. 2 months free) improves LTV without changing COGS structure.

### Variable COGS (per heavy user month, order-of-magnitude)

Assumptions aligned with **caps in this document** (e.g. discovery run ≤$0.15, optimization iterations mostly mini, one GPT-4o final pass per job where enabled):

| Cost driver | Conservative monthly load | Unit cost basis | ~Monthly COGS |
|-------------|---------------------------|-----------------|---------------|
| **OpenAI** | 30 jobs × optimize pipeline | Mostly `gpt-4o-mini`; 30× `gpt-4o` final | **~$8–20** (highly sensitive to token counts) |
| **Proxycurl** | 10 discovery runs × 10 calls | ~$0.01/call | **~$1.00** |
| **Hunter + Apollo** | Bundled API credits | Per-search / verify | **~$2–8** (plan-dependent) |
| **Resend** | ≤20 outreach/day cap × 30 | Well under paid tier at moderate scale | **~$0–5** |
| **Supabase** | Pro project + bandwidth | Fixed + variable | **Allocated per user $1–3** |

**Target:** Pro price **≥4× blended COGS** on power users after payment processing; if not, **tighten free tier caps** (optimizations/month, discovery runs, GPT-4o final passes) before scaling ads.

### Levers that protect margin

1. **Model routing:** Spec 6 already tiers mini vs 4o—enforce **4o only on paid** or on “final polish” step.
2. **Discovery budgets:** Hard per-run caps (already specified) + **monthly discovery quota** per subscription tier.
3. **Human-in-the-loop:** Reduces failed sends, bounces, and abuse—protects domain reputation and support cost.
4. **Pass-through avoidance:** Do not promise “unlimited” Proxycurl or OpenAI on Free.

---

## Risk register

| ID | Category | Risk | Likelihood | Impact | Mitigation & owner |
|----|----------|------|------------|--------|---------------------|
| **R-CWS-01** | Chrome Web Store | Rejection or removal for **deceptive behavior**, undisclosed data use, or **automation that violates single-purpose policy** | Med | Existential (distribution) | Clear listing copy; privacy policy; **obvious user consent** before autofill/send; no covert scraping; Tech lead reviews [Program Policies](https://developer.chrome.com/docs/webstore/program-policies/) each release |
| **R-CWS-02** | Chrome Web Store | **Manifest/API changes** (MV3 ongoing constraints) break extension | Low–Med | High | Pin Chromium release targets; minimal permissions; abstraction over `chrome.*` where feasible |
| **R-ATS-01** | ATS / employer | **Bot detection, CAPTCHA, rate limits, IP reputation** block autofill or submission | Med | High | User-paced actions; **fallback to manual confirm**; avoid headless patterns; respect `robots`/ToS where applicable; monitor per-adapter failure rates |
| **R-ATS-02** | ATS / employer | **DOM changes** break selectors (fragile adapters) | High | Med | Adapter versioning; health checks; graceful degradation; telemetry on detection failures |
| **R-LLM-01** | Vendor | OpenAI **pricing, outages, or policy** changes | Med | Med | Abstract LLM client; cache prompts; circuit breakers; optional second provider later |
| **R-DATA-01** | Privacy | User PII in resumes + contacts—**breach or misuse** | Low | Existential | RLS (already); minimize retention; Edge secrets; optional DPA with vendors |
| **R-UNIT-01** | Economics | **COGS exceed** subscription on power users | Med | High | Enforce tier caps; dynamic throttling; monitor per-user COGS in analytics (Spec 10) |

**Review cadence:** Product + Tech lead walk this register **monthly** and within **48 hours** of any Chrome Web Store message or major ATS incident.

---

## Global Architecture Preamble

### Technology Stack (Immutable)

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| Build | Vite | 5.x+ | Sub-second HMR, native ESM, first-class Chrome extension support via `@crxjs/vite-plugin` |
| UI Framework | React | 18.x+ | Component model, concurrent features, massive ecosystem |
| Language | TypeScript | 5.x (strict) | Type safety across extension contexts, Supabase type generation |
| Extension API | Manifest V3 | — | Required by Chrome Web Store as of 2024, service worker model |
| State | Zustand | 4.x+ | Minimal boilerplate, works in all extension contexts, middleware support |
| Styling | TailwindCSS + shadcn/ui | 3.x / latest | Utility-first, tree-shakeable, accessible component primitives |
| Backend | Supabase | — | Auth + Postgres + Edge Functions + Storage + Realtime in one platform |
| LLM | OpenAI GPT-4o / GPT-4o-mini | — | Structured output support, function calling, cost tiering |
| Email | Resend | — | Developer-first transactional email, custom domain, webhook tracking |
| Contact Data | Apollo.io + Proxycurl + Hunter.io | — | Complementary coverage: bulk search, LinkedIn enrichment, email verification |

### Extension Context Model

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

### Supabase Client Singleton (Used Across All Specs)

Every spec that touches Supabase MUST import from a single shared client module. This is the canonical implementation:

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

### Message Passing Protocol

All inter-context communication uses a typed message protocol:

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

## Spec 1 — P0: Project Scaffolding & Extension Shell

### 1.1 Priority & Objective

**Priority:** P0 — Core MVP
**Justification:** Nothing can be built without the foundational project structure, build pipeline, and extension shell. This is the skeleton upon which every other spec depends.

**Objective:** Establish a fully functional Chrome extension development environment using Vite + React + TypeScript with Manifest V3, including the side panel UI shell, service worker entry point, content script injection framework, TailwindCSS + shadcn/ui component library, and a production build pipeline that outputs a Chrome Web Store-ready `.zip`.

**User Story:** "As a developer on the team, I can clone the repo, run `npm install && npm run dev`, and see a working Chrome extension with hot-reload, a side panel UI, and a service worker — so that I can immediately begin building features."

**Success Criteria:**
- `npm run dev` launches Vite with HMR and the extension loads in Chrome via `chrome://extensions`
- Side panel opens when the extension icon is clicked
- Service worker registers and logs lifecycle events
- Content script injects on target ATS domains (placeholder)
- `npm run build` produces a `dist/` folder loadable as an unpacked extension
- `npm run package` produces a `.zip` for Chrome Web Store submission
- All TypeScript compiles with zero errors under `strict: true`

### 1.2 Architecture & Tech Stack

**Extension Contexts Involved:**
- Service worker (`src/background/index.ts`) — lifecycle management, message routing, alarm scheduling
- Side panel (`src/sidepanel/index.html` + `src/sidepanel/App.tsx`) — primary React UI
- Content scripts (`src/content/index.ts`) — injected into ATS pages, DOM interaction
- Options page (`src/options/index.html` + `src/options/App.tsx`) — settings, API key management (future)

**Vite Configuration:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.config';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      input: {
        sidepanel: 'src/sidepanel/index.html',
        options: 'src/options/index.html',
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
});
```

**Manifest V3 Configuration:**

```typescript
// manifest.config.ts
import { defineManifest } from '@crxjs/vite-plugin';
import packageJson from './package.json';

const { version } = packageJson;

export default defineManifest({
  manifest_version: 3,
  name: 'AutoApply',
  version,
  description: 'Automate your entire job application and networking lifecycle.',
  permissions: [
    'sidePanel',
    'storage',
    'activeTab',
    'tabs',
    'alarms',
    'identity',
  ],
  host_permissions: [
    'https://boards.greenhouse.io/*',
    'https://jobs.lever.co/*',
    'https://*.myworkdayjobs.com/*',
    'https://*.ashbyhq.com/*',
    'https://*.bamboohr.com/*',
    'https://*.icims.com/*',
    'https://*.taleo.net/*',
  ],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
  content_scripts: [
    {
      matches: [
        'https://boards.greenhouse.io/*',
        'https://jobs.lever.co/*',
        'https://*.myworkdayjobs.com/*',
        'https://*.ashbyhq.com/*',
        'https://*.bamboohr.com/*',
        'https://*.icims.com/*',
        'https://*.taleo.net/*',
      ],
      js: ['src/content/index.ts'],
      run_at: 'document_idle',
    },
  ],
  action: {
    default_title: 'Open AutoApply',
  },
  options_page: 'src/options/index.html',
  icons: {
    '16': 'public/icons/icon-16.png',
    '48': 'public/icons/icon-48.png',
    '128': 'public/icons/icon-128.png',
  },
});
```

**Manifest V3 Permissions Justification:**
| Permission | Reason |
|-----------|--------|
| `sidePanel` | Primary UI surface for the extension |
| `storage` | Persist Supabase auth session via `chrome.storage.local` |
| `activeTab` | Access current tab URL for ATS detection |
| `tabs` | Query tab URLs for platform detection across tabs |
| `alarms` | Schedule periodic token refresh, outreach follow-ups |
| `identity` | OAuth redirect URL generation via `chrome.identity.getRedirectURL()` |

**Module Boundaries:**
- This spec produces the project skeleton. All other specs add files into this structure.
- No dependency on other specs. All other specs depend on this one.

**Supabase Services:** None directly (client singleton is defined here but not used until Spec 2).

### 1.3 Database Schema & Data Structures

No database tables in this spec. This spec defines the foundational TypeScript types and project structure only.

**Project Directory Structure:**

```
autoapply/
├── public/
│   └── icons/
│       ├── icon-16.png
│       ├── icon-48.png
│       └── icon-128.png
├── src/
│   ├── background/
│   │   └── index.ts                 # Service worker entry
│   ├── content/
│   │   └── index.ts                 # Content script entry
│   ├── sidepanel/
│   │   ├── index.html               # Side panel HTML shell
│   │   ├── main.tsx                  # React entry point
│   │   ├── App.tsx                   # Root component with router
│   │   └── components/              # Shared UI components
│   │       └── ui/                  # shadcn/ui components
│   ├── options/
│   │   ├── index.html
│   │   └── App.tsx
│   ├── lib/
│   │   └── supabase.ts              # Supabase client singleton
│   ├── stores/
│   │   └── index.ts                 # Zustand store barrel export
│   ├── types/
│   │   ├── messages.ts              # Extension message protocol
│   │   └── database.types.ts        # Generated Supabase types (placeholder)
│   └── utils/
│       └── messaging.ts             # Typed message send/receive helpers
├── manifest.config.ts
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── package.json
└── .env.example
```

**Zustand Store Shell:**

```typescript
// src/stores/index.ts
import { create } from 'zustand';

interface AppState {
  initialized: boolean;
  setInitialized: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  initialized: false,
  setInitialized: (value) => set({ initialized: value }),
}));
```

**chrome.storage.local Keys (this spec):**

```typescript
// Keys reserved by this spec
interface StorageKeys {
  'autoapply:initialized': boolean;       // First-run flag
  'autoapply:supabase:session': string;   // Supabase session JSON (used by Spec 2)
}
```

### 1.4 Logic & Algorithms

**Service Worker Lifecycle:**

```
1. On install:
   a. Log "AutoApply service worker installed"
   b. Set chrome.storage.local 'autoapply:initialized' = true
   c. Open side panel on first install

2. On activate:
   a. Claim all clients
   b. Log "AutoApply service worker activated"

3. On action click (extension icon):
   a. Call chrome.sidePanel.open({ windowId })
   b. If side panel already open, focus it

4. On message received:
   a. Parse ExtensionMessage type
   b. Route to appropriate handler (placeholder handlers for now)
   c. Return ExtensionResponse
```

**Content Script Injection Logic:**

```
1. On document_idle:
   a. Determine current URL
   b. Send DETECT_ATS_PLATFORM message to service worker
   c. If platform detected, inject floating action button (FAB) into page
   d. FAB click → send OPEN_SIDE_PANEL message to service worker
```

**Side Panel Routing:**

```
/ (root)          → Dashboard / Home
/onboarding       → First-time setup wizard (Spec 3)
/profile          → Profile management (Spec 3)
/applications     → Application tracker (Spec 9)
/outreach         → Outreach dashboard (Spec 8)
/settings         → User preferences (Spec 10)
```

### 1.5 API Integration Details

No external API integrations in this spec. This spec establishes the build pipeline and extension shell only.

### 1.6 Edge Cases, Error Handling & Security

- **Service worker termination:** Manifest V3 service workers are ephemeral. All state must be persisted to `chrome.storage.local` or Supabase. Never hold state in service worker memory across events.
- **Content Security Policy (CSP):** The side panel and options page run in the extension context with a restrictive CSP. Inline scripts are forbidden. All React code must be in separate `.js` files (Vite handles this).
- **Content script isolation:** Content scripts run in an isolated world by default. They can access the page DOM but not the page's JavaScript context. This is correct behavior for auto-fill.
- **HMR in development:** `@crxjs/vite-plugin` injects HMR client into the extension. This must be stripped in production builds. The Vite config handles this via `process.env.NODE_ENV`.
- **Icon assets:** Placeholder icons must be provided. Missing icons cause Chrome to reject the extension load.

### 1.7 Kiro Implementation Steps

1. Initialize the project: run `npm init -y` in the workspace root. Set `"name": "autoapply"`, `"version": "0.1.0"`, `"private": true` in `package.json`.
2. Install core dependencies: `npm install react react-dom zustand @supabase/supabase-js`
3. Install dev dependencies: `npm install -D vite @vitejs/plugin-react @crxjs/vite-plugin typescript @types/react @types/react-dom @types/chrome tailwindcss postcss autoprefixer`
4. Initialize TypeScript: create `tsconfig.json` with `strict: true`, `jsx: "react-jsx"`, `moduleResolution: "bundler"`, `target: "ES2022"`, paths alias `@/*` → `src/*`.
5. Initialize TailwindCSS: create `tailwind.config.ts` scanning `src/**/*.{ts,tsx}`, create `postcss.config.js` with tailwind + autoprefixer plugins.
6. Create `src/sidepanel/index.css` with Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`).
7. Create `manifest.config.ts` with the full Manifest V3 configuration as specified in section 1.2.
8. Create `vite.config.ts` with the configuration as specified in section 1.2.
9. Create `src/background/index.ts` — implement service worker lifecycle handlers (install, activate, action click → open side panel, message listener with router stub).
10. Create `src/content/index.ts` — implement content script that sends `DETECT_ATS_PLATFORM` message on load, injects floating action button if platform detected.
11. Create `src/sidepanel/index.html` — minimal HTML shell with `<div id="root">` and script tag pointing to `main.tsx`.
12. Create `src/sidepanel/main.tsx` — React entry point: `createRoot(document.getElementById('root')!).render(<App />)`.
13. Create `src/sidepanel/App.tsx` — root component with placeholder routing (simple state-based for now, no router library needed yet).
14. Create `src/options/index.html` and `src/options/App.tsx` — minimal options page shell.
15. Create `src/types/messages.ts` — define `MessageType`, `ExtensionMessage`, `ExtensionResponse` types as specified in the Global Preamble.
16. Create `src/utils/messaging.ts` — typed helper functions: `sendMessage<T>(msg: ExtensionMessage): Promise<ExtensionResponse<T>>` wrapping `chrome.runtime.sendMessage`.
17. Create `src/lib/supabase.ts` — Supabase client singleton with `chromeStorageAdapter` as specified in the Global Preamble.
18. Create `src/stores/index.ts` — Zustand app store shell as specified in section 1.3.
19. Create `src/types/database.types.ts` — placeholder empty Database type (`export type Database = {}`).
20. Create `public/icons/` directory with placeholder PNG icons (16x16, 48x48, 128x128).
21. Create `.env.example` with `VITE_SUPABASE_URL=` and `VITE_SUPABASE_ANON_KEY=`.
22. Add npm scripts to `package.json`: `"dev": "vite"`, `"build": "tsc && vite build"`, `"package": "npm run build && cd dist && zip -r ../autoapply.zip ."`.
23. Initialize shadcn/ui: install `class-variance-authority clsx tailwind-merge lucide-react` and create `src/lib/utils.ts` with the `cn()` helper function.
24. Create `src/sidepanel/components/ui/button.tsx` — first shadcn/ui component to validate the styling pipeline works end-to-end.
25. Verify: run `npm run build` and confirm zero TypeScript errors and a valid `dist/` output.

---

## Spec 2 — P0: Supabase Auth Integration

### 2.1 Priority & Objective

**Priority:** P0 — Core MVP
**Justification:** Every feature beyond the shell requires user identity. Auth gates profile creation, resume storage, application tracking, and outreach. Without auth, the extension is a static page.

**Objective:** Implement Google OAuth authentication using Supabase Auth with the PKCE flow adapted for Chrome extensions. The system must persist sessions in `chrome.storage.local`, automatically refresh tokens, protect all sidebar routes behind auth state, and handle the OAuth redirect flow within the extension context.

**User Story:** "As a new user, I can sign in with my Google account in one click so that my profile and application data are securely stored and accessible across sessions."

**Success Criteria:**
- User can click "Sign in with Google" in the side panel and complete OAuth flow
- Session persists across extension restarts (service worker termination/restart)
- Token auto-refreshes before expiry without user intervention
- Unauthenticated users see only the login screen; all other routes are protected
- Sign-out clears all local session data and redirects to login

### 2.2 Architecture & Tech Stack

**Extension Contexts Involved:**
- Side panel — login UI, auth state display, protected route wrapper
- Service worker — session persistence, token refresh via `chrome.alarms`, auth state broadcast to all contexts

**Manifest V3 Permissions Required (incremental):**
| Permission | Reason |
|-----------|--------|
| `identity` | `chrome.identity.getRedirectURL()` for OAuth callback URL |
| `storage` | Session persistence in `chrome.storage.local` |

**Module Boundaries:**
- Depends on: Spec 1 (project shell, Supabase client singleton)
- Depended on by: Specs 3–10 (all require authenticated user context)

**Supabase Services Used:** Auth (Google OAuth provider, PKCE flow, session management)

### 2.3 Database Schema & Data Structures

**Supabase Postgres — `profiles` table (auto-created on first sign-in):**

```sql
-- This table extends auth.users with application-specific profile data.
-- Created via a database trigger on auth.users insert.

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only read/update their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger: Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**TypeScript Types:**

```typescript
// src/types/auth.ts
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
```

**Zustand Auth Store:**

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/auth';

interface AuthStore {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  setSession: (session) =>
    set({ session, isAuthenticated: !!session }),
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: () =>
    set({ user: null, session: null, isAuthenticated: false }),
}));
```

**chrome.storage.local Keys (this spec):**

```typescript
interface AuthStorageKeys {
  'autoapply:supabase:session': string;  // Serialized Supabase session JSON
  // Managed by the chromeStorageAdapter in supabase.ts — do NOT read/write directly
}
```

### 2.4 Logic & Algorithms

**OAuth Sign-In Flow (PKCE for Chrome Extension):**

```
1. User clicks "Sign in with Google" in side panel
2. Side panel calls supabase.auth.signInWithOAuth({
     provider: 'google',
     options: {
       redirectTo: chrome.identity.getRedirectURL(),
       skipBrowserRedirect: true,  // We handle the redirect ourselves
     }
   })
3. Supabase returns { data: { url } } — the Google OAuth consent URL
4. Side panel calls chrome.identity.launchWebAuthFlow({
     url: data.url,
     interactive: true
   })
5. Google consent screen opens in a popup window
6. User approves → Google redirects to Supabase callback → Supabase redirects to
   chrome.identity.getRedirectURL() with access_token and refresh_token in the URL hash
7. chrome.identity.launchWebAuthFlow resolves with the redirect URL
8. Parse the URL hash to extract access_token and refresh_token
9. Call supabase.auth.setSession({ access_token, refresh_token })
10. Supabase client stores session via chromeStorageAdapter → chrome.storage.local
11. Fetch user profile from public.profiles table
12. Update Zustand auth store with session + user profile
13. Navigate to dashboard (or onboarding if onboarding_completed === false)
```

**Session Restoration on Extension Load:**

```
1. Side panel mounts → App.tsx useEffect fires
2. Call supabase.auth.getSession()
3. chromeStorageAdapter reads from chrome.storage.local
4. If session exists and is not expired:
   a. Set session in Zustand store
   b. Fetch profile from Supabase
   c. Set user in Zustand store
   d. Set isLoading = false
5. If session exists but is expired:
   a. Supabase client auto-refreshes (autoRefreshToken: true)
   b. Listen for onAuthStateChange SIGNED_IN event
   c. Update store on refresh
6. If no session:
   a. Set isLoading = false
   b. Show login screen
```

**Token Refresh via Service Worker Alarm:**

```
1. On session set (from auth state change listener):
   a. Calculate time until token expiry (session.expires_at - now - 60s buffer)
   b. Create chrome.alarms.create('token-refresh', { delayInMinutes: timeUntilRefresh })
2. On alarm 'token-refresh' fires in service worker:
   a. Call supabase.auth.refreshSession()
   b. New session auto-persisted via chromeStorageAdapter
   c. Reschedule alarm for next refresh
3. On auth state change (SIGNED_OUT):
   a. Clear alarm: chrome.alarms.clear('token-refresh')
```

**Sign-Out Flow:**

```
1. User clicks "Sign out" in side panel
2. Call supabase.auth.signOut()
3. Supabase client clears session from chromeStorageAdapter → chrome.storage.local
4. Clear Zustand auth store
5. Clear chrome.alarms 'token-refresh'
6. Navigate to login screen
```

### 2.5 API Integration Details

**Supabase Auth API (via JS client):**

| Method | Purpose | Notes |
|--------|---------|-------|
| `supabase.auth.signInWithOAuth()` | Initiate Google OAuth | Returns consent URL, does not redirect |
| `supabase.auth.setSession()` | Set session from OAuth callback tokens | Called after `launchWebAuthFlow` |
| `supabase.auth.getSession()` | Restore session on load | Reads from chromeStorageAdapter |
| `supabase.auth.refreshSession()` | Refresh expired token | Called by alarm handler |
| `supabase.auth.signOut()` | Clear session | Clears chromeStorageAdapter |
| `supabase.auth.onAuthStateChange()` | Listen for auth events | SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED |

**Supabase Dashboard Configuration Required:**
- Enable Google OAuth provider in Authentication → Providers
- Set Google Client ID and Client Secret (from Google Cloud Console)
- Add `chrome.identity.getRedirectURL()` output to Redirect URLs in Supabase Auth settings
- The redirect URL format: `https://<extension-id>.chromiumapp.org/`

### 2.6 Edge Cases, Error Handling & Security

- **OAuth popup blocked:** If `chrome.identity.launchWebAuthFlow` fails, show a user-friendly error with a retry button. Log the error for debugging.
- **Token refresh failure:** If `refreshSession()` fails (e.g., refresh token revoked), clear the session and redirect to login with a "Session expired, please sign in again" message.
- **Service worker termination during auth:** The PKCE flow is stateless from the service worker's perspective. The side panel handles the entire flow. Service worker only handles alarm-based refresh.
- **Multiple tabs/windows:** `chrome.storage.local` is shared across all extension contexts. Auth state changes propagate automatically via `onAuthStateChange`.
- **Supabase anon key exposure:** The anon key is safe to include in the extension bundle. It only grants access gated by RLS policies. All sensitive operations go through Edge Functions with service role keys.
- **CORS:** Supabase client handles CORS automatically. No additional configuration needed for extension context.

### 2.7 Kiro Implementation Steps

1. Create `src/types/auth.ts` — define `UserProfile` and `AuthState` interfaces as specified in section 2.3.
2. Create `src/stores/authStore.ts` — implement Zustand auth store with `user`, `session`, `isLoading`, `isAuthenticated` state and corresponding setters as specified in section 2.3.
3. Create `src/lib/auth.ts` — implement auth helper functions:
   - `signInWithGoogle()`: calls `supabase.auth.signInWithOAuth` with Google provider and `chrome.identity.getRedirectURL()`, then `chrome.identity.launchWebAuthFlow`, parses tokens from redirect URL, calls `supabase.auth.setSession`.
   - `signOut()`: calls `supabase.auth.signOut()`, clears Zustand store, clears alarms.
   - `restoreSession()`: calls `supabase.auth.getSession()`, fetches profile, updates store.
   - `fetchUserProfile(userId: string)`: queries `public.profiles` table.
4. Create `src/sidepanel/components/AuthGuard.tsx` — wrapper component that checks `useAuthStore().isAuthenticated`. If false, renders `LoginScreen`. If true, renders `children`. Shows loading spinner while `isLoading` is true.
5. Create `src/sidepanel/components/LoginScreen.tsx` — centered card with Google sign-in button, app logo, tagline. Button calls `signInWithGoogle()` and shows loading state during OAuth flow.
6. Update `src/sidepanel/App.tsx` — wrap all routes in `<AuthGuard>`. Add `useEffect` that calls `restoreSession()` on mount. Subscribe to `supabase.auth.onAuthStateChange` and update Zustand store accordingly.
7. Update `src/background/index.ts` — add alarm listener for `'token-refresh'`. On alarm fire, call `supabase.auth.refreshSession()`. Add auth state change listener that schedules/clears the refresh alarm.
8. Create `src/utils/parseAuthTokens.ts` — utility function that extracts `access_token` and `refresh_token` from a redirect URL hash fragment. Handles both hash and query parameter formats.
9. Add error boundary around auth flow in `LoginScreen.tsx` — catch `launchWebAuthFlow` failures, display user-friendly error with retry button.
10. Verify: load extension, click sign in, complete Google OAuth, confirm session persists after closing and reopening the side panel.

---

## Spec 3 — P0: User Profile & Resume Management

### 3.1 Priority & Objective

**Priority:** P0 — Core MVP
**Justification:** The auto-fill system (Spec 5) and ATS optimization loop (Spec 6) both require structured user data — personal info, work history, education, skills, and a base resume. Without this data layer, the core pipeline has nothing to work with.

**Objective:** Build a comprehensive profile management system where users input their professional information as structured data, upload base resumes (PDF) to Supabase Storage, maintain an experience/project bank for the ATS optimizer to draw from, and manage multiple resume versions with history tracking.

**User Story:** "As a job seeker, I can fill out my professional profile once and upload my resume so that the extension can auto-fill applications and tailor my resume to any job description."

**Success Criteria:**
- User can complete a multi-step onboarding wizard (personal info → education → work experience → skills → resume upload)
- Profile data persists in Supabase Postgres and is editable after onboarding
- PDF resumes upload to Supabase Storage with progress indication
- Experience bank supports CRUD operations (add/edit/delete work entries, projects, skills)
- Resume version history shows all tailored versions generated by the ATS optimizer (Spec 6)
- `onboarding_completed` flag is set to `true` after wizard completion

### 3.2 Architecture & Tech Stack

**Extension Contexts Involved:**
- Side panel — onboarding wizard UI, profile editor, resume upload, experience bank CRUD

**Manifest V3 Permissions Required (incremental):** None beyond Spec 1/2.

**Module Boundaries:**
- Depends on: Spec 1 (shell), Spec 2 (auth — user must be authenticated)
- Depended on by: Spec 5 (auto-fill reads profile data), Spec 6 (ATS optimizer reads experience bank + base resume), Spec 7 (contact discovery uses university for alumni matching)

**Supabase Services Used:** Database (profiles, experiences, resumes tables), Storage (resume PDFs)

### 3.3 Database Schema & Data Structures

**Supabase Postgres Tables:**

```sql
-- Extend the profiles table from Spec 2 with additional fields
ALTER TABLE public.profiles
  ADD COLUMN phone TEXT,
  ADD COLUMN location TEXT,
  ADD COLUMN linkedin_url TEXT,
  ADD COLUMN portfolio_url TEXT,
  ADD COLUMN github_url TEXT,
  ADD COLUMN university TEXT,
  ADD COLUMN degree TEXT,
  ADD COLUMN graduation_year INTEGER,
  ADD COLUMN field_of_study TEXT,
  ADD COLUMN years_of_experience INTEGER,
  ADD COLUMN headline TEXT,
  ADD COLUMN summary TEXT;

-- Work experience entries
CREATE TABLE public.experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('work', 'project', 'volunteer', 'education')),
  title TEXT NOT NULL,                    -- Job title or project name
  organization TEXT NOT NULL,             -- Company or school name
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,                          -- NULL = current/present
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,                       -- Raw description
  bullets JSONB DEFAULT '[]'::jsonb,      -- Array of bullet point strings
  skills JSONB DEFAULT '[]'::jsonb,       -- Array of skill tags
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_experiences_user_id ON public.experiences(user_id);
CREATE INDEX idx_experiences_type ON public.experiences(type);

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own experiences"
  ON public.experiences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Skills bank (normalized, deduplicated per user)
CREATE TABLE public.skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('technical', 'language', 'framework', 'tool', 'soft_skill', 'other')),
  proficiency TEXT CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_skills_user_id ON public.skills(user_id);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own skills"
  ON public.skills FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Resumes (both base uploads and generated tailored versions)
CREATE TABLE public.resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('base', 'tailored')),
  content JSONB,                          -- Structured resume data (for tailored)
  file_path TEXT,                         -- Supabase Storage path
  file_size INTEGER,
  application_id UUID,                    -- FK to applications (Spec 6), NULL for base resumes
  ats_score INTEGER,                      -- Score from ATS optimizer (Spec 6)
  is_primary BOOLEAN DEFAULT FALSE,       -- The "active" base resume
  metadata JSONB DEFAULT '{}'::jsonb,     -- Flexible metadata (keywords matched, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX idx_resumes_type ON public.resumes(type);

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own resumes"
  ON public.resumes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Supabase Storage Bucket:**

```sql
-- Create a private bucket for resume files
-- Bucket name: 'resumes'
-- File path pattern: {user_id}/{resume_id}.pdf
-- RLS: Users can only access their own folder
```

Storage RLS policy (applied via Supabase Dashboard or migration):
```sql
CREATE POLICY "Users can upload own resumes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read own resumes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own resumes"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

**TypeScript Interfaces:**

```typescript
// src/types/profile.ts
export interface Experience {
  id: string;
  user_id: string;
  type: 'work' | 'project' | 'volunteer' | 'education';
  title: string;
  organization: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
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
  category: 'technical' | 'language' | 'framework' | 'tool' | 'soft_skill' | 'other';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
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
}

export interface StructuredResume {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
  };
  summary: string;
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string | null;
    bullets: string[];
  }[];
  education: {
    degree: string;
    school: string;
    graduationYear: number;
    fieldOfStudy: string;
    gpa?: string;
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    bullets: string[];
  }[];
}
```

**Zustand Profile Store:**

```typescript
// src/stores/profileStore.ts
import { create } from 'zustand';
import type { Experience, Skill, Resume, UserProfile } from '@/types/profile';

interface ProfileStore {
  profile: UserProfile | null;
  experiences: Experience[];
  skills: Skill[];
  resumes: Resume[];
  isLoading: boolean;

  setProfile: (profile: UserProfile) => void;
  setExperiences: (experiences: Experience[]) => void;
  addExperience: (experience: Experience) => void;
  updateExperience: (id: string, updates: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  setSkills: (skills: Skill[]) => void;
  addSkill: (skill: Skill) => void;
  removeSkill: (id: string) => void;
  setResumes: (resumes: Resume[]) => void;
  addResume: (resume: Resume) => void;
  setLoading: (loading: boolean) => void;
}
```

### 3.4 Logic & Algorithms

**Onboarding Wizard Flow:**

```
Step 1: Personal Information
  - Pre-fill from Google OAuth data (name, email, avatar)
  - Collect: phone, location, LinkedIn URL, portfolio URL, GitHub URL
  - Validation: email format, URL format, phone format (optional)

Step 2: Education
  - Collect: university, degree, field of study, graduation year
  - This data is critical for alumni matching in Spec 7
  - Support multiple education entries

Step 3: Work Experience
  - Dynamic form: add/remove experience entries
  - Each entry: title, company, location, start date, end date, is_current, bullet points
  - Bullet points are individually editable text areas
  - Skills tags auto-extracted from bullet text (client-side keyword matching)

Step 4: Skills
  - Categorized skill input (technical, frameworks, tools, languages, soft skills)
  - Auto-suggest from common skill lists
  - Proficiency level selector per skill

Step 5: Resume Upload
  - Drag-and-drop or file picker for PDF upload
  - Upload to Supabase Storage: resumes/{user_id}/{resume_id}.pdf
  - Show upload progress bar
  - After upload, create a 'base' entry in resumes table with file_path
  - Mark as is_primary = true (first upload)

Step 6: Review & Complete
  - Summary view of all entered data
  - Edit buttons to jump back to any step
  - "Complete Setup" button → sets onboarding_completed = true on profiles table
  - Redirect to dashboard
```

**Resume Upload Algorithm:**

```
1. User selects PDF file (max 10MB)
2. Validate: file.type === 'application/pdf' && file.size <= 10_485_760
3. Generate resume ID: crypto.randomUUID()
4. Construct storage path: `${userId}/${resumeId}.pdf`
5. Upload to Supabase Storage:
   supabase.storage.from('resumes').upload(path, file, {
     contentType: 'application/pdf',
     upsert: false
   })
6. On success, insert row into resumes table:
   { user_id, title: file.name, type: 'base', file_path: path, file_size: file.size, is_primary: true }
7. If user already has a primary resume, set previous is_primary = false
8. Update Zustand store
```

### 3.5 API Integration Details

**Supabase Database (via JS client):**

| Operation | Method | Table |
|-----------|--------|-------|
| Create profile fields | `supabase.from('profiles').update(data).eq('id', userId)` | profiles |
| Fetch profile | `supabase.from('profiles').select('*').eq('id', userId).single()` | profiles |
| CRUD experiences | `supabase.from('experiences').insert/update/delete` | experiences |
| Fetch experiences | `supabase.from('experiences').select('*').eq('user_id', userId).order('sort_order')` | experiences |
| CRUD skills | `supabase.from('skills').insert/update/delete` | skills |
| Upload resume | `supabase.storage.from('resumes').upload(path, file)` | Storage |
| Get resume URL | `supabase.storage.from('resumes').createSignedUrl(path, 3600)` | Storage |
| Insert resume record | `supabase.from('resumes').insert(data)` | resumes |

### 3.6 Edge Cases, Error Handling & Security

- **Duplicate skill names:** The `UNIQUE(user_id, name)` constraint prevents duplicates. Catch the unique violation error and show "Skill already exists."
- **Resume upload failure:** If storage upload succeeds but database insert fails, clean up the orphaned file with `supabase.storage.from('resumes').remove([path])`.
- **Large PDF files:** Enforce 10MB client-side limit. Show file size in the upload UI. Reject with clear error message.
- **Concurrent edits:** Optimistic UI updates with Zustand. If the Supabase write fails, revert the store and show an error toast.
- **Onboarding abandonment:** If user closes the extension mid-onboarding, `onboarding_completed` remains `false`. On next load, redirect back to onboarding wizard at the last incomplete step (track step progress in `chrome.storage.local`).
- **RLS enforcement:** All queries go through the Supabase client with the user's JWT. RLS policies ensure users can only access their own data. No server-side admin queries from the extension.

### 3.7 Kiro Implementation Steps

1. Run the SQL migration in Supabase to add columns to `profiles`, create `experiences`, `skills`, and `resumes` tables with RLS policies as specified in section 3.3.
2. Create the `resumes` storage bucket in Supabase with the storage RLS policies from section 3.3.
3. Create `src/types/profile.ts` — define `Experience`, `Skill`, `Resume`, `StructuredResume` interfaces as specified in section 3.3.
4. Create `src/stores/profileStore.ts` — implement Zustand profile store with state and actions as specified in section 3.3.
5. Create `src/lib/profile.ts` — implement data access functions:
   - `fetchProfile(userId)` → query profiles table
   - `updateProfile(userId, data)` → update profiles table
   - `fetchExperiences(userId)` → query experiences table ordered by sort_order
   - `createExperience(data)` → insert into experiences
   - `updateExperience(id, data)` → update experiences
   - `deleteExperience(id)` → delete from experiences
   - `fetchSkills(userId)` → query skills table
   - `createSkill(data)` → insert into skills (handle unique constraint)
   - `deleteSkill(id)` → delete from skills
   - `uploadResume(userId, file)` → upload to storage + insert into resumes table
   - `fetchResumes(userId)` → query resumes table
   - `getResumeDownloadUrl(filePath)` → create signed URL
6. Create `src/sidepanel/components/onboarding/OnboardingWizard.tsx` — multi-step wizard container with step indicator, next/back navigation, and step state tracking.
7. Create `src/sidepanel/components/onboarding/PersonalInfoStep.tsx` — form for name, email, phone, location, LinkedIn, portfolio, GitHub URLs.
8. Create `src/sidepanel/components/onboarding/EducationStep.tsx` — form for university, degree, field of study, graduation year. Support multiple entries.
9. Create `src/sidepanel/components/onboarding/ExperienceStep.tsx` — dynamic form for work experience entries with bullet point editing.
10. Create `src/sidepanel/components/onboarding/SkillsStep.tsx` — categorized skill input with proficiency levels.
11. Create `src/sidepanel/components/onboarding/ResumeUploadStep.tsx` — drag-and-drop PDF upload with progress bar, file validation, Supabase Storage integration.
12. Create `src/sidepanel/components/onboarding/ReviewStep.tsx` — summary view of all entered data with edit buttons per section.
13. Create `src/sidepanel/pages/ProfilePage.tsx` — post-onboarding profile editor that reuses the same form components from onboarding steps.
14. Update `src/sidepanel/App.tsx` — add routing: if `onboarding_completed === false`, show `OnboardingWizard`; otherwise show dashboard.
15. Regenerate Supabase TypeScript types and update `src/types/database.types.ts`.

---

## Spec 4 — P0: ATS Platform Detection Engine

### 4.1 Priority & Objective

**Priority:** P0 — Core MVP
**Justification:** The entire auto-fill and ATS optimization pipeline depends on detecting which ATS platform the user is currently viewing. Without reliable detection, the extension cannot activate on job pages.

**Objective:** Build a content script-based detection engine that identifies supported ATS platforms (Greenhouse, Lever, Workday, Ashby, BambooHR, iCIMS, Taleo) via URL pattern matching and DOM fingerprinting, extracts the job description text, and communicates detection results to the service worker and side panel. The system uses a platform adapter registry pattern for extensibility.

**User Story:** "As a job seeker browsing job listings, I want the extension to automatically detect when I'm on a supported job page and extract the job description so that I can trigger auto-fill and resume optimization with one click."

**Success Criteria:**
- Extension correctly identifies all 7 supported ATS platforms with >95% accuracy
- Job description text is extracted cleanly (no navigation, footer, or boilerplate)
- Detection triggers within 2 seconds of page load
- Side panel shows detected platform name, job title, and company
- False positive rate <1% (extension does not activate on non-job pages)

### 4.2 Architecture & Tech Stack

**Extension Contexts Involved:**
- Content script — runs on ATS domains, performs URL matching + DOM fingerprinting, extracts JD
- Service worker — receives detection results, caches them, broadcasts to side panel
- Side panel — displays detection status, shows extracted JD preview

**Manifest V3 Permissions Required (incremental):** None beyond Spec 1 (host_permissions already cover ATS domains).

**Module Boundaries:**
- Depends on: Spec 1 (content script injection, message protocol)
- Depended on by: Spec 5 (auto-fill needs platform adapter), Spec 6 (ATS optimizer needs extracted JD)

**Supabase Services Used:** None (detection is entirely client-side).

### 4.3 Database Schema & Data Structures

No database tables. All detection data is transient and communicated via messages.

**TypeScript Types:**

```typescript
// src/types/platform.ts
export type ATSPlatform =
  | 'greenhouse'
  | 'lever'
  | 'workday'
  | 'ashby'
  | 'bamboohr'
  | 'icims'
  | 'taleo'
  | 'unknown';

export interface JobDetectionResult {
  platform: ATSPlatform;
  confidence: number;          // 0-1 confidence score
  jobTitle: string | null;
  company: string | null;
  location: string | null;
  jobDescription: string;      // Cleaned JD text
  jobUrl: string;
  rawHtml: string;             // Raw JD HTML for fallback parsing
  detectedAt: number;          // Timestamp
}

export interface PlatformAdapter {
  name: ATSPlatform;
  urlPatterns: RegExp[];
  domFingerprints: DOMFingerprint[];
  detectJob: (document: Document, url: string) => JobDetectionResult | null;
  extractJobDescription: (document: Document) => string;
  extractJobTitle: (document: Document) => string | null;
  extractCompany: (document: Document) => string | null;
  extractLocation: (document: Document) => string | null;
}

export interface DOMFingerprint {
  selector: string;
  attribute?: string;
  valuePattern?: RegExp;
}
```

**Zustand Detection Store:**

```typescript
// src/stores/detectionStore.ts
import { create } from 'zustand';
import type { JobDetectionResult } from '@/types/platform';

interface DetectionStore {
  currentDetection: JobDetectionResult | null;
  isDetecting: boolean;
  setDetection: (result: JobDetectionResult | null) => void;
  setDetecting: (detecting: boolean) => void;
  clearDetection: () => void;
}
```

### 4.4 Logic & Algorithms

**Platform Detection Algorithm (Content Script):**

```
1. Content script loads on matched host_permissions URL
2. Phase 1 — URL Pattern Matching (fast, high confidence):
   For each registered platform adapter:
     a. Test current URL against adapter.urlPatterns
     b. If match found, set candidatePlatform = adapter.name, confidence = 0.8
     c. Break on first match (URL patterns are mutually exclusive)

3. Phase 2 — DOM Fingerprinting (confirmation, raises confidence):
   If candidatePlatform found:
     a. For each fingerprint in adapter.domFingerprints:
        - Query document for fingerprint.selector
        - If element exists and matches valuePattern (if specified), increment confidence by 0.05
     b. If confidence >= 0.9, confirm detection
   If no candidatePlatform from URL:
     a. Run all adapters' DOM fingerprints
     b. Select adapter with highest fingerprint match count
     c. If matches >= 2, set candidatePlatform with confidence = 0.7

4. Phase 3 — Job Description Extraction:
   If platform confirmed:
     a. Call adapter.extractJobDescription(document)
     b. Clean extracted text: strip HTML tags, normalize whitespace, remove boilerplate
     c. Call adapter.extractJobTitle(document)
     d. Call adapter.extractCompany(document)
     e. Call adapter.extractLocation(document)

5. Construct JobDetectionResult and send to service worker via DETECT_ATS_PLATFORM message
```

**Platform-Specific URL Patterns & DOM Fingerprints:**

```typescript
// src/content/adapters/greenhouse.ts
export const greenhouseAdapter: PlatformAdapter = {
  name: 'greenhouse',
  urlPatterns: [
    /^https:\/\/boards\.greenhouse\.io\/.+\/jobs\/\d+/,
    /^https:\/\/.+\.greenhouse\.io\/.+/,
    /^https:\/\/.+\/jobs\/.+\?gh_jid=\d+/,
  ],
  domFingerprints: [
    { selector: '#grnhse_app' },
    { selector: '[data-mapped="true"]' },
    { selector: '#application_form' },
    { selector: 'meta[property="og:url"]', attribute: 'content', valuePattern: /greenhouse/ },
  ],
  detectJob: (document, url) => { /* ... */ },
  extractJobDescription: (document) => {
    // Greenhouse JD is typically in #content or .job-post-content
    const selectors = ['#content .body', '.job-post-content', '#job_description'];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el.textContent?.trim() ?? '';
    }
    return '';
  },
  extractJobTitle: (document) => {
    const el = document.querySelector('.job-title, h1.app-title, #header .company-name + h1');
    return el?.textContent?.trim() ?? null;
  },
  extractCompany: (document) => {
    const el = document.querySelector('.company-name, [data-company]');
    return el?.textContent?.trim() ?? null;
  },
  extractLocation: (document) => {
    const el = document.querySelector('.location, [data-location]');
    return el?.textContent?.trim() ?? null;
  },
};
```

```typescript
// src/content/adapters/lever.ts
export const leverAdapter: PlatformAdapter = {
  name: 'lever',
  urlPatterns: [
    /^https:\/\/jobs\.lever\.co\/.+\/.+/,
  ],
  domFingerprints: [
    { selector: '.lever-job-title' },
    { selector: '.section.page-centered' },
    { selector: '[data-qa="job-detail"]' },
  ],
  extractJobDescription: (document) => {
    const sections = document.querySelectorAll('.section.page-centered .content');
    return Array.from(sections).map(s => s.textContent?.trim()).join('\n\n');
  },
  extractJobTitle: (document) => {
    return document.querySelector('h2.posting-headline')?.textContent?.trim() ?? null;
  },
  extractCompany: (document) => {
    return document.querySelector('.main-header-logo img')?.getAttribute('alt') ?? null;
  },
  extractLocation: (document) => {
    return document.querySelector('.location.posting-category')?.textContent?.trim() ?? null;
  },
};
```

```typescript
// src/content/adapters/workday.ts
export const workdayAdapter: PlatformAdapter = {
  name: 'workday',
  urlPatterns: [
    /^https:\/\/.+\.myworkdayjobs\.com\/.+\/job\/.+/,
    /^https:\/\/.+\.wd\d+\.myworkdayjobs\.com\/.+/,
  ],
  domFingerprints: [
    { selector: '[data-automation-id="jobPostingPage"]' },
    { selector: '[data-automation-id="jobPostingDescription"]' },
    { selector: '.css-cygeeu' },  // Workday's obfuscated class pattern
  ],
  extractJobDescription: (document) => {
    const el = document.querySelector('[data-automation-id="jobPostingDescription"]');
    return el?.textContent?.trim() ?? '';
  },
  extractJobTitle: (document) => {
    const el = document.querySelector('[data-automation-id="jobPostingHeader"] h2');
    return el?.textContent?.trim() ?? null;
  },
  extractCompany: (document) => {
    const el = document.querySelector('[data-automation-id="jobPostingCompanyName"]');
    return el?.textContent?.trim() ?? null;
  },
  extractLocation: (document) => {
    const el = document.querySelector('[data-automation-id="locations"]');
    return el?.textContent?.trim() ?? null;
  },
};
```

**Adapter Registry:**

```typescript
// src/content/adapters/registry.ts
import { greenhouseAdapter } from './greenhouse';
import { leverAdapter } from './lever';
import { workdayAdapter } from './workday';
import { ashbyAdapter } from './ashby';
import { bamboohrAdapter } from './bamboohr';
import { icimsAdapter } from './icims';
import { taleoAdapter } from './taleo';
import type { PlatformAdapter, ATSPlatform } from '@/types/platform';

const adapters: PlatformAdapter[] = [
  greenhouseAdapter,
  leverAdapter,
  workdayAdapter,
  ashbyAdapter,
  bamboohrAdapter,
  icimsAdapter,
  taleoAdapter,
];

export function detectPlatform(url: string, document: Document): PlatformAdapter | null {
  // Phase 1: URL matching
  for (const adapter of adapters) {
    if (adapter.urlPatterns.some(pattern => pattern.test(url))) {
      return adapter;
    }
  }
  // Phase 2: DOM fingerprinting fallback
  let bestMatch: PlatformAdapter | null = null;
  let bestScore = 0;
  for (const adapter of adapters) {
    let score = 0;
    for (const fp of adapter.domFingerprints) {
      const el = document.querySelector(fp.selector);
      if (el) {
        if (fp.attribute && fp.valuePattern) {
          const val = el.getAttribute(fp.attribute);
          if (val && fp.valuePattern.test(val)) score++;
        } else {
          score++;
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = adapter;
    }
  }
  return bestScore >= 2 ? bestMatch : null;
}

export function getAdapterByPlatform(platform: ATSPlatform): PlatformAdapter | undefined {
  return adapters.find(a => a.name === platform);
}
```

### 4.5 API Integration Details

No external API integrations. Detection is entirely client-side DOM analysis.

**Internal Message API:**

| Message | Direction | Payload | Response |
|---------|-----------|---------|----------|
| `DETECT_ATS_PLATFORM` | Content → Service Worker | `JobDetectionResult` | `{ success: true }` |
| `GET_CURRENT_DETECTION` | Side Panel → Service Worker | `{}` | `JobDetectionResult \| null` |
| `EXTRACT_JOB_DESCRIPTION` | Side Panel → Content (via SW relay) | `{ tabId }` | `{ jobDescription: string }` |

### 4.6 Edge Cases, Error Handling & Security

- **DOM layout changes:** ATS platforms update their HTML frequently. The adapter pattern isolates changes to a single file. Each adapter uses multiple fallback selectors (primary → secondary → tertiary). If all selectors fail, log a warning and return `platform: 'unknown'`.
- **Single-page applications (SPAs):** Workday and some Greenhouse implementations are SPAs. The content script must use a `MutationObserver` to detect when the job page content loads after the initial `document_idle` event.
- **Embedded iframes:** Some ATS platforms (iCIMS, Taleo) embed the application form in an iframe. Content scripts cannot access cross-origin iframes. For these platforms, detect the parent page and extract what's available.
- **Non-job pages on ATS domains:** A user might be on `boards.greenhouse.io/company` (company page, not a job listing). The detection algorithm must verify that a job description element exists before confirming detection. URL pattern matching alone is insufficient.
- **Performance:** DOM fingerprinting must complete within 500ms. Use `document.querySelector` (not `querySelectorAll`) for fingerprints since we only need existence checks.

### 4.7 Kiro Implementation Steps

1. Create `src/types/platform.ts` — define `ATSPlatform`, `JobDetectionResult`, `PlatformAdapter`, `DOMFingerprint` types as specified in section 4.3.
2. Create `src/stores/detectionStore.ts` — implement Zustand detection store as specified in section 4.3.
3. Create `src/content/adapters/greenhouse.ts` — implement Greenhouse adapter with URL patterns, DOM fingerprints, and extraction methods as specified in section 4.4.
4. Create `src/content/adapters/lever.ts` — implement Lever adapter.
5. Create `src/content/adapters/workday.ts` — implement Workday adapter with SPA-aware MutationObserver for delayed content loading.
6. Create `src/content/adapters/ashby.ts` — implement Ashby adapter. URL pattern: `https://*.ashbyhq.com/*/application/*`. Fingerprints: `[data-testid="job-posting"]`, `.ashby-job-posting-brief-description`.
7. Create `src/content/adapters/bamboohr.ts` — implement BambooHR adapter. URL pattern: `https://*.bamboohr.com/careers/*`. Fingerprints: `.ResumableJob`, `#resumator-job-app`.
8. Create `src/content/adapters/icims.ts` — implement iCIMS adapter. URL pattern: `https://*.icims.com/jobs/*/job`. Fingerprints: `.iCIMS_MainWrapper`, `#iCIMS_Header`.
9. Create `src/content/adapters/taleo.ts` — implement Taleo adapter. URL pattern: `https://*.taleo.net/careersection/*/jobdetail.ftl*`. Fingerprints: `#requisitionDescriptionInterface`, `.contentlinepanel`.
10. Create `src/content/adapters/registry.ts` — implement adapter registry with `detectPlatform()` and `getAdapterByPlatform()` functions as specified in section 4.4.
11. Update `src/content/index.ts` — implement the full detection flow: on load, call `detectPlatform()`, if detected, extract JD and job metadata, send `DETECT_ATS_PLATFORM` message to service worker, inject floating action button. Add MutationObserver for SPA support.
12. Update `src/background/index.ts` — handle `DETECT_ATS_PLATFORM` message: cache the `JobDetectionResult` keyed by `tabId`. Handle `GET_CURRENT_DETECTION` message: return cached result for the requesting tab.
13. Create `src/sidepanel/components/JobDetectionBanner.tsx` — component that queries the service worker for current detection on mount and displays: platform badge, job title, company name, and a "View JD" expandable section.
14. Create `src/content/utils/cleanText.ts` — utility function to strip HTML tags, normalize whitespace, remove common boilerplate phrases (e.g., "Equal Opportunity Employer" disclaimers) from extracted JD text.
15. Verify: load extension, navigate to a Greenhouse job listing, confirm detection banner appears in side panel with correct job title and company.

---

## Spec 5 — P0: Auto-Fill System

### 5.1 Priority & Objective

**Priority:** P0 — Core MVP
**Justification:** Auto-fill is the primary value proposition for the extension's first interaction with users. It's the "wow moment" that converts a browser to a daily user. Without it, the extension is just a resume optimizer with no workflow integration.

**Objective:** Build a platform-specific auto-fill system that maps user profile data to application form fields on supported ATS platforms. The system uses the adapter pattern (extending Spec 4's platform adapters) with a heuristic fallback matcher for unsupported or modified form layouts. It handles text inputs, dropdowns, radio buttons, checkboxes, file uploads (resume attachment), and multi-page form navigation.

**User Story:** "As a job seeker on a Greenhouse application page, I can click one button and have all my personal info, work history, education, and resume automatically filled into the form — so that I can apply in seconds instead of minutes."

**Success Criteria:**
- Auto-fill correctly populates >90% of standard form fields on Greenhouse and Lever
- Resume PDF is attached via file input programmatically
- Dropdown selections (country, state, degree type) are correctly matched
- Multi-page forms (Workday) are navigated and filled sequentially
- User can review and edit any auto-filled field before submission
- Fallback heuristic matcher handles unknown form layouts with >70% accuracy

### 5.2 Architecture & Tech Stack

**Extension Contexts Involved:**
- Content script — DOM manipulation, form field detection, value injection, file upload
- Side panel — auto-fill trigger button, field mapping review UI, manual override controls
- Service worker — relays profile data to content script, coordinates multi-step fills

**Manifest V3 Permissions Required (incremental):** None beyond Spec 1.

**Module Boundaries:**
- Depends on: Spec 1 (shell), Spec 3 (profile data), Spec 4 (platform detection + adapters)
- Depended on by: Spec 6 (ATS optimizer triggers auto-fill with tailored resume), Spec 9 (application tracker records auto-fill events)

**Supabase Services Used:** Database (read profile, experiences, skills), Storage (download resume PDF for file input attachment)

### 5.3 Database Schema & Data Structures

No new database tables. This spec reads from tables defined in Spec 3.

**TypeScript Types:**

```typescript
// src/types/autofill.ts
export interface FormField {
  element: HTMLElement;
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file' | 'date' | 'number';
  label: string;                    // Extracted label text
  name: string;                     // input name attribute
  id: string;                       // input id attribute
  required: boolean;
  currentValue: string;
  ariaLabel: string | null;
  placeholder: string | null;
}

export interface FieldMapping {
  field: FormField;
  profileKey: string;               // Dot-notation path into profile data (e.g., 'personal.email')
  value: string;                    // Resolved value to fill
  confidence: number;               // 0-1 mapping confidence
  source: 'adapter' | 'heuristic'; // How the mapping was determined
}

export type FieldCategory =
  | 'personal.firstName'
  | 'personal.lastName'
  | 'personal.fullName'
  | 'personal.email'
  | 'personal.phone'
  | 'personal.location'
  | 'personal.address'
  | 'personal.city'
  | 'personal.state'
  | 'personal.zip'
  | 'personal.country'
  | 'personal.linkedin'
  | 'personal.portfolio'
  | 'personal.github'
  | 'education.university'
  | 'education.degree'
  | 'education.fieldOfStudy'
  | 'education.graduationYear'
  | 'education.gpa'
  | 'work.currentTitle'
  | 'work.currentCompany'
  | 'work.yearsExperience'
  | 'resume.file'
  | 'cover.letter'
  | 'diversity.gender'
  | 'diversity.ethnicity'
  | 'diversity.veteran'
  | 'diversity.disability'
  | 'legal.authorized'
  | 'legal.sponsorship'
  | 'legal.eighteenPlus';

export interface AutoFillAdapter {
  platform: ATSPlatform;
  discoverFields: (document: Document) => FormField[];
  mapFields: (fields: FormField[], profile: UserProfile, experiences: Experience[]) => FieldMapping[];
  fillField: (mapping: FieldMapping) => Promise<void>;
  attachResume: (fileInput: HTMLInputElement, resumeBlob: Blob, fileName: string) => Promise<void>;
  navigateToNextPage?: (document: Document) => Promise<boolean>;  // For multi-page forms
}
```

### 5.4 Logic & Algorithms

**Auto-Fill Pipeline:**

```
1. User clicks "Auto-Fill" button in side panel (or FAB on page)
2. Side panel sends AUTOFILL_FORM message to service worker
3. Service worker:
   a. Fetches user profile, experiences, skills from Zustand store (already loaded)
   b. Downloads primary resume PDF from Supabase Storage as Blob
   c. Relays data to content script via chrome.tabs.sendMessage
4. Content script receives profile data + resume blob
5. Get platform adapter from registry (Spec 4)
6. Call adapter.discoverFields(document) → FormField[]
7. Call adapter.mapFields(fields, profile, experiences) → FieldMapping[]
8. For each mapping with confidence >= 0.7:
   a. Call adapter.fillField(mapping)
   b. Dispatch 'input', 'change', 'blur' events on the element (React/Angular forms need this)
9. For resume file input:
   a. Call adapter.attachResume(fileInput, resumeBlob, 'resume.pdf')
10. Send results back to side panel: { filled: number, skipped: number, failed: number }
11. Side panel shows summary with option to review/edit individual fields
```

**Heuristic Field Matcher (Fallback):**

```typescript
// src/content/autofill/heuristicMatcher.ts

const FIELD_PATTERNS: Record<FieldCategory, RegExp[]> = {
  'personal.firstName': [/first\s*name/i, /given\s*name/i, /fname/i, /prénom/i],
  'personal.lastName': [/last\s*name/i, /family\s*name/i, /surname/i, /lname/i],
  'personal.fullName': [/full\s*name/i, /^name$/i, /your\s*name/i],
  'personal.email': [/e?\-?mail/i, /email\s*address/i],
  'personal.phone': [/phone/i, /mobile/i, /tel/i, /cell/i],
  'personal.linkedin': [/linkedin/i, /linked\s*in/i],
  'personal.portfolio': [/portfolio/i, /website/i, /personal\s*site/i],
  'personal.github': [/github/i, /git\s*hub/i],
  'education.university': [/university/i, /school/i, /college/i, /institution/i],
  'education.degree': [/degree/i, /qualification/i],
  'education.fieldOfStudy': [/field\s*of\s*study/i, /major/i, /concentration/i],
  'education.graduationYear': [/graduat/i, /year.*complet/i],
  'work.currentTitle': [/current\s*title/i, /job\s*title/i, /position/i],
  'work.currentCompany': [/current\s*(company|employer)/i, /company\s*name/i],
  'work.yearsExperience': [/years?\s*(of)?\s*experience/i],
  'resume.file': [/resume/i, /cv/i, /curriculum/i],
  'legal.authorized': [/authorized?\s*to\s*work/i, /legally.*work/i, /work\s*auth/i],
  'legal.sponsorship': [/sponsor/i, /visa/i, /immigration/i],
};

export function matchFieldToCategory(field: FormField): { category: FieldCategory; confidence: number } | null {
  const textToMatch = [
    field.label,
    field.name,
    field.id,
    field.ariaLabel,
    field.placeholder,
  ].filter(Boolean).join(' ');

  let bestMatch: FieldCategory | null = null;
  let bestConfidence = 0;

  for (const [category, patterns] of Object.entries(FIELD_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(textToMatch)) {
        const confidence = field.label && pattern.test(field.label) ? 0.9 : 0.7;
        if (confidence > bestConfidence) {
          bestConfidence = confidence;
          bestMatch = category as FieldCategory;
        }
      }
    }
  }

  return bestMatch ? { category: bestMatch, confidence: bestConfidence } : null;
}
```

**Form Field Value Injection:**

```typescript
// src/content/autofill/fieldFiller.ts

export async function fillTextField(element: HTMLInputElement | HTMLTextAreaElement, value: string): Promise<void> {
  // Focus the element
  element.focus();

  // Clear existing value
  element.value = '';

  // Use native input setter to bypass React's synthetic event system
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value'
  )?.set;
  nativeInputValueSetter?.call(element, value);

  // Dispatch events that React/Angular/Vue listen for
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

export async function fillSelectField(element: HTMLSelectElement, value: string): Promise<void> {
  // Find the best matching option
  const options = Array.from(element.options);
  const match = options.find(opt =>
    opt.value.toLowerCase() === value.toLowerCase() ||
    opt.textContent?.toLowerCase().includes(value.toLowerCase())
  );

  if (match) {
    element.value = match.value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

export async function attachFile(
  fileInput: HTMLInputElement,
  blob: Blob,
  fileName: string
): Promise<void> {
  const file = new File([blob], fileName, { type: 'application/pdf' });
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  fileInput.files = dataTransfer.files;
  fileInput.dispatchEvent(new Event('change', { bubbles: true }));
}
```

**Greenhouse-Specific Auto-Fill Adapter:**

```typescript
// src/content/autofill/adapters/greenhouse.ts
export const greenhouseAutoFillAdapter: AutoFillAdapter = {
  platform: 'greenhouse',

  discoverFields: (document) => {
    const fields: FormField[] = [];
    // Greenhouse uses #application_form with standard input fields
    const form = document.querySelector('#application_form, #grnhse_app form');
    if (!form) return fields;

    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach((el) => {
      const input = el as HTMLInputElement;
      const label = findLabelForInput(document, input);
      fields.push({
        element: input,
        type: categorizeInputType(input),
        label: label?.textContent?.trim() ?? '',
        name: input.name ?? '',
        id: input.id ?? '',
        required: input.required || input.getAttribute('aria-required') === 'true',
        currentValue: input.value,
        ariaLabel: input.getAttribute('aria-label'),
        placeholder: input.placeholder ?? null,
      });
    });
    return fields;
  },

  mapFields: (fields, profile, experiences) => {
    return fields.map(field => {
      const heuristic = matchFieldToCategory(field);
      if (!heuristic) return null;
      const value = resolveProfileValue(heuristic.category, profile, experiences);
      if (!value) return null;
      return {
        field,
        profileKey: heuristic.category,
        value,
        confidence: heuristic.confidence,
        source: 'heuristic' as const,
      };
    }).filter(Boolean) as FieldMapping[];
  },

  fillField: async (mapping) => {
    const { field, value } = mapping;
    switch (field.type) {
      case 'text': case 'email': case 'tel': case 'url': case 'textarea':
        await fillTextField(field.element as HTMLInputElement, value);
        break;
      case 'select':
        await fillSelectField(field.element as HTMLSelectElement, value);
        break;
      case 'date':
        await fillTextField(field.element as HTMLInputElement, value);
        break;
    }
  },

  attachResume: async (fileInput, blob, fileName) => {
    await attachFile(fileInput, blob, fileName);
  },
};
```

### 5.5 API Integration Details

**Supabase (read-only in this spec):**

| Operation | Purpose |
|-----------|---------|
| `supabase.from('profiles').select('*').eq('id', userId).single()` | Fetch profile for auto-fill values |
| `supabase.from('experiences').select('*').eq('user_id', userId)` | Fetch work history for experience fields |
| `supabase.storage.from('resumes').download(filePath)` | Download resume PDF as Blob for file attachment |

### 5.6 Edge Cases, Error Handling & Security

- **React/Angular controlled inputs:** Standard `element.value = x` doesn't trigger React state updates. The `nativeInputValueSetter` approach (section 5.4) bypasses React's synthetic event system. This is the industry-standard technique used by password managers and auto-fill extensions.
- **Custom dropdown components:** Many ATS platforms use custom dropdown components (not native `<select>`). For these, the adapter must click the dropdown trigger, wait for the options list to render, find the matching option, and click it. Use `MutationObserver` to detect when the dropdown opens.
- **File upload restrictions:** Some forms only accept specific file types or sizes. Check the `accept` attribute on the file input before attempting upload. If the resume doesn't match, show a warning in the side panel.
- **Multi-page forms (Workday):** Workday applications span multiple pages. The adapter must: fill current page → click "Next" → wait for page transition → fill next page → repeat. Use `MutationObserver` or `setTimeout` polling to detect page transitions.
- **CAPTCHA/bot detection:** Some ATS platforms have bot detection. Auto-fill should mimic human behavior: add small random delays between field fills (50-200ms), don't fill all fields simultaneously.
- **Pre-filled fields:** If a field already has a value (e.g., from browser autofill), check before overwriting. If the existing value matches the profile value, skip. If different, overwrite but flag it in the review UI.
- **Content script ↔ service worker data transfer:** Resume blobs can be large. Use `chrome.runtime.sendMessage` for small payloads. For the resume blob, use a temporary URL or chunked transfer if needed.

### 5.7 Kiro Implementation Steps

1. Create `src/types/autofill.ts` — define `FormField`, `FieldMapping`, `FieldCategory`, `AutoFillAdapter` types as specified in section 5.3.
2. Create `src/content/autofill/heuristicMatcher.ts` — implement `FIELD_PATTERNS` map and `matchFieldToCategory()` function as specified in section 5.4.
3. Create `src/content/autofill/fieldFiller.ts` — implement `fillTextField()`, `fillSelectField()`, `attachFile()` functions with React-compatible event dispatching as specified in section 5.4.
4. Create `src/content/autofill/utils.ts` — implement helper functions: `findLabelForInput(document, input)` (walks DOM to find associated `<label>` via `for` attribute or parent traversal), `categorizeInputType(input)` (maps input type/tag to FormField type), `resolveProfileValue(category, profile, experiences)` (resolves a FieldCategory to the actual string value from profile data).
5. Create `src/content/autofill/adapters/greenhouse.ts` — implement Greenhouse auto-fill adapter as specified in section 5.4.
6. Create `src/content/autofill/adapters/lever.ts` — implement Lever auto-fill adapter. Lever uses a simpler form structure with `.application-form` container.
7. Create `src/content/autofill/adapters/workday.ts` — implement Workday auto-fill adapter with multi-page navigation support. Workday uses `data-automation-id` attributes extensively.
8. Create `src/content/autofill/adapters/ashby.ts` — implement Ashby auto-fill adapter.
9. Create `src/content/autofill/adapters/bamboohr.ts` — implement BambooHR auto-fill adapter.
10. Create `src/content/autofill/adapters/icims.ts` — implement iCIMS auto-fill adapter.
11. Create `src/content/autofill/adapters/taleo.ts` — implement Taleo auto-fill adapter.
12. Create `src/content/autofill/autofillEngine.ts` — implement the main auto-fill orchestrator: receives profile data + resume blob, gets platform adapter, calls discoverFields → mapFields → fillField for each mapping, returns summary stats.
13. Update `src/content/index.ts` — add message handler for `AUTOFILL_FORM` that invokes the autofill engine.
14. Update `src/background/index.ts` — add handler for `AUTOFILL_FORM` from side panel: fetch profile data from Zustand store, download resume blob from Supabase Storage, relay to content script.
15. Create `src/sidepanel/components/AutoFillButton.tsx` — button component that triggers auto-fill, shows loading state, and displays results summary (X fields filled, Y skipped, Z failed).
16. Create `src/sidepanel/components/AutoFillReview.tsx` — review panel showing all mapped fields with their values, confidence scores, and edit buttons for manual override.
17. Verify: load extension, navigate to a Greenhouse job listing, click auto-fill, confirm all standard fields are populated correctly.

---

## Spec 6 — P0: ATS Resume Optimization Loop

### 6.1 Priority & Objective

**Priority:** P0 — Core MVP
**Justification:** Resume tailoring is the highest-impact feature for interview conversion rates. A generic resume gets filtered by ATS keyword scanners. An optimized resume that mirrors the JD's language passes through. This is the technical moat that separates AutoApply from simple auto-fill tools.

**Objective:** Build a server-side iterative optimization pipeline (Supabase Edge Function) that takes a user's base resume + experience bank and a parsed job description, extracts target keywords, rewrites resume bullets to incorporate those keywords naturally, scores the result against an ATS rubric, and repeats until the score exceeds a configurable threshold (default 85/100) or max iterations (default 3) are reached. The final tailored resume is stored as structured JSON, rendered to PDF client-side, and uploaded to Supabase Storage.

**User Story:** "As a job seeker, I want my resume automatically rewritten to match each job description's keywords so that I pass ATS screening filters and get more interviews."

**Success Criteria:**
- Edge Function accepts base resume + JD and returns a tailored resume with ATS score ≥85
- Optimization loop completes in <30 seconds for 3 iterations
- Generated resume preserves factual accuracy (no fabricated experience)
- PDF renders cleanly with professional formatting
- Tailored resume is stored and linked to the application record
- User can view before/after comparison in the side panel

### 6.2 Architecture & Tech Stack

**Extension Contexts Involved:**
- Side panel — triggers optimization, shows progress (score per iteration), displays before/after, renders PDF
- Service worker — invokes Edge Function, relays progress via Realtime subscription

**Supabase Services Used:** Edge Functions (optimization logic), Database (store tailored resume record), Storage (store generated PDF), Realtime (push iteration progress to sidebar)

**External APIs:** OpenAI GPT-4o-mini (iterations 1-2), GPT-4o (final pass)

### 6.3 Database Schema & Data Structures

**Supabase Postgres — `applications` table:**

```sql
CREATE TABLE public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  job_url TEXT,
  job_description TEXT,
  platform TEXT,                           -- ATSPlatform enum value
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

CREATE INDEX idx_applications_user_id ON public.applications(user_id);
CREATE INDEX idx_applications_status ON public.applications(status);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own applications"
  ON public.applications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**TypeScript Types:**

```typescript
// src/types/optimization.ts
export interface ATSOptimizationRequest {
  baseResume: StructuredResume;
  experienceBank: Experience[];
  jobDescription: string;
  jobTitle: string;
  company: string;
  targetScore: number;       // Default 85
  maxIterations: number;     // Default 3
  applicationId: string;
}

export interface ATSOptimizationResponse {
  tailoredResume: StructuredResume;
  finalScore: number;
  iterations: ATSIteration[];
  keywordsMatched: string[];
  keywordsMissed: string[];
}

export interface ATSIteration {
  iteration: number;
  score: number;
  feedback: string;
  sectionsModified: string[];
  timestamp: number;
}

export interface ATSScoreBreakdown {
  overallScore: number;
  keywordMatch: number;       // 0-100: % of JD keywords found in resume
  experienceRelevance: number; // 0-100: how well experience aligns with role
  skillsAlignment: number;    // 0-100: technical skills match
  formatCompliance: number;   // 0-100: ATS-friendly formatting
  quantification: number;     // 0-100: use of metrics/numbers in bullets
}
```

### 6.4 Logic & Algorithms

**Edge Function: `optimize-resume`**

```
Input: ATSOptimizationRequest
Output: ATSOptimizationResponse

Algorithm:
1. EXTRACT KEYWORDS from job description:
   Prompt GPT-4o-mini with JD text → structured output:
   {
     requiredSkills: string[],
     preferredSkills: string[],
     requiredExperience: string[],
     industryTerms: string[],
     actionVerbs: string[],
     yearsRequired: number | null,
     degreeRequired: string | null
   }

2. INITIAL SCORE of base resume against extracted keywords:
   Compare base resume content against keyword lists.
   Calculate ATSScoreBreakdown.

3. ITERATION LOOP (max N iterations):
   For i = 1 to maxIterations:
     a. If currentScore >= targetScore, BREAK (success)

     b. SELECT MODEL:
        - Iterations 1 to (N-1): GPT-4o-mini (cost optimization)
        - Final iteration: GPT-4o (quality pass)

     c. REWRITE PROMPT (see below for exact template)
        - Input: current resume JSON + keywords + score breakdown + feedback
        - Output: rewritten resume JSON (structured output, JSON mode)

     d. VALIDATE output:
        - Parse JSON, verify all required fields present
        - HALLUCINATION CHECK: compare rewritten experience entries against
          original experience bank. Flag any company/title/date that doesn't
          exist in the original data. Reject and retry if fabricated.
        - Verify no bullet point exceeds 150 characters (ATS best practice)

     e. RESCORE the rewritten resume against keywords
        Calculate new ATSScoreBreakdown

     f. Record ATSIteration { iteration: i, score, feedback, sectionsModified }

     g. Broadcast progress via Supabase Realtime channel:
        `optimization:{applicationId}`

4. RETURN ATSOptimizationResponse with final resume, score, all iterations
```

**Keyword Extraction Prompt Template:**

```
You are an ATS (Applicant Tracking System) keyword analyzer. Extract all relevant
keywords and requirements from the following job description.

JOB DESCRIPTION:
---
{{jobDescription}}
---

Return a JSON object with exactly this structure:
{
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "requiredExperience": ["3+ years in backend development", "experience with distributed systems"],
  "industryTerms": ["microservices", "CI/CD", "agile"],
  "actionVerbs": ["led", "designed", "implemented", "optimized"],
  "yearsRequired": 3,
  "degreeRequired": "Bachelor's in Computer Science or equivalent"
}

Rules:
- Extract ONLY keywords explicitly stated in the JD. Do not infer or add keywords.
- requiredSkills: hard technical skills explicitly listed as required
- preferredSkills: skills listed as "nice to have", "preferred", or "bonus"
- requiredExperience: specific experience requirements with years if mentioned
- industryTerms: domain-specific terminology and buzzwords
- actionVerbs: strong action verbs used in the JD that should appear in resume bullets
```

**Resume Rewrite Prompt Template:**

```
You are an expert resume writer optimizing a resume to pass ATS screening for a specific role.

TARGET ROLE: {{jobTitle}} at {{company}}

KEYWORDS TO INCORPORATE:
Required Skills: {{requiredSkills}}
Preferred Skills: {{preferredSkills}}
Industry Terms: {{industryTerms}}
Action Verbs: {{actionVerbs}}

CURRENT ATS SCORE: {{currentScore}}/100
SCORE BREAKDOWN:
- Keyword Match: {{keywordMatch}}/100
- Experience Relevance: {{experienceRelevance}}/100
- Skills Alignment: {{skillsAlignment}}/100
- Quantification: {{quantification}}/100

FEEDBACK FROM PREVIOUS ITERATION:
{{feedback}}

CURRENT RESUME (JSON):
{{currentResumeJSON}}

EXPERIENCE BANK (additional experiences to draw from):
{{experienceBankJSON}}

INSTRUCTIONS:
1. Rewrite resume bullets to naturally incorporate missing keywords
2. You may reorder or select different experiences from the experience bank if they are more relevant
3. Add quantifiable metrics where possible (%, $, time saved, team size)
4. Use strong action verbs from the keyword list
5. Keep each bullet under 150 characters
6. DO NOT fabricate any experience, company, title, or date not present in the resume or experience bank
7. DO NOT change the personal information section
8. Maintain professional tone and grammatical correctness

Return the complete rewritten resume as a JSON object matching the StructuredResume schema.
```

**ATS Scoring Algorithm:**

```typescript
function scoreResume(resume: StructuredResume, keywords: ExtractedKeywords): ATSScoreBreakdown {
  const resumeText = flattenResumeToText(resume).toLowerCase();

  // Keyword Match (40% weight)
  const allKeywords = [...keywords.requiredSkills, ...keywords.preferredSkills, ...keywords.industryTerms];
  const matched = allKeywords.filter(kw => resumeText.includes(kw.toLowerCase()));
  const keywordMatch = Math.round((matched.length / allKeywords.length) * 100);

  // Experience Relevance (25% weight)
  const expKeywords = keywords.requiredExperience;
  const expMatched = expKeywords.filter(exp => {
    const terms = exp.toLowerCase().split(/\s+/);
    return terms.filter(t => t.length > 3).some(t => resumeText.includes(t));
  });
  const experienceRelevance = Math.round((expMatched.length / Math.max(expKeywords.length, 1)) * 100);

  // Skills Alignment (20% weight)
  const skillsInResume = resume.skills.flatMap(s => s.items).map(s => s.toLowerCase());
  const requiredMatched = keywords.requiredSkills.filter(s =>
    skillsInResume.some(rs => rs.includes(s.toLowerCase()))
  );
  const skillsAlignment = Math.round((requiredMatched.length / Math.max(keywords.requiredSkills.length, 1)) * 100);

  // Quantification (15% weight)
  const allBullets = resume.experience.flatMap(e => e.bullets);
  const quantifiedBullets = allBullets.filter(b => /\d+%|\$\d+|\d+\+?\s*(years?|months?|team|users?|clients?)/i.test(b));
  const quantification = Math.round((quantifiedBullets.length / Math.max(allBullets.length, 1)) * 100);

  // Format Compliance (bonus, not weighted)
  const formatCompliance = checkFormatCompliance(resume);

  const overallScore = Math.round(
    keywordMatch * 0.4 +
    experienceRelevance * 0.25 +
    skillsAlignment * 0.2 +
    quantification * 0.15
  );

  return { overallScore, keywordMatch, experienceRelevance, skillsAlignment, formatCompliance, quantification };
}
```

**Client-Side PDF Generation:**

```typescript
// src/lib/pdfGenerator.ts
// Uses @react-pdf/renderer for structured PDF output

import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

export async function generateResumePDF(resume: StructuredResume): Promise<Blob> {
  const ResumeDocument = () => (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header: Name, contact info */}
        <View style={styles.header}>
          <Text style={styles.name}>{resume.personal.name}</Text>
          <Text style={styles.contact}>
            {resume.personal.email} | {resume.personal.phone} | {resume.personal.location}
          </Text>
          <Text style={styles.links}>
            {resume.personal.linkedin} | {resume.personal.portfolio}
          </Text>
        </View>

        {/* Summary */}
        {resume.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SUMMARY</Text>
            <Text style={styles.body}>{resume.summary}</Text>
          </View>
        )}

        {/* Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXPERIENCE</Text>
          {resume.experience.map((exp, i) => (
            <View key={i} style={styles.entry}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{exp.title}</Text>
                <Text style={styles.entryDate}>
                  {exp.startDate} — {exp.endDate ?? 'Present'}
                </Text>
              </View>
              <Text style={styles.entrySubtitle}>{exp.company} | {exp.location}</Text>
              {exp.bullets.map((bullet, j) => (
                <Text key={j} style={styles.bullet}>• {bullet}</Text>
              ))}
            </View>
          ))}
        </View>

        {/* Education, Skills, Projects follow same pattern */}
      </Page>
    </Document>
  );

  const blob = await pdf(<ResumeDocument />).toBlob();
  return blob;
}
```

### 6.5 API Integration Details

**OpenAI API (called from Edge Function):**

| Endpoint | Method | Model | Purpose |
|----------|--------|-------|---------|
| `POST https://api.openai.com/v1/chat/completions` | POST | `gpt-4o-mini` | Keyword extraction, iterations 1-(N-1) rewrite |
| `POST https://api.openai.com/v1/chat/completions` | POST | `gpt-4o` | Final iteration rewrite (quality pass) |

Request structure:
```json
{
  "model": "gpt-4o-mini",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ],
  "response_format": { "type": "json_object" },
  "temperature": 0.3,
  "max_tokens": 4000
}
```

Authentication: `Authorization: Bearer ${OPENAI_API_KEY}` (stored as Supabase Edge Function secret)

Rate limits: GPT-4o-mini: 500 RPM, 200k TPM. GPT-4o: 500 RPM, 30k TPM.
Backoff: Exponential with jitter, max 3 retries, initial delay 1s.

Cost per optimization (estimated):
- Keyword extraction: ~500 input tokens + ~300 output = ~$0.0004
- Per rewrite iteration (4o-mini): ~3000 input + ~2000 output = ~$0.003
- Final pass (4o): ~3000 input + ~2000 output = ~$0.025
- Total for 3-iteration optimization: ~$0.03

### 6.6 Edge Cases, Error Handling & Security

- **LLM hallucination prevention:** Every rewritten resume is validated against the original experience bank. If a company name, job title, or date range appears in the output that doesn't exist in the input, that entry is rejected and the original is preserved. The prompt explicitly forbids fabrication.
- **JSON parsing failure:** If the LLM returns malformed JSON despite `response_format: json_object`, retry once with a stricter prompt. If it fails again, return the last valid iteration's result.
- **Edge Function timeout:** Supabase Edge Functions have a 150s timeout (on paid plans). 3 iterations with GPT-4o-mini should complete in ~15-20s. If approaching timeout, return the best result so far.
- **Token limit exceeded:** If the resume + JD + prompt exceeds the model's context window, truncate the experience bank (keep most relevant entries based on keyword overlap) rather than the JD.
- **Concurrent optimizations:** Each optimization runs in its own Edge Function invocation. No shared state. The `applicationId` in the Realtime channel ensures updates go to the correct sidebar instance.
- **API key security:** The OpenAI API key is stored as a Supabase Edge Function secret (`Deno.env.get('OPENAI_API_KEY')`). It never touches the extension bundle.

### 6.7 Kiro Implementation Steps

1. Run SQL migration to create the `applications` table with RLS policies as specified in section 6.3.
2. Create `src/types/optimization.ts` — define `ATSOptimizationRequest`, `ATSOptimizationResponse`, `ATSIteration`, `ATSScoreBreakdown` types as specified in section 6.3.
3. Create Supabase Edge Function `supabase/functions/optimize-resume/index.ts`:
   - Parse request body as `ATSOptimizationRequest`
   - Verify JWT from Authorization header
   - Call keyword extraction with GPT-4o-mini
   - Implement scoring function
   - Implement iteration loop (score → rewrite → validate → rescore)
   - Broadcast progress via Supabase Realtime
   - Return `ATSOptimizationResponse`
4. Create `supabase/functions/optimize-resume/prompts.ts` — store prompt templates as template literal functions with variable injection.
5. Create `supabase/functions/optimize-resume/scoring.ts` — implement `scoreResume()` function and `flattenResumeToText()` helper.
6. Create `supabase/functions/optimize-resume/validation.ts` — implement hallucination checker that compares output against experience bank.
7. Create `src/lib/optimization.ts` — client-side wrapper: `optimizeResume(request)` calls `supabase.functions.invoke('optimize-resume', { body: request })`.
8. Create `src/lib/pdfGenerator.ts` — implement `generateResumePDF()` using `@react-pdf/renderer` as specified in section 6.4. Install dependency: `npm install @react-pdf/renderer`.
9. Create `src/stores/optimizationStore.ts` — Zustand store tracking current optimization state: `isOptimizing`, `currentIteration`, `iterations[]`, `finalResult`.
10. Create `src/sidepanel/components/OptimizationPanel.tsx` — UI component showing: trigger button, progress bar with iteration count, score gauge per iteration, before/after resume comparison view.
11. Create `src/sidepanel/components/ResumePreview.tsx` — renders a `StructuredResume` as a formatted preview in the sidebar (not PDF, just styled HTML for quick review).
12. Create `src/sidepanel/components/ScoreBreakdown.tsx` — visual breakdown of ATS score categories (keyword match, experience relevance, skills alignment, quantification) as progress bars.
13. Wire up Supabase Realtime subscription in `OptimizationPanel.tsx`: subscribe to channel `optimization:{applicationId}`, update `optimizationStore` on each broadcast.
14. After optimization completes: call `generateResumePDF()` client-side, upload to Supabase Storage at `{userId}/tailored/{applicationId}.pdf`, insert `resumes` record with `type: 'tailored'` and link to application.
15. Deploy Edge Function to Supabase. Set `OPENAI_API_KEY` as a secret via Supabase CLI or dashboard.
16. Verify: trigger optimization from side panel on a detected job page, confirm iterations progress in real-time, confirm final PDF is generated and stored.

---

## Spec 7 — P1: Contact Discovery & Enrichment Pipeline

### 7.1 Priority & Objective

**Priority:** P1 — Feature Enhancement
**Justification:** Networking is the #1 predictor of job search success, yet no existing auto-apply tool automates it. This is the competitive differentiator that transforms AutoApply from "another Simplify clone" into a category-defining product. Classified P1 because the core apply flow (P0) must work first.

**Objective:** Build a server-side contact discovery pipeline (Supabase Edge Function) that, given a target company and the user's university, queries Apollo.io for recruiters/hiring managers, cross-references Proxycurl for alumni connections, verifies email addresses via Hunter.io, deduplicates results, and stores the enriched contact graph in Supabase Postgres.

**User Story:** "As a job seeker who just applied to Google, I want the extension to automatically find 5+ recruiters and alumni at Google with verified emails so that I can network my way to a referral."

**Success Criteria:**
- Edge Function returns 5+ contacts per company with >80% email verification rate
- Alumni from user's university are flagged and prioritized
- Contact deduplication prevents storing the same person twice across applications
- Results appear in the side panel within 10 seconds
- API costs per discovery run stay under $0.15

### 7.2 Architecture & Tech Stack

**Extension Contexts Involved:**
- Side panel — triggers discovery, displays contact cards, shows verification status
- Service worker — invokes Edge Function

**Supabase Services Used:** Edge Functions (discovery orchestration), Database (contacts table), Realtime (push discovery progress)

**External APIs:** Apollo.io (people search), Proxycurl (LinkedIn enrichment), Hunter.io (email finding + verification), Google Custom Search (fallback)

### 7.3 Database Schema & Data Structures

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
  email_confidence INTEGER,              -- Hunter.io confidence score 0-100
  linkedin_url TEXT,
  is_alumni BOOLEAN DEFAULT FALSE,
  university TEXT,                        -- Their university (for alumni matching)
  seniority TEXT,                         -- 'entry', 'mid', 'senior', 'director', 'vp', 'c_suite'
  department TEXT,                        -- 'hr', 'engineering', 'recruiting', etc.
  source TEXT NOT NULL,                   -- 'apollo', 'proxycurl', 'hunter', 'google_search'
  raw_data JSONB DEFAULT '{}'::jsonb,     -- Full API response for reference
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email)                  -- Deduplicate by email per user
);

CREATE INDEX idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX idx_contacts_company ON public.contacts(company);
CREATE INDEX idx_contacts_application_id ON public.contacts(application_id);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own contacts"
  ON public.contacts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**TypeScript Types:**

```typescript
// src/types/contacts.ts
export interface Contact {
  id: string;
  user_id: string;
  application_id: string | null;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  company: string;
  email: string | null;
  email_verified: boolean;
  email_confidence: number | null;
  linkedin_url: string | null;
  is_alumni: boolean;
  university: string | null;
  seniority: string | null;
  department: string | null;
  source: string;
  created_at: string;
}

export interface ContactDiscoveryRequest {
  company: string;
  jobTitle: string;
  applicationId: string;
  userUniversity: string | null;
  targetCount: number;           // Default 5
}

export interface ContactDiscoveryResponse {
  contacts: Contact[];
  totalFound: number;
  alumniFound: number;
  emailsVerified: number;
}
```

### 7.4 Logic & Algorithms

**Edge Function: `discover-contacts`**

```
Input: ContactDiscoveryRequest
Output: ContactDiscoveryResponse

Algorithm:
1. SEARCH APOLLO.IO for people at the target company:
   Query parameters:
   - organization_name: company
   - person_titles: ["recruiter", "talent acquisition", "hiring manager",
                     "university recruiter", "technical recruiter",
                     "engineering manager", "HR"]
   - person_seniorities: ["senior", "director", "manager"]
   - limit: 20 (fetch more than needed for filtering)

2. FILTER results:
   - Remove contacts without LinkedIn URLs (low quality)
   - Prioritize by relevance: recruiter > hiring manager > engineering manager
   - Prioritize by seniority: director > senior > mid

3. ALUMNI CROSS-REFERENCE (if userUniversity provided):
   For each Apollo contact with a LinkedIn URL:
   - Query Proxycurl with the LinkedIn URL
   - Check education history for userUniversity match
   - If match found, set is_alumni = true
   Note: Proxycurl costs $0.01/call. Limit to top 10 contacts to control costs.

4. EMAIL DISCOVERY & VERIFICATION:
   For each contact (top 10 by priority):
   a. If Apollo provided an email, verify with Hunter.io
   b. If no email from Apollo, use Hunter.io email finder:
      POST https://api.hunter.io/v2/email-finder
      { first_name, last_name, domain: companyDomain }
   c. Verify found email:
      GET https://api.hunter.io/v2/email-verifier?email=...
   d. Store email_confidence from Hunter response

5. DEDUPLICATE against existing contacts for this user:
   - Check UNIQUE(user_id, email) constraint
   - On conflict, update the existing record with new application_id link

6. STORE contacts in Supabase Postgres

7. RETURN ContactDiscoveryResponse with all enriched contacts
```

**Alumni Matching Algorithm:**

```typescript
function isAlumni(proxycurlEducation: Education[], userUniversity: string): boolean {
  if (!userUniversity) return false;
  const normalizedTarget = normalizeUniversityName(userUniversity);
  return proxycurlEducation.some(edu => {
    const normalizedSchool = normalizeUniversityName(edu.school || '');
    return (
      normalizedSchool === normalizedTarget ||
      levenshteinDistance(normalizedSchool, normalizedTarget) <= 3 ||
      UNIVERSITY_ALIASES[normalizedTarget]?.includes(normalizedSchool)
    );
  });
}

function normalizeUniversityName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(university|college|institute|school)\b/g, '')
    .replace(/\b(of|the|at|and)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Common aliases
const UNIVERSITY_ALIASES: Record<string, string[]> = {
  'carnegiemellon': ['cmu'],
  'stanford': ['stanforduniversity'],
  'mit': ['massachusettsinstitutetechnology'],
  'ucberkeley': ['cal', 'berkeley', 'ucb'],
  // ... extend as needed
};
```

### 7.5 API Integration Details

**Apollo.io People Search:**
- Endpoint: `POST https://api.apollo.io/v1/mixed_people/search`
- Auth: `x-api-key: ${APOLLO_API_KEY}` header
- Rate limit: 50 requests/minute (free tier), 300/min (paid)
- Cost: Free tier gives 10,000 credits/month. Each search = 1 credit.
- Backoff: 429 → wait 60s, retry

**Proxycurl LinkedIn Enrichment:**
- Endpoint: `GET https://nubela.co/proxycurl/api/v2/linkedin?url={linkedinUrl}`
- Auth: `Authorization: Bearer ${PROXYCURL_API_KEY}`
- Rate limit: 300 requests/minute
- Cost: $0.01 per successful call. Budget: max 10 calls per discovery = $0.10
- Backoff: 429 → wait 10s, retry

**Hunter.io Email Finder:**
- Endpoint: `POST https://api.hunter.io/v2/email-finder`
- Auth: `api_key` query parameter
- Rate limit: 15 requests/second
- Cost: 1 request per search. Free: 25/month. Starter ($49): 500/month.

**Hunter.io Email Verifier:**
- Endpoint: `GET https://api.hunter.io/v2/email-verifier?email={email}&api_key={key}`
- Cost: 1 verification per call. Bundled with plan.

### 7.6 Edge Cases, Error Handling & Security

- **Apollo returns no results:** Fall back to Google Custom Search: `site:linkedin.com/in "{company}" "recruiter"`. Parse LinkedIn URLs from results, then enrich via Proxycurl.
- **Proxycurl rate limit:** If alumni check hits rate limit, skip remaining alumni checks and return contacts with `is_alumni: null` (unknown). The user can trigger a re-check later.
- **Hunter email not found:** If Hunter can't find an email, store the contact without email. The outreach spec (Spec 8) will skip contacts without verified emails.
- **Duplicate contacts across applications:** The `UNIQUE(user_id, email)` constraint handles this. On conflict, the existing contact is updated with the new `application_id` (many-to-many relationship could be added later).
- **API key rotation:** All API keys are Supabase Edge Function secrets. Rotation requires updating the secret via Supabase CLI — no code changes needed.
- **Cost control:** The Edge Function tracks API call counts per invocation and enforces hard limits: max 1 Apollo search, max 10 Proxycurl calls, max 15 Hunter calls per discovery run.

### 7.7 Kiro Implementation Steps

1. Run SQL migration to create the `contacts` table with RLS policies as specified in section 7.3.
2. Create `src/types/contacts.ts` — define `Contact`, `ContactDiscoveryRequest`, `ContactDiscoveryResponse` types.
3. Create Supabase Edge Function `supabase/functions/discover-contacts/index.ts`:
   - Parse request body, verify JWT
   - Call Apollo.io people search
   - Filter and prioritize results
   - Cross-reference alumni via Proxycurl (if university provided)
   - Find and verify emails via Hunter.io
   - Deduplicate and store in contacts table
   - Return ContactDiscoveryResponse
4. Create `supabase/functions/discover-contacts/apollo.ts` — Apollo.io API client with typed request/response.
5. Create `supabase/functions/discover-contacts/proxycurl.ts` — Proxycurl API client with alumni matching logic.
6. Create `supabase/functions/discover-contacts/hunter.ts` — Hunter.io email finder + verifier client.
7. Create `supabase/functions/discover-contacts/alumni.ts` — `isAlumni()` function with university normalization and alias matching.
8. Create `src/lib/contacts.ts` — client-side wrapper: `discoverContacts(request)` calls `supabase.functions.invoke('discover-contacts', { body: request })`.
9. Create `src/stores/contactsStore.ts` — Zustand store: `contacts[]`, `isDiscovering`, `discoveryProgress`.
10. Create `src/sidepanel/components/ContactCard.tsx` — displays a single contact: name, title, company, email (masked until verified), alumni badge, LinkedIn link, "Draft Email" button.
11. Create `src/sidepanel/components/ContactDiscoveryPanel.tsx` — triggers discovery, shows progress, renders list of ContactCards.
12. Set Edge Function secrets via Supabase CLI: `APOLLO_API_KEY`, `PROXYCURL_API_KEY`, `HUNTER_API_KEY`.
13. Verify: trigger contact discovery for a known company, confirm 5+ contacts returned with verified emails.

---

## Spec 8 — P1: Outreach Drafting & Dispatch

### 8.1 Priority & Objective

**Priority:** P1 — Feature Enhancement
**Justification:** Contact discovery (Spec 7) is only valuable if it leads to actual outreach. This spec closes the loop by generating personalized emails and sending them. Together with Spec 7, this creates the "connection farming" moat.

**Objective:** Build an outreach system that generates personalized coffee chat emails using GPT-4o (leveraging the contact's background, the job posting, and the user's profile), presents drafts for user review/editing in the sidebar, dispatches approved emails via Resend API, and tracks outreach status with Realtime updates.

**User Story:** "As a job seeker, I want personalized cold emails drafted for each recruiter the extension found so that I can review, edit, and send them with one click to maximize my chances of getting a referral."

**Success Criteria:**
- GPT-4o generates contextually relevant, non-generic emails for each contact
- User can review, edit, and approve each email before sending
- Emails are sent via Resend with custom domain support
- Outreach status (drafted → sent → follow_up) is tracked in real-time
- Follow-up reminders are scheduled 5 days after initial send

### 8.2 Architecture & Tech Stack

**Extension Contexts Involved:**
- Side panel — email draft review/edit UI, send button, outreach status dashboard
- Service worker — schedules follow-up reminders via `chrome.alarms`

**Supabase Services Used:** Edge Functions (email generation + dispatch), Database (outreach table), Realtime (status updates)

**External APIs:** OpenAI GPT-4o (email drafting), Resend (email sending)

### 8.3 Database Schema & Data Structures

```sql
CREATE TABLE public.outreach (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  application_id UUID REFERENCES public.applications(id),
  email_subject TEXT NOT NULL,
  email_body TEXT NOT NULL,
  email_html TEXT,                        -- HTML version for rich formatting
  status TEXT DEFAULT 'drafted' CHECK (status IN (
    'drafted', 'approved', 'sending', 'sent', 'follow_up_scheduled', 'follow_up_sent', 'replied', 'bounced'
  )),
  sent_at TIMESTAMPTZ,
  follow_up_at TIMESTAMPTZ,              -- Scheduled follow-up date
  follow_up_body TEXT,                    -- Pre-generated follow-up email
  resend_message_id TEXT,                 -- Resend API message ID for tracking
  opened_at TIMESTAMPTZ,                 -- Via Resend webhook (future)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_outreach_user_id ON public.outreach(user_id);
CREATE INDEX idx_outreach_contact_id ON public.outreach(contact_id);
CREATE INDEX idx_outreach_status ON public.outreach(status);

ALTER TABLE public.outreach ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own outreach"
  ON public.outreach FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**TypeScript Types:**

```typescript
// src/types/outreach.ts
export interface Outreach {
  id: string;
  user_id: string;
  contact_id: string;
  application_id: string | null;
  email_subject: string;
  email_body: string;
  email_html: string | null;
  status: 'drafted' | 'approved' | 'sending' | 'sent' | 'follow_up_scheduled' | 'follow_up_sent' | 'replied' | 'bounced';
  sent_at: string | null;
  follow_up_at: string | null;
  follow_up_body: string | null;
  resend_message_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OutreachDraftRequest {
  contactId: string;
  applicationId: string;
  userProfile: UserProfile;
  contact: Contact;
  jobTitle: string;
  company: string;
  jobDescription: string;
}

export interface OutreachDraftResponse {
  subject: string;
  body: string;
  followUpBody: string;
}
```

### 8.4 Logic & Algorithms

**Email Drafting Prompt Template:**

```
You are a professional networking email writer. Draft a concise, warm coffee chat
request email from a job applicant to a company employee.

SENDER PROFILE:
Name: {{userName}}
University: {{userUniversity}} (Class of {{graduationYear}})
Current Role: {{currentTitle}} at {{currentCompany}}
LinkedIn: {{userLinkedIn}}

RECIPIENT:
Name: {{contactName}}
Title: {{contactTitle}} at {{company}}
{{#if isAlumni}}Note: They are a fellow {{userUniversity}} alumni.{{/if}}

TARGET ROLE: {{jobTitle}} at {{company}}

INSTRUCTIONS:
1. Subject line: Short, personal, no spam triggers. Reference a shared connection point.
2. Opening: {{#if isAlumni}}Lead with the alumni connection.{{else}}Lead with genuine interest in their work/role.{{/if}}
3. Body: Briefly mention your background (1-2 sentences), express interest in the role, ask for a 15-minute coffee chat or phone call.
4. Closing: Grateful, not desperate. Professional but warm.
5. Total length: 100-150 words. Shorter is better.
6. Do NOT use phrases: "I hope this email finds you well", "I came across your profile", "I would love to pick your brain"
7. Tone: Confident, specific, respectful of their time.

Return JSON:
{
  "subject": "...",
  "body": "...",
  "followUpBody": "..." // A brief 2-3 sentence follow-up for 5 days later
}
```

**Outreach Pipeline:**

```
1. User clicks "Draft Emails" on ContactDiscoveryPanel
2. For each contact with a verified email:
   a. Call Edge Function `draft-outreach` with contact + user profile + job context
   b. GPT-4o generates subject, body, and follow-up body
   c. Store as outreach record with status = 'drafted'
   d. Push to sidebar via Realtime

3. User reviews drafts in sidebar:
   a. Each draft shown as an editable card (subject + body)
   b. User can edit text, then click "Approve" or "Discard"
   c. Approved → status = 'approved'

4. User clicks "Send All Approved":
   a. Call Edge Function `send-outreach` with list of approved outreach IDs
   b. For each:
      - Send via Resend API
      - Update status = 'sent', set sent_at
      - Store resend_message_id
      - Calculate follow_up_at = sent_at + 5 days
      - Update status = 'follow_up_scheduled'
   c. Push updates via Realtime

5. Follow-up scheduling:
   a. Service worker sets chrome.alarm for each follow_up_at
   b. On alarm fire, notify user in sidebar: "Follow up with {name}?"
   c. User can send pre-generated follow-up or edit it
```

**Resend API Integration:**

```typescript
// Inside Edge Function
async function sendEmail(
  from: string,       // "user@customdomain.com" or "noreply@autoapply.com"
  to: string,
  subject: string,
  body: string
): Promise<{ id: string }> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text: body,
      // html: htmlVersion, // Optional rich HTML version
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Resend error: ${error.message}`);
  }

  return response.json(); // { id: "msg_..." }
}
```

### 8.5 API Integration Details

**OpenAI GPT-4o (email drafting):**
- Same endpoint as Spec 6
- Model: `gpt-4o` (quality matters for outreach — no mini here)
- Temperature: 0.7 (more creative than resume rewriting)
- Cost per draft: ~$0.01 (short prompts)
- Cost for 5 contacts: ~$0.05

**Resend API:**
- Endpoint: `POST https://api.resend.com/emails`
- Auth: `Authorization: Bearer ${RESEND_API_KEY}`
- Rate limit: 10 emails/second (free tier: 100/day, paid: 50k/month)
- Cost: Free tier 3,000/month. $20/month for 50,000.
- Webhook for open tracking: `POST https://api.resend.com/webhooks` (future enhancement)

### 8.6 Edge Cases, Error Handling & Security

- **Email deliverability:** Use a custom domain with SPF/DKIM/DMARC configured in Resend. Emails from `@autoapply.com` will have better deliverability than generic domains.
- **Spam prevention:** Rate limit outreach to max 20 emails/day per user. This prevents abuse and protects domain reputation.
- **Bounce handling:** If Resend reports a bounce, update outreach status to 'bounced' and mark the contact's email as unverified.
- **User editing breaks formatting:** The email body is plain text, not HTML. This prevents formatting issues from user edits. HTML version is auto-generated from plain text for email clients that prefer it.
- **Follow-up timing:** `chrome.alarms` minimum interval is 1 minute. For 5-day follow-ups, set the alarm with `when: Date.now() + 5 * 24 * 60 * 60 * 1000`. Service worker may not be alive when the alarm fires — Chrome will wake it.

### 8.7 Kiro Implementation Steps

1. Run SQL migration to create the `outreach` table with RLS policies as specified in section 8.3.
2. Create `src/types/outreach.ts` — define `Outreach`, `OutreachDraftRequest`, `OutreachDraftResponse` types.
3. Create Supabase Edge Function `supabase/functions/draft-outreach/index.ts`:
   - Accept contact + user profile + job context
   - Call GPT-4o with email drafting prompt
   - Parse structured JSON response
   - Insert outreach record with status 'drafted'
   - Return draft
4. Create Supabase Edge Function `supabase/functions/send-outreach/index.ts`:
   - Accept list of outreach IDs
   - For each: fetch outreach record, send via Resend, update status
   - Return send results
5. Create `src/lib/outreach.ts` — client-side wrappers: `draftOutreach()`, `sendOutreach()`, `fetchOutreach()`.
6. Create `src/stores/outreachStore.ts` — Zustand store: `outreachItems[]`, `isDrafting`, `isSending`.
7. Create `src/sidepanel/components/OutreachDraftCard.tsx` — editable email card: subject input, body textarea, approve/discard buttons, send button.
8. Create `src/sidepanel/components/OutreachPanel.tsx` — container: "Draft All" button, list of OutreachDraftCards, "Send All Approved" button, status summary.
9. Wire up Realtime subscription for outreach status updates in OutreachPanel.
10. Update `src/background/index.ts` — add follow-up alarm scheduling: on outreach status change to 'sent', create alarm for follow_up_at. On alarm fire, send notification to sidebar.
11. Set Edge Function secrets: `RESEND_API_KEY`.
12. Verify: draft emails for discovered contacts, review in sidebar, send, confirm delivery via Resend dashboard.

---

## Spec 9 — P1: Application Tracking Dashboard

### 9.1 Priority & Objective

**Priority:** P1 — Feature Enhancement
**Justification:** Users applying to dozens of jobs need a centralized view of their pipeline. Without tracking, the extension is a fire-and-forget tool with no feedback loop. The dashboard transforms AutoApply from a utility into a daily-use platform.

**Objective:** Build a sidebar dashboard that displays all applications in a Kanban-style pipeline (detected → optimizing → ready → applied → interviewing → offer/rejected), shows ATS scores, outreach stats per application, and supports filtering/sorting. All data syncs in real-time via Supabase Realtime.

**User Story:** "As a job seeker who has applied to 50+ jobs this week, I want a dashboard showing every application's status, ATS score, and networking progress so that I can prioritize follow-ups and track my pipeline."

**Success Criteria:**
- Dashboard shows all applications grouped by status
- Each application card shows: company, role, ATS score, outreach count, date
- User can manually update application status (e.g., mark as "interviewing")
- Real-time updates when optimization completes or outreach status changes
- Filter by status, company, date range
- Sort by date, ATS score, company name

### 9.2 Architecture & Tech Stack

**Extension Contexts Involved:**
- Side panel — dashboard UI (primary view after onboarding)

**Supabase Services Used:** Database (read applications, resumes, outreach), Realtime (live status updates)

### 9.3 Database Schema & Data Structures

No new tables. This spec reads from `applications` (Spec 6), `resumes` (Spec 3), `contacts` (Spec 7), and `outreach` (Spec 8).

**Zustand Dashboard Store:**

```typescript
// src/stores/dashboardStore.ts
import { create } from 'zustand';

interface ApplicationSummary {
  id: string;
  company: string;
  role: string;
  platform: string;
  status: string;
  ats_score: number | null;
  outreach_count: number;
  outreach_replied: number;
  applied_at: string | null;
  created_at: string;
  job_url: string | null;
}

interface DashboardStore {
  applications: ApplicationSummary[];
  isLoading: boolean;
  filter: {
    status: string | null;
    company: string | null;
    dateRange: { from: string; to: string } | null;
  };
  sortBy: 'date' | 'score' | 'company';
  sortOrder: 'asc' | 'desc';

  setApplications: (apps: ApplicationSummary[]) => void;
  updateApplication: (id: string, updates: Partial<ApplicationSummary>) => void;
  setFilter: (filter: Partial<DashboardStore['filter']>) => void;
  setSortBy: (sortBy: DashboardStore['sortBy']) => void;
  toggleSortOrder: () => void;
  setLoading: (loading: boolean) => void;
}
```

### 9.4 Logic & Algorithms

**Dashboard Data Fetching:**

```typescript
async function fetchDashboardData(userId: string): Promise<ApplicationSummary[]> {
  // Single query with aggregated outreach counts
  const { data, error } = await supabase
    .from('applications')
    .select(`
      id, company, role, platform, status, ats_score, applied_at, created_at, job_url,
      outreach:outreach(count),
      outreach_replied:outreach(count).filter(status.eq.replied)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return data.map(app => ({
    ...app,
    outreach_count: app.outreach?.[0]?.count ?? 0,
    outreach_replied: app.outreach_replied?.[0]?.count ?? 0,
  }));
}
```

**Realtime Subscription:**

```typescript
// Subscribe to application status changes
supabase
  .channel('dashboard-updates')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'applications',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      if (payload.eventType === 'INSERT') {
        dashboardStore.getState().setApplications([
          ...dashboardStore.getState().applications,
          mapToSummary(payload.new),
        ]);
      } else if (payload.eventType === 'UPDATE') {
        dashboardStore.getState().updateApplication(payload.new.id, payload.new);
      }
    }
  )
  .subscribe();
```

**Status Pipeline Visualization:**

```
detected → optimizing → ready → applied → interviewing → offer
                                    ↘                      ↗
                                     → rejected
                                    ↘
                                     → withdrawn
```

### 9.5 API Integration Details

All data comes from Supabase Postgres via the JS client. No external APIs.

### 9.6 Edge Cases, Error Handling & Security

- **Large application lists:** For users with 100+ applications, implement pagination (load 20 at a time, infinite scroll). Use Supabase `.range(from, to)` for cursor-based pagination.
- **Stale data:** Realtime subscription handles live updates. On sidebar open, always do a fresh fetch to catch any updates that occurred while the sidebar was closed.
- **Status transitions:** Enforce valid transitions client-side (e.g., can't go from 'detected' directly to 'offer'). Invalid transitions show an error toast.
- **Offline state:** If Supabase is unreachable, show cached data from the last successful fetch (stored in Zustand, which persists in memory during the sidebar session).

### 9.7 Kiro Implementation Steps

1. Create `src/stores/dashboardStore.ts` — implement Zustand dashboard store as specified in section 9.3.
2. Create `src/lib/dashboard.ts` — implement `fetchDashboardData()` with the aggregated query from section 9.4.
3. Create `src/sidepanel/components/dashboard/ApplicationCard.tsx` — compact card showing company logo (via Clearbit Logo API: `https://logo.clearbit.com/{domain}`), role, status badge, ATS score gauge, outreach count, date.
4. Create `src/sidepanel/components/dashboard/StatusColumn.tsx` — column component for a single status group, renders list of ApplicationCards.
5. Create `src/sidepanel/components/dashboard/DashboardFilters.tsx` — filter bar: status dropdown, company search input, date range picker, sort toggle.
6. Create `src/sidepanel/components/dashboard/Dashboard.tsx` — main dashboard view: fetches data on mount, subscribes to Realtime, renders StatusColumns or list view based on user preference, applies filters and sorting.
7. Create `src/sidepanel/components/dashboard/ApplicationDetail.tsx` — expanded view when clicking an application card: full JD, tailored resume preview, outreach list, status update buttons.
8. Update `src/sidepanel/App.tsx` — set Dashboard as the default view for authenticated users who have completed onboarding.
9. Wire up Supabase Realtime subscription in Dashboard.tsx as specified in section 9.4.
10. Verify: create several test applications, confirm they appear in dashboard, update statuses, confirm real-time updates propagate.

---

## Spec 10 — P2: Analytics, Settings & Polish

### 10.1 Priority & Objective

**Priority:** P2 — Polish / Advanced
**Justification:** Analytics and settings are not required for the core workflow but are essential for user retention and product maturity. Understanding which resume versions perform best and which outreach templates get replies creates a data flywheel that improves the product over time.

**Objective:** Build an analytics dashboard showing application success rates, resume version A/B performance, outreach response rates, and weekly/monthly activity trends. Add a settings page for user preferences (default ATS score threshold, outreach limits, notification preferences). Implement rate limit management across all external APIs, error recovery UX, and a first-time onboarding tutorial flow.

**User Story:** "As a power user who has applied to 200+ jobs, I want to see which resume versions get the most interviews and which outreach templates get the most replies so that I can refine my strategy."

**Success Criteria:**
- Analytics page shows: applications per week, interview rate, ATS score distribution, outreach response rate
- Resume A/B tracking: compare interview callback rates across different tailored resume versions
- Settings page allows configuring: ATS target score, max optimization iterations, daily outreach limit, notification preferences
- Rate limit dashboard shows remaining API credits across OpenAI, Apollo, Hunter, Resend
- Onboarding tutorial highlights key features on first use

### 10.2 Architecture & Tech Stack

**Extension Contexts Involved:**
- Side panel — analytics charts, settings forms, onboarding tutorial overlay
- Options page — extended settings (API key management for power users, export data)

**Supabase Services Used:** Database (aggregation queries for analytics), Edge Functions (rate limit status checks)

### 10.3 Database Schema & Data Structures

```sql
-- User preferences
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

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own settings"
  ON public.user_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Analytics events (append-only log for tracking)
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

CREATE INDEX idx_analytics_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON public.analytics_events(created_at);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own analytics"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**TypeScript Types:**

```typescript
// src/types/settings.ts
export interface UserSettings {
  user_id: string;
  ats_target_score: number;
  max_optimization_iterations: number;
  daily_outreach_limit: number;
  notifications_enabled: boolean;
  auto_optimize_on_detect: boolean;
  auto_discover_contacts: boolean;
  preferred_resume_template: string;
  theme: 'light' | 'dark' | 'system';
}

// src/types/analytics.ts
export interface AnalyticsSummary {
  totalApplications: number;
  applicationsThisWeek: number;
  interviewRate: number;              // % of applications that reached 'interviewing'
  offerRate: number;                  // % of applications that reached 'offer'
  averageAtsScore: number;
  totalOutreachSent: number;
  outreachResponseRate: number;       // % of outreach that got 'replied'
  topPerformingResumeId: string | null;
  weeklyTrend: { week: string; count: number }[];
  atsScoreDistribution: { range: string; count: number }[];
}
```

### 10.4 Logic & Algorithms

**Analytics Aggregation Queries:**

```typescript
// Application funnel
async function getApplicationFunnel(userId: string): Promise<Record<string, number>> {
  const { data } = await supabase
    .from('applications')
    .select('status')
    .eq('user_id', userId);

  return data.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

// Weekly application trend
async function getWeeklyTrend(userId: string, weeks: number = 12): Promise<{ week: string; count: number }[]> {
  const { data } = await supabase.rpc('get_weekly_application_trend', {
    p_user_id: userId,
    p_weeks: weeks,
  });
  return data;
}

// Postgres function for weekly trend
/*
CREATE OR REPLACE FUNCTION get_weekly_application_trend(p_user_id UUID, p_weeks INT)
RETURNS TABLE(week TEXT, count BIGINT) AS $$
  SELECT
    TO_CHAR(DATE_TRUNC('week', created_at), 'YYYY-MM-DD') as week,
    COUNT(*) as count
  FROM public.applications
  WHERE user_id = p_user_id
    AND created_at >= NOW() - (p_weeks || ' weeks')::INTERVAL
  GROUP BY DATE_TRUNC('week', created_at)
  ORDER BY week;
$$ LANGUAGE sql SECURITY DEFINER;
*/

// Resume A/B performance
async function getResumePerformance(userId: string) {
  const { data } = await supabase
    .from('applications')
    .select('tailored_resume_id, status, ats_score')
    .eq('user_id', userId)
    .not('tailored_resume_id', 'is', null);

  // Group by resume, calculate interview rate per resume version
  const byResume = new Map<string, { total: number; interviews: number; avgScore: number }>();
  // ... aggregation logic
}
```

**Rate Limit Tracking:**

```typescript
// src/lib/rateLimits.ts
interface RateLimitStatus {
  service: string;
  remaining: number;
  limit: number;
  resetsAt: string;
}

// Track API usage in chrome.storage.local
// Each Edge Function call increments counters
// Reset counters based on API billing cycle
```

**Onboarding Tutorial Flow:**

```
Step 1: "Welcome to AutoApply" — overview of what the extension does
Step 2: "Your Profile" — highlight the profile section, explain why it matters
Step 3: "Job Detection" — show how the extension activates on job pages
Step 4: "One-Click Apply" — demonstrate auto-fill + ATS optimization
Step 5: "Network Automatically" — explain contact discovery + outreach
Step 6: "Track Everything" — show the dashboard

Implementation: Overlay tooltips using a lightweight tour library (e.g., driver.js)
Track completion in chrome.storage.local: 'autoapply:tutorial_completed'
```

### 10.5 API Integration Details

No new external APIs. Analytics are computed from existing Supabase data. Rate limit status is tracked client-side based on Edge Function response headers.

### 10.6 Edge Cases, Error Handling & Security

- **Analytics performance:** For users with thousands of applications, aggregation queries could be slow. Use Postgres functions (`SECURITY DEFINER`) for complex aggregations to leverage server-side computation. Consider materialized views if query times exceed 2 seconds.
- **Settings sync:** Settings are loaded on sidebar open and cached in Zustand. Changes are written to Supabase immediately (optimistic update). If the write fails, revert the local state.
- **Rate limit exhaustion:** When any API's rate limit is approaching (>80% used), show a warning banner in the sidebar. When exhausted, disable the corresponding feature with a clear message ("Daily outreach limit reached. Resets tomorrow.").
- **Data export:** Settings page includes a "Export My Data" button that downloads all user data as JSON (GDPR compliance). Implemented as a Supabase Edge Function that queries all user tables and returns a ZIP.
- **Theme switching:** Respect `prefers-color-scheme` media query for 'system' theme. TailwindCSS dark mode classes handle the styling.

### 10.7 Kiro Implementation Steps

1. Run SQL migration to create `user_settings` and `analytics_events` tables with RLS policies. Create the `get_weekly_application_trend` Postgres function.
2. Create `src/types/settings.ts` and `src/types/analytics.ts` — define types as specified in section 10.3.
3. Create `src/stores/settingsStore.ts` — Zustand store for user settings with load/save actions.
4. Create `src/lib/settings.ts` — `fetchSettings()`, `updateSettings()` functions.
5. Create `src/lib/analytics.ts` — `fetchAnalyticsSummary()`, `getApplicationFunnel()`, `getWeeklyTrend()`, `getResumePerformance()` functions.
6. Create `src/sidepanel/components/analytics/AnalyticsDashboard.tsx` — main analytics view with summary cards (total apps, interview rate, avg ATS score, outreach response rate).
7. Create `src/sidepanel/components/analytics/WeeklyTrendChart.tsx` — bar chart showing applications per week. Use a lightweight chart library (e.g., `recharts` or pure SVG).
8. Create `src/sidepanel/components/analytics/ATSScoreDistribution.tsx` — histogram of ATS scores across all applications.
9. Create `src/sidepanel/components/analytics/OutreachFunnel.tsx` — funnel visualization: sent → opened → replied.
10. Create `src/sidepanel/components/settings/SettingsPage.tsx` — form with all user preferences from `UserSettings` type. Save on change with debounce.
11. Create `src/sidepanel/components/settings/RateLimitDashboard.tsx` — shows remaining API credits per service with progress bars.
12. Install `driver.js`: `npm install driver.js`. Create `src/sidepanel/components/onboarding/Tutorial.tsx` — implement 6-step tutorial overlay. Trigger on first sidebar open after onboarding completion.
13. Create `src/lib/analyticsTracker.ts` — utility that inserts events into `analytics_events` table. Call from other specs: after auto-fill (Spec 5), after optimization (Spec 6), after outreach send (Spec 8), after status change (Spec 9).
14. Update `src/sidepanel/App.tsx` — add navigation items for Analytics and Settings pages.
15. Verify: complete several applications end-to-end, confirm analytics dashboard shows accurate data, confirm settings persist across sessions.

---

## Appendix A: Environment Variables

```env
# .env (extension build)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Supabase Edge Function Secrets (set via CLI or dashboard)
OPENAI_API_KEY=sk-...
APOLLO_API_KEY=...
PROXYCURL_API_KEY=...
HUNTER_API_KEY=...
RESEND_API_KEY=re_...
```

## Appendix B: Dependency Manifest

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

## Appendix C: Supabase Edge Function Deployment

All Edge Functions are deployed via Supabase CLI:

```bash
# Deploy all functions
supabase functions deploy optimize-resume
supabase functions deploy discover-contacts
supabase functions deploy draft-outreach
supabase functions deploy send-outreach

# Set secrets
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set APOLLO_API_KEY=...
supabase secrets set PROXYCURL_API_KEY=...
supabase secrets set HUNTER_API_KEY=...
supabase secrets set RESEND_API_KEY=re_...
```

## Appendix D: Implementation Priority Matrix

### Engineering-effort estimates (single-threaded, idealized)

The table below is **not a calendar promise**. It approximates **focused implementation time** for an experienced engineer (or AI-accelerated solo dev) when context-switching and meetings are minimal. **Integration, QA, store review, and unknowns** are not fully baked into single-day rows.

| Spec | Priority | Depends On | Estimated Effort | Cumulative (serial) |
|------|----------|-----------|-----------------|---------------------|
| 1. Project Scaffolding | P0 | — | 1 day | 1 day |
| 2. Supabase Auth | P0 | Spec 1 | 1 day | 2 days |
| 3. Profile & Resume Mgmt | P0 | Spec 1, 2 | 2 days | 4 days |
| 4. ATS Detection Engine | P0 | Spec 1 | 2 days | 6 days |
| 5. Auto-Fill System | P0 | Spec 1, 3, 4 | 3 days | 9 days |
| 6. ATS Optimization Loop | P0 | Spec 1, 2, 3, 4 | 3 days | 12 days |
| 7. Contact Discovery | P1 | Spec 1, 2, 6 | 2 days | 14 days |
| 8. Outreach Dispatch | P1 | Spec 7 | 2 days | 16 days |
| 9. Application Dashboard | P1 | Spec 6 | 2 days | 18 days |
| 10. Analytics & Settings | P2 | All | 3 days | 21 days |

**Serial sum:** ~**21 engineering days** of nominal implementation effort for the full Spec 1–10 scope under idealized conditions.

### Credible calendar planning

| Scope | Realistic calendar (indicative) | Notes |
|-------|-------------------------------|--------|
| **P0 only (Specs 1–6)** | **6–10 weeks** part-time, or **~6–8 weeks** with two engineers and parallel workstreams | Includes integration, manual QA, first Chrome Web Store dry run—not just typing code |
| **Full blueprint (1–10)** | **10–14+ weeks** human team | P1/P2 features, polish, beta feedback |
| **Solo developer, sequential** | **Multiply** serial estimates by **2–3×** for calendar time (context switching, learning, life) | AI tools reduce typing, not ambiguity or review cycles |

**Takeaway:** Treat **~21 engineering days** (serial sum, full Spec 1–10) as a **rough order-of-magnitude for raw build steps**, not as “P0 ships in three weeks.” The [Team plan, parallel workstreams, and sprint milestones](#team-plan-parallel-workstreams-and-sprint-milestones) section is the authoritative schedule framing for stakeholders.

---

*End of masterplan.md — Version 1.1.0*
