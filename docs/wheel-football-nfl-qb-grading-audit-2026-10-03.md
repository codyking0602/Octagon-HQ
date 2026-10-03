# NFL Wheel of Football — QB grading audit

## Status

**Phase 2 locked calibration — October 3, 2026.**

This is an audit-only grading artifact. It grades every quarterback in the current curated NFL Wheel population against the Phase 1 anchor board.

It does **not** wire grades into runtime, expose hidden grades to clients, alter Wheel generation, or change historical results.

Population source: `data/generated/football/wheel-football-priorities.json` at main `b582b00917da256880fc24cb0ff9df9f105eb30e`.

Population checked: **34 QB entries**.

Constitution: PR #1641.

## Semantic

Grade **current NFL quarterback ability right now**.

Do not grade:
- career greatness;
- fame;
- fantasy value;
- draft status;
- theoretical ceiling;
- a one- or two-game hot streak;
- future projection.

Availability/injury is primarily an eligibility concern. Current play matters, but ordinary September variance should not erase a stronger established sample.

## Evidence snapshot

Evaluation timestamp: **October 3, 2026**, before Week 4 was complete.

Most 2026 evidence therefore covers two or three games; Pittsburgh/Cleveland had four completed games. The audit intentionally uses 2025 full-season performance as the stronger baseline unless 2026 evidence is large or severe enough to justify a real current-level adjustment.

Primary external evidence:
- NFL Week 4 QB Index, including embedded Next Gen Stats context: https://www.nfl.com/news/nfl-qb-rankings-index-week-4-2026-nfl-season
- 2025 NFL passing table / QBR context: https://www.pro-football-reference.com/years/2025/passing.htm
- NFL.com individual career/stat pages for every uncertain/current comparison.
- Specific young/returning-QB checks:
  - Drake Maye: https://www.nfl.com/players/drake-maye/stats/career
  - Jayden Daniels: https://www.nfl.com/players/jayden-daniels/stats/career
  - Jordan Love: https://www.nfl.com/players/jordan-love/stats/career
  - Jalen Hurts: https://www.nfl.com/players/jalen-hurts/stats/career
  - Justin Herbert: https://www.nfl.com/players/justin-herbert/stats/career
  - Baker Mayfield: https://www.nfl.com/players/baker-mayfield/stats/career
  - C.J. Stroud: https://www.nfl.com/players/c-j-stroud/stats/career
  - Jaxson Dart: https://www.nfl.com/players/jaxson-dart/stats/career
  - Tyler Shough: https://www.nfl.com/players/tyler-shough/stats/career
  - Michael Penix Jr.: https://www.nfl.com/players/michael-penix-jr/stats/career
  - Bryce Young: https://www.nfl.com/players/bryce-young/stats/career
  - Daniel Jones: https://www.nfl.com/players/daniel-jones/stats/career
  - Deshaun Watson: https://www.nfl.com/players/deshaun-watson/stats/career
  - Aaron Rodgers: https://www.nfl.com/players/aaron-rodgers/stats/career
  - Geno Smith: https://www.nfl.com/players/geno-smith/stats/career
  - Kirk Cousins: https://www.nfl.com/players/kirk-cousins/stats/career
  - Malik Willis: https://www.nfl.com/players/malik-willis/stats/career
  - Cam Ward: https://www.nfl.com/players/cam-ward/stats/career
  - Fernando Mendoza preseason / competition context: https://www.nfl.com/news/2026-nfl-draft-quarterback-class-examining-when-fernando-mendoza-eight-others-could-make-first-starts

External rankings/ratings were treated as evidence only. None mechanically set a grade.

## Approved anchor ladder

The Phase 1 board is preserved, including Cody's correction that Purdy and Herbert were initially too high.

| Grade | QB | Anchor |
| ---: | --- | --- |
| 99 | Josh Allen | Current ceiling |
| 97 | Patrick Mahomes | Elite / ceiling-adjacent |
| 96 | Lamar Jackson | Elite |
| 95 | Matthew Stafford | Elite pocket quarterback |
| 95 | Joe Burrow | Elite pocket quarterback |
| 92 | Dak Prescott | High-end |
| 89 | Brock Purdy | Very good starter |
| 89 | Jared Goff | Very good starter |
| 88 | Justin Herbert | High-end / good boundary |
| 87 | Trevor Lawrence | Good starter |
| 85 | Sam Darnold | Solid / above-average starter |
| 82 | Jacoby Brissett | Average / solid starter |
| 80 | Aaron Rodgers | Below-average starter |
| 74 | Jameis Winston | Weak current Wheel option |

## Locked QB grades

| Grade | QB | Team | Audit rationale |
| ---: | --- | --- | --- |
| 99 | Josh Allen | BUF | Complete passing/creation/rushing ceiling. One turnover-heavy early game is normal variance. |
| 97 | Patrick Mahomes | KC | Elite processing, arm talent and creation remain established; 2025 prevents a reputation-only 99/100. |
| 96 | Lamar Jackson | BAL | Elite passer plus unmatched quarterback rushing stress. |
| 95 | Matthew Stafford | LAR | 2025 MVP baseline remains elite; early pressure struggles are too small a sample for a major downgrade. |
| 95 | Joe Burrow | CIN | Elite placement/processing and a strong 2026 start; no meaningful current gap from Stafford. |
| 92 | Dak Prescott | DAL | Strong 2025 QBR/production and a clean 2026 opening confirm high-end current play. |
| 90 | Drake Maye | NE | 2025 was MVP-caliber. The brutal 2026 opening lowers him materially but does not erase the established level after three games. |
| 90 | Jalen Hurts | PHI | Efficient 2024-25 passing plus major rushing value; current indecision/uneven play keeps him below 92+. |
| 89 | Brock Purdy | SF | Very good current quarterback. The 2026 heater is not enough to promote him above the approved 89 anchor. |
| 89 | Jared Goff | DET | Sustained structured efficiency; narrower pressure/off-platform creation keeps him below the high-end group. |
| 88 | Justin Herbert | LAC | Elite physical traits do not override 2025 and early-2026 mistakes. Grade actual play, not theoretical ceiling. |
| 87 | Trevor Lawrence | JAX | 2025 step forward plus strong early 2026 play; historical inconsistency still prevents a higher band. |
| 87 | Jayden Daniels | WSH | Special rushing/creation ability and a proven high-end rookie season; shortened/less efficient 2025-26 evidence caps him. |
| 87 | Jordan Love | GB | Strong 2023-25 starter sample outweighs three rough games, but current inconsistency keeps him here. |
| 86 | Baker Mayfield | TB | 2024 ceiling was high, but 2025 and 2026 have regressed. Thumb availability is not an ability downgrade. |
| 86 | C.J. Stroud | HOU | Still a good starter; the last two-plus seasons have not sustained the rookie-year peak. |
| 85 | Sam Darnold | SEA | Two credible, efficient starting seasons; persistent turnover volatility keeps him at the approved 85 anchor. |
| 84 | Geno Smith | NYJ | 2025 turnover problems plus a sharp 2026 rebound land slightly below Darnold. |
| 84 | Caleb Williams | CHI | Real 2025 development and creation ability; accuracy/consistency still prevent an above-average lock. |
| 84 | Kyler Murray | MIN | Established dual-threat ability remains solid; recent small samples are weak, while availability stays separate. |
| 83 | Daniel Jones | IND | Strong 2025 resurgence is real; early 2026 regression and long prior volatility prevent treating it as a permanent higher tier. |
| 83 | Kirk Cousins | LV | Excellent three-game 2026 start, but post-Achilles movement/arm margin and recent baseline prevent a recency jump. |
| 83 | Jaxson Dart | NYG | Positive 2025 starter/rushing sample plus hot 2026 start; too little evidence for a larger move. |
| 82 | Jacoby Brissett | ARI | Approved competent average-starter line. |
| 82 | Tyler Shough | NO | Thirteen-game body supports credible starter ability; turnover/fumble volatility keeps him at the Brissett line. |
| 82 | Bryce Young | CAR | Early 2026 improvement is meaningful but still too small to move above the established starter line. |
| 81 | Bo Nix | DEN | Two years of competent but relatively low-efficiency play plus another uneven 2026 start. |
| 81 | Deshaun Watson | CLE | Four-game 2026 rebound earns a small current bump; poor 2022-24 play and 2025 absence block a larger move. |
| 80 | Aaron Rodgers | PIT | Approved below-average current starter anchor. Still flashes high-level pocket play, but current efficiency is no longer above-average. |
| 80 | Michael Penix Jr. | ATL | Arm/timing flashes, but only 15 NFL games and middling established efficiency limit the grade. |
| 78 | Malik Willis | MIA | Useful physical/rushing tools and prior spot-start flashes; current full-time accuracy/finishing remain limited. |
| 77 | Cam Ward | TEN | Full 2025 season plus early 2026 remain below-average efficiency; creation talent keeps him above the floor. |
| 75 | Fernando Mendoza | LV | **Provisional.** No regular-season NFL snaps; preseason was uneven and he lost QB1 to Cousins. No No. 1-pick projection bonus is applied. |
| 74 | Jameis Winston | NYG | Approved weak current Wheel option anchor: arm talent remains, but reliability/decision volatility are clearly below the starter line. |

## Pairwise contradiction audit

### Ceiling / elite

**Allen 99 > Mahomes 97 > Lamar 96 > Stafford 95 = Burrow 95**

No contradiction found. Stafford/Burrow tie rather than inventing precision.

### High-end neighborhood

**Dak 92 > Maye 90 = Hurts 90 > Purdy 89 = Goff 89 > Herbert 88**

This was the main pressure point.

- Purdy stays at 89 despite the best three-game start in football; three games do not establish a new tier.
- Herbert stays at the user-corrected 88. Physical ceiling cannot own the grade.
- Maye stays above Purdy/Goff because the 2025 MVP-caliber season is unusually strong established evidence, but the 2026 collapse is severe enough to keep him well below Dak.
- Hurts ties Maye: enough established total-QB value for 90, but current passing inconsistency prevents 92+.

### Good-starter neighborhood

**Herbert 88 > Lawrence 87 = Daniels 87 = Love 87 > Mayfield 86 = Stroud 86 > Darnold 85**

No full-point contradiction survived review.

Lawrence, Daniels and Love arrive at 87 through different profiles, but the current total-QB cases are close enough that a tie is more honest than fake precision.

### Solid-starter neighborhood

**Darnold 85 > Geno 84 = Caleb 84 = Kyler 84 > Jones 83 = Cousins 83 = Dart 83**

- Darnold remains the approved 85 anchor despite strong recent raw efficiency because turnover volatility is real.
- Cousins' 2026 start is not allowed to erase the post-Achilles/recent baseline.
- Dart's two-game 2026 burst is treated as confirmation of promise, not a tier jump.

### Average / below-average neighborhood

**Brissett 82 = Shough 82 = Bryce 82 > Nix 81 = Watson 81 > Rodgers 80 = Penix 80**

- Brissett remains the average-starter reference.
- Bryce's early improvement is not yet enough to move above that line.
- Watson's four-game rebound earns only a small bump because the prior current-era sample is poor.
- Penix does not receive a physical-arm premium.

### Floor

**Rodgers 80 = Penix 80 > Willis 78 > Ward 77 > Mendoza 75 > Winston 74**

Mendoza is deliberately low-confidence and provisional. His first meaningful regular-season sample should trigger a targeted exception review.

## Distribution check — performed after grading

| Band | Count |
| --- | ---: |
| 95-100 | 5 |
| 90-94 | 3 |
| 85-89 | 9 |
| 80-84 | 13 |
| 75-79 | 3 |
| Below 75 | 1 |

Mean: **85.62**  
Median: **84.5**  
Range: **74-99**

No grade was moved to improve this distribution.

## Version lock

Version: `nfl-wheel-qb-grades-2026-10-03-v1`

The machine-readable authority is:

`data/generated/football/wheel-nfl-qb-grades-2026-10-03.json`

This is the initial version, so there is no previous-grade change log. Every future actual change must preserve:
- previous grade;
- new grade;
- effective date;
- concise reason;
- nearby anchor/peer sanity check.

Historical completed games will eventually freeze the grade effective at selection time when Phase 5 wires runtime behavior.

## Phase boundary

**QB grading is complete and locked.**

Do not re-grade the position wholesale during normal maintenance. Use the biweekly exception scan from the grading constitution.

Next calibration phase, only when directed: **RB anchors first**.
