# Monitoring & Observability Setup

## Sentry (Error Tracking)

### Browser Setup

1. **Get your Sentry DSN** from https://sentry.io (create project if needed)

2. **Initialize in your app:**
   ```javascript
   import { initSentry } from './src/utils/sentry-init.js';
   
   initSentry('YOUR_SENTRY_DSN', {
     environment: 'production', // or 'staging'
     tracesSampleRate: 0.1 // 10% of transactions
   });
   ```

3. **Or use CDN directly:**
   ```html
   <script src="https://browser.sentry-cdn.com/7.91.0/bundle.min.js"></script>
   <script>
     Sentry.init({ dsn: 'YOUR_SENTRY_DSN' });
   </script>
   ```

### Edge Setup (Already Configured)

Sentry is already wired in `workers/lib/telemetry.js`. Ensure `SENTRY_DSN` secret is set:

```bash
wrangler secret put SENTRY_DSN --env production
```

## PostHog (Analytics)

### Browser Setup

1. **Get your PostHog API key** from https://posthog.com

2. **Initialize:**
   ```javascript
   import posthog from 'posthog-js';
   
   posthog.init('YOUR_POSTHOG_API_KEY', {
     api_host: 'https://us.i.posthog.com'
   });
   ```

3. **Track events:**
   ```javascript
   posthog.capture('tool_created', {
     tool_id: tool.id,
     category: tool.category
   });
   ```

### Edge Setup (Already Configured)

PostHog is already wired in `workers/lib/telemetry.js`. Ensure secrets are set:

```bash
wrangler secret put POSTHOG_API_KEY --env production
wrangler secret put POSTHOG_HOST --env production
```

## Cloudflare Analytics

- **Workers Analytics**: Already enabled in `wrangler.toml` (`[observability] enabled = true`)
- **Dashboard**: View in Cloudflare Dashboard → Workers & Pages → Your Worker → Analytics

## Key Metrics to Monitor

- **Error Rate**: Sentry dashboard
- **Request Volume**: Cloudflare Workers Analytics
- **Tool Creation Funnel**: PostHog events
- **Self-Test Pass Rate**: Query Supabase `tool_selftest_results` table
- **Publish Success Rate**: Monitor `/api/tools/publish` endpoint

## Alerts

Set up alerts for:
- High error rate (>5% of requests)
- API endpoint failures
- Dispatch worker 500 errors
- Supabase connection failures

