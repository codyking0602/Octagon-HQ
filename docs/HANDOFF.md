# Octagon HQ V2 — Current Handoff

_Last updated: 2026-07-23_

This is the authoritative cold-start handoff for continuing Octagon HQ V2 in a new ChatGPT/Codex conversation. Read this file, `docs/product-blueprint.md`, and `docs/RANKINGS-MIGRATION.md` before making changes. Then inspect the current `main` head because documentation-only commits may follow the last product-behavior commit listed below.

## Critical correction: Rankings is scaffolding

The current V2 Rankings implementation is **not** Cody's real calculation system and is **not approved visually**.

- `src/features/rankings/rankingData.ts` is a hand-written static top-10 array with manually entered ranks, OVRs, scores, and copy.
- `src/features/rankings/RankingsPage.tsx` only filters and renders that array.
- It does not run the V1 calculation pipeline, automatically reorder fighters, or recalculate OVR when inputs change.
- The current V2 Rankings layout is a generic proof-of-routing list, not a faithful migration of Cody's approved V1 Rankings tab.
- The displayed order may be wrong and must not be treated as production ranking truth.

**Stop rule:** do not add more fighters and do not polish the current ranking rows. The next product milestone is to audit and migrate the real scoring pipeline, establish V1/V2 calculation parity, discuss the approved Rankings visual target with Cody, and only then replace the disposable UI scaffold.

Read `docs/RANKINGS-MIGRATION.md` for the exact engine, parity, visual, and implementation requirements.

## Repositories and live apps

### V1 — current legacy production app

- Repository: `codyking0602/ufc-goat-rankings`
- Live URL: `https://codyking0602.github.io/ufc-goat-rankings/`
- Keep alive during V2 migration.
- Maintenance-only except for production-breaking behavior, incorrect live Picks data, or security/access issues.
- Do not continue structural cleanup or major feature development in V1.
- V1 remains the visual reference, feature specification, canonical ranking/data reference, and rollback product.

### V2 — clean rebuild

- Repository: `codyking0602/Octagon-HQ`
- Production branch: `main`
- Last product-behavior commit recorded at this handoff: `8db0c27b8344b80bc46cfd81b4d8c8517c8b1e8b` (`Migrate real branding and first rankings slice`). Later commits may be documentation-only; inspect current `main` before editing.
- Last confirmed working Cloudflare URL before Worker rename: `https://octagon-hq.bcking06.workers.dev`
- `wrangler.jsonc` names the Worker `app`, so expected deployed URL: `https://app.bcking06.workers.dev`. Confirm in Cloudflare before treating it as verified.
- Desired free URL after the manual Cloudflare account-subdomain change: `https://app.octagonhq.workers.dev`

## Why V2 exists

V1 accumulated dozens of ordered global scripts, global CSS override layers, competing startup/identity/routing responsibilities, local-storage fallbacks, and custom service-worker behavior. Small changes repeatedly caused unrelated startup failures. V2 is a parallel production rebuild, not another V1 refactor.

## Locked technology and hosting

- GitHub: source control, PRs, CI, and Codex workspace.
- Cloudflare Workers static assets: V2 hosting at no cost.
- Supabase: intended backend for auth, profiles, Picks, challenges, War Room, realtime data, and notifications.
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
- Static output: `dist`
- SPA route fallback: `wrangler.jsonc` with `not_found_handling: "single-page-application"`
- Do not restore `public/_redirects`; it conflicted with Workers static-asset routing and caused an infinite-loop deployment failure.

### Manual URL step still pending

Inside Cloudflare, change the account `workers.dev` subdomain from `bcking06` to `octagonhq` only after confirming the account is not used for another Worker that should retain the old subdomain. This affects every Worker in the account.

## Non-negotiable architecture rules

- `src/main.tsx`: one application entry.
- `src/app/App.tsx`: one startup/readiness owner.
- `src/app/router.tsx`: one routing owner.
- `src/lib/supabase.ts`: one Supabase client owner.
- Future auth: exactly one session/identity provider.
- `src/styles/tokens.css`: one semantic design-token source.
- Feature folders own their screens, local state, and focused tests.
- No global script-order architecture.
- No duplicate initialization or recovery path.
- No consumer feature independently reads canonical auth storage or resolves identity.
- No feature invents its own sharing, notification, button, card, loading, or permission system.
- Build in small vertical slices and validate each slice.

## Locked product requirements

1. Branded black startup screen with the real Octagon HQ logo and a loading indication; no white flash, UI flicker, or unfinished Home rendering.
2. Fresh launch opens Home, never Picks.
3. Major destinations load independently with route-level code splitting and route-specific loading states.
4. War Room is completely undiscoverable to unauthorized users: no tab, card, disabled CTA, route, onboarding copy, or notification.
5. Authorized War Room users will eventually have structured `@mentions`, in-app notifications, push notifications, and exact message deep links.
6. After a UFC Picks event is fully scored, a server-owned idempotent push notification opens the completed-event results/recap page.
7. Play includes a Challenge Center for sent, received, waiting, completed, and unseen-result challenges.
8. Onboarding is redesigned and adaptive for independent users, Picks invites, War Room invites, incomplete profiles, and V1 migration users.
9. Public copy says `Octagon HQ`; never show `UFC App`, `GOAT26`, internal group codes, Supabase terminology, or development labels.
10. Sharing is centralized, minimal, native when supported, and uses clean deep links.
11. Home includes a compact `Your HQ` card with exactly Daily streak, Current Picks record, Favorite fighter, Open challenges, and one intelligent next action.
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
- Route-level lazy loading and skeleton state.
- Semantic dark design tokens and reusable shell styling.
- Fixed five-item bottom navigation: Home, Rankings, Play, Picks, Intelligence.
- Home route and `Your HQ` placeholder card.
- War Room absent from navigation and routes.
- Cloudflare Workers deployment with clean SPA refresh routing.
- Temporary `V2` badge and `Foundation Active` developer card removed.
- Existing real Octagon HQ logo used for static boot, React boot, header, favicon, and Apple touch icon.
- Home previews three static ranking rows.
- Rankings routing scaffold:
  - lazy-loaded `/rankings` route;
  - search input;
  - direct `/fighters/:slug` routes;
  - fighter-photo fallback;
  - profile-section proof for category/context/copy rendering.

### Not complete or approved

- Real ranking calculation pipeline.
- Fluid rank/OVR recalculation.
- Full V1/V2 score and output parity.
- Approved Rankings tab visual migration.
- Current top-10 order and OVR presentation.
- Fighter profiles as production ranking truth.
- Play content.
- Picks content.
- Intelligence content.
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

## Current static ranking scaffold

The scaffold contains copied rows for:

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

This list is not an approved current ranking order. Do not extend it.

## Real ranking source and migration rule

V1 current `main` remains the calculation reference. Inspect exact owners before migration, including:

- canonical fighter facts;
- category calculators;
- `ranking-pipeline.js` as owner of weighted totals, ranks, OVRs, visible stats, and runtime projection;
- `ranking-data.js`;
- `display-overrides.js` for presentation only;
- Compare profiles and ledgers;
- `assets/fighters/`.

V2 must migrate typed facts and pure calculation behavior—not copied final ranks and not V1's global runtime architecture. Ranks and OVRs must be calculated, never manually entered in presentation records.

The required parity and visual gates are in `docs/RANKINGS-MIGRATION.md`.

## Temporary V1 asset dependency

V2 is not asset-independent. `src/config/brand.ts` currently points to V1-hosted:

- logo: `https://codyking0602.github.io/ufc-goat-rankings/assets/app-icon.png`
- fighter assets: `https://codyking0602.github.io/ufc-goat-rankings/assets/fighters`

Before V1 is retired, copy the real logo and fighter images into V2 and use local paths. Preserve real fighter photos; crop, resize, recenter, sharpen lightly, and convert only. Never AI-regenerate fighter photos unless Cody explicitly asks.

## Current key V2 files

- `src/main.tsx` — application entry
- `src/app/App.tsx` — boot/readiness owner
- `src/app/router.tsx` — route owner
- `src/app/AppShell.tsx` — shell
- `src/config/brand.ts` — brand and temporary V1 asset locations
- `src/components/BrandMark.tsx` — logo rendering
- `src/features/home/HomePage.tsx` — Home and Your HQ presentation
- `src/features/rankings/rankingData.ts` — disposable static ranking scaffold
- `src/features/rankings/RankingsPage.tsx` — disposable leaderboard/search presentation
- `src/features/rankings/FighterProfilePage.tsx` — profile-route presentation proof
- `src/features/rankings/FighterPhoto.tsx` — photo/fallback owner
- `src/styles/tokens.css` — semantic tokens
- `src/styles/global.css` — current shell/component foundation
- `wrangler.jsonc` — Cloudflare Worker/static SPA configuration
- `docs/product-blueprint.md` — stable product principles
- `docs/RANKINGS-MIGRATION.md` — authoritative ranking correction and next milestone
- `docs/HANDOFF.md` — current implementation handoff

## Validation workflow

Every production slice:

1. Start from current `main`.
2. One narrow branch and one purpose.
3. Smallest complete vertical slice.
4. Focused tests.
5. Open a PR.
6. Require exact PR head to pass `npm run typecheck`, `npm test`, and `npm run build`.
7. Merge only after green.
8. Confirm Cloudflare production deployment.
9. Phone-test the exact live build.

Do not use V1's old safe branches, temporary workflows, fallback paths, duplicate initialization, or broad cleanup habits.

## Important completed PRs

- PR #1 — Build the Octagon HQ V2 foundation.
- PR #2 — Configure Cloudflare Workers deployment.
- PR #3 — Remove conflicting Pages redirect and fix Workers deployment loop.
- PR #4 — Add real branding and the disposable Rankings routing scaffold.
- PR #6 — Add the authoritative new-chat handoff.
- PR #7 — Clarify handoff commit terminology.

## Exact next safe actions

1. Read `docs/RANKINGS-MIGRATION.md`.
2. Inspect current V1 `main` to identify exact owners of canonical fighter facts, category calculations, ranking totals/ranks/OVR, and the approved Rankings display.
3. Inspect current V2 `main`; do not assume the static scaffold is authoritative.
4. Discuss with Cody how closely V2 should reproduce the current V1 Rankings tab and identify any intentional visual changes before coding the replacement UI.
5. Create a stable V1 production-output parity fixture.
6. Propose the typed V2 scoring-engine migration and test contract.
7. Do not add fighters or polish the current rows until Cody approves the engine and visual plan.
8. Separately confirm the current Cloudflare URL and complete the account-subdomain change when appropriate.

## New-chat starter prompt

Copy this into a new conversation:

> Continue the Octagon HQ V2 rebuild. Repository: `codyking0602/Octagon-HQ`. V1 repository: `codyking0602/ufc-goat-rankings`. First read `docs/HANDOFF.md`, `docs/product-blueprint.md`, and `docs/RANKINGS-MIGRATION.md`, then inspect current `main` in both repositories before proposing or making changes. Critical correction: the current V2 Rankings page and `rankingData.ts` are disposable static scaffolding. They do not use Cody's calculation pipeline, are not fluid, may show the wrong order, and do not visually match the approved V1 Rankings tab. Do not add fighters or polish the scaffold. Start by auditing the exact current V1 ranking engine and approved Rankings presentation, explain the findings to Cody, and discuss the visual target before coding. The required next milestone is typed V2 scoring-engine migration with exact V1 output parity, followed by an approved V1-parity Rankings UI. Preserve the clean V2 architecture: one owner, one purpose, small vertical slice, focused tests, exact PR head green, then merge. Never copy V1's global runtime architecture, add duplicate initialization, or manually hard-code ranks/OVRs as presentation truth.
