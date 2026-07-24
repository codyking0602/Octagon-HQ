# Octagon HQ V2 — Current Handoff

_Last updated: 2026-07-24_

This is the authoritative cold-start handoff for continuing Octagon HQ V2. Read this file, `docs/product-blueprint.md`, `docs/RANKINGS-MIGRATION.md`, `docs/rankings-parity-contract.md`, `docs/intelligence-verdict-flow.md`, and `docs/octagon-verdict-export.md`, then inspect current `main` before editing.

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

V2 contains the complete 80-fighter UFC-only ranking model:

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

## Rankings and fighter-profile product status

The calculation migration and the approved mobile Rankings/profile presentation are complete.

Locked decisions:

1. `/fighters/:slug` is the canonical profile route. Mobile uses a full-screen profile; a routed desktop right-side drawer remains a later enhancement.
2. Leaderboard rows remain compact and uniform: rank, real fighter photo, name, UFC record, division, OVR, and one isolated Watch Moment action.
3. Category ratings and explanations belong in fighter profiles and Category boards, not a six-chip wall on every leaderboard row.
4. Preserve P4P, Women, Divisions, Categories, search, and curated era filtering.
5. Do not invent rank-movement presentation until real movement data exists.
6. Fighter profiles preserve Compare, Ask Why, Watch Fight, Share, Resume Snapshot, six category cards, Why Ranked Here, and Why Not Ranked Higher/Lower.
7. All 80 Signature Fight destinations are direct, audited public YouTube links; UFC Fight Pass search links are excluded.

## Intelligence and Octagon Verdict

Intelligence is a zero-cost handoff to the user's Octagon Verdict GPT, not an in-app AI or statistical Compare engine.

Locked behavior:

- Primary navigation is Home, Rankings, Play, and Picks until permission-aware War Room exists.
- Intelligence is opened from the persistent top question-mark / Ask Octagon Verdict control.
- Unauthorized users must not see a fake, disabled, or discoverable War Room destination.
- Fighter-profile Compare opens Intelligence with the source fighter selected and the opponent control focused.
- Fighter-profile Ask Why copies a current calculated-rank question and opens a visible FROM FIGHTER PROFILE context card.
- Copy & Open Verdict is the primary action; visible prompt text and a separate copy control remain as fallbacks.
- Ordinary matchup prompts stay short. Octagon Verdict's own instructions own verdict-first structure, counterarguments, and better-fighter versus better-UFC-resume framing.
- Do not build a second in-app comparison calculation path.

### V2 export ownership

- `src/features/intelligence/octagonVerdictExport.ts` packages the existing calculated V2 owners; it does not recalculate rankings.
- `scripts/export-octagon-verdict.mjs` owns the local `npm run export:verdict` command.
- `.github/workflows/export-octagon-verdict.yml` builds, validates, and uploads the package for relevant pull requests, relevant changes on `main`, and manual runs.
- The package contains the master JSON feed, compact index, 80 fighter files, calculated division boards, derived direct-matchup files, and `octagon-verdict-knowledge.md` for manual Custom GPT upload.
- Direct UFC matchups are derived from canonical fight facts and reconciled by fighter pair and date. Head-to-head results are context only and never override the higher calculated total score.
- `artifacts/` is ignored. Generated packages are outputs, not a second editable source.
- V1 no longer owns the Octagon Verdict export pipeline.

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
- No duplicate initialization, fallback, recovery, ranking, comparison, or export owner.
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
- Complete 80-fighter ranking input dataset and pure calculation engine.
- Exact category, modifier, total, rank, OVR, visible-stat, and board-order parity with pinned V1 production.
- Compact P4P and Women boards, Divisions, Categories, search, and curated era filtering.
- Direct calculated fighter profiles for all 80 fighters.
- Full approved profile presentation and audited Signature Fight destinations.
- Final Intelligence/Octagon Verdict gateway, profile Compare handoff, and Ask Why handoff.
- Native V2 Octagon Verdict JSON/Markdown exporter and reproducible artifact workflow.
- Disposable static ranking source deleted.

### Not complete

- Routed desktop profile drawer.
- Local V2 ownership of all fighter image files.
- Real Home personalization, onboarding, favorite fighter, Top 10/profile-photo reminders, and persistence.
- Play games, Challenge Center, Picks, event recaps, authentication, profiles, permission-aware War Room, mentions, notifications, and final sharing/installability cutover.

## Validation standard

Every production slice:

1. Start from current `main`.
2. Use one branch and one purpose.
3. Make the smallest complete vertical change.
4. Add focused tests.
5. Require the exact PR head to pass `npm run typecheck`, `npm test`, and `npm run build`.
6. Merge only after green.
7. Confirm Cloudflare production deployment when the app bundle changes.
8. Phone-test the exact live build when the user-facing app changes.

Exporter changes additionally require a successful `Export Octagon Verdict V2 Package` workflow and inspection of the generated artifact.

## Next safe action

Finish the routed desktop profile drawer and local V2 ownership of all real fighter images. Preserve the current mobile full-screen profile and canonical `/fighters/:slug` route.

After those two remaining Rankings-adjacent migrations, begin real Home personalization and onboarding.

## New-chat starter prompt

> Continue the Octagon HQ V2 rebuild from current `main` in `codyking0602/Octagon-HQ`. First read `docs/HANDOFF.md`, `docs/product-blueprint.md`, `docs/RANKINGS-MIGRATION.md`, `docs/rankings-parity-contract.md`, `docs/intelligence-verdict-flow.md`, and `docs/octagon-verdict-export.md`, then inspect current `main`. The complete 80-fighter calculation migration, compact Rankings controls, full fighter profiles, audited Signature Fight links, final Intelligence handoff, and native V2 Octagon Verdict exporter are complete. Compare and Ask Why are prompt handoffs into Intelligence—not a standalone in-app comparison engine. Do not recreate static ranking ownership, duplicate comparison calculations, generated export data as source, or V1's global runtime architecture. The next safe milestones are the routed desktop profile drawer and local V2 ownership of real fighter photos, followed by Home personalization.