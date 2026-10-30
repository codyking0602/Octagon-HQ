# NBA GM: five-season postseason outcome cohort

Date: October 30, 2026. **Research-only calibration input; not a gameplay rating or simulator change.**

## Scope and definitions

The companion file `nba-gm-150-team-season-postseason-2022-2026.csv` adds one actual postseason finish for each of the 150 team-season rows in `nba-gm-150-team-season-efficiency-2022-2026.csv`. Years are **season-ending years**, not opening years. The fixed outcomes match the result-screen terms already used by private NBA GM:

| Finish | Each season | Five seasons |
|---|---:|---:|
| Champion | 1 | 5 |
| Finals (runner-up) | 1 | 5 |
| Conference Finals (eliminated there) | 2 | 10 |
| Conference Semifinals (eliminated there) | 4 | 20 |
| First Round (eliminated there) | 8 | 40 |
| Missed Playoffs | 14 | 70 |
| **Total** | **30** | **150** |

`Missed Playoffs` means **failed to reach the 16-team main bracket**. Play-in elimination is a miss. The two Finals teams have separate `Champion` and `Finals` outcomes; a team reaching conference finals but losing is only `Conference Finals`.

## Independently checkable season anchors

| Ending year | Champion | Finals runner-up | Conference finalists eliminated | Example anchor |
|---|---|---|---|---|
| 2022 | GSW | BOS | DAL, MIA | Golden State won with 53 regular-season wins |
| 2023 | DEN | MIA | LAL, BOS | Denver won with 53 wins |
| 2024 | BOS | DAL | IND, MIN | Boston won with 64 wins |
| 2025 | OKC | IND | NYK, MIN | Oklahoma City won with 68 wins |
| 2026 | NYK | SAS | CLE, OKC | New York won with 53 wins |

**Official playoff sources (full series schedules/results):**
- 2022: https://www.nba.com/playoffs/2022/series
- 2023: https://www.nba.com/playoffs/2023/series and https://www.nba.com/news/2023-nba-playoffs-schedule
- 2024: https://www.nba.com/news/2024-nba-playoffs-schedule
- 2025: https://www.nba.com/news/2025-nba-playoffs-schedule
- 2026: https://www.nba.com/news/2026-nba-playoffs-schedule

The historical efficiency/win cohort keeps its own source documentation. The new outcomes are separate to avoid changing the original observed net-rating-to-wins benchmark.

## Observed main-bracket qualification vs. regular-season wins

These are **pooled observed counts** for the 150 team-seasons (not a fitted predictive win model). Group boundaries do not correspond to game scoring tiers.

| Actual wins | Teams | Made 16-team bracket | Won title |
|---|---:|---:|---:|
| 0–29 | 31 | 0 | 0 |
| 30–39 | 26 | 2 | 0 |
| 40–44 | 24 | 11 | 0 |
| 45–49 | 30 | 28 | 0 |
| 50–54 | 24 | 24 | 3 |
| 55–59 | 7 | 7 | 0 |
| 60–82 | 8 | 8 | 2 |
| **Total** | **150** | **80** | **5** |

These counts reveal a strong relationship between actual wins and entry into the main playoffs, but even a 50-win team is far from a lock to win the title. They also show that treating a 64-win season as an automatic championship is indefensible.

**What is and is not calibrated:** This file validates postseason *labels and historical cohort membership* and supplies outcomes for later study. It does **not** prove a conversion from the game's provisional 330-player six-skill ratings, roster positional fit, fictional salary choices, or offseason trades into realistic offensive/defensive efficiency, regular-season wins, series-winning chance or championship probability. Even using actual end-of-season net rating or wins as an input has retrospective information unavailable at draft time. The five NBA seasons are the study window, not a five-year game: NBA GM gameplay still lasts **three** simulated seasons.

## Regression gate

`src/features/nba/nbaGmPostseasonCalibration.test.ts` joins all 150 outcomes to efficiency rows by (seasonEnd, teamCode), requires exact key uniqueness, validates 30 team records each year and the correct 1/1/2/4/8/14 finish distribution, and pins historical Finals and play-in edge cases. No runtime scoring or production SQL was altered by this data exercise.

**Next model research before altering runtime weights:** obtain player-season on/off or publicly verifiable lineup minutes, opponent-adjusted efficiency, team four factors (effective FG%, turnovers, offensive rebounds, free-throw rate) and peak-season player development trajectories. Use chronological holdouts, check calibration by win bands and playoff round, and distinguish the game-specific seven-man construction from real 8–10-player rotations and injuries.
