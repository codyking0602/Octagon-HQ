# Octagon HQ

The clean V2 rebuild of Octagon HQ: UFC rankings, games, picks, and community.

## Local development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run typecheck
npm test
npm run build
```

## Deployment

Cloudflare Pages configuration:
- Build command: `npm run build`
- Output directory: `dist`
- Node version: read from `.nvmrc`

The current V1 app remains live separately during migration.
