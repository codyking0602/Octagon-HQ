# Historical Rankings Parity Contract

_Last approved: 2026-07-22. Reclassified as historical evidence: 2026-07-30._

## Purpose

This contract records the one-time migration proof for the original 80-fighter V1 production ranking projection. It is retained to detect accidental calculation drift in those migrated fighters.

It does **not** own the current Octagon HQ roster, fighter count, scoring contract, ranks, OVRs, profiles, or export validation.

## Sealed reference

- Historical repository: `codyking0602/ufc-goat-rankings`
- Historical commit: `842ba06ea09c4f40723226f4c4dfd35041cb3314`
- Captured projection: `UFC_CALCULATED_RANKING_PROJECTION`
- Historical output fixture: `src/features/rankings/engine/__fixtures__/v1-production-output-842ba06e.json`
- Historical input seed: `src/features/rankings/data/generated/canonical-ranking-inputs-842ba06e.json`

These files are immutable migration evidence. The retired capture script and workflow must not be restored.

## Current V2 ownership

Current ranking behavior is owned by:

- `src/features/rankings/data/v2RankingRoster.ts` — post-migration additions and reviewed replacements;
- `src/features/rankings/data/rankingInputs.ts` — one composed and validated live roster;
- `src/features/rankings/engine/rankingContract.ts` — runtime scoring and OVR contract;
- `src/features/rankings/engine/categoryCalculators.ts` — category calculations;
- `src/features/rankings/engine/rankingEngine.ts` — totals, ordering, ranks, and OVRs;
- `src/features/rankings/rankingModel.ts` — app-facing calculated projection.

## Regression requirements

For every fighter in the historical fixture, V2 must continue to preserve the approved:

- category calculations;
- Peak Apex, loss-context, and era-depth modifiers;
- weighted contributions and final total;
- visible-stat projection;
- locked factual exceptions such as Jones/Hamill and Volkanovski/Islam.

Future fighter additions may change absolute ranks and OVR placement by entering the calculated board. They do not need to be inserted into the historical fixture, and the live fighter count must never be constrained to 80/65/15.

## Change rules

An intentional scoring-philosophy change must be:

1. isolated;
2. documented with affected fighters and fields;
3. approved by Cody;
4. implemented in the existing V2 owner;
5. covered by focused tests.

Do not rewrite the historical fixture to make a new result appear to have existed in V1.
