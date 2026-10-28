# College Football Wheel of Football — WR grading audit

## Status

**WR calibration locked — October 3, 2026.**

This audit grades every wide receiver in the current manually curated 68-school CFB Wheel population.

It is **calibration-only**. It does not wire grades into runtime, expose hidden scores, alter Wheel generation, or change historical results.

Population authority:
- `data/generated/football/cfb/wheel-football-current-priorities-2026.json`
- `data/curated/football/cfb/wheel-football-priority-audit-2026-10-03.json`
- current main at grading start: `8285e5a842b020489f5da9ffaeed5fd9f20396f0`

Population checked: **228 WR entries across 68 schools**.

## Semantic

Grade **current college-football wide receiver ability right now**.

The locked CFB weighting is more current-season-sensitive than the NFL model:
- 2026 performance and role lead;
- 2025 substantially stabilizes;
- older evidence is secondary;
- no NFL projection, recruiting ranking, draft stock, school prestige, fame, fantasy value, or future-upside bonus.

The 55-60% / 30-35% / remainder concept is guidance, **not a formula**.

WR ability includes separation/release, route running, hands, catch-point ability, YAC/creation, vertical threat, ball security and overall receiving usefulness.

## Evidence freeze

Evidence is frozen to **completed games through September 27, 2026** so October 3 games do not create inconsistent timing within the position.

Primary evidence:
- EA SPORTS College Football 27 current Week 4 WR ratings where exact current entries were available;
- 2026 national/conference receiving leader tables and current player game logs;
- official school statistics and Sports-Reference / CFBStats prior-season context;
- recent game recaps for role/opponent context.

EA is used only as an error detector.

## Approved anchor ladder

| HQ | Player | School |
| ---: | --- | --- |
| 99 | Jeremiah Smith | Ohio State |
| 98 | Malachi Toney | Miami |
| 97 | KJ Duff | Rutgers |
| 94 | Charlie Becker | Indiana |
| 94 | Wyatt Young | Oklahoma State |
| 92 | Chris Marshall | Arkansas |
| 91 | Ryan Coleman-Williams | Alabama |
| 91 | Duce Robinson | Florida State |
| 89 | Cam Coleman | Texas |
| 88 | Mario Craver | Texas A&M |
| 86 | Cooper Barkate | Miami |
| 83 | Hudson Clement | Illinois |
| 78 | Ricky Johnson | Utah |
| 74 | Brayden Trimble | Illinois |

## Full locked WR board

| HQ | Player | School | EA CFB 27 | Δ | QA |
| ---: | --- | --- | ---: | ---: | --- |
| 99 | Jeremiah Smith | Ohio State | 99 | 0 |  |
| 98 | Malachi Toney | Miami | 97 | +1 |  |
| 97 | KJ Duff | Rutgers | 93 | +4 |  |
| 95 | Carlos Hernandez | Wake Forest | 87 | +8 | REVIEW |
| 94 | Charlie Becker | Indiana | 92 | +2 |  |
| 94 | Collin Dixon | Illinois | 87 | +7 | REVIEW |
| 94 | Wyatt Young | Oklahoma State | 91 | +3 |  |
| 93 | Anthony Evans III | Mississippi State | 87 | +6 |  |
| 93 | Cayden Lee | Missouri | 89 | +4 |  |
| 93 | Deuce Alexander | Ole Miss | 88 | +5 |  |
| 92 | Chris Marshall | Arkansas | 84 | +8 | REVIEW |
| 92 | JJ Buchanan | Michigan | 86 | +6 |  |
| 92 | Reed Harris | Arizona State | 90 | +2 |  |
| 91 | Amare Thomas | Houston | 90 | +1 |  |
| 91 | Donovan Olugbode | Missouri | 85 | +6 |  |
| 91 | Duce Robinson | Florida State | 92 | -1 |  |
| 91 | Ryan Coleman-Williams | Alabama | 91 | 0 |  |
| 90 | Junior Sherrill | Vanderbilt | 88 | +2 |  |
| 90 | Tre Richardson | Louisville | 86 | +4 |  |
| 89 | Cam Coleman | Texas | 94 | -5 |  |
| 89 | Dezmen Roebuck | Washington | 88 | +1 |  |
| 89 | Que'Sean Brown | Virginia Tech | 86 | +3 |  |
| 89 | Winston Watkins Jr. | LSU | 87 | +2 |  |
| 88 | Braden Pegan | Utah | 86 | +2 |  |
| 88 | Chase Hendricks | California | 87 | +1 |  |
| 88 | Chris Durr Jr. | Maryland | 82 | +6 |  |
| 88 | Dakorien Moore | Oregon | 88 | 0 |  |
| 88 | Ed Small | TCU | 81 | +7 | REVIEW |
| 88 | Isaiah Sategna III | Oklahoma | 90 | -2 |  |
| 88 | Jordan Faison | Notre Dame | 88 | 0 |  |
| 88 | Justin Bowick | Oklahoma State | 85 | +3 |  |
| 88 | JV Gibson | Cincinnati | 85 | +3 |  |
| 88 | Kenny Darby | Kentucky | — | — | N/A |
| 88 | Keshaun Singleton | Auburn | 88 | 0 |  |
| 88 | Legend Glasker | BYU | — | — | N/A |
| 88 | Mario Craver | Texas A&M | 91 | -3 |  |
| 88 | Nick Marsh | Indiana | 88 | 0 |  |
| 88 | Tre Spivey | Arizona | — | — | N/A |
| 88 | Vernell Brown III | Florida | 88 | 0 |  |
| 87 | Eric Singleton Jr. | Florida | 90 | -3 |  |
| 87 | Ian Strong | California | 90 | -3 |  |
| 87 | Kayden Dixon-Wyatt | USC | 83 | +4 |  |
| 87 | Keenan Jackson | NC State | 85 | +2 |  |
| 87 | Kenny Johnson | Texas Tech | 87 | 0 |  |
| 87 | T.J. Moore | Clemson | 88 | -1 |  |
| 87 | Tyrell Henry | Wisconsin | — | — | N/A |
| 87 | Yannick Smith | SMU | 83 | +4 |  |
| 86 | Andrew Marsh | Michigan | 88 | -2 |  |
| 86 | Brandon Inniss | Ohio State | 87 | -1 |  |
| 86 | Cataurus Hicks | Pittsburgh | — | — | N/A |
| 86 | Cooper Barkate | Miami | 90 | -4 |  |
| 86 | Dallas Wilson | Florida | 85 | +1 |  |
| 86 | Evan Stewart | Oregon | 87 | -1 |  |
| 86 | Jacory Barney Jr. | Nebraska | 87 | -1 |  |
| 86 | Lotzeir Brooks | Alabama | 88 | -2 |  |
| 86 | Louis Brown IV | Baylor | — | — | N/A |
| 86 | Mike Matthews | Tennessee | 87 | -1 |  |
| 86 | Nik McMillan | Kansas | 89 | -3 |  |
| 86 | Noah Jennings | Minnesota | — | — | N/A |
| 86 | Ryan Wingo | Texas | 88 | -2 |  |
| 86 | Trent Mosley | USC | 83 | +3 |  |
| 86 | Yamir Knight | SMU | 86 | 0 |  |
| 85 | Bryant Wesco Jr. | Clemson | 87 | -2 |  |
| 85 | Caden High | Stanford | — | — | N/A |
| 85 | Danny Scudero | Colorado | 90 | -5 |  |
| 85 | Devin McCuin | Ohio State | 86 | -1 |  |
| 85 | DJ Epps | West Virginia | 78 | +7 | REVIEW |
| 85 | Gavin Freeman | Baylor | 85 | 0 |  |
| 85 | Isaiah Horton | Texas A&M | 87 | -2 |  |
| 85 | Jackson Harris | LSU | 89 | -4 |  |
| 85 | Jalen Cooper | SMU | — | — | N/A |
| 85 | Jeremy Scott | TCU | — | — | N/A |
| 85 | Kameron Courtney | Virginia | — | — | N/A |
| 85 | Kwazi Gilmer | Nebraska | 85 | 0 |  |
| 85 | Nyck Harbor | South Carolina | 85 | 0 |  |
| 85 | Omarion Miller | Arizona State | 88 | -3 |  |
| 84 | Asaad Waseem | Purdue | 85 | -1 |  |
| 84 | Braylon Staley | Tennessee | 88 | -4 |  |
| 84 | Chas Nimrod | Auburn | 82 | +2 |  |
| 84 | Chris Lawson | Washington | — | — | N/A |
| 84 | Coy Eakin | Texas Tech | 87 | -3 |  |
| 84 | DeAndre Moore Jr. | Colorado | 86 | -2 |  |
| 84 | Demetrice McCray | Pittsburgh | — | — | N/A |
| 84 | Griffin Wilde | Northwestern | 86 | -2 |  |
| 84 | Horatio Fields | Ole Miss | — | — | N/A |
| 84 | Isaiah Fuhrmann | Georgia Tech | — | — | N/A |
| 84 | Isiah Canion | Georgia | 83 | +1 |  |
| 84 | Jared Richardson | Duke | — | — | N/A |
| 84 | Javon Tracy | Minnesota | 87 | -3 |  |
| 84 | Jayden McGowan | Baylor | 83 | +1 |  |
| 84 | Joseph Williams | Colorado | 88 | -4 |  |
| 84 | Josh Derry | UCF | — | — | N/A |
| 84 | Josh Manning | Kansas State | — | — | N/A |
| 84 | Koby Young | Houston | — | — | N/A |
| 84 | Lawayne McCoy | Louisville | 84 | 0 |  |
| 84 | Marquis Johnson | Mississippi State | — | — | N/A |
| 84 | Omari Hayes | Iowa State | 84 | 0 |  |
| 84 | Reece Vander Zee | Iowa | — | — | N/A |
| 84 | Rico Scott | Alabama | — | — | N/A |
| 84 | Rodney Bullard Jr. | Michigan State | 84 | 0 |  |
| 84 | Terry Bussey | Texas A&M | — | — | N/A |
| 84 | Trent Walker | Houston | 87 | -3 |  |
| 84 | Tyler Morris | Indiana | — | — | N/A |
| 84 | Umari Hatcher | Syracuse | — | — | N/A |
| 84 | Victor Snow | NC State | 86 | -2 |  |
| 83 | Ayden Greene | Virginia Tech | 83 | 0 |  |
| 83 | Chase Sowell | Penn State | 85 | -2 |  |
| 83 | Hudson Clement | Illinois | 84 | -1 |  |
| 83 | Jaron Tibbs | Kansas State | 84 | -1 |  |
| 83 | Mason Humphrey | North Carolina | — | — | N/A |
| 83 | Mazeo Bennett Jr. | South Carolina | — | — | N/A |
| 83 | Na'eem Abdul-Rahim Gladding | Maryland | 82 | +1 |  |
| 83 | Nyziah Hunter | Nebraska | 85 | -2 |  |
| 83 | Reed Swanson | Boston College | — | — | N/A |
| 83 | Semaj Morgan | UCLA | — | — | N/A |
| 83 | Talyn Taylor | Georgia | 83 | 0 |  |
| 82 | Antonio Meeks | Wake Forest | — | — | N/A |
| 82 | Ben Black III | Rutgers | — | — | N/A |
| 82 | Brian Rowe Jr. | UCLA | — | — | N/A |
| 82 | Brycen Coleman | Vanderbilt | — | — | N/A |
| 82 | Censere Lee | Pittsburgh | — | — | N/A |
| 82 | Chris Hunter III | Arizona | — | — | N/A |
| 82 | Chrishon McCray | Michigan State | 85 | -3 |  |
| 82 | CJ Brown | Arkansas | — | — | N/A |
| 82 | Creed Whittemore | Utah | 82 | 0 |  |
| 82 | Da'Shawn Martin | Virginia | 82 | 0 |  |
| 82 | De'Nylon Morrissette | Purdue | — | — | N/A |
| 82 | DJ Miller | Kentucky | — | — | N/A |
| 82 | Emmett Mosley V | Texas | 84 | -2 |  |
| 82 | Eugene Wilson III | LSU | 85 | -3 |  |
| 82 | Hayden Eligon II | Northwestern | 82 | 0 |  |
| 82 | Jaden Bray | West Virginia | — | — | N/A |
| 82 | Jadon Porter | Baylor | — | — | N/A |
| 82 | Jalen Smith | Minnesota | — | — | N/A |
| 82 | Jeremiah McClellan | Oregon | 86 | -4 |  |
| 82 | Johntay Cook II | Ole Miss | — | — | N/A |
| 82 | Jordan Shipp | North Carolina | 83 | -1 |  |
| 82 | Joshisa Trader | NC State | — | — | N/A |
| 82 | Kyler Kasper | BYU | 84 | -2 |  |
| 82 | Malachi Henry | Cincinnati | — | — | N/A |
| 82 | Micah Gilbert | Notre Dame | 84 | -2 |  |
| 82 | Micahi Danzy | Florida State | 84 | -2 |  |
| 82 | Nitro Tuggle | South Carolina | — | — | N/A |
| 82 | Sanfrisco Magee | Mississippi State | — | — | N/A |
| 82 | TreyShun Hurry | Louisville | — | — | N/A |
| 81 | Chris Barnes | Oklahoma State | — | — | N/A |
| 81 | Elijah Thomas | Oklahoma | — | — | N/A |
| 81 | Fredrick Moore | Michigan State | — | — | N/A |
| 81 | Jaedn Skeete | Boston College | — | — | N/A |
| 81 | Jayden Moore | Duke | — | — | N/A |
| 81 | JonAnthony Hall | Stanford | — | — | N/A |
| 81 | Malcolm Simmons | Texas Tech | — | — | N/A |
| 81 | Messiah Hampton | Oregon | — | — | N/A |
| 81 | Radarious Jackson | Tennessee | — | — | N/A |
| 81 | Tyler Brown | Clemson | 82 | -1 |  |
| 81 | Waden Charles | UCF | — | — | N/A |
| 80 | Chris Brooks Jr. | Wisconsin | — | — | N/A |
| 80 | Cooper Perry | California | 81 | -1 |  |
| 80 | Dalen Penson | Georgia Tech | — | — | N/A |
| 80 | Davion Brown | Virginia Tech | — | — | N/A |
| 80 | Dominic Overby | Iowa State | — | — | N/A |
| 80 | Jacobe Hayes | TCU | — | — | N/A |
| 80 | Jalen Moss | Arizona State | — | — | N/A |
| 80 | Jayvan Boggs | Florida State | — | — | N/A |
| 80 | Jeremiah Koger | Auburn | — | — | N/A |
| 80 | Joshua Moore | Miami | — | — | N/A |
| 80 | Koby Howard | Penn State | 82 | -2 |  |
| 80 | Mylan Graham | Notre Dame | — | — | N/A |
| 80 | Naeshaun Montgomery | Missouri | — | — | N/A |
| 80 | Nahzae Cox | Kansas | — | — | N/A |
| 80 | Nic Anderson | Kentucky | 83 | -3 |  |
| 80 | Rashid Williams | Washington | — | — | N/A |
| 80 | Tanook Hines | USC | — | — | N/A |
| 80 | Traylon Ray | Ole Miss | — | — | N/A |
| 80 | Trech Kekahuna | North Carolina | — | — | N/A |
| 80 | Zion Ragins | Mississippi State | — | — | N/A |
| 79 | Brandon White | Kansas State | — | — | N/A |
| 79 | Brett Eskildsen | Penn State | — | — | N/A |
| 79 | Chauncey Magwood | Purdue | — | — | N/A |
| 79 | Chris Henry Jr. | Ohio State | — | — | N/A |
| 79 | Cole Weaver | Syracuse | 81 | -2 |  |
| 79 | Davion Chandler | Indiana | — | — | N/A |
| 79 | Donovan Murph | South Carolina | — | — | N/A |
| 79 | Giovanni Richardson | Arizona | — | — | N/A |
| 79 | Jacquon Gibson | Virginia | — | — | N/A |
| 79 | Javarius Green | Boston College | — | — | N/A |
| 79 | Jojo Phillips | BYU | — | — | N/A |
| 79 | Jordan Onovughe | Stanford | — | — | N/A |
| 79 | Jourdin Houston | Rutgers | — | — | N/A |
| 79 | Kaleb Webb | Maryland | — | — | N/A |
| 79 | Kam Shanks | Wake Forest | — | — | N/A |
| 79 | Parker Livingstone | Oklahoma | 82 | -3 |  |
| 79 | Sacovie White Helton | Georgia | — | — | N/A |
| 79 | Tony Diaz | Iowa | — | — | N/A |
| 79 | Ty Robinson | Illinois | 79 | 0 |  |
| 78 | Ashton Bethel-Roman | Texas A&M | 81 | -3 |  |
| 78 | Eugene Hilton Jr. | Wisconsin | — | — | N/A |
| 78 | Evan Boyd | Iowa State | — | — | N/A |
| 78 | Isaiah Johnson | Cincinnati | — | — | N/A |
| 78 | Ismael Cisse | Arkansas | — | — | N/A |
| 78 | Jonah Burton | Duke | — | — | N/A |
| 78 | Jordan Allen | Georgia Tech | — | — | N/A |
| 78 | Keaton Kubecka | Kansas | — | — | N/A |
| 78 | Landon Ellis | UCLA | 83 | -5 |  |
| 78 | Micah Hudson | Texas Tech | 82 | -4 |  |
| 78 | Ric'Darious Farmer | UCF | — | — | N/A |
| 78 | Ricky Johnson | Utah | — | — | N/A |
| 78 | Salesi Moa | Michigan | — | — | N/A |
| 78 | Tony Kinsler | Pittsburgh | — | — | N/A |
| 78 | Tristen Brown | Vanderbilt | — | — | N/A |
| 78 | Zacharyus Williams | USC | — | — | N/A |
| 77 | Darius Johnson | Syracuse | — | — | N/A |
| 77 | Isaiah Mizell | Arizona | — | — | N/A |
| 77 | John Neider | West Virginia | — | — | N/A |
| 77 | Marlion Jackson | Virginia Tech | — | — | N/A |
| 77 | Shane Carr | Kentucky | — | — | N/A |
| 77 | Terrence Lewis | Oklahoma State | — | — | N/A |
| 77 | Zay Robinson | Penn State | — | — | N/A |
| 76 | Cody Jackson | Iowa State | — | — | N/A |
| 76 | Craig Dandridge | Georgia | — | — | N/A |
| 76 | Derrick Salley Jr. | Kansas State | — | — | N/A |
| 76 | Drew Wagner | Northwestern | — | — | N/A |
| 76 | Evan James | Iowa | — | — | N/A |
| 76 | Johnathan Montague Jr. | Boston College | — | — | N/A |
| 76 | Liam Thorpe | Stanford | — | — | N/A |
| 76 | Ty'Lyric Coleman | Virginia | — | — | N/A |
| 75 | Tate Nagy | Kansas | — | — | N/A |
| 74 | Brayden Trimble | Illinois | 79 | -5 |  |

## Pairwise contradiction audit

### Ceiling

**Smith 99 > Toney 98 > Duff 97 > Carlos Hernandez 95**

Smith remains the current ceiling. Toney and Duff combine elite 2026 production with major 2025 evidence. Hernandez's 516-yard first month plus a real 2025 baseline made him strong enough to enter the elite tier during the full-population audit.

### High-end

**Carlos Hernandez 95 > Becker 94 = Collin Dixon 94 = Wyatt Young 94**

No contradiction remained after blind comparison. Dixon's 430 yards and seven touchdowns through four games are strong enough to overcome the shorter elite sample. Becker and Young remain the approved 94 anchors.

### 92–93 neighborhood

**Anthony Evans III 93 = Cayden Lee 93 = Deuce Alexander 93 > Chris Marshall 92 = JJ Buchanan 92 = Reed Harris 92**

This neighborhood is deliberately driven by 2026. Each player has national-level current production, while sample and established prior level prevent moving them into the 95+ tier.

### 90–91 neighborhood

**Amare Thomas 91 = Donovan Olugbode 91 = Duce Robinson 91 = Ryan Coleman-Williams 91 > Junior Sherrill 90 = Tre Richardson 90**

Different profiles tie because their current total WR value is close. No player receives a school/recruiting boost.

### Upper-middle through floor

The 89 through 80 bands were checked against adjacent players rather than against a target distribution.

The floor remains real:

**79 cluster > 78 cluster > 77 cluster > 76 cluster > Tate Nagy 75 > Brayden Trimble 74**

A curated Wheel slot does not imply an 80 floor.

## Range / separation audit

Passed.

- Minimum: **74**
- Maximum: **99**
- Below 80: **52**
- 80-84: **100**
- 85-89: **57**
- 90-94: **15**
- 95-100: **4**

No player was raised merely because he was selected for the curated population.

## EA College Football 27 discrepancy audit

Rule:
- **0-6:** normally no mandatory review;
- **7-9:** mandatory review;
- **10+:** major red flag requiring explicit written defense;
- EA never sets the grade and is never a required midpoint.

Exact current EA Week 4 ratings were resolved for **109/228** curated WRs. Unresolved entries were left unresolved rather than fabricating a value.

### Final mandatory discrepancies

### Chris Marshall — HQ 92 / EA 84 / Δ +8

**keep HQ.** Keep HQ 92. The current four-game breakout and physical receiving profile are materially ahead of EA 84; the grade is high-end, not ceiling-level, because the established sample is less complete.

### Collin Dixon — HQ 94 / EA 87 / Δ +7

**keep HQ.** Keep HQ 94. He has 430 yards and seven TD through four games, including a credible 63-yard showing at Ohio State. EA has moved him up but still trails the current football evidence.

### Ed Small — HQ 88 / EA 81 / Δ +7

**keep HQ.** Keep HQ 88. Four-game production (24 catches, 371 yards) is a real sophomore breakout; 88 recognizes that without pretending his limited prior sample makes him elite.

### DJ Epps — HQ 85 / EA 78 / Δ +7

**keep HQ.** Keep HQ 85. EA 78 is too low after 279 yards/3 TD through four games plus a 512-yard 2025 season, but the audit already reduced HQ from 91 to 85 to avoid overreacting to explosive-play production.

### Carlos Hernandez — HQ 95 / EA 87 / Δ +8

**keep HQ.** Keep HQ 95. His 2026 production is elite (30 catches, 516 yards, 3 TD through four games) and is supported by a 611-yard 2025 season. EA 87 is clearly lagging the current level.

There are **0 final 10+ red flags**.

### Corrections caused by the last-line audit

- **Koby Young: 89 → 84.** Current touchdown explosiveness did not justify an upper-80s complete-WR grade on only 171 receiving yards and a thin prior sample.
- **DJ Epps: 91 → 85.** Current explosive production plus 2025 output is good, but the original grade overreacted to big plays and short-sample efficiency.
- **Chris Durr Jr.: 91 → 88.** Volume breakout is real, but 8.9 yards per catch and modest prior production do not support the low-90s.
- **Amare Thomas: 93 → 91.** Four TDs in four games are strong, but 287 receiving yards made 93 too aggressive.
- **Ed Small: 90 → 88.** 371 yards through four games justify a major rise, but the limited 2025 sample keeps him below the 90 tier.

The audit can keep HQ, move HQ toward EA, or move HQ farther away. EA creates scrutiny, not gravity.

## Distribution check — performed last

| Band | Count |
| --- | ---: |
| 95-100 | 4 |
| 90-94 | 15 |
| 85-89 | 57 |
| 80-84 | 100 |
| 75-79 | 51 |
| Below 75 | 1 |

Mean: **83.21**  
Median: **83**  
Range: **74-99**

Distribution was inspected only after player-by-player grading and QA.

## Version lock

Version: `cfb-wheel-wr-grades-2026-10-03-v1`

Machine-readable authority:

`data/generated/football/wheel-cfb-wr-grades-2026-10-03.json`

Every future actual WR grade change must preserve:
- previous grade;
- new grade;
- effective date;
- concise football reason;
- nearby anchor/peer sanity check.

Normal maintenance should be a targeted exception scan rather than a wholesale regrade.

## Phase boundary

**CFB WR grading is complete and locked.**

This branch must **not** merge to `main` until Cody explicitly says **“Go live.”**

Next grading step: **TE anchor board first.**
