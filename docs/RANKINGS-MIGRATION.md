# Octagon HQ — Ranking Ownership

_Last updated: 2026-07-30_

## Current status

The V1-to-V2 calculation migration is closed. Octagon HQ V2 now owns the live UFC ranking roster, scoring contract, calculated boards, fighter profiles, local assets, sharing data, games, What's New synchronization, and Octagon Verdict export.

V1 is not a runtime source, roster provider, build dependency, or regeneration path.

## Live V2 owners

1. `src/features/rankings/data/generated/canonical-ranking-inputs-842ba06e.json`
   - sealed historical migration seed for the original 80 fighters;
   - retained only as auditable provenance;
   - never regenerated or read from the V1 repository again.
2. `src/features/rankings/data/v2RankingRoster.ts`
   - one V2-owned overlay for every post-migration fighter addition and reviewed replacement;
   - owns additions, replacements, era membership changes, model date, and source-version labels.
3. `src/features/rankings/data/rankingInputs.ts`
   - composes the sealed seed and the V2 overlay;
   - derives fighter, men's, and women's counts from the live roster;
   - validates unique names/slugs, complete prime windows, calculation ownership, and era coverage.
4. `src/features/rankings/engine/rankingContract.ts`
   - V2 runtime owner of category weights, OVR curve, anchors, and the Jon Jones 99 benchmark.
5. `src/features/rankings/engine/categoryCalculators.ts`
   - pure category and modifier calculations.
6. `src/features/rankings/engine/rankingEngine.ts`
   - totals, tie breakers, ranks, and OVR projection.
7. `src/features/rankings/rankingModel.ts`
   - one app-facing calculated projection and fighter-profile lookup owner.

Ranks, totals, category scores, and OVRs must never be entered manually.

## Historical parity evidence

The following files are frozen regression evidence, not live owners:

- `src/features/rankings/engine/__fixtures__/v1-production-output-842ba06e.json`;
- `src/features/rankings/engine/parityFixture.ts`;
- `docs/rankings-parity-contract.md`.

They prove that the original 80 migrated fighters retained their audited calculations. Future fighters are not required to exist in the historical fixture, and their addition must not require editing that fixture.

The retired V1 capture script and GitHub Actions workflow have been deleted. No workflow may clone or execute the V1 repository to build current ranking inputs.

## Adding a fighter

Every new ranked fighter must be one narrow reviewed change through `v2RankingRoster.ts` and the existing owners.

Required inputs:

- canonical UFC fight ledger and identity;
- prime-window start and end behavior;
- championship judgments;
- opponent-quality judgments;
- Peak Apex judgments;
- era and division-depth inputs;
- presentation copy, Watch Moment, and Signature Fight;
- era-filter membership;
- local thumbnail and profile WebPs.

Required proof:

- schema and completeness validation;
- calculated ranking and profile route;
- local asset validation;
- Rankings, division/category, search, and game-pool compatibility;
- Octagon Verdict export and direct-matchup reconciliation;
- What's New recognition from the deployed canonical model;
- exact-head typecheck, full test suite, and production build.

Do not create a second roster, static ranking array, fallback score, manual OVR, duplicate profile record, or alternate exporter input.

## Dynamic roster rules

- Fighter counts are derived from the canonical composed roster.
- Asset and exporter tests reconcile against those derived counts.
- The original 80/65/15 counts describe only the sealed migration baseline.
- Jon Jones remains the approved 99 OVR benchmark unless Cody changes the ranking philosophy.
- The scoring contract remains V2-owned even though its initial values were proven against historical parity evidence.

## Rankings and profile behavior

- `/fighters/:slug` remains the canonical fighter URL.
- Rankings, Home, profiles, games, Intelligence prompts, rich previews, What's New, and the exporter consume the calculated model.
- Compare and Ask Why are Intelligence/Octagon Verdict handoffs, not duplicate comparison engines.
- Head-to-head results are context only and never override the higher calculated UFC-only score.

## Octagon Verdict

Canonical owners remain:

- `src/features/intelligence/octagonVerdictExport.ts`;
- `scripts/export-octagon-verdict.mjs`;
- `.github/workflows/export-octagon-verdict.yml`;
- `docs/octagon-verdict-export.md`.

The exporter validates the live derived fighter count. Generated artifacts are outputs and the Custom GPT knowledge upload remains manual.

## Stop rules

- Do not restore the V1 capture workflow or script.
- Do not fetch current ranking data from V1.
- Do not recreate `rankingData.ts`.
- Do not hard-code the current fighter count into runtime or export validation.
- Do not manually reorder fighters or enter calculated values.
- Do not create duplicate calculation, roster, profile, comparison, asset, or export owners.
- Do not commit generated Octagon Verdict artifacts as source data.
