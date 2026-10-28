# Cloudflare deployment

Octagon HQ deploys through Cloudflare Workers static assets.

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Static asset directory: `dist`
- Clean React Router paths are handled by `assets.not_found_handling = "single-page-application"` in `wrangler.jsonc`.
- Do not add a Pages-style `public/_redirects` catch-all; it conflicts with Workers static asset routing.
