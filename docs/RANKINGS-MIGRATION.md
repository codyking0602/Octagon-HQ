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
5. Rankings, Home, and fighter profiles consume `rankingModel.ts` only.

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

## Remaining visual-parity gate

The current V2 page is calculation-correct and displays all 80 fighters, but the final approved UFC/2K-style presentation remains to be built.

Locked UI decisions:

- preserve Overall, Women, Divisions, and Categories navigation;
- retain search and era filtering on Overall/Women;
- retain the KPI strip for now;
- retain six row chips: Championship, Opponent Quality, Prime Dominance, Longevity, Peak Apex, and Loss Context;
- keep `/fighters/:slug` as the canonical profile URL;
- use a routed right-side profile drawer on desktop and a full-screen profile on mobile;
- do not invent rank-movement presentation during parity work.

The UI must consume only `rankingModel.ts` and must not add fallback calculations or frozen output data.

## Remaining implementation sequence

### Slice D — approved Rankings UI

- reproduce the approved V1 information hierarchy and UFC/2K density with clean V2 components;
- add Divisions and Categories interactions;
- add the six category chips to rows;
- add era filtering;
- preserve the KPI strip and search;
- phone-test the exact production build.

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

## New-chat instruction

Read `docs/HANDOFF.md`, `docs/product-blueprint.md`, `docs/RANKINGS-MIGRATION.md`, and `docs/rankings-parity-contract.md`, then inspect current `main`. The next ranking milestone is visual parity on top of the completed calculation model—not another engine rewrite and not adding fighters to a static array.
