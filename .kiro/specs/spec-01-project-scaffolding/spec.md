# Spec 1 — P0: Project Scaffolding & Extension Shell

## Requirement

Establish a fully functional Chrome extension development environment using Vite + React + TypeScript with Manifest V3, including the side panel UI shell, service worker entry point, content script injection framework, TailwindCSS + shadcn/ui component library, and a production build pipeline that outputs a Chrome Web Store-ready `.zip`.

## User Story

"As a developer on the team, I can clone the repo, run `npm install && npm run dev`, and see a working Chrome extension with hot-reload, a side panel UI, and a service worker — so that I can immediately begin building features."

## Success Criteria

- `npm run dev` launches Vite with HMR and the extension loads in Chrome via `chrome://extensions`
- Side panel opens when the extension icon is clicked
- Service worker registers and logs lifecycle events
- Content script injects on target ATS domains (placeholder)
- `npm run build` produces a `dist/` folder loadable as an unpacked extension
- `npm run package` produces a `.zip` for Chrome Web Store submission
- All TypeScript compiles with zero errors under `strict: true`

## Priority

P0 — Core MVP. Nothing can be built without the foundational project structure. All other specs depend on this one.

## Dependencies

None. This is the root spec.

## Architecture

Reference: #[[file:masterplan.md]] — Spec 1, sections 1.2 through 1.7
Reference: #[[file:.kiro/specs/architecture-reference.md]] — Global Architecture Preamble

### Extension Contexts

- Service worker (`src/background/index.ts`) — lifecycle management, message routing, alarm scheduling
- Side panel (`src/sidepanel/index.html` + `src/sidepanel/App.tsx`) — primary React UI
- Content scripts (`src/content/index.ts`) — injected into ATS pages, DOM interaction
- Options page (`src/options/index.html` + `src/options/App.tsx`) — settings (future)

### Manifest V3 Permissions

| Permission | Reason |
|-----------|--------|
| `sidePanel` | Primary UI surface |
| `storage` | Persist Supabase auth session |
| `activeTab` | Access current tab URL for ATS detection |
| `tabs` | Query tab URLs for platform detection |
| `alarms` | Schedule periodic token refresh, outreach follow-ups |
| `identity` | OAuth redirect URL generation |

### Project Directory Structure

```
autoapply/
├── public/icons/
├── src/
│   ├── background/index.ts
│   ├── content/index.ts
│   ├── sidepanel/ (index.html, main.tsx, App.tsx, components/ui/)
│   ├── options/ (index.html, App.tsx)
│   ├── lib/ (supabase.ts)
│   ├── stores/ (index.ts)
│   ├── types/ (messages.ts, database.types.ts)
│   └── utils/ (messaging.ts)
├── manifest.config.ts
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── package.json
└── .env.example
```

## Implementation Tasks

1. Initialize project with `npm init -y`, set name/version/private in package.json
2. Install core deps: react, react-dom, zustand, @supabase/supabase-js
3. Install dev deps: vite, @vitejs/plugin-react, @crxjs/vite-plugin@beta (required for Vite 5 compatibility), typescript, @types/react, @types/react-dom, @types/chrome, tailwindcss, postcss, autoprefixer
4. Create tsconfig.json (strict: true, jsx: react-jsx, moduleResolution: bundler, target: ES2022, paths alias @/* → src/*)
5. Create tailwind.config.ts and postcss.config.js
6. Create src/sidepanel/index.css with Tailwind directives
7. Create manifest.config.ts with full Manifest V3 config
8. Create vite.config.ts with @crxjs/vite-plugin, react plugin, path aliases
9. Create src/background/index.ts — service worker lifecycle (install, activate, action click → open side panel, message router stub)
10. Create src/content/index.ts — content script (DETECT_ATS_PLATFORM message, FAB injection inside ShadowRoot for CSS isolation)
11. Create src/sidepanel/index.html — HTML shell with div#root
12. Create src/sidepanel/main.tsx — React entry point
13. Create src/sidepanel/App.tsx — root component with MemoryRouter-based placeholder routing (BrowserRouter is incompatible with Chrome extension side panels)
14. Create src/options/index.html and src/options/App.tsx — minimal options page
15. Create src/types/messages.ts — MessageType, ExtensionMessage, ExtensionResponse types
16. Create src/utils/messaging.ts — typed sendMessage helper wrapping chrome.runtime.sendMessage
17. Create src/lib/supabase.ts — Supabase client singleton with chromeStorageAdapter
18. Create src/stores/index.ts — Zustand app store shell
19. Create src/types/database.types.ts — placeholder empty Database type
20. Create public/icons/ with placeholder PNGs (16, 48, 128)
21. Create .env.example with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
22. Add npm scripts: dev, build, package
23. Install shadcn/ui deps (class-variance-authority, clsx, tailwind-merge, lucide-react), create src/lib/utils.ts with cn() helper
24. Create src/sidepanel/components/ui/button.tsx — first shadcn/ui component
25. Verify: run npm run build, confirm zero TS errors and valid dist/ output
