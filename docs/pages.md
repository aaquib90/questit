# Public Docs on Cloudflare Pages

- Serve the `docs/` directory as static content (can evolve to Docusaurus later).
- Recommended `_headers` CSP for static site:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'
```

