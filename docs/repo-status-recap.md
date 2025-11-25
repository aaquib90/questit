## Repository Status Recap (November 2025)

### Overview
Questit generates lightweight, browser-executable micro-tools from natural language prompts. The current flow is browser-first: the React workbench sends prompts to an AI proxy, receives a JSON bundle `{ html, css, js }`, and renders it in a sandboxed iframe. Users can iterate with follow-up instructions, optionally save to Supabase, and publish a shareable Cloudflare Worker URL (Workers for Platforms).

### Architecture and Runtime
- **Runtime**: Cloudflare Workers for Platforms (WfP)
  - `workers/dispatch/worker.js` routes subdomains to User Workers (dynamic dispatch).
  - Separate API workers provide proxying, packaging, publishing, and reporting.
- **Web Workbench**: `apps/web/` (Vite + React + shadcn/ui + Tailwind)
  - Prompts go directly to `https://questit.cc/api/ai/proxy`.
  - Preview runs inside an iframe; follow-ups send prior code back for contextual updates.
  - Optional Supabase auth/persistence; “My Tools” management and publish.
- **Storage**: Supabase Postgres with RLS
  - Core tables for tools and telemetry plus `user_tools` for saved bundles.
- **Observability**: Sentry and PostHog hooks (dispatch worker includes telemetry).

Key references:
- Root overview and limits: `README.md`, `docs/*.md`
- Workbench UI: `apps/web/src/App.jsx`, `apps/web/src/generateTool.js`, `apps/web/src/lib/supabaseClient.js`
- AI Proxy: `workers/api/ai/proxy.js`
- GitHub Proxy: `workers/api/github/proxy.js`
- Package: `workers/api/package/worker.js`
- Publish (WfP): `workers/api/tools/publish.js`
- Dispatch: `workers/dispatch/worker.js`
- DB: `supabase/migrations/*.sql`, `supabase/seed/sample_tool_instance.sql`

### Current Capabilities and UI Flow
1. **Prompt → Generate**
   - The UI calls the AI proxy with a strict system prompt to return only `{ html, css, js }`.
   - File: `apps/web/src/generateTool.js` enforces JSON output, sets provider/model, and passes `response_format: json_object`.
2. **Iterate**
   - Follow-up prompts include the previous `{ html, css, js }` to update the tool while preserving structure.
3. **Preview**
   - The bundle is embedded in a sandboxed iframe styled to match shadcn themes and color modes.
4. **Save (optional)**
   - If Supabase is configured and the user is signed in (email + password), the bundle is saved to `public.user_tools`.
   - `apps/web/src/lib/supabaseClient.js` degrades gracefully if env vars are missing, preventing hard failures.
5. **My Tools**
   - Users can view, reload into workbench, and publish saved tools from the “My Tools” section in `apps/web/src/App.jsx`.
6. **Publish**
   - Publishing posts the saved bundle to the `publish` worker, which emits a User Worker script (WfP) with a Questit-branded shell honoring the selected theme and color mode.

### Theming and Modes
- Base themes: emerald, sky, violet, amber, rose, cyan, indigo, lime, slate.
- Color modes: light, dark, system. Published Workers mirror the saved preference.
- Theme tokens and shell CSS are embedded into published Workers so shared links visually match the workbench.

### API Workers
- **AI Proxy** (`workers/api/ai/proxy.js`)
  - Providers: `openai`, `gemini` (google).
  - Expects `system`, `input`, optional `options.response_format`, and model selection.
  - Returns the upstream model’s content directly (JSON string when `json_object` is requested).
  - CORS allows localhost and `questit.cc` origins (including subdomains).
- **GitHub Proxy** (`workers/api/github/proxy.js`)
  - Pass-through to raw GitHub content with optional token.
  - CORS aligned with AI proxy.
- **Package** (`workers/api/package/worker.js`)
  - Packs the `{ html, css, js }` into a single downloadable HTML file.
- **Publish (WfP)** (`workers/api/tools/publish.js`)
  - Builds a full User Worker HTML shell with theme tokens and color mode handling; uploads to a dispatch namespace using Cloudflare API.
  - Returns `{ name, namespace }`; users can visit `https://<name>.questit.cc/`.
- **Self-Test Report** (`workers/api/selftest/report.js`)
  - Accepts `{ instance_id, pass, details }` and inserts into Supabase `tool_selftest_results` via service role.
- **Dispatch** (`workers/dispatch/worker.js`)
  - Parses subdomain, applies KV-backed rate limiting, fetches the corresponding User Worker via dispatch namespace, and proxies the request.

### Database and RLS
- Core schema (`20251105_init.sql`):
  - `public.tool_templates`, `public.tool_instances`, `public.tool_data`
  - `public.scope_gate_decisions`, `public.tool_selftest_results`
- RLS baseline (`20251105_rls.sql`):
  - Enables RLS for the core tables; permissive insert policies set as placeholders (to be tightened).
- User tools (`20251109_user_tools.sql`):
  - `public.user_tools` with `user_id`, prompt, title, theme, color_mode, and the bundle fields.
  - RLS: “Users can manage their own tools” with `auth.uid() = user_id`.
- Seed helper (`supabase/seed/sample_tool_instance.sql`):
  - Inserts a placeholder `tool_instances` row so self-test reporting has a valid foreign key.

### Endpoints (public surface)
- `POST /api/ai/proxy` – AI model proxy (OpenAI, Gemini, Anthropic), server-side keys.
- `GET /api/github/*` – GitHub file proxy.
- `POST /api/package` – Downloadable single-file HTML package.
- `POST /api/tools/publish` – Publish a User Worker (WfP).
- `POST /api/selftest/report` – Report self-test results to Supabase.

### Limits and Safeguards
- From `README.md`: Bundle ≤ 350 KB, ≤ 6 files, ≤ 2,000 LoC; CPU ≤ 50ms avg; Memory ≤ 128MB; soft 10 RPS / burst 30; default-deny networking; TTL 90 days (ephemeral).
- The workbench and prompts enforce browser-only execution. Heavy features should prefer browser-compatible/WASM libraries.
- Static security scans, repo adaptation, and repair flows will be reintroduced progressively.

### Notable Recent Changes
- AI integration:
- `apps/web/src/generateTool.js` adds iteration input construction and strict JSON parsing; defaults per provider (`gpt-4o-mini` or `gemini-2.5-flash`, with legacy Gemini 1.5 available in the UI).
  - `workers/api/ai/proxy.js` implements provider switching with clean pass-through of JSON content and CORS.
  - `src/ai/ai-model.js` remains a thin client wrapper used by core paths.
- Web workbench:
  - `apps/web/src/App.jsx` integrates shadcn UI, theme/color mode pickers, iteration, Supabase auth (email/password), Saved Tools, and publish UI.
  - `apps/web/src/lib/supabaseClient.js` graceful degradation if missing Vite env vars.
- Supabase:
  - New `public.user_tools` table with RLS by user; core tables enabled for RLS with placeholder policies.
  - Latest migration adds `public_summary`, `model_provider`, and `model_name` columns so published/remixed experiences can show safe metadata while keeping prompts private.
- Publishing:
  - `workers/api/tools/publish.js` now emits a full HTML shell reflecting theme & color-mode; uploads to dispatch namespace for shareable links.
- Dispatch & Telemetry:
  - `workers/dispatch/worker.js` enforces rate limiting and reports to Sentry/PostHog.

### Gaps, Risks, and Suggested Next Steps
- **Tighten RLS** on core tables (`tool_instances`, `tool_data`, etc.) by introducing explicit ownership fields and policies keyed to authenticated users/sessions.
- **Reintroduce static security scanning** and guardrails in the generation pipeline for published tools (align with “Static Security Scan” mentioned in README).
- **Repo adaptation and auto-repair**: progressively restore the repo adaptation and interpreter-backed repair loop with clear size/time limits and browser compatibility constraints.
- **AI Proxy hardening**: add structured error codes, stricter `response_format` enforcement, per-origin rate limiting, and audit logging.
- **Publishing UX**: surface Cloudflare API errors with actionable messages; validate theme keys and sanitize content aggressively (already done for `</style>`/`</script>` in the publisher).
- **Observability**: ensure consistent Sentry/PostHog wiring across all API workers, including publish/package.
- **Docs**: keep `README.md` and `docs/` in lockstep with feature flags (what’s enabled vs. staged).

This recap reflects the current code in `apps/web/`, `workers/`, and `supabase/`, aligned with the project’s README and docs. It captures the browser-first generation, iteration, save, and publish flow while outlining security and platform steps to harden for broader use.
