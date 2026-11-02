# NBA GM V6 — independent offense/defense and historical team grades (November 1, 2026)

**Status:** Private / owner-only. Implemented on new franchises only. No NFL GM, salary, contracts, existing run snapshots or 90/3/7 end-score changes.

## Why V5 needed correction

V5 awarded 62% of a player's overall-derived impact to offense and 38% to defense. Thus a Luka Dončić 97 overall could receive positive defensive value even with a 70 perimeter-defense skill. The issue was the *simulation model*, not the underlying NBA player ratings. Further, `78 + offensive impact` and `78 + defensive impact` were arbitrary UI scales, not historical team grades.

## V6 mechanics

- Player offense comes **only** from 40% Scoring, 30% Shooting, 30% Playmaking, centered at 75 and scaled by 0.45; bounded to −5..+8 per roster player before playing-time weighting.
- Player defense comes **only** from the appropriate role's Perimeter Defense, Interior Defense and Rebounding, centered at 74.5 and scaled by 0.23; bounded to −4..+6.5 per player before minute weights. **No portion of overall talent automatically becomes defense.** A *year-to-year change* in development affects both indices, not the original overall score.
- Minutes remain five starters × 0.63 and two backups × 0.50, with the unrepresented 0.85 share charged at −1.70 net. Defensive impact saturates at +6.25 for a seven-player rotation, reflecting diminishing returns and the roughly +7 best observed season-relative defense in five years, rather than stacking unbounded elite stops.
- Existing fit bonuses (maximum ±1) and seeded win regression remain. Win mapping is 40.9983 + 2.2684 × modeled net impact plus bounded variance. This fits historical *team net→wins*, **not a scientific fit of fictional player skills→NBA outcomes**.
- OFF and DEF **team grades**, 60–99, are historical percentile scores. For each of the 150 actual teams (2021–22 through 2025–26), center its real offensive/defensive rating against its own season's league average. Compare the new simulated OFF/DEF effects against those two season-adjusted populations. Larger always means better, including defense. 60 is bottom of historical range, about 80 is median, 95+ is elite relative to the last five years. These aren't NBA offensive/defensive ratings, and they are not independently calibrated possession-efficiency predictions.

## Owner benchmark (current seven players)

Luka Dončić · Kon Knueppel · Ace Bailey · LeBron James · Victor Wembanyama · Jamal Shead · Deni Avdija.

Independent skill calculations (static year-one roster, before development): elite 95+ offense, strong but not artificially stellar defense. Record is still simulated, and a 66–16 championship is a plausible upper-end seed, not the automatic result. Wembanyama's 99 interior defense provides the largest rim-protection contribution, while Luka's defense is based on his actual perimeter/rebounding traits, not 97 overall.

## Regression and safeguards

- Transactional backend test covers 480 deterministic V6 team-seasons over the owner roster and three calibrated peers, with 82-game totals, title variance and historical grades.
- Mutate Luka's *overall only* inside a rolled-back test transaction: Year 1 side metrics must not change. Lower his perimeter-defense skill alone: defense must drop, offense must not change.
- Full saved-V5 direct/router equality and V6 opt-in gates. New franchises use `simulationModelVersion=6`. Old saves retain V5 and their recorded 66–16 championship.
- Final screen and Year 1 screen use `OFFENSE GRADE / DEFENSE GRADE` and `GRD` only for V6; old saves keep legacy labels.

**Limitations:** The five-year team benchmarks and observed net→wins model are empirical. The player six-skill-to-impact coefficients, defensive saturation, and playoff-game logistic are authorial approximations. Predictive certification would require year-matched player on/off or box-plus-minus observations, rotation minutes, injuries and a held-out fit. This V6 improves integrity; it does not establish a historically validated forecast.
