# Questit

Questit is a Cloudflare-first platform for generating lightweight micro-tools from natural language prompts. It leverages Workers for Platforms (WfP) to execute user tools as isolated User Workers, with AI-powered code adaptation from open-source repositories.

## Architecture

- **Runtime**: Cloudflare Workers for Platforms (WfP)
  - Dynamic dispatch Worker routes subdomains to User Workers
  - Dispatch namespaces: staging and production
- **Edge APIs**: AI proxy, GitHub proxy, package/download, publish, self-test reporting
- **Storage**: Supabase Postgres with RLS for tools, instances, and test results
- **Observability**: Sentry (browser/edge) and PostHog analytics

## Current Status (November 2025)

- The in-browser workbench now sends prompts straight to the AI proxy and renders the returned HTML/CSS/JS inside a sandboxed iframe. GitHub repo adaptation and Code Interpreter auto-repair are temporarily disabled.
- The workbench UI now runs on shadcn/ui (Tailwind) with dynamic base-color selection (emerald, sky, violet, amber, rose, cyan, indigo, lime, slate) and light/dark/system mode switching so the preview can match the user’s preferred theme.
- Signed-in users now authenticate via Supabase email + password (with password reset support) and can persist generated tools to their Supabase project.
- Saved tools appear in a dedicated **My Tools** view where users can reload a bundle into the workbench or publish a shareable Worker URL.
- Generated tools can now be iterated via follow-up prompts inside the workbench; the UI sends the current HTML/CSS/JS bundle back to the proxy so updates stay contextual.
- Generated tools are scoped to **browser-only execution** for now; prompts and adapters enforce client-friendly libraries (e.g., pdf.js) and surface graceful fallbacks when a task needs heavier compute.
- The workbench now offers **model selection** between OpenAI GPT-4o mini and Google Gemini 2.5 Flash (with a legacy 1.5 option), with automatic routing through the edge proxy.
- Shared tools now render through a **versioned share shell bundle** (`/share-shell/v1/`) so layout/auth fixes cascade across old and new links, and published URLs use the canonical `/tools/<slug>/` path instead of per-subdomain workers.
- The legacy harness at `public/test.html` is available for quick local testing (`python3 -m http.server 8000` → `http://localhost:8000/public/test.html`).
- Cloudflare Pages hosts the simplified React workbench (`apps/web/`), while the existing Workers (AI proxy, GitHub proxy, package, publish, self-test, dispatch) remain deployed for staging and production.
- Publish/self-test flows still rely on the Worker APIs, but the UI currently focuses on generation + preview. Additional guardrails (repo selection, auto-publish) will be reintroduced iteratively.

## Quick Start

```javascript
import Questit from './src/index.js';

// Initialize with default endpoints (questit.cc)
const questit = new Questit({
  endpoint: 'https://questit.cc/api/ai/proxy',
  // Optional: override provider/model (defaults to OpenAI GPT-4o mini)
  // provider: 'gemini',
  // model: 'gemini-2.5-flash'
});

// Process a user prompt
const toolContainer = await questit.process(
  "Create a simple calculator",
  {}, // context
  'render' // delivery method: 'render', 'embed', or 'download'
);

// Tool is rendered in the container
document.body.appendChild(toolContainer);

// Publish tool as User Worker (accessible via subdomain)
const publishResult = await publishTool(questit.currentTool);
// Returns: { name: 'tool-xyz', namespace: '...' }
// Accessible at: https://tool-xyz.questit.cc/
```

## Shared Tool Delivery

- Publish worker now emits a minimal HTML wrapper that loads the versioned bundle at `https://questit.cc/share-shell/v1/share.{css,js}` and embeds the tool payload as JSON.  
- Client-side shell (`apps/web/public/share-shell/v1`) applies theming, renders metadata, injects the tool code, and handles remix/auth headers.  
- Set `SHARE_SHELL_BASE_URL` on the publish worker (`questit-publish-prod` / `questit-publish-staging`) to override the asset origin per environment.  
- Existing share slugs can be rewritten in-place by calling `POST /api/tools/publish` with the original `share_slug`; see `docs/share-shell-migration.md` for the step-by-step backfill.

## API Endpoints

All endpoints are available at `https://questit.cc/api/*`:

- `POST /api/ai/proxy` - AI model proxy (keys server-side)
- `GET /api/github/*` - GitHub file proxy with auth
- `POST /api/package` - Generate downloadable HTML package
- `POST /api/tools/publish` - Publish tool as User Worker
- `POST /api/selftest/report` - Report self-test results to Supabase

## Workspace Tooling

Questit now runs as a pnpm + Turborepo workspace so the web, mobile, workers, and shared packages can evolve together.

- **Package manager**: `pnpm@9` via `corepack enable pnpm`
- **Orchestrator**: `turbo run <task>` powers cached `build`, `lint`, `test`, and `typecheck` pipelines
- **Workspaces**: Apps live under `apps/*`, shared code under `packages/*`, and Workers continue under `workers/*`

```bash
corepack enable pnpm            # ensures pnpm@9 is available
pnpm install                    # installs every workspace dependency
```

Common scripts:

```bash
pnpm dev:web                    # run Vite workbench
pnpm dev:mobile                 # (after bootstrap) run Expo dev server
pnpm lint                       # repo-wide lint via Turbo
pnpm test                       # runs package/app unit suites
pnpm typecheck                  # shared tsconfig checks
pnpm turbo run build --filter apps/web  # CI-equivalent web build
```

## Development

### Prerequisites

- Node.js 20+
- pnpm 9 (`corepack enable pnpm`)
- Cloudflare account with Workers for Platforms enabled
- Supabase project
- Wrangler CLI: `npm i -g wrangler`

### Workspace Setup

```bash
corepack enable pnpm
pnpm install
```

With dependencies installed you can start the Vite workbench via `pnpm dev:web` or run individual workspace scripts using `pnpm --filter <package> <command>`.

### Environment Setup

1. **Cloudflare Workers**:
   ```bash
   # Set secrets for staging
   wrangler secret put OPENAI_API_KEY --env staging
   wrangler secret put GEMINI_API_KEY --env staging
   wrangler secret put GITHUB_TOKEN --env staging
   wrangler secret put SUPABASE_URL --env staging
   wrangler secret put SUPABASE_SERVICE_ROLE --env staging
   # ... (see docs/secrets.md for full list)
   ```

2. **Supabase Migrations**:
   ```bash
   # Apply migrations
   psql $SUPABASE_DB_URL -f supabase/migrations/20251105_init.sql
   psql $SUPABASE_DB_URL -f supabase/migrations/20251105_rls.sql
   psql $SUPABASE_DB_URL -f supabase/migrations/20251109_user_tools.sql
   ```

3. **Deploy Workers**:
   ```bash
   # Deploy dispatch worker
   wrangler deploy --env staging
   wrangler deploy --env production

   # Deploy API workers
   cd workers/api/ai && wrangler deploy --env staging
   # ... repeat for other API workers
   ```

4. **Configure Web Workbench**:
   ```bash
   # apps/web/.env (Vite)
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   # optional: enables the Publish button and dialog
   VITE_PUBLISH_API_BASE=https://questit.cc/api
   ```

### Deploying the Web App on Cloudflare Pages

For the monorepo (`apps/web`), set these in Pages → Settings → Build & Deploy:

- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm --filter web build`
- Output directory: `apps/web/dist`

Environment variables (Production and Preview):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_PUBLISH_API_BASE` (optional, enables publish dialog + link copy)

Trigger a redeploy after saving settings.

### My Tools: Private Run vs Publish

- Private Run: `GET /my-tools/:id/play` renders your saved tool while signed in (no public link).
- Publish: open `/build?tool=<id>&publish=1` to choose visibility and generate a public viewer at `/tools/<slug>`.

Supabase schema additions used by the UI:

```sql
alter table public.user_tools
  add column if not exists share_slug text,
  add column if not exists visibility text default 'draft';

create unique index if not exists user_tools_share_slug_idx
  on public.user_tools (share_slug)
  where share_slug is not null;
```

### Mobile (Expo) Preview

- The Expo client lives in `apps/mobile`. Run it with `pnpm dev:mobile` (or `pnpm --filter mobile dev`) after installing dependencies.
- `metro.config.js` and `babel.config.js` are pre-wired to resolve local packages (`@questit/ui`, `@questit/toolkit`) through pnpm workspaces. Keep Metro running from the repo root so watch folders stay valid.
- Copy `apps/mobile/.env.example` to `apps/mobile/.env` and fill in `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and optional `TEMPLATE_CDN_URL` before launching Metro.
- Expo reads env values via `app.config.js` (`APP_ENV`, `SUPABASE_URL`, etc.), so restart `pnpm dev:mobile` after editing `.env`.
- For iOS/Android simulators, install the Expo Go app or run `expo run:ios` / `expo run:android` once native builds are needed.

## Project Structure

```
questit/
├── apps/
│   ├── web/              # Vite workbench (shadcn UI)
│   └── mobile/           # Expo/React Native app (to be bootstrapped)
├── packages/
│   ├── ui/               # Cross-platform UI primitives (React/React Native entrypoints)
│   ├── toolkit/          # Shared clients (Supabase, template runtime, memory adapters)
│   └── config/           # tsconfig/eslint/tailwind presets + repo scripts
├── src/
│   ├── ai/               # Legacy Questit pipeline logic
│   ├── core/
│   ├── delivery/
│   ├── storage/
│   ├── utils/
│   └── index.js
├── workers/              # Cloudflare Workers (dispatch + API workers)
├── supabase/             # Database migrations + types
├── docs/                 # Documentation + planning
└── turbo.json / pnpm-workspace.yaml / .npmrc
```

## Features

- **Scope Gating**: Pre-validates requests against size/complexity limits
- **Static Security Scan**: Blocks dangerous patterns (eval, new Function, etc.)
- **Self-Testing**: Auto-runs self-checks and reports results
- **Error Handling**: Unified error system with Sentry integration
- **Interactive Iteration**: Collects update instructions and regenerates HTML/CSS/JS with full context for the current session
- **Shadcn Workbench**: Tailwind + shadcn/ui components with selectable base themes powering the in-browser tool builder
- **Supabase Sync**: Optional login flow that stores generated tools in Supabase for logged-in users
- **My Tools Dashboard**: Browse saved bundles, reload them into the workbench, or publish a Worker without leaving the app
- **Shareable Edge Shell**: Published Workers render inside a Questit-branded layout that mirrors the saved theme and color-mode preference
- **Tool Memory (Beta)**: Device-scoped storage helpers (`window.questit.kit.memory`) let generated tools remember user inputs, with viewer-side controls to review and clear stored data
- **Browser Runtime Kit**: `window.questit.kit` exposes an event bus, `safeFetch`, persistent storage helpers, and shadcn-aligned UI templates so generated tools can stay dynamic without extra build tooling
- **Questit UI Classes**: Generated HTML can reuse the bundled `questit-ui-*` classes/snippets to match the workbench styling out of the box
- **Model Selection**: Edge proxy drives OpenAI and Google Gemini models; the workbench UI exposes a simple switcher while keeping API keys server-side
- **Remixable Share Links**: Published Workers surface safe metadata, a remix link, and keep the original prompt private
- **Rate Limiting**: KV-backed rate limiting on dispatch worker

## Recent Enhancements (Q4 2025)

- **Workbench Iteration Flow** – Users can send follow-up instructions; responses are re-rendered in the preview with history tracking.
- **shadcn/ui Redesign** – The interface now uses shadcn components, Tailwind utility layers, and an emerald-inspired palette by default.
- **Theme Picker & Color Modes** – Added support for multiple shadcn base themes (emerald, sky, violet, amber, rose, cyan, indigo, lime, slate) plus light/dark/system toggles that affect both the frame and generated output.
- **Supabase Auth + Persistence** – Magic-link login lets users opt-in to saving generated bundles to the `user_tools` table (requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` during build/deploy).
- **My Tools + Publish Flow** – Signed-in users can manage Supabase-backed tools, load them into the workbench, and publish Cloudflare Worker links in one place.
- **Shadcn Wrapper for User Workers** – Published tools inherit the Questit theme tokens and respect saved light/dark/system preferences.
- **Production Safeguards** – The Supabase client now degrades gracefully when credentials are absent, preventing blank screens in non-configured environments.
- **Browser Runtime & UI Kit** – Introduced a shared helper layer (`window.questit.kit` / `window.questit.runtime`) plus shadcn-themed HTML snippets so generated tools can wire up dynamic behaviour and consistent visuals.
- **Browser-First Guidance** – Updated prompts and adapters to prefer browser-compatible libraries, ensuring all generated experiences run locally until the worker-backed roadmap is ready.
- **Multi-Model Support** – Questit’s AI proxy can now call OpenAI GPT-4o mini and Google Gemini 2.5 Flash (plus a legacy 1.5 option); the workbench exposes a model picker and `GEMINI_API_KEY` enables Gemini routing.
- **Share + Remix UX** – Published links now show safe metadata, a Questit shell, and a one-click remix button that keeps prompts private while duplicating code for new users.
- **Passphrase & Memory Enhancements** – Share-shell now supports passphrase unlocks, exposes a device-session memory bridge, and the Tool Viewer shows “Your Data” with clear/reset controls.

## Limits

- Bundle: ≤ 350 KB, ≤ 6 files, ≤ 2,000 LoC
- Runtime: CPU ≤ 50ms avg, Memory ≤ 128MB, RPS soft 10/burst 30
- Network: Default deny, allowlist via proxy only
- TTL: 90 days (ephemeral), renewable

## Documentation

- [Infrastructure Overview](docs/infra-overview.md)
- [Security Model](docs/security.md)
- [Limits & Quotas](docs/limits.md)
- [Archetypes & Self-Test Specs](docs/archetypes.md)
- [Secrets Configuration](docs/secrets.md)
- [Browser Runtime Helpers](docs/browser-runtime.md)
- [Dynamic Tool Roadmap](docs/dynamic-tool-roadmap.md)

## License

See LICENSE file for details.
