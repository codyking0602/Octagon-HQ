# NBA GM — 150-team-season historical calibration, first measured layer

**Status: completed regular-season efficiency/wins cohort; NOT a certified NBA GM roster-fit or player-skill model.**  
**Collected:** October 30, 2026. **Five real NBA seasons, not five game seasons.** The playable game is still three seasons.

## Immutable source and data checks

Dataset: [150 team-season efficiency records](./nba-gm-150-team-season-efficiency-2022-2026.csv).

Every NBA franchise appears once per season across 2021–22 to 2025–26: **30 teams × 5 seasons = 150**. Each season has **1,230 aggregate team wins** and **1,230 losses**. Fields: season ending year, current NBA team abbreviation, W/L, unadjusted points per 100 possessions on offense and defense, and the arithmetic net rating from the displayed rounded rates. The derived net rating can differ by 0.01 from the source's original net-rating column because the source calculates from unrounded inputs. **Do not substitute this derived value for the original adjusted net rating.**

Primary source for each season (Basketball-Reference, team-rating tables):
- 2021–22: https://www.basketball-reference.com/leagues/NBA_2022_ratings.html
- 2022–23: https://www.basketball-reference.com/leagues/NBA_2023_ratings.html
- 2023–24: https://www.basketball-reference.com/leagues/NBA_2024_ratings.html
- 2024–25: https://www.basketball-reference.com/leagues/NBA_2025_ratings.html
- 2025–26: https://www.basketball-reference.com/leagues/NBA_2026_ratings.html

Source checks: 2023 Denver 53 W, 117.61 ORtg, 114.31 DRtg; 2024 Boston 64 W, 123.35 ORtg, 111.73 DRtg; 2025 OKC 68 W, 120.33 ORtg, 107.61 DRtg; 2026 Knicks 53 W, 119.87 ORtg, 113.40 DRtg. Cross-check title winners with https://www.nba.com/news/history-nba-champions .

## Measured benchmark: team net efficiency → regular-season wins

For each test season, fit **ordinary least squares, W = intercept + slope × net rating**, using only earlier seasons. Net rating is the difference of observed offensive and defensive ratings **within the test season**. We are **not** claiming to forecast an entire future season from preseason rosters; this specifically calibrates *a win-conversion layer conditional on already known team efficiency*. Baseline predicts 41 wins for every team.

| Held-out season | Prior team-seasons | Fitted win slope / net-rating point | MAE, wins | RMSE, wins | 41-win baseline RMSE |
| --- | ---: | ---: | ---: | ---: | ---: |
| 2022–23 | 30 | 2.2324 | 2.352 | 2.995 | 9.856 |
| 2023–24 | 60 | 2.2934 | 2.275 | 2.771 | 13.186 |
| 2024–25 | 90 | 2.3143 | 2.029 | 2.559 | 13.130 |
| **2025–26 (last holdout)** | **120** | **2.2684** | **2.694** | **3.339** | **13.611** |

Last holdout model **W = 40.9983 + 2.2684 × observed unadjusted NRtg**. Evaluation uses unrounded model predictions; rounding is for display only.

Largest 2025–26 residuals: Charlotte **44 observed vs ~52 estimated**, Lakers **53 vs ~45**, Milwaukee **32 vs ~26**. These are valuable reality checks against an overly deterministic model. The relationship is descriptive/conditional; team quality, schedule, and late-season dynamics can differ substantially.

**What this measurement supports:** a linear net-rating-to-wins reference curve, with roughly 2.3 additional wins per +1 point of observed net efficiency in this five-season window, and meaningful scatter around that curve. It does **not** support any specific coefficient converting an NBA GM player's six skill grades into ORtg, DRtg, player development, or chemistry.

## Explicit unfinished calibration work

1. Add source-verified, season-relative shooting / eFG%, turnovers, offensive/defensive rebounding, free throw rate and 3PA share for all 150 records, with missingness checks and provenance; use the same convention across seasons.
2. Add minutes-weighted historical rotations with position availability, injury-adjusted minutes, ball-handling load, and contemporaneous skill measures. **The current 330-player 2026 board cannot serve as historical 2022–26 player-grade measurements; using it unchanged introduces look-ahead bias.**
3. Fit separate offensive and defensive efficiency models on seasons 2022–25, reserving 2025–26, comparing individual talent-only, components-only and complementarity/interaction models. Use season-relative offensive and defensive baselines, regularization, feature checks, and inspect errors on noncontenders as well as champions.
4. Add separately tested postseason series simulation, bracket structure, variation, and matchup response; the regular-season win baseline does not estimate championship odds.
5. Before translating coefficients to the game, verify that top-heavy creation, shooting-plus-creation, rim protection, perimeter defense and bench balance each behave plausibly without double-counting an overall grade and its component skills; use only scientifically justified signs/magnitudes.
6. Include development/decline only with independently verified age and longitudinal ability evidence, not artificial guesses tied to IDs.

**Product decision:** retain the current explicitly provisional **owner-only** simulation and qualitative post-Season-1 report until the missing player/lineup model is independently validated. Do not advertise scientifically calibrated chemistry or publish NBA GM based solely on this win mapping.
