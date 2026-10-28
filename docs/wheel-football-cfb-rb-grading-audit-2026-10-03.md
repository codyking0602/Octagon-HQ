# College Football Wheel of Football — RB grading audit

## Status

**RB calibration locked — October 3, 2026.**

This audit grades all **155 running backs across the 68-school curated CFB Wheel population**.

It is calibration-only. It does **not** wire grades into runtime, alter Wheel generation, expose hidden grades, change eligibility, or modify historical results.

Population authority:
- `data/generated/football/cfb/wheel-football-current-priorities-2026.json`
- `data/curated/football/cfb/wheel-football-priority-audit-2026-10-03.json`
- main baseline: `f77ca3c2e917d9cb4ca21d6f9877877647d80e3c`

## Semantic

Grade **current college-football running-back ability right now**.

The locked CFB weighting standard is intentionally more current-season-sensitive than the NFL model:
- 2026 performance/role leads the evaluation;
- 2025 remains a substantial stabilizer;
- older evidence is secondary;
- this is judgment guidance, **not a literal formula**.

The conceptual weighting is roughly **55–60% 2026 / 30–35% 2025 / remainder older/context**.

Do not grade NFL projection, recruiting rank, draft stock, fame, school prestige, fantasy value, or future upside. Injury/availability generally does not directly reduce underlying ability.

RB ability includes vision/decision-making, burst, elusiveness, contact balance/power, creation beyond blocking, short-yardage value, receiving, ball security and pass-game usefulness.

## Evidence snapshot

The board is frozen to **completed games through September 27, 2026** so October 3 games in progress do not create inconsistent timing within the position.

Primary evidence:
- current 2026 school/player statistics and game logs;
- recent 2025 college performance as a stabilizer;
- opponent and role context;
- EA SPORTS College Football 27 current Week 4 HB ratings as an error detector only.

## Approved anchor ladder

| Grade | Player | School |
| ---: | --- | --- |
| 98 | Jadan Baugh | Florida |
| 97 | Nate Sheppard | Duke |
| 95 | Wayne Knight | UCLA |
| 95 | Wayshawn Parker | Utah |
| 93 | Antwan Raymond | Rutgers |
| 93 | Cam Cook | West Virginia |
| 93 | LJ Martin | BYU |
| 92 | Ahmad Hardy | Missouri |
| 91 | Kewan Lacy | Ole Miss |
| 91 | Fluff Bothwell | Mississippi State |
| 89 | DeSean Bishop | Tennessee |
| 87 | Aiden Flora | Iowa State |
| 86 | Isaac Brown | Louisville |
| 80 | Darius Taylor | Minnesota |
| 74 | DeKalon Taylor | Colorado |

## Locked full RB board

| HQ | Player | School | EA | Δ | QA |
| ---: | --- | --- | ---: | ---: | --- |
| 98 | Jadan Baugh | Florida | 96 | +2 |  |
| 97 | Nate Sheppard | Duke | 93 | +4 |  |
| 95 | Wayne Knight | UCLA | 91 | +4 |  |
| 95 | Wayshawn Parker | Utah | 88 | +7 | REVIEW |
| 94 | Caleb Hawkins | Oklahoma State | 92 | +2 |  |
| 93 | Antwan Raymond | Rutgers | 92 | +1 |  |
| 93 | Cam Cook | West Virginia | 91 | +2 |  |
| 93 | LJ Martin | BYU | 93 | 0 |  |
| 92 | Ahmad Hardy | Missouri | 96 | -4 |  |
| 92 | Mark Fletcher Jr. | Miami | 93 | -1 |  |
| 92 | Nate Frazier | Georgia | 91 | +1 |  |
| 91 | Bo Jackson | Ohio State | 90 | +1 |  |
| 91 | Fluff Bothwell | Mississippi State | 90 | +1 |  |
| 91 | Justice Haynes | Georgia Tech | 91 | 0 |  |
| 91 | Kewan Lacy | Ole Miss | 96 | -5 |  |
| 91 | King Miller | USC | 88 | +3 |  |
| 91 | Turbo Richard | Indiana | 89 | +2 |  |
| 90 | Jeffrey Overton Jr. | Virginia Tech | 84 | +6 |  |
| 90 | Kendrick Raphael | SMU | 88 | +2 |  |
| 90 | Lee Beebe Jr. | Indiana | 86 | +4 |  |
| 89 | CJ Baxter | Kentucky | 86 | +3 |  |
| 89 | DeSean Bishop | Tennessee | 91 | -2 |  |
| 89 | Duke Watson | UCF | 86 | +3 |  |
| 89 | Gi'Bran Payne | Cincinnati | 82 | +7 | REVIEW |
| 89 | Jamal Roberts | Missouri | 87 | +2 |  |
| 89 | Kamari Moulton | Iowa | 89 | 0 |  |
| 89 | Keyjuan Brown | Louisville | 88 | +1 |  |
| 89 | Matt Fuller | South Carolina | 80 | +9 | REVIEW |
| 89 | Ousmane Kromah | Florida State | 87 | +2 |  |
| 88 | Cam Edwards | Michigan State | 90 | -2 |  |
| 88 | Cole Tabb | Cincinnati | 83 | +5 |  |
| 88 | Duke Clark | Florida | 82 | +6 |  |
| 88 | Gideon Davidson | Clemson | 84 | +4 |  |
| 88 | Hollywood Smothers | Texas | 89 | -1 |  |
| 88 | Jason Patterson | Kentucky | 82 | +6 |  |
| 88 | Jayden Scott | NC State | 83 | +5 |  |
| 88 | Jeremiah Cobb | Auburn | 88 | 0 |  |
| 88 | Jkoby Williams | Texas Tech | 87 | +1 |  |
| 88 | Jordon Davison | Oregon | 87 | +1 |  |
| 88 | Makhi Hughes | Houston | 85 | +3 |  |
| 87 | Aiden Flora | Iowa State | 78 | +9 | REVIEW |
| 87 | Dilin Jones | LSU | 83 | +4 |  |
| 87 | Jamal Rule | Nebraska | 81 | +6 |  |
| 87 | Jeremy Payne | TCU | 85 | +2 |  |
| 87 | Rodney Fields Jr. | Kansas State | 82 | +5 |  |
| 86 | Aneyas Williams | Notre Dame | 86 | 0 |  |
| 86 | Caleb Komolafe | Northwestern | 86 | 0 |  |
| 86 | Isaac Brown | Louisville | 92 | -6 |  |
| 86 | Ja'Kobi Jackson | Ohio State | 82 | +4 |  |
| 86 | Jordan Marshall | Michigan | 87 | -1 |  |
| 85 | Adam Mohammed | California | 82 | +3 |  |
| 85 | Benjamin Hall | North Carolina | 82 | +3 |  |
| 85 | Chauncey Bowens | Georgia | 86 | -1 |  |
| 85 | Dierre Hill Jr. | Oregon | 85 | 0 |  |
| 85 | Dylan Edwards | Kansas | 86 | -1 |  |
| 85 | Fame Ijeboi | Purdue | 85 | 0 |  |
| 85 | Raleek Brown | Texas | 88 | -3 |  |
| 85 | Re'Shaun Sanford II | Houston | 82 | +3 |  |
| 85 | Rueben Owens II | Texas A&M | 87 | -2 |  |
| 84 | Abu Sama III | Wisconsin | 85 | -1 |  |
| 84 | Aidan Laughery | Illinois | 85 | -1 |  |
| 84 | Anthony Woods | UCLA | 81 | +3 |  |
| 84 | Calil Valentine | Illinois | 85 | -1 |  |
| 84 | Cameron Dickey | Texas Tech | 88 | -4 |  |
| 84 | Carson Hansen | Penn State | 86 | -2 |  |
| 84 | CharMar Brown | Miami | 85 | -1 |  |
| 84 | EJ Crowell | Alabama | 82 | +2 |  |
| 84 | Ismail Mahdi | Arizona | — | — |  |
| 84 | Jakyrian Turner | Pittsburgh | 86 | -2 |  |
| 84 | Javian Mallory | Miami | 77 | +7 | REVIEW |
| 84 | Joe Jackson | Kansas State | 85 | -1 |  |
| 84 | Joseph Himon II | Northwestern | 81 | +3 |  |
| 84 | Marcellous Hawkins Jr. | Virginia Tech | 84 | 0 |  |
| 84 | Sedrick Alexander | Vanderbilt | 85 | -1 |  |
| 84 | Xavier Brown | Virginia | 80 | +4 |  |
| 83 | Braeden Jackson | Iowa | — | — |  |
| 83 | Damon Ferguson Jr. | Pittsburgh | 79 | +4 |  |
| 83 | Daniel Hill | Alabama | 83 | 0 |  |
| 83 | James Peoples | Penn State | 85 | -2 |  |
| 83 | Jekail Middlebrook | Virginia | 85 | -2 |  |
| 83 | Kyson Brown | Arizona State | 81 | +2 |  |
| 83 | TJ Thomas | Minnesota | 79 | +4 |  |
| 83 | Ty Clark III | Wake Forest | 80 | +3 |  |
| 83 | Waymond Jordan | USC | 87 | -4 |  |
| 82 | Brian Bonner Jr. | Washington | 81 | +1 |  |
| 82 | Chris Johnson Jr. | Clemson | 83 | -1 |  |
| 82 | CJ Campbell Jr. | Duke | 83 | -1 |  |
| 82 | Dawson Pendergrass | Baylor | 83 | -1 |  |
| 82 | Demon June | North Carolina | 84 | -2 |  |
| 82 | Evan Dickens | Boston College | 85 | -3 |  |
| 82 | Javin Gordon | Tennessee | 82 | 0 |  |
| 82 | Kedrick Reescano | Arizona | 83 | -1 |  |
| 82 | Landen Chambers | UCF | 82 | 0 |  |
| 82 | Malachi Hosley | Georgia Tech | 83 | -1 |  |
| 82 | Mekhi Nelson | Nebraska | 78 | +4 |  |
| 82 | Tylik Hill | Syracuse | 77 | +5 |  |
| 82 | Xay Davis | Virginia | 77 | +5 |  |
| 81 | Evan Pryor | Florida | 83 | -2 |  |
| 81 | Lloyd Avant | Oklahoma | 82 | -1 |  |
| 81 | Makhi Frazier | Ole Miss | 81 | 0 |  |
| 81 | Makhilyn Young | Vanderbilt | 81 | 0 |  |
| 81 | Micah Ford | Stanford | 82 | -1 |  |
| 81 | Micah Welch | Colorado | 80 | +1 |  |
| 81 | Xavier Robinson | Oklahoma | 83 | -2 |  |
| 81 | Yasin Willis | Kansas | 82 | -1 |  |
| 80 | Darius Taylor | Minnesota | 87 | -7 | REVIEW |
| 80 | Darrion Dupree | Wisconsin | 80 | 0 |  |
| 80 | Davion Gause | NC State | 80 | 0 |  |
| 80 | Iverson Howard | Maryland | 78 | +2 |  |
| 80 | Jamarion Morrow | Texas A&M | 81 | -1 |  |
| 80 | Jay Harris | Kansas State | 81 | -1 |  |
| 80 | Jaylen McGill | North Carolina | — | — |  |
| 80 | Jerrick Gibson | Purdue | 81 | -1 |  |
| 80 | Kolin Wilson | Mississippi State | 76 | +4 |  |
| 80 | L.J. Phillips Jr. | Iowa | 82 | -2 |  |
| 80 | Nolan James Jr. | Notre Dame | 79 | +1 |  |
| 80 | Omar Mabson II | Auburn | 81 | -1 |  |
| 80 | Samuel Singleton Jr. | Florida State | 81 | -1 |  |
| 80 | Sutton Smith | Arkansas | 84 | -4 |  |
| 80 | Trae'shawn Brown | Alabama | 75 | +5 |  |
| 79 | Amari Latimer | West Virginia | 76 | +3 |  |
| 79 | Christian Clark | South Carolina | 79 | 0 |  |
| 79 | Clay Thevenin | Rutgers | 80 | -1 |  |
| 79 | Dramekco Green | SMU | 79 | 0 |  |
| 79 | Gavin Sawchuk | Northwestern | 80 | -1 |  |
| 78 | Daune Morris | Tennessee | 79 | -1 |  |
| 78 | Isaiah Mozee | Nebraska | 78 | 0 |  |
| 78 | Jaziun Patterson | Michigan State | 80 | -2 |  |
| 78 | Ju'Juan Johnson | Syracuse | 79 | -1 |  |
| 78 | Quinton Martin Jr. | Penn State | 81 | -3 |  |
| 78 | Savion Hiter | Michigan | 83 | -5 |  |
| 78 | Taevion Swint | UCF | 77 | +1 |  |
| 77 | Caden Knighten | Baylor | 81 | -4 |  |
| 77 | Cameron Pettaway | Iowa State | 77 | 0 |  |
| 77 | Daniel Bray | Utah | 81 | -4 |  |
| 77 | Deuce Lawrence | Wake Forest | 75 | +2 |  |
| 77 | Jon Denman | TCU | 74 | +3 |  |
| 77 | Liam Willson | Maryland | — | — |  |
| 77 | Stacy Gage | LSU | 77 | 0 |  |
| 77 | Trelain Maddox | Georgia Tech | 77 | 0 |  |
| 76 | Ashten Emory | California | 76 | 0 |  |
| 76 | Grayson Rigdon | Arizona State | 75 | +1 |  |
| 76 | Marquis Gillis | Arizona State | 72 | +4 |  |
| 76 | Preston Rex | BYU | 75 | +1 |  |
| 76 | Sedrick Irvin | Stanford | 76 | 0 |  |
| 75 | Bo MacCormack III | Boston College | 76 | -1 |  |
| 75 | J.J. Hill | Mississippi State | 74 | +1 |  |
| 75 | Jabree Coleman | South Carolina | 74 | +1 |  |
| 75 | Shavane Anderson Jr. | Syracuse | 73 | +2 |  |
| 75 | Tre Page III | Oklahoma State | 75 | 0 |  |
| 75 | Trey Cooley | Washington | 75 | 0 |  |
| 75 | Xai'Shaun Edwards | Missouri | 75 | 0 |  |
| 74 | Cam Settles | Arkansas | 77 | -3 |  |
| 74 | DeKalon Taylor | Colorado | 75 | -1 |  |
| 74 | Harry Dalton III | Maryland | 75 | -1 |  |

## Pairwise / neighboring-player audit

- **Jadan Baugh 98 > Nate Sheppard 97 > Wayne Knight 95 = Wayshawn Parker 95 > Caleb Hawkins 94**
- **Caleb Hawkins 94 > Antwan Raymond 93 = Cam Cook 93 = LJ Martin 93 > Ahmad Hardy 92 = Mark Fletcher Jr. 92 = Nate Frazier 92**
- **Bo Jackson 91 = Fluff Bothwell 91 = Justice Haynes 91 = Kewan Lacy 91 = King Miller 91 = Turbo Richard 91 > Lee Beebe Jr. 90 = Kendrick Raphael 90 = Jeffrey Overton Jr. 90**
- **89 cluster (Bishop / Baxter / Fuller / Roberts / Moulton / Ousmane / Keyjuan / Duke Watson / Gi'Bran) > 88 cluster > 87 cluster**
- **86 cluster > 85 cluster > 84 cluster > 83 cluster > 82 cluster > 81 cluster > 80 cluster**
- **79 cluster > 78 cluster > 77 cluster > 76 cluster > 75 cluster > Cam Settles 74 = DeKalon Taylor 74 = Harry Dalton III 74**

Key resolved pressure points:
- Hardy remains 92 rather than ceiling range: zero 2026 games matter materially in college, but injury is not treated as proof his underlying ability disappeared.
- Lacy remains 91: the current year is quieter, while dominant 2025 evidence prevents a four-game collapse.
- Isaac Brown remains 86: excellent prior evidence stabilizes him, but 2026 performance materially lowers him from EA 92.
- Caleb Hawkins rises to 94 on 441 rushing yards through four games; current production is elite, while a thinner established sample keeps him below the 95+ anchors.
- Matt Fuller, Gi'Bran Payne, Duke Watson, Jason Patterson, Jayden Scott and Javian Mallory all moved materially upward after the 2026-first neighbor audit showed the first draft was too depth-chart/reputation driven.
- Duke Clark settles at 88 after the external audit exposed 259 yards on 32 carries at 8.1 YPC; the smaller role prevents a 90s grade but makes the initial low placement indefensible.
- The bottom remains deliberately separated; curated membership does not imply an 80 floor.

Result: **passed — no remaining pairwise contradiction identified.**

## Range / separation audit

Passed.

- Range: **74-98**
- Median: **83**
- Mean: **83.47**
- Below 80: **35**
- Curated membership does **not** create an 80-point floor.

## EA College Football 27 discrepancy audit

Rule:
- Δ 0–6: normally no mandatory review;
- Δ 7–9: mandatory football sanity check;
- Δ 10+: explicit major-red-flag explanation required;
- EA is never an input formula or required midpoint.

Resolved current EA ratings: **151/155**.

Unresolved exact current EA entries: **Braeden Jackson, Liam Willson, Ismail Mahdi, Jaylen McGill**.

Mandatory reviews:
- **Matt Fuller (South Carolina) — HQ 89 / EA 80 / Δ +9:** Keep HQ 89. His 384 yards on 57 carries (6.74 YPC) with four TD through four games are substantially ahead of EA 80. The current-season-heavy CFB model should reward that demonstrated production.
- **Aiden Flora (Iowa State) — HQ 87 / EA 78 / Δ +9:** Keep locked HQ 87. He has 382 rushing yards at 7.5 YPC plus receiving value through four games; the thin prior RB sample is already why he stops at 87.
- **Wayshawn Parker (Utah) — HQ 95 / EA 88 / Δ +7:** Keep locked HQ 95. His 328 rushing yards, 154 receiving yards and nine total TD through four games are elite current all-purpose production; EA 88 is lagging the 2026 level.
- **Gi'Bran Payne (Cincinnati) — HQ 89 / EA 82 / Δ +7:** Keep HQ 89. His 368 yards on 51 carries at 7.2 YPC are materially ahead of EA 82; this is a current-season breakout EA has not fully captured.
- **Javian Mallory (Miami) — HQ 84 / EA 77 / Δ +7:** Keep HQ 84. His 226 yards on 25 carries at roughly 9.0 YPC with three TD demand breakout credit; the small role/sample is why HQ stops at 84 rather than going higher.
- **Darius Taylor (Minnesota) — HQ 80 / EA 87 / Δ -7:** Keep locked HQ 80. Earlier high-end ability prevents a larger collapse, but 107 rushing yards at 2.7 YPC through three 2026 games make EA 87 too reputation-heavy for this grading semantic.

**10+ red flags: 0.**

The audit did its job before lock: it forced rechecks of current breakouts and exposed several first-pass placements that were too depth-chart/reputation driven.

## Final distribution — inspected last

| Band | Count |
| --- | ---: |
| 95-100 | 4 |
| 90-94 | 16 |
| 85-89 | 39 |
| 80-84 | 61 |
| 75-79 | 32 |
| Below 75 | 3 |

No grade was moved to manufacture this distribution.

## Version lock

Version: `cfb-wheel-rb-grades-2026-10-03-v1`

Machine-readable authority:

`data/generated/football/wheel-cfb-rb-grades-2026-10-03.json`

Future changes must record the previous grade, new grade, effective date, reason, and nearby peer/anchor sanity check. Normal maintenance should be targeted exception scanning, not wholesale regrading.

## Phase boundary

**CFB RB grading is complete and locked.**

The artifacts remain unmerged until Cody explicitly says **“Go live.”**

Next grading phase: **WR anchors first.**
