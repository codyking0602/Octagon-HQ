# Octagon HQ V2 — Rankings Migration

_Last updated: 2026-07-23_

## Current status

The calculation migration is complete.

V2 now has:

- the complete 80-fighter typed input dataset;
- pure TypeScript ownership of all seven categories/modifiers;
- calculated weighted totals, tie breakers, ranks, and fixed-anchor OVRs;
- calculated visible stats and profile values;
- exact output parity with pinned V1 production for all 65 men and 15 women;
- one app-facing calculated projection in `src/features/rankings/rankingModel.ts`;
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
5. Rankings, Home, and fighter profiles consume `rankingModel.ts` only for ranking values.

Ranks and OVRs must never be manually entered into presentation records.

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
- category scores and explanation belong in fighter profile and context surfaces;
- retain the compact KPI strip and search;
- retain Overall and Women now, with Divisions, Categories, and era filtering as focused follow-up interactions;
- keep `/fighters/:slug` as the canonical profile URL;
- use a routed right-side profile drawer on desktop and a full-screen profile on mobile;
- do not invent rank-movement presentation until movement data exists.

The UI must consume only the calculated ranking model for ranks, records, OVRs, and ordering. Watch Moment URLs are pinned presentation metadata and must not create a second ranking projection.

## Remaining implementation sequence

### Slice D1 — compact Rankings hierarchy

- use the approved Rankings title hierarchy and compact board selector;
- retain the KPI strip and search;
- use uniform dense leaderboard rows;
- preserve row-to-profile navigation;
- add one isolated circular Watch Moment action per fighter;
- capture and validate all 80 Watch Moment URLs from the pinned V1 reference;
- phone-test the exact production build.

### Slice D2 — remaining Rankings interactions

- add Divisions and Categories interactions without changing score ownership;
- add era filtering on Overall and Women;
- keep the same compact row system and shared semantic design tokens.

### Slice E — profile presentation and Compare

- implement the approved routed desktop drawer/mobile full-screen behavior;
- migrate richer profile presentation in small batches while preserving the common calculated projection;
- migrate Compare without duplicating score ownership;
- copy real fighter photos into V2 in controlled batches.

## Stop rules

- Do not recreate `rankingData.ts`.
- Do not manually reorder fighters.
- Do not manually enter rank, OVR, total, or category scores in UI data.
- Do not copy V1's global ordered-script architecture.
- Do not build a second calculation or readiness path.
- Do not restore leaderboard taglines, full Watch Moment pills, or category-chip walls without Cody explicitly changing the approved compact-row direction.

## New-chat instruction

Read `docs/HANDOFF.md`, `docs/product-blueprint.md`, `docs/RANKINGS-MIGRATION.md`, and `docs/rankings-parity-contract.md`, then inspect current `main`. The complete 80-fighter calculation migration is finished. Continue the approved compact Rankings presentation on top of `rankingModel.ts`; do not rewrite the engine, recreate static ranking arrays, or change scoring without Cody's approval.
