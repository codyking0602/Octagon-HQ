# Octagon HQ V2 — Current Handoff

_Last updated: 2026-07-23_

This is the authoritative cold-start handoff for continuing Octagon HQ V2 in a new ChatGPT/Codex conversation. Read this file before making changes, then inspect the current `main` head because documentation-only commits may follow the last product-behavior commit listed below.

## Repositories and live apps

### V1 — current legacy production app

- Repository: `codyking0602/ufc-goat-rankings`
- Live URL: `https://codyking0602.github.io/ufc-goat-rankings/`
- Status: keep alive during the V2 migration; maintenance-only except for production-breaking behavior, incorrect live Picks data, or security/access issues.
- Do not continue structural cleanup or major feature development in V1.
- V1 is the visual reference, feature specification, canonical data source, and rollback product during migration.

### V2 — clean rebuild

- Repository: `codyking0602/Octagon-HQ`
- Production branch: `main`
- Last product-behavior commit at this handoff: `8db0c27b8344b80bc46cfd81b4d8c8517c8b1e8b` (`Migrate real branding and first rankings slice`). Inspect current `main` before editing because later commits may be documentation-only.
- Last confirmed working Cloudflare URL before the Worker rename: `https://octagon-hq.bcking06.workers.dev`
- `wrangler.jsonc` now names the Worker `app`, so the expected next deployed URL is `https://app.bcking06.workers.dev`; confirm it in Cloudflare before treating it as verified.
- Desired free URL after the manual Cloudflare account-subdomain change: `https://app.octagonhq.workers.dev`

## Why V2 exists

V1 accumulated dozens of ordered global scripts, global CSS override layers, competing startup/identity/routing responsibilities, local-storage fallbacks, and custom service-worker behavior. Small changes repeatedly caused unrelated startup failures. V2 is a parallel production rebuild, not another V1 refactor.

## Locked technology and hosting

- GitHub remains the source-control, PR, CI, and Codex workspace.
- Cloudflare Workers static assets hosts V2 at no cost.
- Supabase remains the intended backend for auth, profiles, Picks, challenges, War Room, realtime data, and notifications.
- Frontend: React + TypeScript + Vite.
- Routing: React Router.
- Server-data caching: TanStack Query.
- Validation: Zod.
- No Next.js.
- No no-code builder.
- No native iOS app during the rebuild.
- No service worker or custom cache/update manager until the browser app is complete and stable.

## Deployment configuration

Cloudflare is connected directly to the V2 GitHub repository.

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Node: `22.12.0` from `.nvmrc`
- Static build output: `dist`
- Clean SPA routes are owned by `wrangler.jsonc` using `not_found_handling: "single-page-application"`.
- Do not restore `public/_redirects`; it conflicted with Workers static-asset routing and caused an infinite-loop deployment failure.

### Manual URL step still pending

Inside Cloudflare, change the account `workers.dev` subdomain from `bcking06` to `octagonhq` only after confirming that the account is not being used for another Worker that should keep the old subdomain. This affects every Worker in that Cloudflare account.

## Non-negotiable architecture rules

- `src/main.tsx`: one application entry.
- `src/app/App.tsx`: one startup/readiness owner.
- `src/app/router.tsx`: one routing owner.
- `src/lib/supabase.ts`: one Supabase client owner.
- Future auth must have exactly one session/identity provider.
- `src/styles/tokens.css`: one semantic design-token source.
- Feature folders own their screens, local state, and focused tests.
- No global script ordering architecture.
- No duplicate initialization or recovery path.
- No consumer feature independently reading canonical auth storage or resolving identity.
- No feature invents its own sharing, notification, button, card, loading, or permission system.
- Build in small vertical slices and validate after every slice.

## Locked product requirements

1. Branded black startup screen with the real Octagon HQ logo and a loading indication; no white flash, UI flicker, or unfinished Home rendering.
2. Fresh launch opens Home, never Picks.
3. Major destinations load independently through route-level code splitting and route-specific loading states.
4. War Room is completely undiscoverable to unauthorized users: no tab, card, disabled CTA, route, onboarding copy, or notification.
5. Authorized War Room users will eventually support real structured `@mentions`, in-app notifications, push notifications, and deep links to the exact conversation/message.
6. After a UFC Picks event is fully scored, a server-owned push notification should open the already-built completed-event results/recap page. It must be idempotent and only send after results and scoring are settled.
7. Play includes a Challenge Center for sent, received, waiting, completed, and unseen-result challenges.
8. Onboarding will be completely redesigned and adaptive for new independent users, Picks invites, War Room invites, incomplete profiles, and V1 migration users.
9. Public copy must say `Octagon HQ`; never show `UFC App`, `GOAT26`, internal group codes, Supabase terminology, or development labels.
10. Sharing is centralized, minimal, native when supported, and uses clean deep links.
11. Home includes a compact `Your HQ` card with exactly:
   - Daily streak
   - Current Picks record
   - Favorite fighter
   - Open challenges
   - One intelligent next action
12. Visual system:
   - True black: canvas, safe areas, header, bottom navigation
   - Charcoal: cards, rows, controls, inputs, conversation surfaces
   - White: primary information
   - Gray: records, dates, instructions, supporting metadata
   - UFC red: primary actions, selected states, progress, restrained emphasis
   - Amber: Underdog Lock and real attention-needed states
   - Green: live, complete, successful, ready
   - Blue: links

## Current V2 implementation status

### Complete and merged

- React/TypeScript/Vite application shell.
- One startup owner and branded loading experience.
- One router with clean routes.
- Route-level lazy loading and skeleton loading state.
- Semantic dark design tokens and reusable shell styling.
- Fixed five-item bottom navigation: Home, Rankings, Play, Picks, Intelligence.
- Home route and `Your HQ` placeholder card.
- War Room absent from navigation and routes.
- Cloudflare Workers deployment with clean SPA refresh routing.
- Temporary developer-facing `V2` badge and `Foundation Active` card removed.
- Existing real Octagon HQ logo now used for static boot, React boot screen, header, favicon, and Apple touch icon.
- First real Rankings slice:
  - Searchable top-10 UFC-only leaderboard.
  - UFC/2K-style OVR presentation.
  - Direct fighter routes at `/fighters/:slug`.
  - Category breakdown.
  - Division-strength context.
  - Key judgment calls.
  - `Why ranked here`.
  - Required `Why not ranked higher?`.
  - Fighter-photo fallback behavior.
- Home previews the top three fighters.

### First migrated ranking batch

1. Jon Jones
2. Georges St-Pierre
3. Demetrious Johnson
4. Anderson Silva
5. Islam Makhachev
6. Khabib Nurmagomedov
7. Alexander Volkanovski
8. Randy Couture
9. Max Holloway
10. Kamaru Usman

### Still placeholder or intentionally absent

- Play feature content.
- Picks feature content.
- Intelligence feature content.
- Authentication/session provider.
- Supabase environment connection.
- User profile persistence.
- Real Your HQ values.
- Onboarding.
- Challenge Center.
- War Room, mentions, and notifications.
- Standardized sharing service.
- Push notifications.
- PWA installability/service worker.

## Temporary V1 asset dependency

V2 is not yet asset-independent.

`src/config/brand.ts` currently points to:

- Logo: `https://codyking0602.github.io/ufc-goat-rankings/assets/app-icon.png`
- Fighter assets: `https://codyking0602.github.io/ufc-goat-rankings/assets/fighters`

This was used to migrate the real visual identity without blocking the first rankings slice. Before V1 can ever be retired, copy the actual logo and fighter images into V2 and switch `brand.ts` to local V2 paths. Preserve real fighter photos; crop/resize/clean only, never AI-regenerate them unless Cody explicitly asks.

## Ranking data source and migration rule

V1 remains the source of truth during migration:

- `assets/data/ranking-data.js`
- `assets/data/display-overrides.js`
- Compare profile/ledger files
- `assets/fighters/`

Do not copy V1's runtime architecture. Migrate typed data and product behavior into V2 in small reviewed batches. Do not add fighter data to HTML.

The initial V2 top-10 file is a deliberately small typed vertical slice, not the final full data migration. Continue in small batches and reconcile against the current V1 source before each merge.

## Current key V2 files

- `src/main.tsx` — application entry
- `src/app/App.tsx` — boot/readiness owner
- `src/app/router.tsx` — route owner
- `src/app/AppShell.tsx` — header/content/bottom-nav shell
- `src/config/brand.ts` — public brand and temporary V1 asset locations
- `src/components/BrandMark.tsx` — logo rendering
- `src/features/home/HomePage.tsx` — Home and Your HQ presentation
- `src/features/rankings/rankingData.ts` — first typed ranking batch
- `src/features/rankings/RankingsPage.tsx` — leaderboard/search
- `src/features/rankings/FighterProfilePage.tsx` — fighter breakdown route
- `src/features/rankings/FighterPhoto.tsx` — remote-photo/fallback owner
- `src/styles/tokens.css` — semantic tokens
- `src/styles/global.css` — current shell/component foundation
- `wrangler.jsonc` — Cloudflare Worker/static SPA configuration
- `docs/product-blueprint.md` — stable product principles and migration order
- `docs/HANDOFF.md` — current implementation state and new-chat handoff

## Validation workflow

Every production slice follows this sequence:

1. Start from current `main`.
2. Use one narrow branch and one purpose.
3. Make the smallest complete vertical slice.
4. Add or update focused tests.
5. Open a PR.
6. Require exact PR head to pass:
   - `npm run typecheck`
   - `npm test`
   - `npm run build`
7. Merge only after green.
8. Confirm Cloudflare production deployment.
9. Phone-test the exact live build.

Do not use V1's old safe branches, temporary workflows, fallback paths, duplicate initialization, or broad cleanup habits.

## Important completed PRs

- PR #1 — Build the Octagon HQ V2 foundation.
- PR #2 — Configure Cloudflare Workers deployment.
- PR #3 — Remove conflicting Pages redirect and fix Workers deployment loop.
- PR #4 — Migrate real branding and first Rankings slice.
- PR #6 — Add the authoritative new-chat handoff.

## Exact next safe actions

1. Confirm Cloudflare successfully deployed the product-behavior commit `8db0c27b8344b80bc46cfd81b4d8c8517c8b1e8b` and verify whether `https://app.bcking06.workers.dev` is live.
2. On phone, verify Home, Rankings, search, a fighter profile, direct refresh on `/rankings`, and direct refresh on `/fighters/jon-jones`.
3. Change the Cloudflare account subdomain to `octagonhq` if it will not disrupt another Worker.
4. Copy the real logo into V2 and remove the remote V1 logo dependency.
5. Copy fighter photos into V2 in the same small batch as the fighters being migrated.
6. Review the first Rankings screen visually before adding more fighters.
7. Continue Rankings/profile migration in small batches, preserving the locked UFC-only ranking shape.

## New-chat starter prompt

Copy this into a new conversation:

> Continue the Octagon HQ V2 rebuild. Repository: `codyking0602/Octagon-HQ`. First read `docs/HANDOFF.md` and `docs/product-blueprint.md`, then inspect the current `main` head before proposing or making changes. The last product-behavior commit recorded in the handoff is `8db0c27b8344b80bc46cfd81b4d8c8517c8b1e8b`; later commits may be documentation-only. V1 at `codyking0602/ufc-goat-rankings` remains live and maintenance-only; use it only as the visual/behavior/data source, never copy its runtime architecture. Use the connected GitHub tools. One owner, one purpose, small vertical slice, focused tests, exact PR head green, then merge. Do not add a service worker, duplicate initialization, fallback identity/routing paths, or global script-order architecture. Start by confirming the Cloudflare deployment and the exact next safe action in the handoff.
