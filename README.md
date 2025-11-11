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
- Signed-in users can authenticate via Supabase magic link and optionally persist generated tools to their Supabase project.
- Saved tools appear in a dedicated **My Tools** view where users can reload a bundle into the workbench or publish a shareable Worker URL.
- Generated tools can now be iterated via follow-up prompts inside the workbench; the UI sends the current HTML/CSS/JS bundle back to the proxy so updates stay contextual.
- Generated tools are scoped to **browser-only execution** for now; prompts and adapters enforce client-friendly libraries (e.g., pdf.js) and surface graceful fallbacks when a task needs heavier compute.
- The workbench now offers **model selection** between OpenAI GPT-4o mini and Google Gemini 2.5 Flash (with a legacy 1.5 option), with automatic routing through the edge proxy.
- Shared tools now render through a **versioned share shell bundle** (`/share-shell/v1/`) so layout/auth fixes cascade across old and new links, and published URLs use the canonical `/tools/<slug>/` path instead of per-subdomain workers.
- The legacy harness at `public/test.html` is available for quick local testing (`python3 -m http.server 8000` → `http://localhost:8000/public/test.html`).
- Cloudflare Pages hosts the simplified React workbench (`web/`), while the existing Workers (AI proxy, GitHub proxy, package, publish, self-test, dispatch) remain deployed for staging and production.
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
- Client-side shell (`web/public/share-shell/v1`) applies theming, renders metadata, injects the tool code, and handles remix/auth headers.  
- Set `SHARE_SHELL_BASE_URL` on the publish worker (`questit-publish-prod` / `questit-publish-staging`) to override the asset origin per environment.  
- Existing share slugs can be rewritten in-place by calling `POST /api/tools/publish` with the original `share_slug`; see `docs/share-shell-migration.md` for the step-by-step backfill.

## API Endpoints

All endpoints are available at `https://questit.cc/api/*`:

- `POST /api/ai/proxy` - AI model proxy (keys server-side)
- `GET /api/github/*` - GitHub file proxy with auth
- `POST /api/package` - Generate downloadable HTML package
- `POST /api/tools/publish` - Publish tool as User Worker
- `POST /api/selftest/report` - Report self-test results to Supabase

## Development

### Prerequisites

- Node.js 18+
- Cloudflare account with Workers for Platforms enabled
- Supabase project
- Wrangler CLI: `npm i -g wrangler`

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
   # web/.env (Vite)
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

## Project Structure

```
questit/
├── src/
│   ├── ai/              # AI integration (intent parsing, repo finding, code adaptation)
│   ├── core/             # Core logic (analysis, assembly, publishing)
│   ├── delivery/         # Delivery methods (render, embed, download)
│   ├── storage/          # Storage utilities (localStorage, Supabase)
│   ├── utils/            # Helper functions (errors, IDs, etc.)
│   └── index.js          # Main Questit class
├── workers/
│   ├── dispatch/         # Dynamic dispatch Worker (WfP)
│   └── api/              # API Workers (AI, GitHub, package, publish, selftest)
├── supabase/
│   └── migrations/       # Database migrations
└── docs/                 # Documentation
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
