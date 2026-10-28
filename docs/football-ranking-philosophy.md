# Football Ranking Philosophy + Scoring Architecture

Last reviewed: 2026-08-28

## Purpose

Stage 14 defines the shared meaning and stability rules for Football comparative ratings before NFL- and CFB-specific models are tuned in Stages 15 and 16.

`src/features/back-room/footballComparisonAuthority.ts` remains the single comparison/ranking owner. Candidate membership still starts from the canonical Football subject query. This framework changes how qualified non-reviewed subjects are evaluated; it does not create a ranking roster, second factual owner, or alternate game path.

The implementation contract is versioned as `stage14-v1` in `src/features/back-room/footballRankingFramework.ts`.

## What a rating means

A Football rating answers one explicit comparison question. It is not recognizability, popularity, fantasy value, current ability, or a universal statement that every kind of football subject can be placed on one undifferentiated ladder.

The supported semantics are intentionally separate:

- **Career greatness** — the quality of a player's full career inside the requested league/position scope. Peak and sustained excellence matter most; longevity is valuable but cannot turn merely lasting a long time into greatness.
- **Single-season greatness** — the quality of one bounded player season. Career reputation outside that season contributes zero.
- **Coach greatness** — coaching achievement across the relevant career scope: peak teams, sustained contention, championships/postseason results, longevity/adaptability, and contextual program/franchise elevation where defensible.
- **Program/franchise greatness** — organizational achievement across the explicitly defined time scope. It is not the same question as best single team or best dynasty.
- **Bounded-era greatness** — the strength of one explicitly bounded program/franchise era. Only seasons inside the era count.
- **Team-season greatness** — the quality and accomplishment of one team in one season. Later reputation and accomplishments outside that season contribute zero.

## Shared greatness dimensions

Every league/position model maps its evidence into a common set of dimensions:

1. **Peak** — how dominant the subject was at its best.
2. **Sustained excellence** — how long high-level performance was maintained inside the comparison scope.
3. **Longevity tail** — additional durable value after the core peak, without treating raw duration as elite performance.
4. **Honors** — major awards and consensus recognition appropriate to the league/position.
5. **Postseason / team accomplishment** — championship and postseason value where the comparison question legitimately includes it.
6. **Contextual strength** — era, position, competition, efficiency, schedule/opponent, inherited situation, or similar context when the underlying evidence can support it.

These dimensions prevent one raw production average from quietly standing in for every definition of greatness. Stage 15 and Stage 16 own the final metric-to-dimension mappings and within-dimension weights for NFL and CFB models.

Existing reviewed rubrics in `footballContentContract.ts` remain calibration/philosophy evidence for their matching categories. They are not a second scoring engine and do not control candidate membership.

## Stable, anchored scoring

A data-derived rating must not change merely because a new eligible subject is added to the canonical database.

Therefore Stage 14 removes current-candidate-pool percentile scoring. Metric values are evaluated against a fixed calibration series associated with the ranking version. In `stage14-v1`, the existing reviewed Rank Five identities provide that fixed calibration set for the current comparison categories.

Important distinction:

- reviewed identities may provide calibration anchors and exact reviewed overrides;
- reviewed identities do **not** decide who is eligible to be ranked;
- canonical A/B/C query results remain the candidate source;
- expanding the candidate pool does not rewrite the fixed calibration series.

The shared semantic dimensions and the category score profile are deliberately separate. The semantic contract says what a complete greatness case should contain and therefore owns coverage/confidence. The score profile says how the currently available, calibrated factual signals contribute to the transitional rating. In `stage14-v1`, that score profile is the existing metric contract already owned by `footballComparisonAuthority.ts`; Stage 15 and Stage 16 replace/tune those league- and position-specific profiles rather than creating another scoring owner.

Changing anchors, scale semantics, or material scoring behavior requires a ranking-version change and Stage 17 calibration/stability review.

## Rating scale

The shared framework emits a fixed 35–99 data-derived rating scale. Existing reviewed ratings may retain their reviewed value.

The product's existing presentation bands remain authoritative:

- 92+ — elite
- 82–91 — great
- 70–81 — good
- 55–69 — average
- 35–54 — below average
- below 35 — bad

The Stage 14 scale is architecture, not final NFL/CFB calibration. Stage 15/16 tune the models; Stage 17 audits distributions and pairwise anchors before the version is considered fully calibrated for broad game use.

## Missing data and confidence

Missing facts are not zeroes and are not silently redistributed into the metrics that happen to exist.

For each semantic contract:

- every greatness dimension has an explicit share of the complete semantic case;
- **coverage** is the share of semantic dimension weight supported by usable evidence;
- **confidence** combines semantic coverage with the reliability/confidence of the evidence actually used;
- results below the semantic minimum coverage are marked `low-confidence` rather than presented as equally precise;
- a metric without a usable fixed calibration series does not pretend to supply calibrated ranking evidence.

For the category score profile:

- every expected factual signal keeps its explicit model weight;
- a missing or uncalibratable score-profile signal contributes a neutral score rather than donating its weight to the remaining signals;
- score-profile weighting does not make an uncovered semantic dimension disappear from coverage/confidence.

This separation prevents two opposite errors: sparse evidence cannot gain fake certainty by reweighting itself to 100%, and an intentionally incomplete transitional model does not have its useful rating spread flattened merely because Stage 15/16 have not yet supplied every final greatness dimension.

Stage 14 deliberately records low-confidence results instead of fabricating facts. Stage 18 game integration may choose stricter eligibility thresholds once the Stage 15/16 models are complete.

## Era and position adjustment

Raw totals are not automatically comparable across eras or positions.

Fixed calibration is therefore position-relative whenever a comparison category spans multiple positions and the reviewed calibration set contains at least two anchors for that position/metric. If a position does not have enough fixed anchors, the same versioned category-wide calibration series is used as the explicit fallback. This remains independent of the current candidate pool.

The framework also exposes an explicit bounded context-adjustment hook. Era- or position-relative adjustments must be supplied by a reviewed NFL/CFB model from reproducible evidence; they are never inferred from the current candidate pool and never from recognizability tier.

The adjustment hook is intentionally bounded so context can correct comparability without becoming an uncontrolled subjective override. Stage 15 and Stage 16 own the final position/era model inputs.

## Recognizability is not greatness

A/B/C/D recognizability decides product eligibility. It contributes **zero** to ranking score.

A famous player does not receive ranking points for being famous. A Tier C subject with sufficient objective evidence may grade above a Tier A subject. Tier D remains outside normal casual membership unless a future deep feature explicitly requests it, but D is still not a negative scoring input.

## Reviewed ratings

Reviewed legacy Rank Five ratings remain legitimate expert calibration/override evidence for matching canonical identities.

They are allowed to:

- anchor the versioned scale;
- preserve an exact reviewed rating for a matching identity;
- provide pairwise sanity evidence.

They are not allowed to:

- define the candidate universe;
- exclude an otherwise qualified canonical subject;
- substitute for missing objective facts on a different identity;
- make the rating of a non-reviewed subject depend on which reviewed rows a caller happened to pass into a game.

## Stage boundaries

Stage 14 owns the common architecture only.

- **Stage 15** implements NFL position/category models, including defensive position-relative evaluation and NFL season/coach/team semantics.
- **Stage 16** implements CFB player, coach, program, era, and team-season models with zero NFL-career contribution to college greatness.
- **Stage 17** performs calibration, pairwise anchors, distribution/era/position bias checks, weight perturbation, and locks the versioned scale.
- **Stage 18** moves all comparison games from transitional/migration-grade evaluation onto the fully calibrated models.

Until those stages are complete, `stage14-v1` should be understood as a stable architecture and transitional data-derived scoring path, not a claim that every category's final football judgment has already been tuned.
