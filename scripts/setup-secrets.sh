#!/usr/bin/env bash
set -euo pipefail

ENV=${1:-staging}

echo "Setting Wrangler secrets for $ENV..."

wrangler secret put OPENAI_API_KEY --env $ENV
wrangler secret put GEMINI_API_KEY --env $ENV
wrangler secret put GITHUB_TOKEN --env $ENV
wrangler secret put SENTRY_DSN --env $ENV
wrangler secret put POSTHOG_API_KEY --env $ENV
wrangler secret put POSTHOG_HOST --env $ENV
wrangler secret put SUPABASE_URL --env $ENV
wrangler secret put SUPABASE_SERVICE_ROLE --env $ENV

echo "Done. Also set CF_API_TOKEN and CF_ACCOUNT_ID in GitHub repo secrets."
