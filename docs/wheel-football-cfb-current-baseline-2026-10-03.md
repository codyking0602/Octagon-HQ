# CFB Wheel current-roster baseline — 2026-10-03

## Scope

Step 2 establishes the current-only roster baseline for the approved CFB Wheel universe:

- SEC: 16 schools
- Big Ten: 18 schools
- Big 12: 16 schools
- ACC: 17 schools
- Notre Dame: 1 independent
- Total: 68 schools

This does not add historical/all-time CFB players and does not grade players.

## Selection contract

The baseline deliberately mirrors the compact NFL Wheel shape:

- QB: 1 baseline selection
- RB: 2–3
- WR: 3–4
- TE: 1–2 tracked for Flex curation
- Flex: 4
- Front Seven: 5–6
- Secondary: 5–6
- Head Coach: 1

Ourlads' current 2026 depth charts own football structure and starter/depth ordering. ESPN's current team roster payload is used to normalize matching player display names and supply current head-coach metadata. Raw ESPN roster row order never determines Wheel priority.

When a current Ourlads depth-chart player is not present uniquely in ESPN's payload, the player is retained rather than silently deleted and the mismatch is recorded in `reconciliationWarnings`. The checked-in Step 2 artifact contains 152 such warnings across 68 schools.

The Vanderbilt RB case is the reason this is explicit: Ourlads listed Sedrick Alexander and Makhilyn Young, while ESPN's roster payload omitted Young even though Vanderbilt's official 2026 roster and 2026 player page still listed him.

## Runtime safety

This artifact is **not launch authority**.

`WHEEL_FOOTBALL_CFB_BASELINE_LAUNCH_READY` is hard-coded to `false`. Step 3 must manually audit every school conference-by-conference for football importance, reorder or replace edge cases, and resolve the source warnings before CFB Wheel runtime consumes these priorities.

## Files

- Canonical 68-school scope: `src/features/back-room/footballCfbCurrentSchoolScope.ts`
- Generator: `scripts/generate-wheel-cfb-ourlads-priorities.mjs`
- Generated baseline: `data/generated/football/cfb/wheel-football-current-priorities-2026.json`
- Typed baseline module: `src/features/back-room/wheelFootballCfbPriority.ts`
- Contract tests: `src/features/back-room/wheelFootballCfbPriority.test.ts`
