# NBA GM Priority 2 — NBA-specific scouting / market-risk calibration

**October 31, 2026. Draft PR #2345. Owner-only; do not merge/deploy without separate authorization.**

## Authority, scope and ownership

- Source branch: `main` at `7c9b06e88da01426d9d6d0ded2d317a4edb2243c`, before any Priority 2 changes.
- 330 authored 2026 NBA players: `docs/nba-gm-330-six-skills-PROVISIONAL-2026-10-29.json`. Player-specific v4 progression: `data/curated/nba/gm-nba-development-profiles-2026-10-30.json`.
- Authoritative development outcomes and odds: private `nba_gm_v4_odds` and `nba_gm_v4_grade` in migration `202612310898`. Actual fictional salaries: `nba_gm_v3_salary`; seven-player three-season cap `$155M`. The offered contract terms, salary scale, player grade and trade restrictions are **not altered**.
- Priority 1 owns `NbaGmDevPage.tsx`, `NbaGmFinalExperience.tsx`, `nba-gm-dev.css`, portraits/logos. This branch changes none of those files.
- Provisional editorial game ratings are not official NBA ratings or observed team payrolls. No real salary contract claims are made.

## Tier review — all 330

The Football GM threshold mapping (94 / 89 / 83) was imported unchanged despite a materially different NBA 330-player grade population. NBA tiers are display decision aids; the authoritative grade continues to drive cap value, ability and simulated performance.

| Label | Old overall bands | Old count | New NBA bands | New count |
| --- | --- | ---: | --- | ---: |
| ELITE | 94+ | 10 | 94+ | 10 |
| IMPACT | 89–93 | 17 | 86–93 | 33 |
| STARTER | 83–88 | 39 | 79–85 | 125 |
| DEPTH | <83 | 264 | <79 | 162 |
| Total | | 330 | | 330 |

Depth is now 49.1% (was 80.0%). ELITE stays 3.0% and IMPACT is 10.0% of this deliberately top-heavy private 330-person selection. This is **not** a quota or a grade adjustment: source numeric ratings do not move. We evaluated each integer band and the named 78–89 players against existing NBA statistical/editorial evidence. A broadly applied `79` starter cutoff recognizes starter-capable rotation players; it does not assert that each such player starts all 82 games. Strong bench specialists can still be starter-caliber in this *seven-player draft*.

Evidence anchors and borderline spot checks:
- 2025–26 All-NBA First Team included Wembanyama (99), Jokić (98), Shai (98), Dončić (97) and Cade Cunningham (94); the 94 ELITE cutoff correctly keeps this classification exclusive rather than relaxing it further. Official NBA: https://pr.nba.com/2025-26-kia-all-nba-team/ .
- The 2025–26 All-NBA Third Team included Chet Holmgren (89), Jalen Johnson (90), Jamal Murray (90) and Jalen Duren (85). Chet, Jalen Johnson, and Murray are IMPACT. Duren remains a border-case STARTER rather than an ad hoc grade change based on one award; his existing player-specific evidence can support a separate full rating editorial audit. Official NBA: https://www.nba.com/news/2025-26-all-nba-teams-announced .
- OG Anunoby (87), Franz Wagner (86), Lauri Markkanen (86) and Cooper Flagg (87, 2025–26 Rookie of the Year) now appropriately read IMPACT, rather than merely STARTER. Official Rookie of the Year: https://pr.nba.com/voting-results-2025-26-nba-regular-season-awards/ .
- Derrick White (85) and Rudy Gobert (85) remain strong STARTER-caliber assets, and Dyson Daniels (81) now reads STARTER rather than DEPTH, despite specialist defense being especially valuable. All three made the 2025–26 All-Defensive teams; however, one elite defensive skill alone does not imply universal overall-star impact. Official: https://www.nba.com/news/history-all-defensive-team .
- Matas Buzelis, P.J. Washington and Tari Eason (79) now correctly avoid blanket DEPTH labeling. McConnell (79) is starter-capable but primarily a rotation specialist: an acknowledged subjective classification edge. Luke Kennard (78) remains DEPTH despite high shooting skill; the six separate skill grades continue to reveal the specialist's value.

No hidden team-by-team quota is imposed. Some weak/young/rotation-heavy teams have no IMPACT/ELITE players; that is preferable to forced inflation. All 30 teams retain exactly the underlying published people and positional constraints.

## Scouting signals and development authority

The five outlook labels remain mapped by `footballGmOutlookFromOdds` to the four `developmentOdds` returned from the server, with the BOOM/BUST branch checked before directional labels. Fresh `developmentModelVersion=2` franchises use player-specific `nba_gm_v4_odds` with age, career ceiling and actual resolved offseason grade. The same odds drive server `v4_grade` outcome selection.

`HIGH UPSIDE`, `RISING`, `STEADY`, `BOOM/BUST`, and `DECLINE RISK` are **projections**, not disclosures of the MD5-seeded actual improvement, breakouts or regression. Old V2/pre-profile V3 saves can lack odds; their preexisting age-based fallback is retained without changing saved-run version. After the end of Season 3, the UI no longer needs another developmental prediction. We do not create unverified birth dates for the 29 players without them.

## Reprice forecast — not a seeded outcome leak

Three-year contracts are always **SALARY LOCKED**. One-year contracts expose **LOW REPRICE**, **MED REPRICE**, or **HIGH REPRICE** via the new `nbaGmScoutRepriceProjection` / `nbaGmScoutRepriceLabel` exports.

For each 1YR player:

1. Read the **same identity-bound** server v4 `developmentOdds`, ceiling, annual gain/loss and `marketVariancePct` used by the private development + salary functions. Migration `202612310899` returns these parameters only through the existing owner-only catalog RPC as `developmentForecast`; no random seed or resolved future outcome is exposed.
2. Approximate mean development per outcome: breakout = `0.775 × min(maxAnnualGain, remainingCareerHeadroom)`, improved = `min(0.62×gain, 0.3+0.5×min(2.4,0.55×gain))`, steady = `0`, decline = `-(0.35+0.5×(maxAnnualLoss-0.35))`. These are deterministic integrations of the **existing server delta formulas**, not grade-only risk rules.
3. For each of the four development outcomes, model nine market outcomes across `[-marketVariancePct,+marketVariancePct]` (equal weights) using the server salary equation: `1.105^cumulativeGradeDelta × 1.065` for Year 2 and `1.105^cumulativeGradeDelta × 1.12` for Year 3, with the same lower/upper multipliers and $100k price rounding. This estimates the distribution, never evaluates a seeded roll.
4. The signal measures **expected positive dollar exposure** `E[max(projectedSalary−currentSalary,0)]`, relative exposure as a share of current salary, and probability of a price jump of at least 18%.
5. **HIGH** if expected upside exposure >=$3M, or jump probability >=36%, or (relative expected exposure >=18% and expected upside >=$1.1M). **MED** if not high and expected upside >=$850k, or jump probability >=15%, or relative exposure >=10%. Otherwise **LOW**. These are explicit **$155M-game-economy** thresholds, not reused Football GM dollars. The 18% outcome threshold and dollar thresholds are provisional gameplay sensitivity assumptions, not externally observed NBA repricing coefficients.

Forecast by current 330-person catalog (236 1YR; 94 3YR):

| Risk | Count |
| --- | ---: |
| HIGH REPRICE | 90 |
| MED REPRICE | 98 |
| LOW REPRICE | 48 |
| SALARY LOCKED | 94 |

Examples: Wembanyama HIGH (very large absolute dollar exposure even with a narrow ceiling), Luka HIGH, Cooper Flagg HIGH (young high-upside premium), LaMelo Ball HIGH, Dyson Daniels HIGH (positive upside path), OG Anunoby MED, De'Aaron Fox MED, Paul George LOW, and Kawhi Leonard / Stephen Curry / Joel Embiid SALARY LOCKED. These are *pre-outcome expectations*.

**Offseason semantics:** UI should pass the already-resolved **Year 2 grade** and use `season=2` to forecast the remaining Year 3 salary change; for `season=1`, use the pre-draft grade. The forecast never reads `salaries[2]` (the potentially already-seeded Year 3 outcome in an offseason catalog). Legacy save runs with missing v4 odds use only the frozen **pre-draft** fixture escalation as a conservative display fallback; this has lower confidence than a fresh-run forecast and does not alter their economics.

## Deterministic gameplay coverage and honesty about limits

- 330/330 identity-aligned grade and tier validations, 236 1YR + 94 3YR coverage, all four risk classes, and explicit seeded-future-salary nonleakage tests.
- 4,000 deterministic seven-team-spin **opportunity windows** sampled across all 30-team catalogs, deduplicating repeated teams: 8,365 ELITE player exposures, 28,098 IMPACT, 105,875 STARTER, 137,077 DEPTH. Elite is encountered in 94.1% of **unfiltered seven-wheel windows**. **Important:** This is an upper-bound opportunity analysis, not a statement about actual legal, position-compatible, cap-affordable draft choices.
- Existing `nbaGmDraftCompletion.test.ts` directly exercises 12 diverse V3 legal seven-player drafting strategies at the **$155M** three-year cap with distinct slots and a >$50M Year 1 payroll range. That suite remains part of NBA GM CI; it is more faithful to actual cap/role constraints than unfiltered availability.
- `nbaGmDevelopmentProfiles.test.ts` verifies 330 profiles, 301 verified ages + 29 gaps, probabilities summing to 100, model version routing, caps and ceiling behavior.
- Football GM cutoffs, Outlook helper and its tests are **untouched**. New code imports shared `footballGmOutlookFromOdds` only; all tier and market thresholds are NBA-specific.
- Pending or separate validation: live Supabase RPC runtime after approved deployment; player career trajectories are editorial assumptions rather than longitudinally fitted forecasting, and this audit does not certify the ultimate 2026–27 roster/contract accuracy.

## Priority 1 integration handoff (no UI conflicts)

1. In `NbaGmDevPage.tsx` import `nbaGmScoutRepriceLabel` from `./nbaGmScouting`.
2. In the existing `ScoutBadges` scope, **replace only** the generic string `player.gameContract==="3YR"?"SALARY LOCKED":"REPRICE RISK"` with `nbaGmScoutRepriceLabel(display,year===2?2:1)`. `display` already holds the resolved Year 2 grade when `run.phase==="offseason"`. The badge must use existing Football GM treatment for LOW/MED/HIGH/LOCKED; Priority 1 owns colors/layout.
3. No extra RPCs, state fields or JSX restructuring required. `nbaGmDevRepository.ts` accepts the optional field and old saved franchise payloads continue parsing.
4. Ensure the **additive catalog migration** runs before relying on fresh-run risk labels. Before it lands, old catalogs fall back to a salary-fixture prediction and are not authorized as full player-specific risk forecasts.
5. Do not cherry-pick a partially tested migration or override Priority 1 visual files. Combine via an integration branch and run the exact merged-head full suite before going live.

## Provisional flags

- Risk HIGH/MED thresholds and nine-market-point quadrature are deliberately *game-calibrated estimates*; measuring their real calibration requires many server-resolved franchises and can lead to later threshold refinements.
- Roster and ability grades are still editorial, not independently NBA-certified 2026–27 real-world rankings. A targeted Duren/85 and specialist-review queue remains open; no blanket regrading was done.
- Forecast does not tell the user whether the actual offseason roll will be favorable. The true outcome can diverge (including a large negative repricing).
