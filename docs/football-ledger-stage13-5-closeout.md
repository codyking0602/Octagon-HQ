# Football Knowledge Ledger — Stage 13.5 Closeout

Last reviewed: 2026-08-28

## Status

**COMPLETE. Stage 14 is now unblocked.**

Stage 13.5 was the recognition-completeness and factual-readiness repair gate between the completed Stage 13 factual universe and Stage 14 ranking philosophy. Its purpose was to prove that the canonical A/B/C universe was not merely internally self-consistent, mature the bounded subject families that were still shallow, and leave a durable post-gate census before ranking logic could consume the universe.

The canonical ownership model did not change:

- `src/features/back-room/footballSubjectRegistry.ts` remains the identity/query owner.
- `src/features/back-room/footballFactualStats.ts` remains the public factual owner.
- `src/features/back-room/footballLedgerAudit.ts` owns the final post-gate census and factual-readiness review.
- `data/generated/football/factual-coverage-matrix.json` remains a source-projection audit artifact; it is not the final canonical readiness census.

## Completion result

The durable generated review is `docs/football-ledger-stage13-5-review.md` and is now freshness-checked in CI.

Final Stage 13.5 census:

- **3,890** canonical A/B/C subjects.
- **0** independent omission candidates.
- **0** historical tier violations.
- **316** CFB player seasons, all fact-ready for the season-level contract.
- **71** reviewed CFB Program Eras.

Partial factual readiness is intentional where trustworthy facts are unavailable. Recognition decides whether a subject belongs in the canonical universe; factual coverage decides whether that subject is eligible for a specific game. Unknown values are never converted into fake zeroes or ranking-friendly defaults.

## What Stage 13.5 repaired

1. **Era dating and historical policy** — removed accidental dated-subject `Unknown` era leakage while preserving the historical A/B/C policy.
2. **Independent recognition completeness** — major recognition evidence families were dispositioned explicitly into A/B/C/D rather than treating the existing canonical universe as proof of its own completeness.
3. **Player-season maturity** — CFB player seasons became a permanent multi-position universe rather than a tiny Find the Leader specialty pool. Tier C remains the primary modern variety layer.
4. **Program Era maturity** — CFB Program Eras expanded to 71 reviewed eras. A coaching tenure is the default natural boundary; Mack Brown/Texas and Bob Stoops/Oklahoma are the only reviewed same-coach split exceptions. Nick Saban/Alabama, Dabo Swinney/Clemson, Kirby Smart/Georgia, and Jim Harbaugh/Michigan remain unified coaching eras.
5. **Durable factual-readiness audit** — the canonical human-review artifact is checked into the repository and CI now fails if regeneration would change or remove it.

## Stage 14 handoff

Stage 14 may now begin **Ranking Philosophy + Scoring Architecture**.

It must consume the completed canonical universe rather than reopening membership through a ranking-specific roster. Ranking work may define stable greatness semantics, anchored/versioned scoring, position and era adjustment, missing-data confidence, and calibration, but it must not:

- create a second candidate-membership authority;
- use legacy rating inventory as membership;
- fabricate missing facts;
- silently reweight sparse subjects into fake precision;
- tie a subject's score to the size of the current candidate pool.

The existing `footballComparisonAuthority.ts` remains the shared comparison owner unless a dedicated migration explicitly changes that ownership.

## Release proof

The final Stage 13.5 artifact-hygiene PR was #741. Its exact head `5bb4f6285394bd0691148f9234fea237f40618fb` passed typecheck, production build, all eight full-suite test shards, Today’s Challenge phone-layout validation, the aggregate Validate V2 gate, and the Octagon Verdict export before merge.

PR #741 merged to `main` as `0c36a85c5881c373af4f72dd42bbacecfcc6dfea`.
