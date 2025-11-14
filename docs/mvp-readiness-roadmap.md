# Questit MVP Readiness Roadmap

Two capabilities are still blocking a production-ready launch: (1) dedicated end-user pages for published tools and (2) durable memory so tools can retain state. This document captures the shared approach, design intents, and engineering tasks required to deliver both.

---

## 1. Standalone Tool Pages (“Tool Viewer”)

### 1.1 Product Goals
- Each published tool receives a stable URL (`/tools/:slug`) that anyone can open without the workbench.
- Page loads quickly, works on mobile, and highlights the creator (avatar/name) with optional call-to-action buttons (“Duplicate in Questit”, “Report tool”).
- Respect privacy: private tools require the owner to authenticate; optionally allow a passphrase for semi-private sharing.
- Capture lightweight analytics (views, unique visitors) surfaced back to the creator.

### 1.2 Experience & Layout
1. **Hero shell**  
   - Tool name, short summary, creator badge, “Open in Workbench” button.  
   - Status indicator (live, archived).  
   - Optional tags/badges (category, device friendly).
2. **Preview surface**  
   - Iframe running the tool bundle (reuse `buildIframeHTML`).  
   - Loading skeleton, error fallback (“Tool unavailable”).  
   - Responsive container with max width 900px and device frame toggle (phone/desktop).
3. **Tool details sidebar**  
   - Sections: “What it does”, “Last updated”, “Template origin”, “Memory usage indicator”.  
   - Social proof: view count, quick actions (copy link, embed snippet).  
   - Remix CTA that opens the workbench prefilled with the template.
4. **Footer**  
   - Branding, link to Questit homepage, “Create your own tool” CTA.  
   - Legal (Terms, Privacy), and “Report tool” trigger.

### 1.3 Architecture & Data Flow
- **Routes**:  
  - Web app: add React route (`/tools/:slug`) that fetches metadata + bundle.  
  - Worker/Pages: serve static HTML for SEO + fallback to client hydration.
- **Data sources**:  
  - Supabase table `published_tools` with fields: `slug`, `tool_id`, `title`, `summary`, `html`, `css`, `js`, `owner_id`, `visibility`, `created_at`, `updated_at`, `view_count`.  
  - Additional table `tool_views` to log daily counts (optional).
- **Publishing flow**:  
  - When creator presses “Publish share link”:  
    1. Validate tool passes scope and security checks.  
    2. Generate slug (kebab-case + short hash).  
    3. Persist metadata/bundle to `published_tools`.  
    4. Trigger CDN cache purge/invalidation (if using static caching).  
    5. Return share URL + ability to copy.
- **Access control**:  
  - `visibility = 'public' | 'private' | 'passphrase'`.  
  - Private: require Supabase auth and ownership check.  
  - Passphrase: challenge screen that sets encrypted session cookie.  
  - Public: direct access.
- **Analytics**:  
  - Middleware increments `view_count`, optionally logs `tool_views` row.  
  - Present aggregate data in workbench (My Tools list & Tool Viewer sidebar).

### 1.4 Engineering Tasks
1. **Data model**  
   - Create migrations for `published_tools` + `tool_views`.  
   - Write Supabase edge function/SQL policies for read/write security.
2. **API layer**  
   - `GET /api/tools/:slug` → metadata + bundle (public).  
   - `POST /api/tools/:toolId/publish` → create/update published entry.  
   - `POST /api/tools/:slug/views` → analytics (optional, can piggy-back on GET).  
   - `DELETE /api/tools/:slug` → unpublish (owner-only).
3. **Frontend**  
   - Implement `ToolViewer` React route.  
   - Add skeleton/loading + error boundary.  
   - Build sharing controls and embed copy snippet.  
   - Update Workbench publish flow to call new API and surface new options (public/private/passphrase).  
   - Add view analytics to My Tools detail panel.
4. **Deployment**  
   - Configure Cloudflare Pages (or Worker) route for `/tools/*`.  
   - Add caching strategy: HTML cached 5m, bundle assets 1h, purge on publish.  
   - Set up monitoring (status codes, performance).
5. **QA & Accessibility**  
   - Test across device breakpoints, keyboard navigation, and screen readers.  
   - Validate passphrase flow (correct rejection/acceptance).  
   - Ensure iframe sandbox restrictions remain (no top-level navigation).

### 1.5 Open Questions
- Do we need multi-language support on Tool Viewer?  
- Should tools support offline caching or PWA install?  
- Are we exposing API keys or storing generative outputs client-side? (Security review required.)

---

## 2. Tool Memory & Persistence

### 2.1 Product Goals
- Allow generated tools to remember user inputs (e.g., journal entries, checklists) between sessions/devices.
- Provide creators with a simple mental model: toggle memory on, select retention duration, optionally expose “Clear data” button to end users.
- Ensure privacy compliance: ability to export/delete, clear on unpublish, encryption at rest.
- Support both anonymous sessions (local storage or device-scoped) and authenticated accounts (Supabase profiles).

### 2.2 Memory Model
We support three storage scopes:
1. **Ephemeral session** – stored client-side; resets on tab close. (Default for tools without memory.)
2. **Device-scoped** – persisted via encrypted local storage, with optional sync using anonymous ID. (For quick personal tools.)
3. **Cloud profile** – persisted in Supabase `tool_memories` keyed by `tool_id`, `user_id`, `memory_key`.

> MVP focus: implement device-scoped (using local storage + optional sync) and authenticated cloud storage.

### 2.3 Data Schema
- Table `tool_memories`
  - `id` (uuid), `tool_id` (uuid), `user_id` (uuid, nullable), `session_id` (text, nullable).
  - `memory_key` (text), `memory_value` (jsonb), `created_at`, `updated_at`.
  - Index on `(tool_id, user_id, memory_key)` and `(tool_id, session_id)`.
- Optionally, table `memory_events` for logging operations (set/delete) for analytics and debugging.

### 2.4 API & SDK
1. **API endpoints**  
   - `POST /api/tools/:toolId/memory` → set/update memory (requires memory key).  
   - `GET /api/tools/:toolId/memory` → fetch memory for current user/session.  
   - `DELETE /api/tools/:toolId/memory/:key` → remove entry.  
   - `POST /api/tools/:toolId/memory/clear` → wipe all entries (owner-only).
2. **Auth rules**  
   - For device-scoped storage without login: assign `session_id` (UUID) stored in cookie/local storage; include in API request header.  
   - For logged-in creators/users: use Supabase auth to attach `user_id`.  
   - Enforce per-tool quotas (e.g., 1 MB per tool) to avoid abuse.
3. **Client helpers**  
   - Add `useToolMemory(toolId)` hook returning `get`, `set`, `remove`, `reset`.  
   - Expose to generated tool runtime via injected script (makes `QuestitMemory` global).  
   - Provide offline fallback (caches writes and syncs when online).

### 2.5 Workbench UI Changes
- **Composer sidebar**: new “Memory” section with controls:  
  - Toggle “Remember user inputs”.  
  - Options: `No memory`, `Device only`, `Signed-in users`.  
  - Retention dropdown: `Until cleared`, `30 days`, `7 days`.  
  - Display storage quota used.
- **Template metadata**: allow template authors to mark recommended memory configuration.
- **Timeline**: annotate prompts where memory state changed (“Memory cleared”, “Storage updated”).
- **Tool Viewer**: show privacy indicator (“This tool stores information on your device only.”) and “Clear your data” button.

### 2.6 Engineering Tasks
1. **Backend & Infrastructure**
   - Create Supabase tables (`tool_memories`, optional `memory_events`).  
   - Write Row Level Security policies for user/session-based access.  
   - Implement Cloudflare Worker/Edge function that proxies memory requests (for rate limiting and origin filtering).  
   - Set up encryption (Supabase at rest) and environment-safe key management.
2. **Client Runtime**
   - Build memory hook (`useToolMemory`) and wrap generated tool iframe with context provider.  
   - Update iframe builder to inject memory bootstrap script.  
   - Provide CLI/generator snippets explaining how to read/write memory (`QuestitMemory.set('list', items)`).
3. **Workbench Integration**
   - Add memory controls UI in Workbench inspector (or sidebar).  
   - Update publish flow to include memory configuration (persisted in metadata).  
   - Update Save Tool dialog to store memory settings with tool record.
4. **Templates & Migration**
   - Store memory config in new columns (`memory_scope`, `memory_retention_days`).  
   - Write migration script for existing tools (default `memory_scope = 'none'`).  
   - Highlight memory-ready templates in Templates tab.
5. **Testing**
   - Unit tests for API endpoints and RLS policies.  
   - E2E tests using Playwright/Cypress:  
     - Create tool → enable memory → use viewer → verify persistence across reload.  
     - Switch memory scope while data exists (ensure data is handled correctly).  
     - Clear data and confirm removal server/client side.
6. **Security & Compliance**
   - Document data retention and deletion policy.  
   - Implement rate limits per session/user to prevent abuse.  
   - Add “Download my data” endpoint for compliance.

### 2.7 Open Questions
- Do we need cross-tool shared memory (e.g., workspace-level)?  
- For anonymous device scope, do we sync to cloud for multi-device? (Maybe post-MVP.)  
- Should memory writes require explicit user consent (GDPR checkbox) on Tool Viewer?

---

## 3. Supporting Work & Timeline

### 3.1 Phased Implementation
| Phase | Duration | Key Outputs |
|-------|----------|-------------|
| **P1 – Foundations** | 1–1.5 weeks | DB migrations, API endpoints (publish + memory), basic Tool Viewer route scaffold. |
| **P2 – Tool Viewer MVP** | 1 week | Full viewer UI, share flow updates, analytics logging, QA. |
| **P3 – Memory MVP** | 1.5–2 weeks | Memory API hooked into runtime, workbench controls, templates updated. |
| **P4 – Polish & Ops** | 0.5 week | Analytics dashboards, documentation, compliance copy, smoke tests, launch checklist. |

### 3.2 Dependencies & Risks
- Need Supabase project with Row Level Security + function deployment rights.  
- Requires CDN/Worker deploy capability for `/tools/:slug` route.  
- Memory management touches security/privacy—ensure legal review before launch.  
- Consider rate limiting + quota enforcement early to avoid runaway costs.

### 3.3 Success Criteria
- Tool Viewer pages must load <2s on 4G and pass Lighthouse accessibility contrast checks.  
- Creators can publish, unpublish, and see view counts in My Tools.  
- Tools with memory enabled retain entries across reloads; users can clear their data.  
- No 4xx/5xx spikes after launch; analytics confirm engagement.

---

## 4. Follow-Up Documentation
- Update `docs/design-refresh-guide.md` with Tool Viewer layout specs and memory UI references.  
- Produce API docs for `/api/tools/*` endpoints and `QuestitMemory` client.  
- Write onboarding guide for creators about publishing + privacy best practices.  
- Create internal runbook for handling support requests (data deletion, abusive content).

Use this roadmap as the authoritative source when scoping engineering tickets, design deliverables, or QA test plans related to MVP readiness.
