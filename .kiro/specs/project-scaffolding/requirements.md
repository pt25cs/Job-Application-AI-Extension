# Requirements Document

## Introduction

This feature establishes the foundational Chrome extension development environment for AutoApply using Vite + React + TypeScript with Manifest V3. It includes the side panel UI shell, service worker entry point, content script injection framework, TailwindCSS + shadcn/ui component library, and a production build pipeline that outputs a Chrome Web Store-ready `.zip`. This is the root spec upon which all other features depend.

## Glossary

- **Extension_Shell**: The complete Chrome extension project skeleton including all entry points (service worker, side panel, content scripts, options page), build configuration, and shared libraries
- **Service_Worker**: The Manifest V3 background script (`src/background/index.ts`) that manages extension lifecycle events, message routing, and alarm scheduling
- **Side_Panel**: The primary React-based UI surface (`src/sidepanel/`) rendered in Chrome's built-in side panel, opened via the extension action icon
- **Content_Script**: A script (`src/content/index.ts`) injected into ATS (Applicant Tracking System) web pages at `document_idle` to enable DOM interaction and platform detection
- **Options_Page**: A secondary React-based UI (`src/options/`) for extension settings and configuration
- **Build_Pipeline**: The Vite-based toolchain that compiles TypeScript, bundles React components, processes TailwindCSS, and outputs a loadable Chrome extension to `dist/`
- **Packaging_Pipeline**: The process that takes the `dist/` build output and produces a `.zip` archive suitable for Chrome Web Store submission
- **HMR**: Hot Module Replacement — Vite's development feature that updates code in the running extension without a full reload
- **ATS_Domain**: A web domain belonging to an Applicant Tracking System (e.g., `boards.greenhouse.io`, `jobs.lever.co`, `*.myworkdayjobs.com`)
- **Message_Protocol**: The typed inter-context communication system using `chrome.runtime.sendMessage` with `ExtensionMessage` and `ExtensionResponse` types
- **FAB**: Floating Action Button — a UI element injected into ATS pages by the Content_Script inside a ShadowRoot to provide quick access to extension functionality while maintaining CSS isolation from the host page
- **ShadowRoot**: A DOM encapsulation boundary (Shadow DOM) used to isolate Content_Script-injected UI elements from the host page's CSS, preventing style leakage in both directions
- **Manifest_V3**: The current Chrome extension manifest format required by the Chrome Web Store, using service workers instead of persistent background pages
- **Component_Library**: The shadcn/ui component system integrated with TailwindCSS, class-variance-authority, clsx, and tailwind-merge for consistent UI primitives

## Requirements

### Requirement 1: Development Environment Setup

**User Story:** As a developer on the team, I want to clone the repo and run `npm install && npm run dev` so that I have a working Chrome extension development environment with hot-reload.

#### Acceptance Criteria

1. WHEN a developer runs `npm install`, THE Extension_Shell SHALL install all required dependencies without errors, including React 18.x, TypeScript 5.x (strict mode), Vite 5.x, @crxjs/vite-plugin@beta (required for Vite 5 + Manifest V3 service worker compatibility), Zustand, TailwindCSS, and shadcn/ui component dependencies
2. WHEN a developer runs `npm run dev`, THE Build_Pipeline SHALL launch Vite with HMR enabled on port 5173
3. WHEN the development server is running, THE Extension_Shell SHALL be loadable in Chrome via `chrome://extensions` as an unpacked extension from the development output
4. WHEN a source file is modified during development, THE Build_Pipeline SHALL apply HMR to update the running extension without requiring a full extension reload
5. THE Extension_Shell SHALL compile all TypeScript with zero errors under `strict: true`, `jsx: react-jsx`, `moduleResolution: bundler`, and `target: ES2022`
6. THE Extension_Shell SHALL configure path aliases so that `@/*` resolves to `src/*` in all TypeScript files

### Requirement 2: Manifest V3 Configuration

**User Story:** As a developer, I want a complete Manifest V3 configuration so that the extension declares all required permissions and entry points for Chrome.

#### Acceptance Criteria

1. THE Extension_Shell SHALL define a Manifest V3 configuration with `manifest_version: 3`, extension name "AutoApply", and version sourced from `package.json`
2. THE Extension_Shell SHALL declare the following permissions: `sidePanel`, `storage`, `activeTab`, `tabs`, `alarms`, `identity`
3. THE Extension_Shell SHALL declare host permissions for ATS_Domain patterns: `boards.greenhouse.io`, `jobs.lever.co`, `*.myworkdayjobs.com`, `*.ashbyhq.com`, `*.bamboohr.com`, `*.icims.com`, `*.taleo.net`
4. THE Extension_Shell SHALL register the Service_Worker as a module-type background script at `src/background/index.ts`
5. THE Extension_Shell SHALL register the Side_Panel default path as `src/sidepanel/index.html`
6. THE Extension_Shell SHALL register Content_Script injection on all declared ATS_Domain patterns with `run_at: document_idle`
7. THE Extension_Shell SHALL register the Options_Page at `src/options/index.html`
8. THE Extension_Shell SHALL declare extension icons at sizes 16x16, 48x48, and 128x128 pixels from `public/icons/`

### Requirement 3: Service Worker Lifecycle

**User Story:** As a developer, I want the service worker to handle lifecycle events and message routing so that the extension background process is functional from day one.

#### Acceptance Criteria

1. WHEN the Service_Worker is installed, THE Service_Worker SHALL log "AutoApply service worker installed" and set `autoapply:initialized` to `true` in `chrome.storage.local`
2. WHEN the Service_Worker is activated, THE Service_Worker SHALL claim all clients and log "AutoApply service worker activated"
3. WHEN the user clicks the extension action icon, THE Service_Worker SHALL open the Side_Panel for the current window using `chrome.sidePanel.open`
4. WHEN the Service_Worker receives an ExtensionMessage, THE Service_Worker SHALL route the message to the appropriate handler based on the message `type` field and return an ExtensionResponse
5. IF the Service_Worker receives a message with an unrecognized `type`, THEN THE Service_Worker SHALL return an ExtensionResponse with `success: false` and a descriptive error string

### Requirement 4: Side Panel UI Shell

**User Story:** As a developer, I want a working React-based side panel UI so that I can immediately begin building feature interfaces.

#### Acceptance Criteria

1. WHEN the Side_Panel is opened, THE Side_Panel SHALL render a React 18 application mounted to a `div#root` element in `src/sidepanel/index.html`
2. THE Side_Panel SHALL include a root `App` component using `MemoryRouter` from `react-router-dom` (NOT `BrowserRouter`, which is incompatible with Chrome extension side panels that lack access to the browser History API) with placeholder route-based navigation supporting paths: `/` (dashboard), `/onboarding`, `/profile`, `/applications`, `/outreach`, `/settings`
3. THE Side_Panel SHALL apply TailwindCSS utility classes via a stylesheet containing `@tailwind base`, `@tailwind components`, and `@tailwind utilities` directives
4. THE Side_Panel SHALL include a functional shadcn/ui Button component at `src/sidepanel/components/ui/button.tsx` to validate the Component_Library integration

### Requirement 5: Content Script Injection

**User Story:** As a developer, I want a content script framework that injects on ATS pages so that future specs can build DOM interaction features on top of it.

#### Acceptance Criteria

1. WHEN the Content_Script loads on an ATS_Domain page, THE Content_Script SHALL send a `DETECT_ATS_PLATFORM` message to the Service_Worker via the Message_Protocol
2. WHEN the Service_Worker responds with a detected platform, THE Content_Script SHALL create a ShadowRoot (mode: `open`) on a host `<div>` element and inject the FAB placeholder element inside the ShadowRoot to isolate extension CSS from the host page and prevent host page CSS from leaking into the FAB
3. THE Content_Script SHALL inject a scoped stylesheet inside the ShadowRoot containing only the styles required for the FAB, ensuring no TailwindCSS resets or base styles leak into the host page DOM
4. WHEN the user clicks the FAB, THE Content_Script SHALL send an `OPEN_SIDE_PANEL` message to the Service_Worker via the Message_Protocol

### Requirement 6: Typed Message Protocol

**User Story:** As a developer, I want a typed message passing system so that all inter-context communication is type-safe and consistent.

#### Acceptance Criteria

1. THE Message_Protocol SHALL define a `MessageType` union type including: `DETECT_ATS_PLATFORM`, `EXTRACT_JOB_DESCRIPTION`, `AUTOFILL_FORM`, `GET_AUTH_SESSION`, `OPEN_SIDE_PANEL`, `OPTIMIZATION_STATUS`, `OUTREACH_STATUS`
2. THE Message_Protocol SHALL define an `ExtensionMessage<T>` generic interface with fields: `type` (MessageType), `payload` (T), optional `tabId` (number), and `timestamp` (number)
3. THE Message_Protocol SHALL define an `ExtensionResponse<T>` generic interface with fields: `success` (boolean), optional `data` (T), and optional `error` (string)
4. THE Message_Protocol types (`MessageType`, `ExtensionMessage`, `ExtensionResponse`) SHALL be defined in `src/types/messages.ts` to prevent circular dependencies with utility modules
5. THE Extension_Shell SHALL provide a typed `sendMessage<T>` helper function in `src/utils/messaging.ts` that imports types from `src/types/messages.ts` and wraps `chrome.runtime.sendMessage`, returning `Promise<ExtensionResponse<T>>`

### Requirement 7: Shared Libraries and State Management

**User Story:** As a developer, I want shared library modules and a state management shell so that future specs have consistent foundations to build upon.

#### Acceptance Criteria

1. THE Extension_Shell SHALL provide a Supabase client singleton in `src/lib/supabase.ts` that uses a `chromeStorageAdapter` backed by `chrome.storage.local` for session persistence, with `autoRefreshToken: true`, `persistSession: true`, and `flowType: pkce`
2. THE Extension_Shell SHALL provide a Zustand app store in `src/stores/index.ts` with an `initialized` boolean state and a `setInitialized` setter
3. THE Extension_Shell SHALL provide a `cn()` utility function in `src/lib/utils.ts` that merges TailwindCSS class names using `clsx` and `tailwind-merge`
4. THE Extension_Shell SHALL provide a placeholder `Database` type export in `src/types/database.types.ts` for future Supabase type generation

### Requirement 8: Production Build and Packaging

**User Story:** As a developer, I want build and packaging scripts so that I can produce a Chrome Web Store-ready extension artifact.

#### Acceptance Criteria

1. WHEN a developer runs `npm run build`, THE Build_Pipeline SHALL run TypeScript compilation followed by Vite production build, producing output in a `dist/` directory
2. WHEN the build completes, THE Build_Pipeline SHALL produce a `dist/` folder that is directly loadable as an unpacked extension in Chrome
3. WHEN a developer runs `npm run package`, THE Packaging_Pipeline SHALL run the build and then produce a `.zip` archive from the `dist/` directory suitable for Chrome Web Store submission
4. THE Build_Pipeline SHALL include source maps only in development mode, not in production builds
5. THE Build_Pipeline SHALL strip HMR client code from production builds

### Requirement 9: Environment Configuration

**User Story:** As a developer, I want environment variable templates so that I can configure external service credentials without committing secrets.

#### Acceptance Criteria

1. THE Extension_Shell SHALL provide a `.env.example` file containing placeholder entries for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. THE Extension_Shell SHALL provide placeholder icon PNG files at `public/icons/icon-16.png`, `public/icons/icon-48.png`, and `public/icons/icon-128.png`
