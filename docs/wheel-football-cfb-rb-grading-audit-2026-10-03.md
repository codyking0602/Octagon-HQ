# College Football Wheel of Football — RB grading audit

## Status

**RB calibration locked — October 3, 2026.**

This audit grades every running back in the current manually curated 68-school CFB Wheel population.

It is **calibration-only**. It does not wire grades into runtime, expose hidden scores, alter Wheel generation, or change historical results.

Population authority:
- `data/generated/football/cfb/wheel-football-current-priorities-2026.json`
- `data/curated/football/cfb/wheel-football-priority-audit-2026-10-03.json`
- current main at grading start: `8285e5a842b020489f5da9ffaeed5fd9f20396f0`

Population checked: **155 RB entries across 68 schools**.

## Semantic

Grade **current college-football running back ability right now**.

The locked CFB weighting is deliberately more current-season-sensitive than the NFL model:

- 2026 performance and role are the leading evidence;
- 2025 remains a substantial stabilizer;
- older evidence is secondary;
- injury/availability generally does not directly reduce underlying ability;
- no NFL projection, recruiting rank, draft stock, school prestige, fame, fantasy value, or future-upside bonus.

The 55-60% / 30-35% / remainder concept is guidance, **not a formula**.

RB ability includes vision/decision-making, burst, elusiveness, contact balance/power, creation beyond blocking, short-yardage usefulness, receiving, ball security, and pass-game usefulness.

## Evidence freeze

Player evidence is frozen to **completed games through September 27, 2026** so October 3 games in progress do not create inconsistent timing within the position.

Primary evidence:
- EA SPORTS College Football 27 current Week 4 HB ratings;
- current 2026 school/player statistics and game logs;
- Sports-Reference / CFBStats / official school statistics;
- recent game context where opponent quality, role, or availability mattered.

EA ratings are used only as an error detector.

## Approved anchor ladder

| HQ | Player | School |
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

## Full locked RB board

| HQ | Player | School | EA CFB 27 | Δ | QA |
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
| 91 | Bo Jackson | Ohio State | 90 | +1 |  |
| 91 | Fluff Bothwell | Mississippi State | 90 | +1 |  |
| 91 | Justice Haynes | Georgia Tech | — | — | N/A |
| 91 | Kewan Lacy | Ole Miss | 96 | -5 |  |
| 91 | King Miller | USC | 88 | +3 |  |
| 89 | CJ Baxter | Kentucky | 86 | +3 |  |
| 89 | DeSean Bishop | Tennessee | 91 | -2 |  |
| 89 | Hollywood Smothers | Texas | 89 | 0 |  |
| 89 | Jeffrey Overton Jr. | Virginia Tech | 84 | +5 |  |
| 89 | Kamari Moulton | Iowa | 89 | 0 |  |
| 89 | Nate Frazier | Georgia | 91 | -2 |  |
| 88 | Cam Edwards | Michigan State | 90 | -2 |  |
| 88 | Jamal Roberts | Missouri | 87 | +1 |  |
| 88 | Jordon Davison | Oregon | 87 | +1 |  |
| 88 | Kendrick Raphael | SMU | 88 | 0 |  |
| 88 | Lee Beebe Jr. | Indiana | 86 | +2 |  |
| 87 | Aiden Flora | Iowa State | 78 | +9 | REVIEW |
| 87 | Cameron Dickey | Texas Tech | 88 | -1 |  |
| 87 | Chauncey Bowens | Georgia | 86 | +1 |  |
| 87 | Ousmane Kromah | Florida State | 87 | 0 |  |
| 87 | Turbo Richard | Indiana | 89 | -2 |  |
| 86 | Aneyas Williams | Notre Dame | 86 | 0 |  |
| 86 | Duke Clark | Florida | 82 | +4 |  |
| 86 | Duke Watson | UCF | 86 | 0 |  |
| 86 | Gideon Davidson | Clemson | 84 | +2 |  |
| 86 | Isaac Brown | Louisville | 92 | -6 |  |
| 86 | Jakyrian Turner | Pittsburgh | 86 | 0 |  |
| 86 | Jeremiah Cobb | Auburn | 88 | -2 |  |
| 86 | Jordan Marshall | Michigan | 87 | -1 |  |
| 86 | Makhi Hughes | Houston | 85 | +1 |  |
| 86 | Raleek Brown | Texas | 88 | -2 |  |
| 86 | Rueben Owens II | Texas A&M | 87 | -1 |  |
| 85 | Caleb Komolafe | Northwestern | 86 | -1 |  |
| 85 | Calil Valentine | Illinois | 85 | 0 |  |
| 85 | Dierre Hill Jr. | Oregon | 85 | 0 |  |
| 85 | Dylan Edwards | Kansas | 86 | -1 |  |
| 85 | Jeremy Payne | TCU | 85 | 0 |  |
| 85 | Jkoby Williams | Texas Tech | 87 | -2 |  |
| 84 | Abu Sama III | Wisconsin | 85 | -1 |  |
| 84 | Carson Hansen | Penn State | 86 | -2 |  |
| 84 | CharMar Brown | Miami | 85 | -1 |  |
| 84 | Cole Tabb | Cincinnati | 83 | +1 |  |
| 84 | Dilin Jones | LSU | 83 | +1 |  |
| 84 | Evan Dickens | Boston College | 85 | -1 |  |
| 84 | Ismail Mahdi | Arizona | — | — | N/A |
| 84 | Jason Patterson | Kentucky | 82 | +2 |  |
| 84 | Jekail Middlebrook | Virginia | 85 | -1 |  |
| 84 | Joe Jackson | Kansas State | 85 | -1 |  |
| 84 | Sedrick Alexander | Vanderbilt | 85 | -1 |  |
| 84 | Sutton Smith | Arkansas | 84 | 0 |  |
| 84 | Xavier Brown | Virginia | 80 | +4 |  |
| 83 | Aidan Laughery | Illinois | 85 | -2 |  |
| 83 | Dawson Pendergrass | Baylor | 83 | 0 |  |
| 83 | Fame Ijeboi | Purdue | 85 | -2 |  |
| 83 | James Peoples | Penn State | 85 | -2 |  |
| 83 | Keyjuan Brown | Louisville | 88 | -5 |  |
| 83 | Kyson Brown | Arizona State | 81 | +2 |  |
| 83 | Lloyd Avant | Oklahoma | 82 | +1 |  |
| 83 | Rodney Fields Jr. | Kansas State | 82 | +1 |  |
| 83 | Ty Clark III | Wake Forest | 80 | +3 |  |
| 83 | Waymond Jordan | USC | 87 | -4 |  |
| 82 | Adam Mohammed | California | 82 | 0 |  |
| 82 | Benjamin Hall | North Carolina | 82 | 0 |  |
| 82 | Brian Bonner Jr. | Washington | 81 | +1 |  |
| 82 | Chris Johnson Jr. | Clemson | 83 | -1 |  |
| 82 | CJ Campbell Jr. | Duke | 83 | -1 |  |
| 82 | Daniel Hill | Alabama | 83 | -1 |  |
| 82 | Jamal Rule | Nebraska | 81 | +1 |  |
| 82 | Javin Gordon | Tennessee | 82 | 0 |  |
| 82 | Jayden Scott | NC State | 81 | +1 |  |
| 82 | Kedrick Reescano | Arizona | 83 | -1 |  |
| 82 | Malachi Hosley | Georgia Tech | 83 | -1 |  |
| 82 | Marcellous Hawkins Jr. | Virginia Tech | 84 | -2 |  |
| 82 | Micah Ford | Stanford | 82 | 0 |  |
| 82 | Tylik Hill | Syracuse | 77 | +5 |  |
| 82 | Xavier Robinson | Oklahoma | 83 | -1 |  |
| 81 | Demon June | North Carolina | 84 | -3 |  |
| 81 | Ja'Kobi Jackson | Ohio State | 82 | -1 |  |
| 81 | Landen Chambers | UCF | 82 | -1 |  |
| 81 | Makhi Frazier | Ole Miss | 81 | 0 |  |
| 81 | Marquis Gillis | Arizona State | 72 | +9 | REVIEW |
| 81 | Matt Fuller | South Carolina | 80 | +1 |  |
| 81 | Yasin Willis | Kansas | 82 | -1 |  |
| 80 | Darius Taylor | Minnesota | 87 | -7 | REVIEW |
| 80 | Darrion Dupree | Wisconsin | 80 | 0 |  |
| 80 | Davion Gause | NC State | 80 | 0 |  |
| 80 | Gi'Bran Payne | Cincinnati | 81 | -1 |  |
| 80 | Iverson Howard | Maryland | 78 | +2 |  |
| 80 | Jamarion Morrow | Texas A&M | 81 | -1 |  |
| 80 | Jay Harris | Kansas State | 81 | -1 |  |
| 80 | Jerrick Gibson | Purdue | 81 | -1 |  |
| 80 | Kolin Wilson | Mississippi State | 76 | +4 |  |
| 80 | L.J. Phillips Jr. | Iowa | 82 | -2 |  |
| 80 | Makhilyn Young | Vanderbilt | 81 | -1 |  |
| 80 | Nolan James Jr. | Notre Dame | 79 | +1 |  |
| 80 | Omar Mabson II | Auburn | 81 | -1 |  |
| 80 | Re'Shaun Sanford II | Houston | 82 | -2 |  |
| 80 | Samuel Singleton Jr. | Florida State | 81 | -1 |  |
| 79 | Amari Latimer | West Virginia | 76 | +3 |  |
| 79 | Anthony Woods | UCLA | 81 | -2 |  |
| 79 | Christian Clark | South Carolina | 79 | 0 |  |
| 79 | Clay Thevenin | Rutgers | 80 | -1 |  |
| 79 | EJ Crowell | Alabama | 82 | -3 |  |
| 79 | Evan Pryor | Florida | 83 | -4 |  |
| 79 | Gavin Sawchuk | Northwestern | 80 | -1 |  |
| 79 | Jaziun Patterson | Michigan State | 80 | -1 |  |
| 79 | Micah Welch | Colorado | 80 | -1 |  |
| 79 | TJ Thomas | Minnesota | 79 | 0 |  |
| 78 | Isaiah Mozee | Nebraska | 78 | 0 |  |
| 78 | Javian Mallory | Miami | 77 | +1 |  |
| 78 | Jaylen McGill | North Carolina | — | — | N/A |
| 78 | Joseph Himon II | Northwestern | 81 | -3 |  |
| 78 | Ju'Juan Johnson | Syracuse | 79 | -1 |  |
| 78 | Mekhi Nelson | Nebraska | 78 | 0 |  |
| 78 | Quinton Martin Jr. | Penn State | 81 | -3 |  |
| 78 | Savion Hiter | Michigan | 83 | -5 |  |
| 77 | Braeden Jackson | Iowa | — | — | N/A |
| 77 | Damon Ferguson Jr. | Pittsburgh | 79 | -2 |  |
| 77 | Daniel Bray | Utah | 81 | -4 |  |
| 77 | Dramekco Green | SMU | 79 | -2 |  |
| 77 | Jon Denman | TCU | 74 | +3 |  |
| 77 | Liam Willson | Maryland | — | — | N/A |
| 77 | Stacy Gage | LSU | 77 | 0 |  |
| 77 | Taevion Swint | UCF | 77 | 0 |  |
| 77 | Trelain Maddox | Georgia Tech | 77 | 0 |  |
| 77 | Xay Davis | Virginia | 77 | 0 |  |
| 76 | Ashten Emory | California | 76 | 0 |  |
| 76 | Bo MacCormack III | Boston College | 76 | 0 |  |
| 76 | Caden Knighten | Baylor | 81 | -5 |  |
| 76 | Cam Settles | Arkansas | 77 | -1 |  |
| 76 | Cameron Pettaway | Iowa State | 77 | -1 |  |
| 76 | Daune Morris | Tennessee | 79 | -3 |  |
| 76 | Deuce Lawrence | Wake Forest | 75 | +1 |  |
| 76 | Grayson Rigdon | Arizona State | 75 | +1 |  |
| 76 | Preston Rex | BYU | 75 | +1 |  |
| 76 | Sedrick Irvin | Stanford | 76 | 0 |  |
| 75 | J.J. Hill | Mississippi State | 74 | +1 |  |
| 75 | Jabree Coleman | South Carolina | 74 | +1 |  |
| 75 | Shavane Anderson Jr. | Syracuse | 73 | +2 |  |
| 75 | Trae'shawn Brown | Alabama | 75 | 0 |  |
| 75 | Tre Page III | Oklahoma State | 75 | 0 |  |
| 75 | Trey Cooley | Washington | 75 | 0 |  |
| 75 | Xai'Shaun Edwards | Missouri | 75 | 0 |  |
| 74 | DeKalon Taylor | Colorado | 75 | -1 |  |
| 74 | Harry Dalton III | Maryland | 75 | -1 |  |

## Pairwise contradiction audit

### Ceiling

**Baugh 98 > Sheppard 97 > Knight 95 = Parker 95**

No contradiction survived review. Baugh and Sheppard own the strongest combination of current dominance and demonstrated recent ability. Knight and Parker are elite current backs without inventing extra separation.

### High-end

**Caleb Hawkins 94 > Raymond 93 = Cam Cook 93 = LJ Martin 93 > Hardy 92 = Mark Fletcher Jr. 92**

Hardy remains 92 even without 2026 game evidence because injury does not prove the ability disappeared; the absence of current evidence is why he cannot remain near the ceiling.

### 91 neighborhood

**Bo Jackson = Fluff Bothwell = Justice Haynes = Kewan Lacy = King Miller at 91**

Different paths lead to the tie:
- current production is strongest for some;
- prior high-end ability stabilizes others;
- none has enough current evidence to separate cleanly into 92+ after the 2026-first audit.

### Upper-middle

The 89, 88, 87, 86 and 85 neighborhoods were audited adjacent player by adjacent player. Ties are intentional where current total RB value is close even if styles or roles differ.

The most important corrections:
- **Duke Clark 73 → 86** after the audit exposed a severe undergrade;
- **Xavier Brown 87 → 84** after the role/sample review showed the opposite problem.

### Middle and floor

The middle is intentionally dense because many second backs and committee players are legitimately close.

The bottom remains separated:

**75 cluster > DeKalon Taylor 74 = Harry Dalton III 74**

Curated Wheel membership is not an 80-point entitlement.

## Range / separation audit

Passed.

- Minimum: **74**
- Maximum: **98**
- Below 80: **47**
- 80-84: **60**
- 85-89: **33**
- 90-94: **11**
- 95-100: **4**

No player was pulled upward merely because he was selected for the curated population.

## EA College Football 27 discrepancy audit

Rule:
- **0-6:** normally no mandatory review;
- **7-9:** mandatory review;
- **10+:** major red flag requiring explicit written defense;
- EA never sets the grade and is never a required midpoint.

Current official EA CFB 27 ratings were resolved for **150/155** curated RBs.

A current exact EA entry could not be resolved for 5 players despite targeted checks: `Braeden Jackson`, `Liam Willson`, `Ismail Mahdi`, `Justice Haynes`, `Jaylen McGill`. No rating was invented or replaced with a prior-edition value.

### Final mandatory discrepancies

### Darius Taylor — HQ 80 / EA 87 / Δ -7

**keep HQ.** The user-approved 80 anchor intentionally weights 2026 heavily: 107 rushing yards at 2.7 per carry through three games. Prior production prevents a deeper fall, but EA 87 is too reputation-heavy for the current CFB model.

### Marquis Gillis — HQ 81 / EA 72 / Δ +9

**keep HQ.** EA 72 materially undersells a back who produced 1,182 rushing yards in 2025. Limited 2026 usage prevents a high grade, but 81 better balances current role with demonstrated recent ability.

### Aiden Flora — HQ 87 / EA 78 / Δ +9

**keep HQ.** Current 2026 production (382 rushing yards at 7.5 per carry through four games) is materially ahead of EA's 78; 87 remains appropriate because the prior RB sample is thin.

### Wayshawn Parker — HQ 95 / EA 88 / Δ +7

**keep HQ.** Current all-purpose impact is elite: 328 rushing yards, 154 receiving yards and nine total touchdowns through four games. EA's 88 has not caught up to his current level.

There are **0 final 10+ red flags**.

### Corrections caused by the last-line audit

- **Duke Clark: 73 → 86.** Current 2026 production made the original grade indefensible.
- **EJ Crowell: 74 → 79.** Limited role still matters, but 155 yards on 23 carries was too productive for a low-70s grade.
- **Xavier Brown: 87 → 84.** Current sample/role did not support an upper-80s grade.
- **Demon June: 77 → 81.** Current functional production plus 2025 all-purpose evidence supported a low-80s correction.
- **Marquis Gillis: 79 → 81.** 2025 feature-back production plus efficient limited 2026 touches justified a modest upward correction.

This is the intended use of EA/stat discrepancy review: **find potential errors, then re-evaluate the football evidence rather than copy the video-game rating.**

## Distribution check — performed last

| Band | Count |
| --- | ---: |
| 95-100 | 4 |
| 90-94 | 11 |
| 85-89 | 33 |
| 80-84 | 60 |
| 75-79 | 45 |
| Below 75 | 2 |

Mean: **82.57**  
Median: **82**  
Range: **74-98**

Distribution was inspected only after player-by-player grading and QA. No grade was moved to make the histogram look better.

## Version lock

Version: `cfb-wheel-rb-grades-2026-10-03-v1`

Machine-readable authority:

`data/generated/football/wheel-cfb-rb-grades-2026-10-03.json`

Every future actual RB grade change must preserve:
- previous grade;
- new grade;
- effective date;
- concise football reason;
- nearby anchor/peer sanity check.

Normal maintenance should be a targeted exception scan rather than a wholesale regrade.

## Phase boundary

**CFB RB grading is complete and locked.**

This branch must **not** merge to `main` until Cody explicitly says **“Go live.”**

Next grading step: **WR anchor board first.**
