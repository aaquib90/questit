# Questit Monorepo Plan

This document captures the proposed structure and concrete steps for turning the repository into a workspace-style monorepo that can host the existing web experience plus the upcoming apps (mobile, desktop, etc.).

---

## 1. Target Structure

```
Questit/
├── apps/
│   ├── web/            # existing Vite workbench (moved from /web)
│   └── mobile/         # new mobile app (Expo/React Native, Flutter, etc.)
├── packages/
│   ├── ui/             # shared UI primitives (buttons, cards, theming)
│   ├── toolkit/        # shared Questit client utilities, template helpers
│   └── config/         # lint config, tsconfig bases, shared scripts
├── docs/               # architecture + planning
├── workers/            # Cloudflare Workers (unchanged)
├── scripts/            # data import/export utilities (unchanged for now)
└── package.json        # root workspace manifest
```

---

## 2. Migration Steps

### Phase 0 – Prep
1. **Root manifest**  
   - Create `/package.json` with `workspaces: ["apps/*", "packages/*", "workers/*"]`.  
   - Move existing lint/prettier configs to root so they can be shared.
2. **Tooling pick**  
   - Decide on npm vs pnpm workspaces (pnpm recommended for deterministic installs).  
   - Document `corepack enable pnpm` instructions in README.

### Phase 1 – Move the Web App
1. `mv web apps/web`.  
2. Update all relative imports/paths referencing `../web`.  
3. Update deployment scripts (Cloudflare Pages) to point at `apps/web`.
4. Ensure Vite aliases still resolve (`@` → `apps/web/src`).  
5. Run `pnpm install` (or npm) at root; verify `pnpm --filter web dev` works.

### Phase 2 – Stand Up Shared Packages
1. Create `packages/ui`  
   - Move reusable components (buttons, Surface, color utilities) from `apps/web`.  
   - Export via `packages/ui/src/index.ts` (or `.js`).  
   - Update `apps/web` imports to consume `@questit/ui`.
2. Create `packages/toolkit`  
   - House `templateUtils`, `themeManager`, Supabase client helpers, etc.  
   - Publish local types so mobile + web can share logic (template fetch hooks, memory bootstrap).
3. Create `packages/config`  
   - ESLint config, Tailwind config, tsconfig base, Storybook config.  
   - Each app extends the shared config to reduce duplication.

### Phase 3 – Mobile App Bootstrap
1. Scaffold the mobile app inside `apps/mobile` (Expo with React Native is the default recommendation).  
2. Configure metro bundler/Expo to resolve `@questit/ui` and `@questit/toolkit`.  
3. Share Supabase + API clients by importing from `packages/toolkit`.  
4. Establish unified authentication flow (magic link) so both apps behave consistently.

### Phase 4 – Dev Experience & CI
1. **Scripts**  
   - Add root scripts: `pnpm dev:web`, `pnpm dev:mobile`, `pnpm lint`, `pnpm test`.  
   - Optionally add `pnpm turbo` or `nx` for build graph orchestration.
2. **CI pipeline**  
   - Update GitHub Actions/Cloudflare integration to run workspace-aware installs.  
   - Cache pnpm store between jobs for faster builds.
3. **Documentation**  
   - Update README + CONTRIBUTING with workspace usage, dev scripts, and folder layout.  
   - Document how to add new packages/apps.

### Phase 5 – Nice-to-haves
1. **Storybook or Ladle** for UI components, fed by `packages/ui`.  
2. **Testing**  
   - Set up Jest/Vitest at root; reuse config via `packages/config`.  
   - Add smoke tests for template fetching in both web/mobile apps.
3. **Release management**  
   - If we ever publish packages publicly, add changesets or semantic-release.  
   - For now, keep packages private and versioned via git history.

---

## 3. Immediate Next Actions
1. Keep the new `mobile/` directory as a placeholder (already created) and decide on Expo vs. other frameworks.
2. Draft the root `package.json` + choose npm/pnpm workspace tooling.
3. Plan the `web` → `apps/web` move (update Cloudflare build settings the same day to avoid deploy breaks).
4. Identify which components/utils should live in `packages/ui` vs `packages/toolkit` so the migration is incremental.

---

## 4. User Data, Auth, and Local Memory Considerations

### 4.1 Shared Auth & Profiles
- **Single identity provider**: Keep Supabase auth (magic link) as the source of truth for both web and mobile.
- **packages/toolkit/auth**: Export hooks (e.g., `useQuestitSession`, `signInWithMagicLink`, `useProfile`) used by both apps.
- **Profile sync**: Mobile app should cache user preferences (appearance, default model) using `AsyncStorage`/`SecureStore`, mirroring the existing `localStorage` usage on web.
- **Anonymous usage**: Ensure both clients gracefully degrade when not signed in. Local memory should still work (device-scoped) even without an authenticated user.

### 4.2 Local Memory API
- **Shared implementation**: The `buildTemplateMemoryBootstrap` logic currently injects localStorage-backed memory into template iframes. Extract this into `packages/toolkit/memory`:
  - `createMemoryAdapter(storage)` factory that accepts `localStorage`, `AsyncStorage`, or custom drivers.
  - Provide React hooks (`useMemoryEntries(toolId)`, `useMemoryHandler`) for native UIs.
- **Sync between apps**:  
  - Web keeps using `localStorage`.  
  - Mobile uses `AsyncStorage` and, when signed in, can optionally push a subset of memory entries to Supabase for cross-device sync.
- **Privacy defaults**: Document in both apps that local memory stays on-device unless the user opts into account-wide sync. Include explainers in settings screens.

### 4.3 User Info Sharing
- Define a shared `UserProfile` schema (name, avatar, subscription tier, memory preferences, recently used templates).
- Store profile metadata in Supabase (`user_profiles` table) and expose via `packages/toolkit/profile`.
- Both apps should surface a consistent “My Data” panel showing:
  - Saved tools
  - Memory mode (none / device / account)
  - Token usage (if we expose it later)
- Provide utilities for background syncing:
  - `syncProfileLocally(profile)` to hydrate local caches
  - `queueProfileUpdate(patch)` to batch updates while offline (mobile)

### 4.4 Cross-Platform Template Usage
- When a user taps “Use this template” on mobile, mirror the web toast behavior (via shared `packages/ui/toast`).
- Persist “recent templates” locally and in Supabase to power cross-device recents.
- Ensure template previews respect the same memory adapter so experiences (e.g., “Take it for a spin”) behave identically on both clients.

### 4.5 Security & Consent
- Centralize consent prompts (e.g., “Enable account memory?”) in `packages/toolkit/privacy`.
- Log whenever local memory is escalated to account-wide sync; store an audit record in Supabase for support/debug.
- Provide a shared “Clear memory” action that wipes local storage/AsyncStorage and remote entries via Supabase RPC.

Add these considerations to the acceptance checklist when we implement the mobile app. Keeping auth, profile, and memory in shared packages avoids inconsistent behavior between platforms.

---

## 5. Supabase Schema Tasks (Web + App Parity)

1. **`user_profiles` table**
   - Columns: `user_id uuid primary key references auth.users`, `display_name`, `avatar_url`, `memory_mode` (`none/device/account`), `memory_retention`, `last_active_at`, `preferences jsonb`.
   - Policies:  
     - `select`: user can read their own row.  
     - `insert/update`: user can write only their row.  
     - service role retains full access.

2. **`user_recent_templates`**
   - Columns: `user_id`, `template_id`, `template_slug`, `used_at`, `source` (`web`, `mobile`), `notes`.
   - Unique on (`user_id`, `template_id`) to keep the most recent timestamp.
   - RLS: user sees only their entries; service role manages for admin tooling.

3. **`user_settings` (optional)**
   - Single row per user capturing theme, default model, notifications. Can merge into `user_profiles.preferences`.

4. **`template_memory_snapshots`** (account-wide sync opt-in)
   - Columns: `id`, `user_id`, `template_slug`, `memory jsonb`, `updated_at`.
   - Used only if the user enables “account memory”; otherwise data stays device-local.

5. **Audit triggers**
   - For any table that stores user data, add `updated_at` triggers (already used elsewhere) plus optional history tables if we need compliance trails later.

Document migrations under `supabase/migrations/` with clear up/down statements and RLS policies so both apps rely on the same backend shape.

---

## 6. Managing Feature Parity Between Web & App

### 6.1 Shared Feature Flags
- Introduce a `features` table or use Remote Config (e.g., Supabase `kv`, LaunchDarkly) to gate new functionality.
- Expose a helper in `packages/toolkit/flags` so both clients can fetch flags once and cache locally.
- Example flag categories: `template-search-v2`, `account-memory-beta`, `ai-filters-enabled`.

### 6.2 Capability Matrix
- Maintain a matrix in `docs/feature-parity.md` listing each major feature and its availability state:
  - Template browsing (web ✅, mobile beta 🚧)
  - Take-it-for-a-spin preview
  - Local memory inspector
  - Publish/share flows
- Use this matrix to plan sprints and avoid regressions when adding mobile-specific experiences.

### 6.3 Shared Release Notes & Telemetry
- Aggregate analytics/events from both apps into the same Supabase/PostHog pipelines.
- Include `platform` metadata (`web`, `mobile`) on every AI usage event, template apply, publish action, etc.
- Build dashboards that compare usage to spot parity issues early (e.g., mobile “Use template” crash).

### 6.4 Component & Hook Reuse
- Whenever possible, implement features inside shared packages:
  - Search logic (`useTemplateLibrary`, filter utils) in `packages/toolkit`.
  - UI primitives (cards, badges, toasts) in `@questit/ui` with platform-specific render adapters.
  - Memory inspector view logic extracted so both apps can render identical data differently (grid vs. native list).

### 6.5 QA & Rollout
- Define parallel QA checklists for each feature flag. Example:
  1. Launch on web with flag → gather feedback.
  2. Port UI logic to mobile (using shared toolkit) → enable for beta testers.
  3. Once metrics align, promote the flag to “all platforms”.

Keeping features behind flags + a parity matrix ensures we don’t block the mobile build on every web change, but also avoids long-term divergence.

---

## 7. Template & Tool Code Transformation for the Mobile App

The current generator produces HTML/CSS/JS bundles optimized for in-browser rendering. To reuse these templates in a native app, we need a transformation layer that can render either:
1. **WebView-based experience** (fastest path)
2. **Native reconstructions** (ideal long-term for better performance/accessibility)

### 7.1 Phase A – WebView Wrapper (MVP)
- **Shared component**: `packages/toolkit/template-runtime/native-webview`.
- Render the generated bundle inside a secure WebView:
  - Inline the HTML/CSS/JS just like we do on the web.
  - Inject the same `buildTemplateMemoryBootstrap` script, swapping the storage adapter for `AsyncStorage`.
  - Communicate via `postMessage` for memory sync, copy-to-clipboard, etc.
- **Pros**: zero additional generator work; parity with existing templates on day one.
- **Cons**: heavier memory usage, limited native look, relies on WebView availability.

### 7.2 Phase B – Structured Template Schema
- Extend the generator to emit an optional structured schema alongside the raw bundle:
  ```json
  {
    "layout": [...],
    "elements": [...],
    "logic": [...],
    "metadata": { "theme": "...", "icon": "..." }
  }
  ```
- Store the schema in Supabase (`template_library.preview_schema`).  
- Build a renderer in `packages/ui/native-template` that interprets this schema into native components (Text, Button, List).
- Requires updating `generateTool` to ask the model for both HTML and structured JSON, and adding validation to ensure parity.

### 7.3 Phase C – Hybrid Rendering
- Allow templates to declare capabilities:
  - `render_mode: "webview"` (default) or `"native"`.
  - Native templates reference `packages/ui` components; web fallback uses HTML.
- Update Supabase rows with `render_mode` metadata so the mobile app knows which renderer to use.

### 7.4 Transformation Pipeline Tasks
1. **Shared runtime hooks**
   - `useTemplateBundle(templateId)` fetches HTML/CSS/JS and returns metadata needed by both renderers.
   - `useTemplateSchema(templateId)` (later) retrieves the structured schema.
2. **Memory + data layer**
   - Abstract the `localStorage` access pattern into storage drivers:
     - `browserStorageDriver` (localStorage)
     - `nativeStorageDriver` (AsyncStorage)
   - Provide consistent APIs (`get`, `set`, `remove`, `clear`) across both.
3. **Native renderer backlog**
   - Start with a limited widget set (cards, text blocks, buttons, inputs).
   - Incrementally map CSS utilities to native style tokens.
   - Use a shared theme file so colors and typography align with the web version.

### 7.5 Tool Publishing
- When publishing/sharing a tool from mobile, include `render_mode` in the metadata so other clients know whether to load an inline WebView or render natively.
- Update the share shell to detect if it’s being opened from a mobile deep link and choose the right renderer.

### 7.6 Testing Strategy
- For WebView templates: automated smoke tests to ensure memory sync works (postMessage handshake).
- For native templates: unit tests around the schema renderer + snapshot tests of core components.
- Include fixture templates (simple todo list, counter, timer) to verify both rendering paths produce equivalent behavior.

By tackling Phase A first we can ship the mobile app with full template coverage quickly, then progressively migrate high-value templates to native components as the schema stabilizes.

Document progress in this file as each phase completes. This keeps everyone aligned on the monorepo adoption timeline and ensures future apps follow the same structure.
