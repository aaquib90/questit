# Questit Monorepo Plan

This document captures the proposed structure and concrete steps for turning the repository into a workspace-style monorepo that can host the existing web experience plus the upcoming apps (mobile, desktop, etc.).

---

## 0. Guiding Principles

- **Single source of truth**: shared logic, types, and styling primitives live under `packages/*`, while platform-specific rendering stays inside `apps/*`.
- **Platform boundaries**: shared packages must avoid Node-only APIs; expose adapters (`browser`, `native`, `worker`) when platform quirks matter.
- **Gradual adoption**: introduce TypeScript, Turborepo, and workspace tooling without blocking today’s web deployments; allow mixed TS/JS during migration.
- **Deterministic builds**: lock Node, pnpm, and core dependencies so CI, local dev, and Expo EAS produce identical artifacts.
- **Security first**: centralize environment variables, Supabase access, and consent policies so every app inherits the same guardrails.
- **Test where it runs**: web, mobile, and workers each keep lightweight tests, but share fixtures and config to minimize drift.

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

- `packages/ui` exposes platform-specific entry points (e.g., `Button.web.tsx`, `Button.native.tsx`) plus shared tokens/themes.
- `packages/toolkit` acts as the client SDK—Supabase helpers, memory adapters, feature flags, and template runtime hooks originate here.
- `packages/config` consolidates linting, formatting, Tailwind, Storybook/Ladle, and `tsconfig` bases so apps extend consistent defaults.
- Optional `bin/` and `tools/` folders capture repo-wide scripts (formatting, migration generators, deploy helpers) without cluttering `scripts/`.
- Keep infra glue (`vercel.json`, `wrangler.toml`, Expo config) colocated in each app but reference shared defaults from `packages/config`.

---

## 2. Workspace Tooling & Conventions

- **Package manager**: prefer pnpm for deterministic, content-addressable installs. Root `package.json` should declare:

```json
{
  "packageManager": "pnpm@9",
  "workspaces": ["apps/*", "packages/*", "workers/*"],
  "engines": { "node": ">=20" }
}
```

- **Node tool pinning**: document `corepack enable pnpm` (or Volta) in `README.md` so everyone shares the same CLI version.
- **Task runner/orchestration**: add `turbo.json` with pipelines for `build`, `dev`, `lint`, `test`, and `typecheck`. Start with:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "lint": {},
    "test": { "dependsOn": ["^test"] },
    "typecheck": { "dependsOn": ["^typecheck"] },
    "dev": { "cache": false }
  }
}
```

- **Scripts**: expose shorthands at the root (`pnpm dev:web`, `pnpm dev:mobile`, `pnpm lint`, `pnpm test`, `pnpm typecheck`).
- **Workspace boundaries**: enforce workspace protocol (`workspace:*`) in `package.json` deps and use pnpm filters (`pnpm --filter @questit/ui test`) for targeted commands.
- **Caching**: enable Turborepo remote cache (optional) once CI is stable; always cache `~/.pnpm-store` between workflows.

---

## 3. Package Architecture & Boundaries

- **Primary packages**
  - `@questit/ui`: cross-platform UI primitives, toast system, tokens, template preview widgets.
  - `@questit/toolkit`: Supabase client wrappers, template runtime helpers, storage adapters, feature flags, profile utilities.
  - `@questit/config`: ESLint/Prettier/Tailwind configs, tsconfig bases, Storybook/Ladle presets, shared scripts.
- **Public API surface**: export via `src/index.ts` only; forbid deep imports using ESLint (`no-restricted-imports`).
- **Platform-specific files**: use React Native resolver conventions (`.web.tsx`, `.native.tsx`, `.desktop.tsx`) plus environment-specific adapters.
- **Adapter layer**: route platform-specific capabilities (clipboard, filesystem, network retries) through drivers in `packages/toolkit/adapters/<platform>.ts`.
- **Dependency constraints**: shared packages must stick to React/React Native-compatible dependencies; avoid Node built-ins and DOM globals unless guarded.
- **CI enforcement**: add dependency graph lint (e.g., `madge`, `eslint-plugin-boundaries`) to block imports from `apps/*` back into `packages/*`.

---

## 4. TypeScript & Module Resolution

- **Gradual TS**: keep `apps/web` JavaScript for now, but author new shared code in TypeScript. Enable `checkJs` on legacy files to get type hints early.
- **Base config**: store `packages/config/tsconfig/base.json` and extend it elsewhere (`apps/*/tsconfig.json`, `workers/*/tsconfig.json`).
- **Path aliases**: rely on TS `paths` + bundler equivalents (Vite `resolve.alias`, Metro `module-resolver`, Wrangler `tsconfig`) to reference shared packages uniformly.

```json
{
  "extends": "../packages/config/tsconfig/base.json",
  "compilerOptions": {
    "composite": true,
    "moduleResolution": "bundler",
    "paths": {
      "@questit/ui": ["packages/ui/src"],
      "@questit/toolkit": ["packages/toolkit/src"]
    }
  },
  "include": ["packages", "apps", "workers"]
}
```

- **Build outputs**: emit ESM and `.d.ts` files from shared packages so both Vite and Metro can tree-shake and type-check effectively.
- **Type generation**: hook `pnpm typecheck` into CI so we never ship stale declarations; regenerate Supabase types at the root and publish via `@questit/toolkit/types`.

---

## 5. Migration Steps

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
2. Configure Metro/Expo to resolve workspace packages and symlinks:

```js
// apps/mobile/metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.unstable_enableSymlinks = true;
config.resolver.disableHierarchicalLookup = true;
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules')
];

module.exports = config;
```

```js
// apps/mobile/babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        alias: {
          '@questit/ui': '../../packages/ui/src',
          '@questit/toolkit': '../../packages/toolkit/src'
        }
      }]
    ]
  };
};
```

3. Share Supabase + API clients by importing from `packages/toolkit`.  
4. Establish unified authentication flow (email + password) so both apps behave consistently.  
5. Guard shared dependencies—avoid CJS-only or Node-specific packages that Metro cannot bundle; add compatibility checks before promoting dependencies into shared packages.

#### Phase 2/3 Risks & Mitigations
- **Metro + pnpm symlinks**: Metro historically struggles with hoisted `node_modules`. Mitigate with explicit `watchFolders`, `nodeModulesPaths`, and `resolver.disableHierarchicalLookup`.
- **React Native incompatible deps**: run `pnpm why <dep>` before moving packages into `packages/*`; add an allowlist of dependencies proven to work in both Metro and Vite.
- **Circular dependencies**: enforce dependency boundaries (packages → apps only) via lint rules and CI checks (e.g., `pnpm dlx madge --circular`).
- **Incremental migration churn**: move feature slices gradually (UI > toolkit > config) and keep feature flags for code paths until both apps confirm parity.

### Phase 4 – Dev Experience & CI
1. **Scripts + Turborepo**  
   - Add root scripts: `pnpm dev:web`, `pnpm dev:mobile`, `pnpm lint`, `pnpm test`, `pnpm typecheck`.  
   - Wire them into `turbo.json` for cache-aware runs (`pnpm turbo run lint --filter=...`).
2. **CI matrix**  
   - Web (Cloudflare Pages): `pnpm -w install`, `pnpm turbo run build --filter apps/web`.  
   - Workers: `pnpm --filter workers/* deploy` with Wrangler; share `.dev.vars` templates.  
   - Mobile (Expo EAS): install via pnpm, run `eas build --profile preview --platform ios|android` with workspace-aware cache directories.  
   - Cache pnpm store + Turbo outputs between jobs, and persist Expo `~/.expo` if helpful.
3. **Quality gates**  
   - Require `lint`, `typecheck`, `test`, and relevant `build` jobs to pass before merging to `main`.  
   - Surface bundle size deltas (Turborepo traces) and template smoke results in PR status.
4. **Documentation**  
   - Update README/CONTRIBUTING with workspace usage, dev scripts, and instructions for adding new apps/packages.  
   - Document Expo-specific onboarding (simulator setup, `corepack enable pnpm`, `eas login`).

### Phase 5 – Nice-to-haves
1. **Storybook or Ladle** for UI components, fed by `packages/ui`.  
2. **Testing**  
   - Set up Jest/Vitest at root; reuse config via `packages/config`.  
   - Add smoke tests for template fetching in both web/mobile apps.
3. **Release management**  
   - If we ever publish packages publicly, add changesets or semantic-release.  
   - For now, keep packages private and versioned via git history.

---

## 6. Immediate Next Actions
1. Keep the new `mobile/` directory as a placeholder (already created) and decide on Expo vs. other frameworks.
2. Draft the root `package.json` + choose npm/pnpm workspace tooling.
3. Plan the `web` → `apps/web` move (update Cloudflare build settings the same day to avoid deploy breaks).
4. Identify which components/utils should live in `packages/ui` vs `packages/toolkit` so the migration is incremental.
5. Prep `turbo.json`, `.npmrc`, and repo-wide lint configs so code moves are mechanical rather than architectural later.

---

## 7. Environment & Secrets Management

- **Per-app env files**:  
  - `apps/web/.env.local`, `.env.preview`, `.env.production` feed Vite.  
  - `apps/mobile/.env` and `app.config.ts` reference the same keys (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `TEMPLATE_CDN_URL`).  
  - Workers rely on `wrangler.toml` + `wrangler secret put`.
- **Shared schema**: document required keys in `docs/env-reference.md` and surface a `scripts/setup-secrets.sh` helper that scaffolds environment files per app.
- **Secret loading**: expose `@questit/toolkit/env` with a typed accessor so both apps read validated values (Zod schema).
- **Rotation**: prefer 1Password/Secrets Manager for production credentials; local `.env*` stays gitignored.
- **Supabase**: centralize client creation in `@questit/toolkit/supabase/client` and pass environment-specific URLs/keys from callers to prevent config drift.
- **Workers & background jobs**: store service-role keys via `wrangler secret` and never commit them into the repo; document rotation steps alongside deployment instructions.

---

## 8. User Data, Auth, and Local Memory Considerations

### 8.1 Shared Auth & Profiles
- **Single identity provider**: Keep Supabase auth (email + password) as the source of truth for both web and mobile.
- **packages/toolkit/auth**: Export hooks (e.g., `useQuestitSession`, `signInWithMagicLink`, `useProfile`) used by both apps.
- **Profile sync**: Mobile app should cache user preferences (appearance, default model) using `AsyncStorage`/`SecureStore`, mirroring the existing `localStorage` usage on web.
- **Anonymous usage**: Ensure both clients gracefully degrade when not signed in. Local memory should still work (device-scoped) even without an authenticated user.

### 8.2 Local Memory API
- **Shared implementation**: The `buildTemplateMemoryBootstrap` logic currently injects localStorage-backed memory into template iframes. Extract this into `packages/toolkit/memory`:
  - `createMemoryAdapter(storage)` factory that accepts `localStorage`, `AsyncStorage`, or custom drivers.
  - Provide React hooks (`useMemoryEntries(toolId)`, `useMemoryHandler`) for native UIs.
- **Storage drivers**: standardize on an asynchronous interface so browser, native, and worker runtimes behave the same:

```ts
export interface StorageDriver {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

  - Default drivers: `browserStorageDriver` (localStorage), `nativeStorageDriver` (AsyncStorage), `memoryStorageDriver` (worker/tests).
  - Additional adapters cover clipboard, file export, and network sync (postMessage bridge for WebViews, Supabase sync workers).
- **Runtime adapters**: co-locate clipboard, file, and network helpers in `packages/toolkit/adapters/{browser,native,worker}.ts` and inject them into the template runtime so `buildTemplateMemoryBootstrap` never touches globals directly.
- **Sync between apps**:  
  - Web keeps using `localStorage`.  
  - Mobile uses `AsyncStorage` and, when signed in, can optionally push a subset of memory entries to Supabase for cross-device sync.
- **Privacy defaults**: Document in both apps that local memory stays on-device unless the user opts into account-wide sync. Include explainers in settings screens.

### 8.3 User Info Sharing
- Define a shared `UserProfile` schema (name, avatar, subscription tier, memory preferences, recently used templates).
- Store profile metadata in Supabase (`user_profiles` table) and expose via `packages/toolkit/profile`.
- Both apps should surface a consistent “My Data” panel showing:
  - Saved tools
  - Memory mode (none / device / account)
  - Token usage (if we expose it later)
- Provide utilities for background syncing:
  - `syncProfileLocally(profile)` to hydrate local caches
  - `queueProfileUpdate(patch)` to batch updates while offline (mobile)

### 8.4 Cross-Platform Template Usage
- When a user taps “Use this template” on mobile, mirror the web toast behavior (via shared `packages/ui/toast`).
- Persist “recent templates” locally and in Supabase to power cross-device recents.
- Ensure template previews respect the same memory adapter so experiences (e.g., “Take it for a spin”) behave identically on both clients.

### 8.5 Security & Consent
- Centralize consent prompts (e.g., “Enable account memory?”) in `packages/toolkit/privacy`.
- Log whenever local memory is escalated to account-wide sync; store an audit record in Supabase for support/debug.
- Provide a shared “Clear memory” action that wipes local storage/AsyncStorage and remote entries via Supabase RPC.

Add these considerations to the acceptance checklist when we implement the mobile app. Keeping auth, profile, and memory in shared packages avoids inconsistent behavior between platforms.

---

## 9. Supabase Schema Tasks (Web + App Parity)

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

## 10. Data & API Client Unification

- **Supabase types**: run `pnpm supabase gen types typescript --schema public > packages/toolkit/src/generated/supabase.ts` at the root and publish via `@questit/toolkit/types`.
- **API surface**: create `packages/toolkit/api` that wraps Supabase client calls with error normalization, retries, and telemetry. Consumers import `@questit/toolkit/api/templates`, `@questit/toolkit/api/profile`, etc.
- **Env-aware clients**: expose a single `createQuestitClient({ appEnv })` helper that selects `dev`, `staging`, or `prod` URLs/keys using `APP_ENV`.
- **RLS helpers**: keep per-table policies mirrored in client utilities (e.g., `ensureUserCanWriteTemplate(userId, templateId)`) so both apps respect backend constraints.
- **Offline sync**: standardize queue helpers (`queueProfileUpdate`, `syncProfileLocally`) within toolkit so mobile offline flows match the web’s optimistic updates.
- **Versioning**: treat the API package like any other workspace dependency (`workspace:*`) so apps update in lockstep with schema migrations.

---

## 11. Managing Feature Parity Between Web & App

### 11.1 Shared Feature Flags
- Introduce a `features` table or use Remote Config (e.g., Supabase `kv`, LaunchDarkly) to gate new functionality.
- Expose a helper in `packages/toolkit/flags` so both clients can fetch flags once and cache locally.
- Example flag categories: `template-search-v2`, `account-memory-beta`, `ai-filters-enabled`.

### 11.2 Capability Matrix
- Maintain a matrix in `docs/feature-parity.md` listing each major feature and its availability state:
  - Template browsing (web ✅, mobile beta 🚧)
  - Take-it-for-a-spin preview
  - Local memory inspector
  - Publish/share flows
- Use this matrix to plan sprints and avoid regressions when adding mobile-specific experiences.

### 11.3 Shared Release Notes & Telemetry
- Aggregate analytics/events from both apps into the same Supabase/PostHog pipelines.
- Include `platform` metadata (`web`, `mobile`) on every AI usage event, template apply, publish action, etc.
- Build dashboards that compare usage to spot parity issues early (e.g., mobile “Use template” crash).

### 11.4 Component & Hook Reuse
- Whenever possible, implement features inside shared packages:
  - Search logic (`useTemplateLibrary`, filter utils) in `packages/toolkit`.
  - UI primitives (cards, badges, toasts) in `@questit/ui` with platform-specific render adapters.
  - Memory inspector view logic extracted so both apps can render identical data differently (grid vs. native list).

### 11.5 QA & Rollout
- Define parallel QA checklists for each feature flag. Example:
  1. Launch on web with flag → gather feedback.
  2. Port UI logic to mobile (using shared toolkit) → enable for beta testers.
  3. Once metrics align, promote the flag to “all platforms”.

Keeping features behind flags + a parity matrix ensures we don’t block the mobile build on every web change, but also avoids long-term divergence.

---

## 12. Testing Strategy

- **Unit tests**  
  - `packages/*`: Vitest/Jest with jsdom for web-specific utilities and `@testing-library/react-native` for native components.  
  - `apps/web`: React Testing Library for hooks/components, plus snapshot coverage for template previews.  
  - `apps/mobile`: React Native Testing Library + Jest mocks for Expo modules.
- **Integration/E2E**  
  - Web: Playwright smoke tests for template browse/apply flows, memory sync, and auth.  
  - Mobile: Detox (Android/iOS) or Maestro flows for onboarding, template execution, and offline memory.  
  - Workers: Miniflare-based tests for HTTP handlers + contract tests for external APIs.
- **Shared fixtures**: maintain template bundles + schema fixtures in `packages/toolkit/fixtures` so both apps and workers validate the same scenarios.
- **Template runtime**: add automated tests verifying `buildTemplateMemoryBootstrap` handshake, storage drivers, and WebView/native renderer parity.
- **CI hooks**: run fast unit suites on PR, nightly execute heavier E2E pipelines (Playwright, Detox) and template smoke tests.

---

## 13. Template & Tool Code Transformation for the Mobile App

The current generator produces HTML/CSS/JS bundles optimized for in-browser rendering. To reuse these templates in a native app, we need a transformation layer that can render either:
1. **WebView-based experience** (fastest path)
2. **Native reconstructions** (ideal long-term for better performance/accessibility)

### 13.1 Phase A – WebView Wrapper (MVP)
- **Shared component**: `packages/toolkit/template-runtime/native-webview`.
- Render the generated bundle inside a secure WebView:
  - Inline the HTML/CSS/JS just like we do on the web.
  - Inject the same `buildTemplateMemoryBootstrap` script, swapping the storage adapter for `AsyncStorage`.
  - Communicate via `postMessage` for memory sync, copy-to-clipboard, etc.
- **Pros**: zero additional generator work; parity with existing templates on day one.
- **Cons**: heavier memory usage, limited native look, relies on WebView availability.

### 13.2 Phase B – Structured Template Schema
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

### 13.3 Phase C – Hybrid Rendering
- Allow templates to declare capabilities:
  - `render_mode: "webview"` (default) or `"native"`.
  - Native templates reference `packages/ui` components; web fallback uses HTML.
- Update Supabase rows with `render_mode` metadata so the mobile app knows which renderer to use.

### 13.4 Transformation Pipeline Tasks
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

### 13.5 Tool Publishing
- When publishing/sharing a tool from mobile, include `render_mode` in the metadata so other clients know whether to load an inline WebView or render natively.
- Update the share shell to detect if it’s being opened from a mobile deep link and choose the right renderer.

### 13.6 Testing Strategy
- For WebView templates: automated smoke tests to ensure memory sync works (postMessage handshake).
- For native templates: unit tests around the schema renderer + snapshot tests of core components.
- Include fixture templates (simple todo list, counter, timer) to verify both rendering paths produce equivalent behavior.

By tackling Phase A first we can ship the mobile app with full template coverage quickly, then progressively migrate high-value templates to native components as the schema stabilizes.

Document progress in this file as each phase completes. This keeps everyone aligned on the monorepo adoption timeline and ensures future apps follow the same structure.

---

## 14. Dependency Policy & Updates

- **Version pinning**: rely on `pnpm-lock.yaml` plus explicit semver ranges (no `*` or `latest`). Update Node/Expo versions via periodic “infra bump” PRs.
- **Automated updates**: enable Renovate (or Dependabot) with grouping rules (`infra`, `expo`, `react`, `tooling`) so upgrades land incrementally.
- **Compatibility gate**: shared packages must avoid Node built-ins or browser-only globals unless guarded by adapters; enforce with ESLint custom rules.
- **Security checks**: run `pnpm audit --prod` (or `pnpm audit --workspace-root`) in CI and track exceptions in `SECURITY_NOTES.md`.
- **React Native constraints**: add a compatibility allowlist for dependencies that appear in `packages/*`; Metro-incompatible transitive deps must remain app-local.

---

## 15. Code Quality & Ownership

- **Shared configs**: `@questit/config/eslint`, `/prettier`, `/tailwind`, and `/tsconfig` provide single sources of truth; apps extend them without overrides unless necessary.
- **Pre-commit hooks**: use Husky + lint-staged to run `pnpm lint --filter {staged files}`, `pnpm typecheck --filter packages/toolkit`, and formatting before every commit.
- **Type-check tasks**: require `pnpm turbo run typecheck` locally + in CI to ensure packages emit `.d.ts` successfully.
- **CODEOWNERS**: assign ownership per area (`apps/web`, `apps/mobile`, `packages/ui`, `packages/toolkit`, `workers/*`) so reviews auto-request the right people.
- **Docs enforcement**: failing lint or typecheck should block merges; add a PR template reminding contributors to update docs/tests when touching shared packages.

---

## 16. Release & Versioning

- **Changesets**: adopt Changesets to track package and app changes, even if packages remain private. Each release PR summarizes affected workspaces.
- **App tagging**: tag `apps/web` deployments (e.g., `web-v1.4.0`) and align with Expo EAS channels (`preview`, `beta`, `prod`) for mobile releases.
- **Package versions**: publish private workspace versions (using `npm publish --access restricted` if needed) or rely on git tags plus Changeset metadata.
- **Changelogs**: generate root `CHANGELOG.md` plus per-package/app changelog entries so mobile and web teams can trace regressions quickly.
- **Release automation**: wire CI to run `pnpm changeset version && pnpm changeset publish` on `main` merges once we’re ready for automated rollouts.

---

## 17. Appendix – Config Snippets

- **Root `.eslintrc.cjs`**

```
module.exports = {
  extends: ['@questit/config/eslint'],
  parserOptions: { tsconfigRootDir: __dirname },
  ignorePatterns: ['dist', '.turbo']
};
```

- **Root `turbo.json` (extended)**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalEnv": ["APP_ENV", "SUPABASE_URL", "SUPABASE_ANON_KEY"],
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", "build/**"] },
    "lint": {},
    "test": { "dependsOn": ["^test"], "outputs": [] },
    "typecheck": { "dependsOn": ["^typecheck"], "outputs": [] },
    "dev": { "cache": false }
  }
}
```

- **Base `tsconfig` reference**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "paths": {
      "@questit/ui": ["packages/ui/src"],
      "@questit/toolkit": ["packages/toolkit/src"],
      "@questit/config/*": ["packages/config/*"]
    }
  }
}
```

- **Cloudflare Pages workspace-aware build**

```yaml
name: web-deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: corepack enable pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run build --filter apps/web
      - run: npx wrangler pages deploy apps/web/dist
```

- **GitHub Actions matrix snippet for Expo EAS**

```yaml
  mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: corepack enable pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run build --filter packages/toolkit
      - run: npx eas build --profile preview --platform all --non-interactive
```

- **Reminder**: do not move `/web` into `apps/web` until root workspace tooling, CI stubs, and environment scaffolding above are in place.
