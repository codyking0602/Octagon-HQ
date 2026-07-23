# Octagon HQ

The clean V2 rebuild of Octagon HQ: UFC rankings, games, picks, and community.

## Continue this project

Before starting work in a new conversation, read:

- [`docs/HANDOFF.md`](docs/HANDOFF.md) — exact current status, deployment, temporary dependencies, completed work, next safe action, and a copy-paste new-chat prompt.
- [`docs/product-blueprint.md`](docs/product-blueprint.md) — stable product principles, ownership rules, and migration order.

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

Cloudflare Workers static-assets configuration:
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Static output directory: `dist`
- Node version: read from `.nvmrc`

The current V1 app remains live separately during migration.
