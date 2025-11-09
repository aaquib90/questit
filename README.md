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
- Generated tools can now be iterated via follow-up prompts inside the workbench; the UI sends the current HTML/CSS/JS bundle back to the proxy so updates stay contextual.
- The legacy harness at `public/test.html` is available for quick local testing (`python3 -m http.server 8000` → `http://localhost:8000/public/test.html`).
- Cloudflare Pages hosts the simplified React workbench (`web/`), while the existing Workers (AI proxy, GitHub proxy, package, publish, self-test, dispatch) remain deployed for staging and production.
- Publish/self-test flows still rely on the Worker APIs, but the UI currently focuses on generation + preview. Additional guardrails (repo selection, auto-publish) will be reintroduced iteratively.

## Quick Start

```javascript
import Questit from './src/index.js';

// Initialize with default endpoints (questit.cc)
const questit = new Questit();

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
- **Rate Limiting**: KV-backed rate limiting on dispatch worker

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

## License

See LICENSE file for details.
