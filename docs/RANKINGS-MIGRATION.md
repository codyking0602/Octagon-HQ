# Octagon HQ V2 — Rankings Migration Correction

_Last updated: 2026-07-23_

This document corrects an important misunderstanding about the current V2 Rankings implementation and defines the next milestone.

## Current truth

The current V2 Rankings feature is **not** the production ranking engine and must not be treated as approved.

`src/features/rankings/rankingData.ts` is a manually written static top-10 array. It hard-codes each fighter's:

- rank;
- OVR;
- raw score;
- category values;
- penalty;
- profile copy.

`src/features/rankings/RankingsPage.tsx` only searches and renders that array. It does not run Cody's scoring calculations, automatically reorder fighters, or update OVR when ranking inputs change.

The current V2 Rankings layout is also a newly created generic row list. It is not a faithful migration of the approved V1 Rankings tab.

The current implementation proved only that V2 can support:

- a lazy-loaded Rankings route;
- clean fighter-profile URLs;
- searchable fighter rows;
- fighter image fallbacks;
- direct-route refreshes.

Treat the ranking order, OVR values, profile values, and visual presentation as **disposable scaffolding** until the real migration is complete.

## Immediate stop rule

Do not add another fighter to V2 Rankings and do not polish the current ranking rows before completing the engine and visual-parity work below.

## V1 calculation source of truth

The legacy production app remains the calculation reference during migration. Inspect the current files on V1 `main`, especially:

- `assets/data/canonical-fighter-facts.js` — canonical UFC fight and fighter facts;
- `assets/data/category-calculators.js` — approved category calculations and traces;
- `assets/data/ranking-pipeline.js` — single owner of weighted totals, rank assignment, OVR, visible stats, and the app-facing ranking projection;
- `assets/data/ranking-data.js` — profile/display payload consumed by the production projection;
- `assets/data/display-overrides.js` — presentation copy and photo paths only;
- Compare profile and ledger files;
- `assets/fighters/` — real fighter photos.

Confirm exact paths on current V1 `main` before editing because file ownership may have changed.

## Locked calculation behavior to migrate

V2 must use typed equivalents of the real calculation pipeline rather than copied final outputs:

1. Canonical UFC-only fighter facts.
2. Championship calculation.
3. Opponent Quality calculation.
4. Prime Dominance calculation.
5. Longevity calculation.
6. Apex/peak adjustment where currently approved.
7. Locked loss-penalty rules.
8. Era/division-depth adjustment.
9. Weighted total calculation.
10. Deterministic rank assignment and tie breakers.
11. Fixed-anchor OVR curve with Jon Jones as the 99 benchmark.
12. Visible profile stats derived from the same canonical facts.

Ranks and OVR values must never be manually entered into fighter presentation rows.

## Required fluid behavior

After migration, changing an approved fight fact or judgment input must flow through one calculation owner and automatically update:

- category values;
- modifiers and penalties;
- total score;
- rank order;
- OVR;
- visible leaderboard stats;
- fighter profile values;
- Compare Mode inputs that consume ranking data.

Automatic outside-world fight-result ingestion is a later feature. The requirement here is that once canonical inputs change, the ranking output recalculates without manual rank assignment.

## Parity gate

Before the V2 engine is approved, add an automated parity fixture or export from current V1 and compare V2 output for all migrated fighters.

At minimum verify:

- same fighter set;
- same men's and women's order;
- same category values;
- same apex, penalty, and era-depth adjustments;
- same total scores;
- same rank tie breakers;
- same OVR values;
- same visible stats.

A difference is allowed only when it is documented, explained to Cody, and explicitly approved as an intentional V2 scoring change.

Do not make a fresh independent interpretation of Cody's scoring rules during migration.

## Visual-parity gate

Before rebuilding the Rankings page, inspect the current approved V1 Rankings experience and discuss it with Cody.

Default requirement:

> V2 should preserve the approved V1 Rankings information hierarchy, interaction model, and UFC/2K feel while implementing it with clean V2 components and architecture.

Do not independently redesign the tab. Identify with screenshots or a concise screen inventory:

- leaderboard header and controls;
- men's/women's and division navigation;
- fighter-row structure;
- OVR presentation;
- movement or status treatments;
- search/filter behavior;
- profile-entry behavior;
- spacing, typography, card treatment, and mobile density;
- anything Cody wants intentionally changed.

Get Cody's approval on the target before replacing the current scaffold.

## Recommended implementation sequence

### Slice A — audit and contract

- Inspect the exact current V1 ranking pipeline and every required input owner.
- Record the current production output in a stable parity fixture.
- Inventory the approved V1 Rankings screen.
- Discuss visual differences and intended improvements with Cody.
- Produce a narrow implementation plan before coding the engine.

### Slice B — typed calculation core

- Migrate canonical schemas and pure calculation functions.
- Keep calculations independent of React and browser globals.
- Add unit tests for locked loss penalties, weights, tie breakers, division context, and OVR anchors.
- Demonstrate parity on a small representative fighter set.

### Slice C — full parity projection

- Migrate all required fighter inputs.
- Produce the full calculated men's and women's boards.
- Pass the full V1/V2 parity gate.
- Expose one typed ranking projection for all V2 consumers.

### Slice D — approved Rankings UI

- Replace the disposable page with the approved V1-parity design.
- Consume only the calculated projection.
- Add route, search, filter, and visual regression/snapshot coverage where useful.
- Phone-test before merging.

### Slice E — profiles and Compare

- Migrate fighter profile presentation in small batches.
- Ensure profile and Compare data consume the same calculated projection.
- Copy real fighter photos into V2 with each migrated batch.

## New-chat instruction

A new conversation should begin by reading:

1. `docs/HANDOFF.md`
2. `docs/product-blueprint.md`
3. `docs/RANKINGS-MIGRATION.md`

Then inspect current V2 and V1 `main` before proposing changes. The first action is an audit and discussion, not adding fighters or styling the existing scaffold.
