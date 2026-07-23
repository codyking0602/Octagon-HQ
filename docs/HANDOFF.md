# Octagon HQ V2 — Current Handoff

_Last updated: 2026-07-23_

This is the authoritative cold-start handoff for continuing Octagon HQ V2. Read this file, `docs/product-blueprint.md`, `docs/RANKINGS-MIGRATION.md`, and `docs/rankings-parity-contract.md`, then inspect current `main` before editing.

## Repositories and live apps

### V1 — legacy production reference

- Repository: `codyking0602/ufc-goat-rankings`
- Live URL: `https://codyking0602.github.io/ufc-goat-rankings/`
- Pinned ranking-migration reference: `842ba06ea09c4f40723226f4c4dfd35041cb3314`
- Keep V1 alive as the current visual, feature, asset, and rollback reference.
- Do not resume structural cleanup or broad feature development in V1.

### V2 — clean rebuild

- Repository: `codyking0602/Octagon-HQ`
- Production branch: `main`
- Live Cloudflare URL: `https://app.octagon-hq.workers.dev`
- Rankings URL: `https://app.octagon-hq.workers.dev/rankings`

## Critical ranking status

The disposable ten-fighter ranking scaffold has been removed.

V2 now contains the complete 80-fighter UFC-only ranking model:

- 65-fighter Overall board;
- 15-fighter Women board;
- typed canonical fight facts and approved calculation inputs;
- pure TypeScript calculations for Championship, Opponent Quality, Prime Dominance, Longevity, Peak Apex, Loss Context, and Era Depth;
- calculated weighted totals, tie breakers, board ranks, and OVRs;
- calculated visible stats and direct fighter-profile routes;
- exact V1 production-output parity tests for every fighter.

`src/features/rankings/rankingData.ts` no longer exists. Never recreate a hand-written ranking array or manually enter ranks, scores, or OVRs in presentation data.

## Ranking ownership

- `src/features/rankings/data/generated/canonical-ranking-inputs-842ba06e.json`
  - complete captured canonical inputs for all 80 fighters;
  - contains facts, shared era settings, approved judgment inputs, era-depth inputs, and presentation metadata;
  - must not contain final ranks, OVRs, totals, or frozen category scores.
- `src/features/rankings/data/rankingInputs.ts`
  - strict Zod validation and dataset reconciliation owner.
- `src/features/rankings/engine/categoryCalculators.ts`
  - pure owner of the seven approved category/modifier calculations.
- `src/features/rankings/engine/rankingEngine.ts`
  - pure owner of weighting, totals, tie breakers, ranks, and fixed-anchor OVR projection.
- `src/features/rankings/engine/eraWindow.ts`
  - audited exact/one-day date resolution matching V1 production behavior.
- `src/features/rankings/rankingModel.ts`
  - single app-facing calculated projection and profile lookup owner.
- `src/features/rankings/engine/__fixtures__/v1-production-output-842ba06e.json`
  - pinned V1 production-output oracle; never use it as runtime app data.
- `scripts/capture-v1-ranking-inputs.mjs`
  - deterministic pinned-V1 input capture.
- `.github/workflows/capture-v1-ranking-inputs.yml`
  - single reproducible capture workflow owner.

## Current production ranking order

The model—not a hand-written list—produces the current men's top ten:

1. Jon Jones
2. Georges St-Pierre
3. Anderson Silva
4. Demetrious Johnson
5. Islam Makhachev
6. Alexander Volkanovski
7. Khabib Nurmagomedov
8. Matt Hughes
9. Kamaru Usman
10. Max Holloway

Do not reorder fighters manually. Change approved facts or judgment inputs, then let the model recalculate.

## Approved Rankings product target

The calculation migration is complete. The next Rankings milestone is visual and interaction parity with the approved V1 UFC/2K-style product.

Locked decisions:

1. `/fighters/:slug` is the canonical profile route. Desktop may use a routed right-side drawer; mobile uses a full-screen profile.
2. Retain the six visible score chips on leaderboard rows: Championship, Opponent Quality, Prime Dominance, Longevity, Peak Apex, and Loss Context.
3. Retain the KPI strip for now: fighter count, current number one, and average OVR.
4. Preserve Overall, Women, Divisions, and Categories navigation.
5. Preserve search and era filtering on Overall/Women.
6. Do not invent rank-movement presentation during parity work.

The current V2 board is calculation-correct and displays all 80 fighters, but it is not yet the final approved visual migration.

## Temporary V1 asset dependency

V2 still reads real fighter images from the V1 GitHub Pages asset host when presentation metadata provides V1 paths. Before V1 is retired:

- copy the real logo and fighter images into V2;
- use local V2 paths;
- preserve source photographs;
- crop, resize, recenter, lightly sharpen, and convert only;
- never AI-regenerate fighter photos unless Cody explicitly asks.

## Architecture rules

- `src/main.tsx`: one application entry.
- `src/app/App.tsx`: one startup/readiness owner.
- `src/app/router.tsx`: one routing owner.
- `src/lib/supabase.ts`: one Supabase client owner.
- Future auth: exactly one session/identity provider.
- `src/styles/tokens.css`: one semantic design-token source.
- No global script-order architecture.
- No duplicate initialization, fallback, or recovery owner.
- Build in small vertical slices with focused tests.
- Add fighters in small batches only after the current 80-fighter source and update workflow are explicitly extended.

## Locked product requirements

- Fresh launch opens Home, never Picks.
- War Room remains completely undiscoverable to unauthorized users.
- Public copy says `Octagon HQ`; never expose internal development terminology.
- Home retains the compact Your HQ card with Daily streak, Current Picks record, Favorite fighter, Open challenges, and one intelligent next action.
- True black owns canvas/safe areas/navigation; charcoal owns cards and controls; white owns primary information; gray owns support information; UFC red is restrained emphasis.

## Current implementation status

### Complete

- React/TypeScript/Vite application shell.
- One startup owner, router owner, and Supabase client factory.
- Branded boot experience and route-level lazy loading.
- Cloudflare Workers static-asset deployment with clean SPA routes.
- Home foundation and calculated top-three preview.
- Complete 80-fighter ranking input dataset.
- Pure calculation engine.
- Exact category, modifier, total, rank, OVR, visible-stat, and board-order parity with pinned V1 production.
- Overall and Women boards showing all 80 fighters.
- Search across the selected board.
- Direct calculated fighter profiles for every migrated fighter.
- Disposable static ranking source deleted.

### Not complete

- Final V1-parity Rankings visual density and six-chip row treatment.
- Divisions and Categories board interactions.
- Desktop routed profile drawer.
- Local V2 ownership of all fighter image files.
- Compare migration.
- Play, Picks, Intelligence, authentication, persistence, onboarding, challenges, War Room, sharing, and notifications.

## Validation standard

Every production slice:

1. Start from current `main`.
2. Use one branch and one purpose.
3. Make the smallest complete vertical change.
4. Add focused tests.
5. Require the exact PR head to pass `npm run typecheck`, `npm test`, and `npm run build`.
6. Merge only after green.
7. Confirm Cloudflare production deployment.
8. Phone-test the exact live build.

## Next safe action

Build the V1-parity Rankings presentation on top of `rankingModel.ts` without changing calculation ownership. Preserve the approved six chips, KPI strip, board navigation, search/filter behavior, and routed profile strategy. Do not reintroduce `rankingData.ts`, frozen output arrays, or duplicate calculation paths.

## New-chat starter prompt

> Continue the Octagon HQ V2 rebuild from current `main` in `codyking0602/Octagon-HQ`. First read `docs/HANDOFF.md`, `docs/product-blueprint.md`, `docs/RANKINGS-MIGRATION.md`, and `docs/rankings-parity-contract.md`. The complete 80-fighter calculation-from-facts migration is finished: `rankingModel.ts` is the app-facing source, all categories/totals/ranks/OVRs are calculated, and the old `rankingData.ts` scaffold is deleted. Do not recreate static ranking ownership or copy V1's global runtime architecture. The next ranking milestone is the approved V1-parity UFC/2K-style presentation, built in a small tested slice with exact-head green validation.
