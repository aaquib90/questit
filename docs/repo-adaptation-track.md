# Repo Adaptation + Auto-Repair (Gated Reintroduction)

Goal: restore repository-based code adaptation and interpreter-backed repair while protecting latency, cost, and browser compatibility.

## Guardrails
- Feature flag: `REPO_ADAPTATION_ENABLED=false` (default off).
- Hard limits:
  - Max repo size: 200 files / 1.5 MB text
  - Max file size: 64 KB
  - Max processing time: 8s end-to-end (cancel on timeout)
  - Allowed languages: HTML/CSS/JS/JSON/Markdown
- Security:
  - Static scan before adaptation (no secrets, keys, env files)
  - No server-only APIs in adapted outputs

## Flow
1. Intent detection selects archetype and signals if a repo is needed.
2. Repo finder proposes candidates (GitHub URLs and target files).
3. Fetcher pulls a whitelisted subset (respecting size/file limits).
4. Analyzer builds a minimal semantic map (components, hooks, DOM ops).
5. Adapter converts to standalone HTML/CSS/JS (browser-only).
6. Validator runs a static safety pass; fails closed with actionable error.
7. Optional repair loop (max 2 iterations) to fix parse/lint issues.

## Controls
- New options in the workbench “Advanced”:
  - “Use a template repo (experimental)”
  - “Time limit” (4–8s)
  - “File limit” (50–200)
- Server-side kill-switch via env flag.

## Implementation Tasks
- Add feature flag plumbing to `web/src/generateTool.js` and `workers/api/ai/proxy.js`
- Re-enable `src/ai/repo-finder.js`, `src/core/repo-fetcher.js`, `src/core/code-analyzer.js`, `src/ai/code-adapter.js`
- Add static scan on adapted output (reuse publish scan set)
- Add repair loop with bounded iterations and cost
- Expand E2E to cover repo-based generation with size overflow and fallback


