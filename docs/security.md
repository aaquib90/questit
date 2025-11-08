# Security

- Isolation: Workers for Platforms (user workers in dispatch namespaces).
- Client containment: sandboxed iframes + strict CSP + DOM sanitization.
- Static scan: block eval/new Function; warn on innerHTML/document.write/window.open.
- License: attribution enforced; non-permissive licenses blocked.

References:
- Cloudflare Workers for Platforms: https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/
- How WfP works: https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/how-workers-for-platforms-works/

