# NBA GM V10 — Seven-Player Team Strength Calibration
2026-11-04. Owner-directed recalibration; **no game contract or salary cap changes**.

## Source of truth and limitations
- Production private `nba_gm_dev_players`: 330 players across 30 teams, with current editorial team bindings, six graded skills, and primary/secondary positions.
- Production private `nba_gm_contract_candidates_2026_27`: per-player **game signed-contract average** (`provisional_average_salary`). This comparison does **not** change the deliberate game-specific 1YR/3YR contract format or repricing. The **101** rows with two signed seasons that the game deliberately treats as `1YR` remain unchanged.
- Historical `private.nba_gm_v5_historical_teams` / `docs/nba-gm-150-team-season-efficiency-2022-2026.csv`: 150 real team-seasons, 2022–2026, used for the net-rating-to-wins and displayed OVR anchors. The descriptive postseason odds curve is borrowed from Football GM and uses the historical NBA cohort for simulated opponent draws; it is **not** fitted to the 150 NBA outcomes. These observations do *not* by themselves estimate the coefficients translating a seven-player skills mix into real team efficiency.
- Each team's seven highest-overall active players were selected within the 330-person game catalog. Ten raw top sevens were not position-legal for HQ's PG/SG/SF/PF/C/GUARD/BIG roles. A supplementary model check searched legal seven-player combinations among the highest nine per team; 29 teams had at least one valid combination. Do not present this as a complete real-life 15-player roster study or a retrospective player-season regression.
- Production run (Nov 4): Luka, Brunson, Dunn, Avdija, Gobert, Spencer, Leonard Miller. Initial draft 43–39, 84 OVR, 5.2% title odds. Drafted Year 2 roster exceeded the in-game $155M hard cap after *intentional* game repricing. Subsequent changes dropped team strength. This economy scenario is retained as designed.

## Current top-seven signed-average payroll, all 30 teams
Millions of dollars. The salary total here is the real-contract **signed window average used in HQ**, not the market value of an eventual free-agent extension or a claim that a seven-player NBA team must obey the real soft cap.

| Team | Top-7 $M | Team | Top-7 $M | Team | Top-7 $M |
|---|---:|---|---:|---|---:|
| Oklahoma City | 213.48 | New York | 212.57 | Cleveland | 211.15 |
| Denver | 201.25 | Minnesota | 200.74 | Boston | 200.18 |
| Toronto | 199.83 | Golden State | 197.61 | Orlando | 196.16 |
| Philadelphia | 193.03 | Indiana | 188.43 | Houston | 187.05 |
| Sacramento | 181.91 | Miami | 179.05 | Phoenix | 172.41 |
| San Antonio | 172.14 | LA Lakers | 169.55 | Washington | 157.43 |
| Detroit | 156.91 | Utah | 156.47 | Portland | 155.54 |
| New Orleans | 152.15 | Atlanta | 134.52 | LA Clippers | 130.53 |
| Dallas | 129.60 | Brooklyn | 118.51 | Charlotte | 114.47 |
| Milwaukee | 107.88 | Chicago | 92.21 | Memphis | 78.84 |

Across 30 teams: mean **$165.39M**, median **$172.27M**, P25 $138.93M, P75 $197.25M, maximum $213.48M (Oklahoma City), minimum $78.84M (Memphis). Number of top-sevens affordable by a pure hard cap: $155M: **9/30**; $165M: **13/30**; $175M: **16/30**; $185M: **18/30**; $195M: **21/30**. Actual Year-1 signed salary totals are a different metric (median $162.35M). The $155M HQ cap is unchanged in this PR. A later cap decision should examine **legal, draftable** seven-player lineups and 1YR/3YR future exposure, not simply adopt the real NBA soft cap.

## Root cause: two additive penalties double-charge the complete seven-player roster
The V9 skill bridge already computes independent offensive and defensive impacts for every member, respecting role-specific defense, a lower bench weight, six individual skills, and bounded shot creation / floor spacing / perimeter + rim protection.

However, after those independent impacts V9 further charges:

1. **−1.70 net points** for "unrepresented 0.85 court-minute share at replacement level." HQ does not manage an eighth through fifteenth player: the seven draft choices constitute the entire playable rotation. The unrepresented-minutes penalty misfits that format.
2. **Up to −2.20 defensive net points** for the two lowest individual *starting defenders*, **in addition to** the negative defensive impact those same players have already received based on their perimeter defense, interior defense, and rebounding. This was saturated at 2.2 points for almost every tested real seven-player core, so it was functioning as a flat tax rather than meaningfully discriminating roster quality.

These add up to nearly **−3.90** net points for common team compositions, corresponding to approximately **8.8 wins** under the existing 2.2684-wins-per-net-point historical calibration. The existing 150-team observed net-rating-to-win anchors are not the root problem.

## Exact same-player comparisons, V9 vs proposed V10
Year 1 fixed roster and seed; only these two deductions removed. Odds are the established NFL-style V7 descriptive championship curve, not actual NBA season predictions. Each result is a seven-person video game team, not a 2022–2026 NBA historical roster.

| Team / case | V9 OVR | V9 title | V10 OVR | V10 title |
|---|---:|---:|---:|---:|
| Original owner Luka + Brunson + Avdija + Gobert | 84 | 5.2% | 91 | 21.7% |
| Oklahoma City legal top seven from top nine | 92 | 24.6% | 97 | 48.0% |
| Houston highest-overall legal seven | 88 | 12.4% | 93 | 33.1% |
| Golden State highest-overall legal seven | 88 | 12.1% | 94 | 35.1% |
| New York legal top seven from top nine | 87 | 11.0% | 93 | 33.0% |
| San Antonio highest-overall legal seven | 84 | 4.5% | 91 | 20.5% |
| Denver highest-overall legal seven | 82 | 2.0% | 89 | 14.9% |
| Latest owner's after-trade seven at Year-1 grades | 80 | 0.8% | 86 | 8.9% |

A true downside still exists: 80ish real-team cores with weak two-way skills remain non-contenders, as do understaffed/low-value rotations. Good team construction produces credible 15–35% contenders without guaranteeing a 40% outcome. Elite combinations still respect the 49.6% ceiling of the existing odds curve.

## Change and rollout
- Copy authoritative V9 simulator to an opt-in **simulationModelVersion 10** for newly created franchises.
- Remove only the −1.70 extra unrepresented-minutes tax and the extra double-counted weakest-two-defender penalty.
- Retain all six-skill offensive/defensive terms, positional weights, fit, Year 2/3 developed starter optimizer, seeded wins and best-of-seven games, five-year historical OVR/odds mapping, and 90% team/3% record/7% playoffs final scoring.
- **No contract rules, repricing, cap, draft pool, player ratings, trade economics, or previous completed runs change.**
- Verify through versioned PostgreSQL regression on the latest migration set, original-owner benchmark, five current legal NBA-team examples, previous V9 replay, source tests, and exact PR head CI. Deploy only after green verification.

## Remaining uncertainty
The full five-year historical evidence validates net-to-wins and historical team distributions, not the authored skills-to-net conversion. Future tests could use season-specific NBA player minutes and possession data to validate that bridge. 2026–27 game roster bindings are not 2022–2026 real roster rosters and cannot honestly be claimed as a perfect historical fit. V10 deliberately corrects the two evident duplicated game penalties while leaving the rest of the established architecture stable.
