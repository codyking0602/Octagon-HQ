# NBA GM — five-season team-efficiency and construction study (2021–22 to 2025–26)

**October 30, 2026 · Phase 3 PRIVATE research note, NOT a certified chemistry formula**

## Scope and key distinction

Five seasons of **real-world NBA evidence** are the calibration window. The **game remains three seasons**.
The reviewed team ratings below are historical observations. They do not prove that one percentage
of roster success is talent and another is chemistry. The current private NBA GM simulation coefficients
are **provisional** and **must not be represented as scientifically fitted**.

## Verified champions against league context

Metrics below use Basketball-Reference's **unadjusted team ratings** (points per 100 possessions).
"Listed rank" reflects the published page's row order; it is not necessarily a net-rating sorting
for 2025–26, whose visible row order differs from exact NRtg descending order.

| NBA season | Champion | W–L | ORtg | DRtg | NRtg | Listed rank |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| 2021–22 | Golden State Warriors | 53–29 | 112.54 | 106.91 | +5.62 | 4 |
| 2022–23 | Denver Nuggets | 53–29 | 117.61 | 114.31 | +3.30 | 7 |
| 2023–24 | Boston Celtics | 64–18 | 123.35 | 111.73 | +11.62 | 1 |
| 2024–25 | Oklahoma City Thunder | 68–14 | 120.33 | 107.61 | +12.72 | 1 |
| 2025–26 | New York Knicks | 53–29 | 119.87 | 113.40 | +6.47 | 5 |

Source pages:
- [2021–22 ratings](https://www.basketball-reference.com/leagues/NBA_2022_ratings.html)
- [2022–23 ratings](https://www.basketball-reference.com/leagues/NBA_2023_ratings.html)
- [2023–24 ratings](https://www.basketball-reference.com/leagues/NBA_2024_ratings.html)
- [2024–25 ratings](https://www.basketball-reference.com/leagues/NBA_2025_ratings.html)
- [2025–26 ratings](https://www.basketball-reference.com/leagues/NBA_2026_ratings.html)
- [NBA championship winners](https://www.nba.com/news/history-nba-champions)

## Leading teams in each season — comparison cohort

The five names per season below reproduce the listed **top five rows** of the corresponding
Basketball-Reference team-rating table, not a post-hoc five-champion-only sample:

| Season | Listed top five (in source order) |
| --- | --- |
| 2021–22 | Boston, Phoenix, Utah, Golden State, Memphis |
| 2022–23 | Boston, Cleveland, Philadelphia, Memphis, Milwaukee |
| 2023–24 | Boston, Oklahoma City, Minnesota, Denver, New York |
| 2024–25 | Oklahoma City, Cleveland, Boston, Minnesota, LA Clippers |
| 2025–26 | Oklahoma City, San Antonio, Boston, Detroit, New York |

Observations:
- There is no one champion profile: 2023 Denver won with materially worse regular-season
  DRtg than 2022 Golden State or 2025 Oklahoma City.
- Champion regular-season NRtg ranges from **+3.30 to +12.72** here. A simulator
  that treats a single season's net rating as an automatic championship threshold is unjustified.
- The title does not consistently go to the regular-season net-rating leader. Offense, defense,
  top-end talent, complementary skills, and postseason variance must remain distinguishable.
- Strong creators and spacing can make offense highly efficient; sturdy perimeter containment,
  rim deterrence and defensive rebounding offer different defensive pathways.
  These mechanisms are **hypotheses to quantify across the full league**, not estimated coefficients.

## Scientific calibration protocol (not yet executed)

Before approving a production NBA GM team-fit formula, assemble **all 150 team-seasons**
(30 teams × 5 seasons), not only the 25 listed leaders. For each, archive:
season/team, wins/losses, raw and opponent-adjusted ORtg/DRtg, net rating, eFG%, turnover%,
offensive and defensive rebounding%, free-throw rate, three-point attempt share,
playmaking/assisted-shot indicators, minutes-weighted rotation players and playoff finish.

1. **Unit of analysis:** team-season, with lineup/minutes evidence for interactions.
   Normalize ratings relative to each season's league environment; do not compare
   raw 2022 ORtg directly with raw 2026 ORtg.
2. **Separate outcomes:** model season-adjusted offense and defense, then derive
   net rating and calibrate wins with a repeated-game simulation; postseason adds
   bracket and matchup variance rather than a fixed win-count title ladder.
3. **Player inputs:** use the six independently audited NBA skills and separate overall
   impact, with position-specific/minutes-sensitive constraints. Grade points are
   not directly equivalent to points per 100 possessions.
4. **Interaction hypotheses:** spacing complements primary creation; secondary playmaking
   reduces dependence on one handler; perimeter defenders and rim protectors cover
   different threats; rebounding protects and creates possessions. Saturate redundant
   strengths rather than rewarding them linearly. A low-shooting rim protector should
   not be penalized when surrounded by sufficient spacing.
5. **Out-of-sample testing:** walk-forward validation (train prior seasons, assess next);
   reserve 2025–26 as a holdout, including contenders and poor teams. Compare prediction
   error with talent-only and simple league-average baselines; report calibration and
   interval coverage, not just an anecdotal champion match.
6. **Regularization / safeguards:** avoid reverse causation from fitting wins onto players'
   post-season grades, avoid counting overall and identical skills twice, and test
   star-only versus specialist-balanced rotations for pathological outcomes.
7. **Owner review:** publish actual coefficients, error analysis, sample selection,
   and mispredicted historical teams before enabling this simulator for users.

## Phase 3.1 fixes — completed in the draft PR, not released

- The server and client now reserve **distinct eligible players** to fill all
  remaining roster slots instead of repeatedly counting one cheap two-way wing
  or big as several future signings. The reserve uses the worst applicable
  year of each fictional game contract, so one concrete legal completion is
  priced inside all three cap windows. This is deliberately conservative.
- Offseason cut replacements have an emergency-market fallback: free-agent
  spins remain available until the seven-player roster is refilled, rather
  than becoming permanently blocked after three passed teams. An isolated SQL
  regression specifically exercises four passes, signing, and Years 2–3.
- Post-Year-1 feedback is exposed on the first season's results screen, using
  position-aware primary and secondary creation, starter spacing, perimeter
  resistance, interior protection, and rebounding. These qualitative signals
  are scouting guidance, **not** extra unpublished win-formula multipliers.
- The old playoff finish ladder made a title impossible below 64 wins.
  Denver's actual 2022–23 championship came with 53 regular-season wins.
  A seeded, round-by-round playoff variance fixture replaces automatic
  championship thresholds. **Its roll probabilities remain provisional and
  have NOT been fitted to observed playoff series.**

## Source acquisition and outstanding full-cohort work

- Basketball-Reference's team-rating pages (2022–2026) provide actual team
  wins, unadjusted and schedule-adjusted ORtg/DRtg/NRtg. The published
  champion figures above have been cross-checked. Access to the full table
  through a repeatable automated download was denied during this phase;
  historical validation must NOT be marked as complete.
- [BoxScore Lab](https://www.boxscorelab.com/downloads/) offers CC BY 4.0
  exports of team standings, estimated efficiencies, individual player season
  totals, and individual team games for 2022–23 through 2025–26. Those
  *estimated* ratings differ in provenance/method from the Basketball-Reference
  ratings. They cannot be blended without a normalization and source flag;
  its public exports also do not cover 2021–22.
- [NBA Stats four factors](https://www.nba.com/stats/teams/four-factors)
  provides official season-level effective shooting, turnover and rebound
  splits, but minutes-weighted player/lineup features and a season-complete
  2021–22 slice remain necessary to quantify actual complementarity.
- **Current measured full-cohort status: 0/150 consolidated and
  independently validated team-season rows.** There are five champion rows
  and 25 top-table comparison positions in the descriptive research above,
  but they are NOT a training sample. No train/holdout split or out-of-sample
  RMSE has been completed. Keep coefficients private and uncertified until
  that evidence exists.

## Position audit of the 330-player private bank

The frozen source bank contains 330 unique IDs across all 30 NBA teams
(9–13 per team). All raw position codes are syntactically valid, but **75**
athletes were marked `SF` only, including several documented guards and
power forwards. Exactly 91 of the 330 have multiple source-board positions.
Numeric overall and six skill grades were **not touched**.

Migration `202612310896` corrects the following **11 source-backed positional
classifications only**, while keeping the original 330-entry research board
untouched as a provenance artifact:

| Athlete | Corrected private eligibility | Reference |
| --- | --- | --- |
| Naz Reid | PF / C | [NBA player profile](https://www.nba.com/player/1629675) |
| Cameron Boozer | PF / C | [NBA draft profile](https://www.nba.com/draft/2026/prospects/cameron-boozer) |
| Collin Murray-Boyles | PF | [Basketball-Reference](https://www.basketball-reference.com/players/m/murraco01.html) |
| Santi Aldama | PF | [Basketball-Reference](https://www.basketball-reference.com/players/a/aldamsa01.html) |
| Noah Clowney | PF | [Basketball-Reference](https://www.basketball-reference.com/players/c/clownno01.html) |
| Dean Wade | PF | [Basketball-Reference](https://www.basketball-reference.com/players/w/wadede01.html) |
| P.J. Washington | PF | [Basketball-Reference](https://www.basketball-reference.com/players/w/washipj01.html) |
| Jaylin Williams | PF / C | [Basketball-Reference](https://www.basketball-reference.com/players/w/willija07.html) |
| Klay Thompson | SG / SF | [Basketball-Reference](https://www.basketball-reference.com/players/t/thompkl01.html) |
| Moses Moody | SG | [Basketball-Reference](https://www.basketball-reference.com/players/m/moodymo01.html) |
| Kentavious Caldwell-Pope | SG | [Basketball-Reference](https://www.basketball-reference.com/players/c/caldwke01.html) |

All other provisional classifications require full editorial verification;
their code-level validity does **not** certify basketball-positional accuracy.

## Current private game implementation and blockers

- The owner-only V2 draft and offseason share the existing Football GM private run
  persistence, 1YR / 3YR **fictional game-term fixtures**, server-owned wheel and six-skill
  catalog. It currently uses **development-only** win/fit coefficients.
- The model currently does **not** learn from the 150-team research cohort. Do not
  claim those coefficients are scientifically supported or let them dictate public scores.
- NBA positions, remaining identity matches, development, verified contract economics,
  real playoff brackets, trade-market valuation and fit coefficients remain release blockers.
- Year 1 fit feedback is revealed **after** Year 1 and is deliberately qualitative.
  No in-draft live chemistry meter or exposed numerical overalls.

**Certification status: historical champion/top-team descriptive pass complete;
150-team measured cohort and statistical fitting NOT complete.**
