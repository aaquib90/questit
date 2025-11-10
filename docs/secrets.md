# Secrets & Environment Configuration

Configure the following:

## Cloudflare Workers (Wrangler)
Set via `wrangler secret put` (staging/prod as needed):

- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `GITHUB_TOKEN` (optional)
- `CLOUDFLARE_API_TOKEN` (GitHub Actions uses repo secret)
- `CLOUDFLARE_ACCOUNT_ID` (GitHub Actions uses repo secret)
- `SENTRY_DSN`
- `POSTHOG_API_KEY`
- `POSTHOG_HOST` (e.g. https://app.posthog.com)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE`

KV namespaces/bindings:
- Create KV for rate limit; set `RATELIMIT_KV_ID` in wrangler vars.

## GitHub Actions Secrets
- `CF_API_TOKEN`
- `CF_ACCOUNT_ID`
- `RATELIMIT_KV_ID` (if templating)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE`
- `SUPABASE_DB_URL` (for migrations via psql)

## Supabase
- Apply migrations under `supabase/migrations/`.
- RLS policies are scaffolded; tighten when auth is added.
