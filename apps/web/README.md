# Questit Web Workbench (Vite + React)

Questit’s web app provides the in-browser workbench to generate, iterate, save and publish micro-tools. It also hosts the Tool Viewer route (`/tools/:slug`) for published tools.

## Environment

Create `.env` with:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Without these, auth and “My Tools” will be disabled gracefully.

## Scripts

- Install: `pnpm install` (run from the repo root)
- Dev: `pnpm dev:web` *(or `pnpm --filter web dev`)*
- Build: `pnpm --filter web build`

## Routes

- `/` – Workbench (generate → iterate → save → publish)
- `/tools/:slug` – Tool Viewer (public/private/passphrase)
- `/templates/:id` – Template preview deeplink

Cloudflare Pages SPA routing (recommended):

Add a `_routes.json` or framework config to route all paths to `index.html`, or set the fallback pattern:

```
/*    /index.html   200
```

This is required so `/tools/*` is handled client-side.

## Troubleshooting

- Blank “My Tools” panel: verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- 403 Private Viewer: sign in, then retry; passphrase-gated tools require a passphrase to unlock.
- Model errors: the AI proxy may be rate limited; switch the model or retry later.
