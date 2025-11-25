# Public Docs on Cloudflare Pages

- Serve the `docs/` directory as static content (can evolve to Docusaurus later).
- Recommended `_headers` CSP for static site:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'
```

## Building the web app (monorepo) on Cloudflare Pages

When using the new monorepo layout, the web app lives in `apps/web`. Configure Pages → Settings → Build & Deploy:

- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm --filter web build`
- Output directory: `apps/web/dist`

Environment variables (Production + Preview):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_PUBLISH_API_BASE` (optional; enables the “Publish” dialog and public link actions)

Trigger a redeploy after saving settings or push to the connected Git branch.

## Notes

- The old `web/` path has been migrated to `apps/web/`. If auto-deploys still reference `web/`, update the build settings above.
- Publishing relies on the API base. By default we use `https://questit.cc/api`—override with `VITE_PUBLISH_API_BASE` if needed (e.g., staging).

