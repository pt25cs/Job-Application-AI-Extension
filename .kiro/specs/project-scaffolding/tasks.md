# Implementation Plan: Project Scaffolding & Extension Shell

## Overview

Incrementally build the Chrome extension skeleton from build configuration outward: first the toolchain and manifest, then shared types and utilities, then each execution context (service worker, side panel, content script, options page), and finally wiring everything together with tests.

## Tasks

- [x] 1. Initialize project and build configuration
  - [x] 1.1 Create `package.json` with all runtime and dev dependencies
    - Runtime: react, react-dom, react-router-dom, zustand, @supabase/supabase-js, clsx, tailwind-merge, class-variance-authority, lucide-react
    - Dev: vite ^5.x, @vitejs/plugin-react, @crxjs/vite-plugin@beta, typescript ^5.x, @types/react, @types/react-dom, @types/chrome, tailwindcss ^3.x, postcss, autoprefixer, vitest, @testing-library/react, @testing-library/jest-dom, jsdom
    - Scripts: `dev` (vite), `build` (tsc && vite build), `package` (npm run build && cd dist && zip -r ../autoapply.zip .)
    - _Requirements: 1.1, 8.1, 8.3_
  - [x] 1.2 Create `tsconfig.json` with strict mode and path aliases
    - `strict: true`, `jsx: react-jsx`, `moduleResolution: bundler`, `target: ES2022`
    - Path alias `@/*` → `src/*`
    - _Requirements: 1.5, 1.6_
  - [x] 1.3 Create `vite.config.ts` with @crxjs/vite-plugin and React plugin
    - Import manifest from `manifest.config.ts`
    - Configure `@/` path alias resolve
    - Output to `dist/`, source maps only in dev mode, HMR on port 5173
    - _Requirements: 1.2, 1.3, 8.4, 8.5_
  - [x] 1.4 Create `manifest.config.ts` using `defineManifest` from @crxjs/vite-plugin
    - `manifest_version: 3`, name "AutoApply", version from package.json
    - Permissions: sidePanel, storage, activeTab, tabs, alarms, identity
    - Host permissions for all ATS domain patterns
    - Register service worker (module type), side panel, content scripts (document_idle on ATS domains), options page
    - Declare icons at 16, 48, 128 from `public/icons/`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  - [x] 1.5 Create `tailwind.config.ts`, `postcss.config.js`
    - Tailwind content scans `src/**/*.{ts,tsx}`
    - PostCSS with tailwindcss + autoprefixer plugins
    - _Requirements: 4.3_
  - [x] 1.6 Create `.env.example` with Supabase placeholder entries
    - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` placeholders
    - _Requirements: 9.1_
  - [x] 1.7 Create placeholder icon PNGs at `public/icons/`
    - `icon-16.png`, `icon-48.png`, `icon-128.png`
    - _Requirements: 9.2_

- [x] 2. Implement shared types and utilities
  - [x] 2.1 Create `src/types/messages.ts` with message protocol types
    - `MessageType` union, `ExtensionMessage<T>` generic interface, `ExtensionResponse<T>` generic interface
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 2.2 Create `src/utils/messaging.ts` with typed `sendMessage<T>` helper
    - Import types from `@/types/messages`, wrap `chrome.runtime.sendMessage`, auto-add timestamp
    - _Requirements: 6.5_
  - [x] 2.3 Create `src/types/database.types.ts` with placeholder `Database` type
    - Export empty `Database` type for future Supabase type generation
    - _Requirements: 7.4_
  - [x] 2.4 Create `src/lib/utils.ts` with `cn()` utility
    - Merge class names using `clsx` and `tailwind-merge`
    - _Requirements: 7.3_
  - [x] 2.5 Create `src/lib/supabase.ts` with Supabase client singleton
    - Custom `chromeStorageAdapter` using `chrome.storage.local` for getItem/setItem/removeItem
    - `autoRefreshToken: true`, `persistSession: true`, `flowType: 'pkce'`
    - _Requirements: 7.1_
  - [x] 2.6 Create `src/stores/index.ts` with Zustand app store
    - `initialized: boolean` state, `setInitialized` setter
    - _Requirements: 7.2_
  - [ ]* 2.7 Write unit tests for shared utilities
    - Test `sendMessage` adds timestamp and delegates to `chrome.runtime.sendMessage`
    - Test `cn()` merges class names correctly (conflicting Tailwind classes resolved)
    - Test Zustand store initial state and `setInitialized` mutation
    - Set up Chrome API mocks for Vitest
    - _Requirements: 6.5, 7.2, 7.3_

- [x] 3. Implement service worker
  - [x] 3.1 Create `src/background/index.ts` with lifecycle handlers and message router
    - `onInstalled`: log message, set `autoapply:initialized` to `true` in `chrome.storage.local`
    - `onActivated`: claim clients, log message
    - `action.onClicked`: open side panel for current window
    - `onMessage`: route by `type` field — handle `DETECT_ATS_PLATFORM`, `OPEN_SIDE_PANEL`; return error for unknown types
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ]* 3.2 Write unit tests for service worker
    - Test `onInstalled` sets storage flag and logs
    - Test `onActivated` calls `clients.claim()`
    - Test `action.onClicked` calls `chrome.sidePanel.open` with correct windowId
    - Test message router routes known types, returns error for unknown types
    - Mock Chrome APIs (runtime, storage, sidePanel, action)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement side panel UI shell
  - [x] 5.1 Create `src/sidepanel/index.html` with root div and module script entry
    - Minimal HTML with `<div id="root">` and `<script type="module" src="./main.tsx">`
    - _Requirements: 4.1_
  - [x] 5.2 Create `src/sidepanel/index.css` with Tailwind directives
    - `@tailwind base`, `@tailwind components`, `@tailwind utilities`
    - _Requirements: 4.3_
  - [x] 5.3 Create `src/sidepanel/main.tsx` React entry point
    - `createRoot` on `#root`, render `<App />`
    - _Requirements: 4.1_
  - [x] 5.4 Create `src/sidepanel/App.tsx` with MemoryRouter and placeholder routes
    - `MemoryRouter` with routes: `/`, `/onboarding`, `/profile`, `/applications`, `/outreach`, `/settings`
    - Each route renders a placeholder component with the route name
    - Catch-all route redirects to `/`
    - _Requirements: 4.2_
  - [x] 5.5 Create `src/sidepanel/components/ui/button.tsx` shadcn/ui Button component
    - Standard shadcn/ui Button using class-variance-authority for variants
    - Validates full styling pipeline: Tailwind → CVA → clsx → tailwind-merge
    - _Requirements: 4.4_
  - [ ]* 5.6 Write unit tests for side panel
    - Test each route path renders correct placeholder component
    - Test Button component renders with variant classes
    - Use @testing-library/react with MemoryRouter
    - _Requirements: 4.2, 4.4_

- [x] 6. Implement content script
  - [x] 6.1 Create `src/content/content.css` with FAB-scoped styles
    - Positioning, colors, hover states, z-index for the FAB button
    - No Tailwind directives — only scoped FAB styles
    - _Requirements: 5.3_
  - [x] 6.2 Create `src/content/index.ts` with ATS detection and FAB injection
    - Import CSS via `?inline` suffix: `import cssText from './content.css?inline'`
    - On load: send `DETECT_ATS_PLATFORM` message with `window.location.href`
    - On success: create host div, attach ShadowRoot (mode: open), inject `<style>` with cssText, inject FAB button
    - FAB click: send `OPEN_SIDE_PANEL` message
    - Check for existing host element to prevent duplicate injection
    - Graceful degradation if service worker not ready
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ]* 6.3 Write unit tests for content script
    - Test sends `DETECT_ATS_PLATFORM` on load
    - Test creates ShadowRoot with FAB on successful detection
    - Test FAB click sends `OPEN_SIDE_PANEL` message
    - Test ShadowRoot contains scoped styles (no Tailwind resets)
    - Test no duplicate FAB injection
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 7. Implement options page
  - [x] 7.1 Create `src/options/index.html` and `src/options/App.tsx`
    - Minimal HTML shell with React mount point
    - Simple placeholder App component
    - _Requirements: 2.7_

- [x] 8. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirement clauses for traceability
- Checkpoints ensure incremental validation
- Chrome API mocks are needed for all unit tests involving `chrome.*` APIs
- The `@crxjs/vite-plugin@beta` is required for Vite 5 compatibility — the stable channel does not support it
