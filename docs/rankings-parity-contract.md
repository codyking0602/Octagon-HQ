# Rankings Migration Parity Contract

_Last approved: 2026-07-22_

## Purpose

This contract freezes the V1 production ranking output before the typed V2 scoring-engine migration begins. V2 must reproduce the calculated V1 output before the disposable Rankings scaffold is replaced.

This slice does not change scoring, add fighters, or rebuild the Rankings UI.

## Pinned production reference

- Repository: `codyking0602/ufc-goat-rankings`
- Commit: `842ba06ea09c4f40723226f4c4dfd35041cb3314`
- Capture point: after the V1 `ufc-production-ranking-ready` event
- Runtime projection: `window.UFC_CALCULATED_RANKING_PROJECTION`

The fixture must never be reconstructed from the static values originally present in `assets/data/ranking-data.js`. Those arrays are presentation seeds that the production ranking pipeline replaces at runtime.

## V1 ownership contract

| Responsibility | V1 production owner |
| --- | --- |
| Canonical UFC fight facts and reviewed classifications | `assets/data/canonical-fighter-facts.js` plus the approved canonical roster/correction modules |
| Shared prime windows and longevity context | `assets/data/fighter-era-ledgers.js` plus approved resolutions |
| Championship, Opponent Quality, and Peak Apex judgment inputs | `assets/data/canonical-scoring-judgments.js` plus approved roster additions |
| Division-era depth inputs and resolutions | `assets/data/division-era-depth-shadow.js` and `assets/data/canonical-division-era-depth-approved-resolutions.js` |
| Seven approved category/modifier calculations | `assets/js/category-calculators.js` |
| Weighted totals, tie breakers, ranks, OVR, visible stats, and runtime projection | `assets/js/ranking-pipeline.js` |
| Production loading/readiness orchestration | `assets/js/production-ranking-bootstrap.js` |
| Copy, photos, links, and presentation-only overrides | `assets/data/display-overrides.js` |

V2 must migrate the calculation behavior and approved inputs without copying V1's ordered global-script architecture.

## Fixture requirements

The committed fixture must record:

- source repository and exact commit;
- model as-of date and production owner versions;
- category maximum and base-category weights;
- OVR floor, ceiling, curve, board anchors, and leader-only-99 rule;
- exact men's and women's fighter order;
- every fighter's category scores;
- weighted category contributions;
- Peak Apex, loss penalty, and era-depth modifiers;
- base score, pre-era-depth score, modifier score, and final total;
- the deterministic tie-break tuple;
- final rank and OVR;
- the complete visible-stat projection;
- the loss-penalty trace needed to prove classification and aggregation parity.

All numeric values are captured after V1's production rounding behavior. V2 parity tests should compare the typed projection directly with this fixture.

## Allowed differences

No scoring difference is allowed by default. Any V2 difference must be:

1. isolated;
2. documented with the exact affected fighters and fields;
3. explained as an intentional model change rather than a migration accident;
4. approved by Cody before the parity fixture changes.

## Approved Rankings product target

The replacement V2 Rankings experience will preserve the approved V1 information hierarchy and UFC/2K-style density.

The following decisions are locked:

1. **Hybrid fighter profile entry.** `/fighters/:slug` remains the canonical URL. Desktop may present the routed profile as a right-side drawer; mobile presents it as a full-screen profile.
2. **Retain all six category chips.** Championship Resume, Opponent Quality Wins, Prime Dominance, Elite Longevity, Peak Apex, and Loss Context remain visible on leaderboard rows, including the initial mobile parity version.
3. **Retain the KPI strip for now.** Fighter count, current number one, and average OVR remain above the Overall and Women boards until the V2 phone build is reviewed.

Also preserve:

- Overall, Women, Divisions, and Categories navigation;
- search and era filtering on Overall/Women;
- rank, thumbnail, fighter identity, UFC record, divisions, resume tag, and OVR hierarchy;
- category and division leader interactions;
- profile category explanations, Resume Snapshot, Why Ranked Here, Why Not Ranked Higher, Key Judgment Calls, and Final Takeaway.

Do not invent rank-movement presentation during the parity rebuild. V1 does not currently have a canonical movement treatment in the main row renderer.

## Migration sequence

1. Generate and validate the V1 production-output fixture.
2. Implement typed schemas and pure category calculations independent of React and browser globals.
3. Achieve full V1/V2 output parity for the entire men's and women's boards.
4. Replace the disposable Rankings scaffold with the approved V1-parity UI.
5. Migrate fighter profiles and Compare in small batches, all consuming the same typed projection.
