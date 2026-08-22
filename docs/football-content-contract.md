# Football Content Contract

This document is the implementation-facing companion to `docs/football-games-roadmap.md` for Football content ownership and rating-band rules.

## One truth per question

Football content is split into three truth classes:

- **Factual** — objective facts and derived metrics. The future canonical factual owner answers what happened and powers objective games such as Hit the Number and Find the Leader.
- **Comparative** — versioned, category-specific ratings. The existing Football comparison owner answers how great comparable subjects were and powers Blind Rank 5, Keep 4 / Cut 4, and comparative Blind Resume judgments.
- **Subjective** — calibrated opinion. Wavelength-style concepts such as uniform quality, atmosphere, aura, rivalry hatred, or fanbase insanity are not objective comparison truths.

Never silently substitute one class for another.

## Comparison rating bands

Football comparison ratings use one absolute six-band standard:

| Band | Rating |
| --- | ---: |
| Elite | 92–100 |
| Great | 82–<92 |
| Good | 70–<82 |
| Average | 55–<70 |
| Below average | 35–<55 |
| Bad | 0–<35 |

The bands do not make unlike questions comparable. A 96 NFL quarterback career and a 96 college program are both elite inside their own contracts; the scores do not assert that those two subjects can be directly compared.

## Versioned comparison contracts

Every comparison pack must declare a methodology version and a precise question/scope before its ratings are treated as mature.

Current contracts:

- `nfl-qb-career-v1`
- `nfl-rb-career-v1`
- `nfl-head-coach-career-v1`
- `cfb-qb-career-v1`
- `cfb-program-since-2000-v1`
- `cfb-team-season-v1`

Current legacy-authored ratings are intentionally marked `legacy-authored-pending-review`. That status must remain until the relevant depth PR has completed factual-resume review, era/context review, whole-pool calibration, and pairwise sanity checks. Do not relabel a pack `reviewed` merely because its ordering looks reasonable.

## Canonical ownership

`src/features/back-room/footballRankFiveModel.ts` remains the current canonical Football comparison-rating owner. `src/features/back-room/footballContentContract.ts` defines the contract/rating-band rules consumed by that owner and its games; it is not a second ratings provider.

Keep 4 / Cut 4 continues to derive its packs from the Blind Rank comparison owner. Do not create game-specific rating copies.

The factual owner does not exist yet. It is intentionally deferred to the roadmap's factual-foundation PR. Until then, do not create temporary game-specific factual providers that would compete with that future owner.
