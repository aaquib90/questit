# Dynamic Tool Roadmap

This document captures the near-term browser-first enhancements we want to pursue for generated Questit tools and the follow-on ideas for deeper platform extensibility. Use it as a living plan when prioritising implementation work.

## Browser-First Enhancements

- **Richer client runtime**
  - Deliver a lightweight `questit-browser-kit` helper (event bus, `safeFetch`, local/session storage wrappers, retry utilities) that the generator can import automatically.
  - Extend prompt templates and adapter guidance so generated code scaffolds stateful behaviours (timers, async flows, error surfacing) without build tooling.
- **Browser-only execution mandate**
  - Keep all generated experiences strictly client-side until dedicated worker patterns are ready; leverage WebAssembly/browser libraries (e.g. pdf.js) for heavier tasks.
  - Update internal prompts and adapters to highlight the browser constraint and surface graceful fallbacks when an operation cannot be performed locally.
- **Expanded browser capabilities**
  - Publish an allowlist of browser APIs (Clipboard, Web Speech, Geolocation, Web Workers) and teach the static scan to permit deliberate usage while flagging unsafe patterns.
  - Update `renderTool` to expose optional hooks (debug toggles, data refresh, state reset) and surface them through `window.questit.runtime`.
- **Security and performance guardrails**
  - Tighten static scan feedback to cover new dynamic primitives, while preserving the hard ban on dynamic code execution.
  - Emit lightweight telemetry from dynamic helpers (latency, failure counts) into the existing debug panel so issues remain visible in-browser.
- **Validation & docs**
  - Enhance `public/test.html` to demonstrate the helper APIs and add regression checks for dynamic flows (e.g., polling, localStore sync).
  - Document recommended patterns so prompt writers can steer generation toward consistent, debuggable behaviours.

## Future Expansion Tracks

- **Worker-backed capabilities**
  - Template a companion Cloudflare Worker per published tool for secret-aware logic, queueing, or pressure-tested fetches.
  - Adjust the publish flow to deploy the UI worker plus its API sidecar, with guardrails for KV, R2, or Durable Object access.
- **Supabase and data integrations**
  - Explore direct Supabase usage via RLS-safe anon keys and, where needed, proxy middleware that handles complex queries or rate limiting.
- **Realtime collaboration**
  - Prototype Durable Object or WebSocket-driven shared state so multiple users can view or edit tool output simultaneously.
- **Marketplace & governance**
  - Let tools describe required capabilities in a manifest that publish-time validation can inspect (storage, external calls, auth scopes).
  - Layer in SLO dashboards, anomaly detection, and automated throttling to manage abuse as dynamic features expand.

Keep this roadmap updated as features ship or priorities shift; it will act as the reference point for both the AI prompt tuning and engineering execution.
