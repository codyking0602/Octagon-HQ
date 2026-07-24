# Octagon HQ V2 — Rankings Migration

_Last updated: 2026-07-24_

## Current status

The calculation migration, approved mobile Rankings/profile presentation, Intelligence handoff, and Octagon Verdict export migration are complete.

V2 now has:

- the complete 80-fighter typed input dataset;
- pure TypeScript ownership of all seven categories/modifiers;
- calculated weighted totals, tie breakers, ranks, and fixed-anchor OVRs;
- calculated visible stats and profile values;
- exact output parity with pinned V1 production for all 65 men and 15 women;
- one app-facing calculated projection in `src/features/rankings/rankingModel.ts`;
- compact P4P and Women boards;
- calculated Divisions and Categories interactions;
- curated era filtering and search;
- direct full-screen mobile fighter profiles for all 80 fighters;
- audited Watch Moment and Signature Fight destinations;
- final Compare and Ask Why handoffs into Intelligence/Octagon Verdict;
- a native V2 JSON/Markdown knowledge exporter and artifact workflow;
- no hand-written ranking, score, or OVR array.

The former `src/features/rankings/rankingData.ts` scaffold has been deleted and must not be recreated.

## Pinned reference

- V1 repository: `codyking0602/ufc-goat-rankings`
- Pinned production commit: `842ba06ea09c4f40723226f4c4dfd35041cb3314`
- Output oracle: `src/features/rankings/engine/__fixtures__/v1-production-output-842ba06e.json`
- Input dataset: `src/features/rankings/data/generated/canonical-ranking-inputs-842ba06e.json`

The output fixture is test-only. The live app calculates from the typed input dataset.

## Calculation ownership

1. `data/rankingInputs.ts` validates the complete canonical dataset.
2. `engine/categoryCalculators.ts` calculates Championship, Opponent Quality, Prime Dominance, Longevity, Peak Apex, Loss Context, and Era Depth.
3. `engine/rankingEngine.ts` calculates weighted totals, modifiers, tie breakers, ranks, and OVRs.
4. `rankingModel.ts` derives the app-facing boards, visible stats, presentation values, and profile lookup.
5. Rankings, Home, fighter profiles, Intelligence prompts, and the Octagon Verdict exporter consume these owners without recalculating or freezing rankings elsewhere.

Ranks and OVRs must never be manually entered into presentation or export records.

## Completed parity gate

Automated tests verify all 80 fighters for:

- exact fighter set;
- exact men's and women's order;
- exact category values;
- exact apex, penalty, and era-depth modifiers;
- exact weighted contributions and totals;
- exact tie-break tuples;
- exact rank and OVR;
- exact visible stats;
- locked loss-context exceptions, including Jones/Hamill and Volkanovski/Islam.

Any future difference requires an isolated, documented, Cody-approved scoring change.

## Approved Rankings presentation

The leaderboard uses one continuous compact hierarchy for every fighter.

Locked UI decisions:

- every fighter row uses the same size and information hierarchy;
- rows prioritize rank, real fighter photo, name, UFC record, division, and OVR;
- the row itself opens the canonical fighter profile route;
- a separate circular play action opens that fighter's pinned YouTube Watch Moment;
- leaderboard rows do not show taglines, full `Watch Moment` pills, or six category chips;
- category scores and explanation belong in fighter profiles and Category boards;
- retain the compact KPI strip and search;
- preserve P4P, Women, Divisions, Categories, and curated era filtering;
- keep `/fighters/:slug` as the canonical profile URL;
- use a routed right-side profile drawer on desktop later and a full-screen profile on mobile now;
- do not invent rank-movement presentation until movement data exists.

The UI must consume only the calculated ranking model for ranks, records, OVRs, and ordering. Watch Moment and Signature Fight URLs are pinned presentation metadata and must not create a second ranking projection.

## Fighter-profile and Intelligence behavior

- Profiles contain Compare, Ask Why, Watch Fight, and Share.
- Compare is not a standalone in-app scoring screen. It opens Intelligence with Fighter A selected and waits for Fighter B.
- Ask Why builds and copies a question using the fighter's current calculated board and rank, then opens the visible Intelligence context card.
- Intelligence hands the copied prompt to the user's Octagon Verdict GPT with no API or per-question app cost.
- Octagon Verdict's instructions own verdict-first writing, the losing fighter's real counterargument, why the winner still wins, and better-fighter versus better-UFC-resume framing.
- Do not build a second comparison engine or duplicate score ownership.

## Octagon Verdict synchronization

V2 now owns the complete export workflow:

- `src/features/intelligence/octagonVerdictExport.ts` packages calculated V2 data;
- `scripts/export-octagon-verdict.mjs` generates the package with `npm run export:verdict`;
- `.github/workflows/export-octagon-verdict.yml` validates and uploads the package on relevant pull requests, relevant changes to `main`, and manual dispatch;
- `docs/octagon-verdict-export.md` documents generation and the manual Custom GPT upload step.

The package includes:

- the master JSON feed;
- a compact retrieval index;
- one JSON file for each of the 80 ranked fighters;
- calculated division boards;
- direct-matchup JSON derived from canonical ranked-fighter UFC fight facts;
- one upload-ready Markdown knowledge document.

Reciprocal direct-fight records are reconciled by fighter pair and date. Head-to-head results are context only and never override the higher calculated total score. Generated files remain ignored outputs and may not become an editable second source.

## Rankings-adjacent status

### Local fighter assets — complete

- the real app icon and all 80 ranked fighters' thumbnail/profile WebPs are owned in `public/assets/`;
- the calculated fighter model resolves only local `/assets/fighters/` paths;
- automated tests require exactly 160 valid WebP files and reject external fighter-photo URLs;
- V1 is no longer a runtime image host for V2.

### Desktop profile behavior — later enhancement

- add the routed right-side profile drawer on desktop while preserving `/fighters/:slug`;
- keep the current full-screen route on mobile;
- do not create a second profile data owner.

## Stop rules

- Do not recreate `rankingData.ts`.
- Do not manually reorder fighters.
- Do not manually enter rank, OVR, total, or category scores in UI or export data.
- Do not copy V1's global ordered-script architecture.
- Do not build a second calculation, readiness, profile, comparison, or export path.
- Do not commit generated Octagon Verdict artifacts as authoritative source data.
- Do not restore leaderboard taglines, full Watch Moment pills, or category-chip walls without Cody explicitly changing the approved compact-row direction.

## New-chat instruction

Read `docs/HANDOFF.md`, `docs/product-blueprint.md`, `docs/RANKINGS-MIGRATION.md`, `docs/rankings-parity-contract.md`, `docs/intelligence-verdict-flow.md`, and `docs/octagon-verdict-export.md`, then inspect current `main`. The complete 80-fighter calculation migration, compact Rankings presentation, fighter profiles, audited video links, Intelligence handoffs, native V2 Octagon Verdict exporter, and local fighter-asset migration are finished. Compare and Ask Why are prompt handoffs into Octagon Verdict, not an in-app comparison engine. Do not rewrite the engine, recreate static ranking arrays, duplicate comparison/export calculations, commit generated export files as source, or change scoring without Cody's approval. The desktop profile drawer remains a later Rankings enhancement; the next product milestone is Home personalization and onboarding.