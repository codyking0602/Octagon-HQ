# College Football Wheel of Football — QB grading audit

## Status

**QB calibration locked — October 3, 2026.**

This is an audit-only grading artifact covering every quarterback in the current manually curated 68-school CFB Wheel population.

It does **not** wire grades into runtime, expose hidden grades to clients, alter Wheel generation, or change historical results.

Population source: `data/generated/football/cfb/wheel-football-current-priorities-2026.json` reconciled through `data/curated/football/cfb/wheel-football-priority-audit-2026-10-03.json` at main `f295e359d9e70f5c55d0452f4f94d9487fbc3f06`.

Population checked: **68 QB entries / 68 schools / exactly one curated QB per school**.

## Semantic

Grade **current college-football quarterback ability right now**.

Do not grade NFL projection/draft stock, recruiting ranking, fame/school prestige, career greatness, fantasy value, theoretical future ceiling, or one-game hot streaks.

Current 2026 performance matters heavily, but ordinary one- or two-game noise does not erase a stronger established college sample. Young/new starters receive credit only for demonstrated college evidence. Injury/availability remains primarily an eligibility issue unless there is evidence the player's actual ability changed.

## Evidence snapshot

Player grading is frozen to **completed games through September 27, 2026** so games occurring on October 3 do not create inconsistent within-position timing.

Primary external evidence:
- EA Sports College Football 27 current QB ratings: https://www.ea.com/games/ea-sports-college-football/ratings/positions-ratings/quarterback/QB
- CBS Sports Week 4 QB Power Rankings: https://www.cbssports.com/college-football/news/college-football-qb-power-rankings-keelon-russell-kamario-taylor/
- Sports-Reference current/career quarterback pages.
- Official school season-stat/player pages for discrepancy and edge-case checks.
- Completed-game box scores/recaps where opponent strength, role, or availability needed context.

External ratings/rankings are evidence only. None mechanically sets an HQ grade.

## Approved anchor ladder

Cody's final anchor adjustments are incorporated: **Trinidad Chambliss is QB1 at 98; Julian Sayin is reduced from the initial proposal; Kamario Taylor is raised; Arch Manning remains 88.**

| Grade | QB | School | Anchor |
| ---: | --- | --- | --- |
| 98 | Trinidad Chambliss | Ole Miss | current ceiling |
| 97 | Darian Mensah | Miami | elite / ceiling-adjacent |
| 96 | Kamario Taylor | Mississippi State | elite breakout |
| 95 | CJ Carr | Notre Dame | elite |
| 94 | Dante Moore | Oregon | high elite |
| 93 | Gunner Stockton | Georgia | high-end |
| 93 | Julian Sayin | Ohio State | high-end |
| 90 | Keelon Russell | Alabama | very good / rising |
| 90 | Josh Hoover | Indiana | very good established |
| 88 | Arch Manning | Texas | very good / inconsistent |
| 87 | Kevin Jennings | SMU | good / very good |
| 86 | Bear Bachmeier | BYU | good |
| 81 | Walker Eget | Duke | solid starter |
| 76 | Davis Warren | Stanford | below-average starter |
| 73 | Tait Reynolds | Clemson | weak Wheel option |

## Locked full QB board

EA is shown only for the final discrepancy audit. `REVIEW` means the absolute gap is at least seven points and received explicit football review.

| HQ | QB | School | EA CFB 27 | Δ | QA |
| ---: | --- | --- | ---: | ---: | --- |
| 90 | Keelon Russell | Alabama | 86 | +4 |  |
| 78 | KJ Jackson | Arkansas | 74 | +4 |  |
| 84 | Byrum Brown | Auburn | 88 | -4 |  |
| 87 | Aaron Philo | Florida | 78 | +9 | REVIEW |
| 93 | Gunner Stockton | Georgia | 91 | +2 |  |
| 83 | Kenny Minchey | Kentucky | 81 | +2 |  |
| 84 | Sam Leavitt | LSU | 89 | -5 |  |
| 96 | Kamario Taylor | Mississippi State | 88 | +8 | REVIEW |
| 86 | Austin Simmons | Missouri | 82 | +4 |  |
| 84 | John Mateer | Oklahoma | 86 | -2 |  |
| 98 | Trinidad Chambliss | Ole Miss | 95 | +3 |  |
| 82 | LaNorris Sellers | South Carolina | 85 | -3 |  |
| 77 | Faizon Brandon | Tennessee | 79 | -2 |  |
| 88 | Arch Manning | Texas | 91 | -3 |  |
| 83 | Marcel Reed | Texas A&M | 86 | -3 |  |
| 79 | Jared Curtis | Vanderbilt | 80 | -1 |  |
| 86 | Katin Houser | Illinois | 84 | +2 |  |
| 90 | Josh Hoover | Indiana | 88 | +2 |  |
| 82 | Hank Brown | Iowa | 73 | +9 | REVIEW |
| 84 | Malik Washington | Maryland | 81 | +3 |  |
| 82 | Bryce Underwood | Michigan | 83 | -1 |  |
| 76 | Alessio Milivojevic | Michigan State | 72 | +4 |  |
| 82 | Drake Lindsey | Minnesota | 83 | -1 |  |
| 87 | Anthony Colandrea | Nebraska | 87 | +0 |  |
| 87 | Aidan Chiles | Northwestern | 82 | +5 |  |
| 93 | Julian Sayin | Ohio State | 94 | -1 |  |
| 94 | Dante Moore | Oregon | 94 | +0 |  |
| 85 | Rocco Becht | Penn State | 87 | -2 |  |
| 76 | Ryan Browne | Purdue | 76 | +0 |  |
| 72 | Aj Surace | Rutgers | 76 | -4 |  |
| 83 | Nico Iamaleava | UCLA | 87 | -4 |  |
| 92 | Jayden Maiava | USC | 93 | -1 |  |
| 88 | Demond Williams Jr. | Washington | 87 | +1 |  |
| 82 | Colton Joseph | Wisconsin | 84 | -2 |  |
| 87 | Noah Fifita | Arizona | 91 | -4 |  |
| 80 | Cutter Boley | Arizona State | 79 | +1 |  |
| 77 | DJ Lagway | Baylor | 83 | -6 |  |
| 86 | Bear Bachmeier | BYU | 84 | +2 |  |
| 84 | JC French IV | Cincinnati | 78 | +6 |  |
| 70 | Isaac Wilson | Colorado | 71 | -1 |  |
| 88 | Conner Weigman | Houston | 88 | +0 |  |
| 78 | Jaylen Raynor | Iowa State | 79 | -1 |  |
| 76 | Isaiah Marshall | Kansas | 76 | +0 |  |
| 86 | Avery Johnson | Kansas State | 89 | -3 |  |
| 92 | Drew Mestemaker | Oklahoma State | 91 | +1 |  |
| 79 | Jaden Craig | TCU | 80 | -1 |  |
| 78 | Will Hammond | Texas Tech | 76 | +2 |  |
| 82 | Alonza Barnett III | UCF | 85 | -3 |  |
| 90 | Devon Dampier | Utah | 90 | +0 |  |
| 85 | Michael Hawkins Jr. | West Virginia | 83 | +2 |  |
| 74 | Mason McKenzie | Boston College | 75 | -1 |  |
| 79 | Jaron-Keawe Sagapolutele | California | 85 | -6 |  |
| 73 | Tait Reynolds | Clemson | 74 | -1 |  |
| 81 | Walker Eget | Duke | 78 | +3 |  |
| 77 | Ashton Daniels | Florida State | 75 | +2 |  |
| 81 | Alberto Mendoza | Georgia Tech | 78 | +3 |  |
| 88 | Lincoln Kienholz | Louisville | 84 | +4 |  |
| 97 | Darian Mensah | Miami | 94 | +3 |  |
| 81 | CJ Bailey | NC State | 81 | +0 |  |
| 79 | Billy Edwards Jr. | North Carolina | 78 | +1 |  |
| 84 | Mason Heintschel | Pittsburgh | 87 | -3 |  |
| 87 | Kevin Jennings | SMU | 89 | -2 |  |
| 76 | Davis Warren | Stanford | 75 | +1 |  |
| 77 | Steve Angeli | Syracuse | 80 | -3 |  |
| 85 | Beau Pribula | Virginia | 83 | +2 |  |
| 87 | Ethan Grunkemeyer | Virginia Tech | 80 | +7 | REVIEW |
| 87 | Gio Lopez | Wake Forest | 81 | +6 |  |
| 95 | CJ Carr | Notre Dame | 93 | +2 |  |

## Pairwise contradiction audit

### Ceiling / elite

**Chambliss 98 > Mensah 97 > Taylor 96 > Carr 95 > Moore 94**

Chambliss is the user-approved current ceiling. Mensah's extraordinary 2026 efficiency and established prior starting production keep him immediately behind. Taylor's 2026 performance is elite enough to justify the user-directed rise to 96, but Chambliss and Mensah still own the stronger established body. Carr and Moore remain elite without inventing separation beyond the evidence.

### High-end

**Moore 94 > Stockton 93 = Sayin 93 > Maiava 92 = Mestemaker 92 > Russell 90 = Hoover 90 = Dampier 90**

Sayin is intentionally below the original proposed 95. His 2025 performance still matters enough that lowering him further would overreact to four 2026 games. Stockton's current efficiency supports the tie. Maiava and Mestemaker have enough established/current evidence for 92. Russell is not receiving a recruiting bonus; his 90 is based on actual 2026 play.

### Very good / good

**Arch 88 = Weigman 88 = Demond Williams 88 = Kienholz 88 > Philo/Colandrea/Chiles/Jennings/Fifita/Grunkemeyer/Lopez 87 > Houser/Simmons/Bachmeier/Avery Johnson 86 > Becht/Hawkins/Pribula 85**

Arch remains 88: very good, but the actual 2026 passing is not good enough for the 90+ neighborhood. Ties are intentional where different QB styles produce approximately equal current value.

### Middle / lower starter

The 84, 83 and 82 clusters were checked player by player against adjacent groups. No player was moved simply to create visual spacing.

**Walker Eget 81 = CJ Bailey 81 = Alberto Mendoza 81 > Cutter Boley 80 > 79 cluster > 78 cluster > 77 cluster > 76 cluster**

The middle is deliberately allowed to be dense because many current college starters are legitimately close.

### Floor

**Mason McKenzie 74 > Tait Reynolds 73 > Aj Surace 72 > Isaac Wilson 70**

This is the main range/separation lesson from the NFL blind-QB audit. Curated Wheel membership is not an 80-point entitlement. Surace is not Rutgers' primary current starter, Wilson has very little productive current evidence, and neither receives recruiting/upside credit.

## Range / separation audit

Passed.

- Minimum: **70**
- Maximum: **98**
- Below 80: **19 QBs**
- 80-84: **19 QBs**
- 85-89: **18 QBs**
- 90-94: **8 QBs**
- 95-100: **4 QBs**

No low-end player was raised because of school brand, recruiting profile, or curated-pool membership.

## EA College Football 27 discrepancy audit

Locked rule:
- absolute difference **0-6**: normally no mandatory review;
- absolute difference **7-9**: mandatory sanity review;
- absolute difference **10+**: major red flag requiring an explicit written defense;
- EA is an error detector, never an input formula or required midpoint.

Four mandatory reviews remain after the final grading pass:

### Aaron Philo — HQ 87 / EA 78 / Δ +9

**keep HQ.** Florida's current official stats show elite early-2026 efficiency, accuracy and pressure performance; the 78 EA rating is materially behind the demonstrated 2026 level. Short prior sample is already reflected by keeping him out of the 90s.

### Kamario Taylor — HQ 96 / EA 88 / Δ +8

**keep HQ.** The user locked Taylor higher after reviewing the anchor board, and the football evidence supports it: through four games he had 1,192 passing yards, 14 TD to 2 INT, plus rushing creation against three Power-conference opponents. EA is functioning as a lag/error detector here, not a ceiling.

### Hank Brown — HQ 82 / EA 73 / Δ +9

**keep HQ.** Brown opened 4-0 with 68.0% completions, 5 TD, 0 INT and a 91-yard winning drive at Michigan. The prior thin sample prevents an above-average grade, but EA 73 is too low for the demonstrated current level.

### Ethan Grunkemeyer — HQ 87 / EA 80 / Δ +7

**keep HQ.** His 2026 breakout volume and accuracy are well ahead of EA's 80; the short established sample is why HQ stops at 87 rather than moving into the high-end tier.

There are **zero 10+ EA red flags**.

## Distribution check — performed last

| Band | Count |
| --- | ---: |
| 95-100 | 4 |
| 90-94 | 8 |
| 85-89 | 18 |
| 80-84 | 19 |
| 75-79 | 15 |
| Below 75 | 4 |

Mean: **83.81**  
Median: **84**  
Range: **70-98**

No grade was moved to improve this distribution.

## Version lock

Version: `cfb-wheel-qb-grades-2026-10-03-v1`

Machine-readable authority:

`data/generated/football/wheel-cfb-qb-grades-2026-10-03.json`

This is the initial version, so there is no previous-grade change log. Every future actual change must preserve previous grade, new grade, effective date, concise reason, and nearby anchor/peer sanity check.

Normal maintenance should be a targeted exception scan rather than wholesale regrading.

## Phase boundary

**CFB QB grading is complete and locked.**

The artifact remains calibration-only and should not be merged to `main` until Cody explicitly says **“Go live.”**

Next grading step: **RB anchor board first.**
