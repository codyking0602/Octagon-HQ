# Octagon HQ V2 — Rankings Migration

_Last updated: 2026-07-24_

## Current status

The calculation migration and approved mobile Rankings/profile presentation are complete.

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
5. Rankings, Home, fighter profiles, and Intelligence prompts consume `rankingModel.ts` only for ranking values.

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

## Remaining Rankings-adjacent work

### Desktop profile behavior

- add the routed right-side profile drawer on desktop while preserving `/fighters/:slug`;
- keep the current full-screen route on mobile;
- do not create a second profile data owner.

### Local fighter assets

- copy real fighter photos into V2 in controlled batches;
- preserve source photographs;
- crop, resize, recenter, lightly sharpen, and convert only;
- remove the temporary V1 asset-host dependency before V1 retirement.

### Octagon Verdict synchronization

- move the knowledge-pack/export workflow from V1 to V2;
- generate directly from `rankingModel.ts`, canonical inputs, profile presentation data, and real direct-fight ledgers;
- preserve the zero-cost manual Custom GPT upload workflow;
- do not scrape browser globals or copy frozen ranking outputs into a second source.

## Stop rules

- Do not recreate `rankingData.ts`.
- Do not manually reorder fighters.
- Do not manually enter rank, OVR, total, or category scores in UI data.
- Do not copy V1's global ordered-script architecture.
- Do not build a second calculation, readiness, profile, or comparison path.
- Do not restore leaderboard taglines, full Watch Moment pills, or category-chip walls without Cody explicitly changing the approved compact-row direction.

## New-chat instruction

Read `docs/HANDOFF.md`, `docs/product-blueprint.md`, `docs/RANKINGS-MIGRATION.md`, `docs/rankings-parity-contract.md`, and `docs/intelligence-verdict-flow.md`, then inspect current `main`. The complete 80-fighter calculation migration, compact Rankings presentation, fighter profiles, audited video links, and Intelligence handoffs are finished. Compare and Ask Why are prompt handoffs into Octagon Verdict, not an in-app comparison engine. Do not rewrite the engine, recreate static ranking arrays, duplicate comparison calculations, or change scoring without Cody's approval. The next Rankings-adjacent milestone is the V2-owned Octagon Verdict knowledge-pack/export workflow, followed by the desktop profile drawer and local fighter-photo ownership.