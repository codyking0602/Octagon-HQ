# Octagon HQ

The V2 repository for The HQ: UFC and Football rankings, games, picks, intelligence, and community.

## Continue this project

Before starting work in a new conversation, read the documents that own the scope you are changing:

- [`docs/HANDOFF.md`](docs/HANDOFF.md) — current production architecture, deployment ownership, live product state, and next safe action.
- [`docs/the-hq-universal-app-roadmap.md`](docs/the-hq-universal-app-roadmap.md) — canonical roadmap for the universal shell, Home, sport switching, branding, navigation, profile, notifications, onboarding, and sport theming.
- [`docs/the-hq-games-roadmap.md`](docs/the-hq-games-roadmap.md) — sole canonical roadmap for UFC + Football Play/Games, Today's Challenge, game-source ownership, 20 Questions, Who Am I, Auction, and Draft Room.
- [`docs/product-blueprint.md`](docs/product-blueprint.md) — stable product principles and architecture ownership rules.
- [`docs/RANKINGS-MIGRATION.md`](docs/RANKINGS-MIGRATION.md) and [`docs/rankings-parity-contract.md`](docs/rankings-parity-contract.md) — ranking migration/parity contracts.
- [`docs/octagon-verdict-export.md`](docs/octagon-verdict-export.md) — canonical Octagon Verdict export ownership.

Do not revive superseded roadmap files or treat historical implementation docs as current product direction. Resolve current `main` before every branch.

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

GitHub Actions is the only production deployment owner.

- Frontend: `.github/workflows/deploy-cloudflare.yml`
- Backend: `.github/workflows/deploy-supabase.yml`

Cloudflare Workers is the production frontend/rich-preview host. Never call a change live until the exact production deployment marker matches the intended commit.