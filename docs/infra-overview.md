# Infra Overview (Cloudflare-first)

- Runtime: Cloudflare Workers for Platforms (WfP)
  - Dynamic dispatch Worker
  - Dispatch namespaces: staging/prod
  - User Workers per tool instance
- Edge APIs: AI proxy, GitHub proxy, package, publish, self-test report
- Storage: Supabase (Postgres), optional Storage; RLS on instances/data/decisions/selftests
- Observability: Sentry (browser/edge), PostHog, KV rate limiting
- CI/CD: GitHub Actions for Workers and Pages

See: docs/security.md, docs/limits.md, docs/archetypes.md, docs/pages.md.
