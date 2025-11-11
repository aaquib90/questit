# Share Shell Migration Plan

The publish worker now serves a lightweight HTML wrapper that loads the shared
shell assets from `https://questit.cc/share-shell/v1/`. Existing share URLs still
point at Workers created with the legacy inline layout. Follow the steps below
to migrate older shares and keep the shared assets up to date.

## 1. Deploy the new shell

1. Build and deploy the frontend so `web/public/share-shell/v1` is available on
   `questit.cc`.
2. Deploy the publish worker (staging first, then production) so newly published
   tools emit the external shell markup.

## 2. Backfill existing shares

1. Produce a list of share slugs from Supabase. Each entry should include the
   slug and the stored HTML/CSS/JS payload.
2. For each slug, call the publish worker with the existing payload **and the
   original `share_slug`** so the script is overwritten in place. Example:

   ```bash
   curl -X POST https://questit.cc/api/tools/publish \
     -H 'Content-Type: application/json' \
     -H 'Authorization: Bearer <SERVICE_TOKEN>' \
     -d '{
       "id": "<tool-id>",
       "title": "...",
       "public_summary": "...",
       "theme": "...",
       "color_mode": "...",
       "model_provider": "...",
       "model_name": "...",
       "html": "...",
       "css": "...",
       "js": "...",
       "share_slug": "<existing-slug>"
     }'
   ```

3. Repeat for all environments (staging, production). Verify a random sample of
   migrated URLs to confirm they load the new shell.

## 3. Version management going forward

- When updating the shared design, create a new directory
  `public/share-shell/v<next>/` and bump `SHARE_SHELL_VERSION` in
  `workers/api/tools/publish.js`.
- Re-run the backfill script so existing shares adopt the latest version.
- Monitor the `/metadata` endpoint for a few published tools — it now reports
  `shell_version`, which can be used to audit the rollout.

## 4. Environment configuration

- The publish worker honours the optional environment variable
  `SHARE_SHELL_BASE_URL`. Set it to the fully qualified asset base (for example
  `https://questit.cc/share-shell`) to support custom domains per environment.
