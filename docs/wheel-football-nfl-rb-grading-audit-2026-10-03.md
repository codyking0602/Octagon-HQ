# NFL Wheel of Football — RB grading audit

## Status

**RB grading locked — October 3, 2026.**

This is an audit-only grading artifact for every running back in the current curated NFL Wheel population.

It does **not** wire grades into runtime, alter Wheel generation, expose hidden grades, or change historical results.

Population source: `data/generated/football/wheel-football-priorities.json` at main `b582b00917da256880fc24cb0ff9df9f105eb30e`.

Population checked: **65 RB entries**.

Constitution: PR #1641.

## Semantic

Grade **current NFL running-back ability right now**.

The grade covers vision/decision-making, burst, elusiveness, contact balance/power, creation beyond blocking, short-yardage, receiving, ball security and pass-game usefulness.

Do not grade career greatness, fantasy value, draft status, college reputation, theoretical ceiling, or a one/two-game hot streak. Injury/availability is primarily an eligibility issue.

## Approved anchor ladder

| Grade | RB |
| ---: | --- |
| 99 | Bijan Robinson |
| 98 | Jahmyr Gibbs |
| 96 | Christian McCaffrey |
| 95 | Jonathan Taylor |
| 94 | James Cook III |
| 94 | Derrick Henry |
| 94 | Saquon Barkley |
| 91 | De'Von Achane |
| 89 | Kenneth Walker |
| 88 | Kyren Williams |
| 86 | Breece Hall |
| 85 | Chase Brown |
| 82 | Tony Pollard |
| 78 | Justice Hill |
| 74 | Tyler Goodson |

## Locked grades

| Grade | RB | Team | Confidence |
| ---: | --- | --- | --- |
| 99 | Bijan Robinson | ATL | high |
| 98 | Jahmyr Gibbs | DET | high |
| 96 | Christian McCaffrey | SF | high |
| 95 | Jonathan Taylor | IND | high |
| 94 | Derrick Henry | BAL | high |
| 94 | James Cook III | BUF | high |
| 94 | Saquon Barkley | PHI | high |
| 91 | De'Von Achane | MIA | high |
| 89 | Kenneth Walker | KC | high |
| 88 | Jaylen Warren | PIT | high |
| 88 | Kyren Williams | LAR | high |
| 87 | Bucky Irving | TB | high |
| 86 | Breece Hall | NYJ | high |
| 86 | Josh Jacobs | GB | high |
| 86 | TreVeyon Henderson | NE | medium |
| 85 | Chase Brown | CIN | high |
| 85 | Kyle Monangai | CHI | medium |
| 84 | Chuba Hubbard | CAR | high |
| 84 | J.K. Dobbins | DEN | high |
| 84 | Travis Etienne Jr. | NO | high |
| 83 | Ashton Jeanty | LV | high |
| 83 | Bhayshul Tuten | JAX | medium |
| 83 | D'Andre Swift | CHI | high |
| 83 | James Conner | ARI | medium |
| 83 | Javonte Williams | DAL | high |
| 83 | Omarion Hampton | LAC | medium |
| 82 | Aaron Jones Sr. | MIN | high |
| 82 | Brian Robinson | ATL | high |
| 82 | Cam Skattebo | NYG | medium |
| 82 | David Montgomery | HOU | high |
| 82 | Isiah Pacheco | DET | high |
| 82 | Jeremiyah Love | ARI | medium |
| 82 | Jordan Mason | MIN | high |
| 82 | Rachaad White | WSH | high |
| 82 | Rhamondre Stevenson | NE | high |
| 82 | Tony Pollard | TEN | high |
| 82 | Tyler Allgeier | ARI | high |
| 82 | Zach Charbonnet | SEA | high |
| 81 | Blake Corum | LAR | medium |
| 81 | Jacory Croskey-Merritt | WSH | high |
| 81 | Keaton Mitchell | LAC | high |
| 81 | Tyjae Spears | TEN | high |
| 80 | Alvin Kamara | NO | high |
| 80 | Najee Harris | NYG | high |
| 80 | Quinshon Judkins | CLE | high |
| 80 | Rico Dowdle | PIT | high |
| 79 | Emmett Johnson | KC | low |
| 79 | Isaac Guerendo | SF | medium |
| 79 | Jaylen Wright | MIA | medium |
| 79 | Kenny Gainwell | TB | high |
| 79 | Tank Bigsby | PHI | high |
| 79 | Woody Marks | HOU | high |
| 78 | Braelon Allen | NYJ | high |
| 78 | Jadarian Price | SEA | low |
| 78 | Justice Hill | BAL | high |
| 78 | Mike Washington Jr. | LV | low |
| 78 | RJ Harvey | DEN | low |
| 78 | Samaje Perine | CIN | high |
| 77 | Chris Rodriguez Jr. | JAX | high |
| 77 | Dylan Sampson | CLE | medium |
| 77 | Ty Johnson | BUF | high |
| 76 | Jonathon Brooks | CAR | low |
| 76 | MarShawn Lloyd | GB | low |
| 75 | Seth McGowan | IND | low |
| 74 | Tyler Goodson | DAL | high |

## Pairwise contradiction audit

- Bijan Robinson 99 > Jahmyr Gibbs 98 > Christian McCaffrey 96 > Jonathan Taylor 95 > James Cook III 94 = Derrick Henry 94 = Saquon Barkley 94
- De'Von Achane 91 > Kenneth Walker 89 > Kyren Williams 88 = Jaylen Warren 88 > Bucky Irving 87 > Josh Jacobs 86 = Breece Hall 86 = TreVeyon Henderson 86 > Chase Brown 85 = Kyle Monangai 85
- Chuba Hubbard 84 = J.K. Dobbins 84 = Travis Etienne Jr. 84 > James Conner 83 = D'Andre Swift 83 = Javonte Williams 83 = Bhayshul Tuten 83 = Omarion Hampton 83 = Ashton Jeanty 83
- Tony Pollard 82 = Jeremiyah Love 82 = Tyler Allgeier 82 = Brian Robinson 82 = Isiah Pacheco 82 = David Montgomery 82 = Aaron Jones Sr. 82 = Jordan Mason 82 = Rhamondre Stevenson 82 = Cam Skattebo 82 = Zach Charbonnet 82 = Rachaad White 82
- Keaton Mitchell 81 = Blake Corum 81 = Tyjae Spears 81 = Jacory Croskey-Merritt 81 > Quinshon Judkins 80 = Alvin Kamara 80 = Najee Harris 80 = Rico Dowdle 80
- Woody Marks 79 = Emmett Johnson 79 = Jaylen Wright 79 = Tank Bigsby 79 = Isaac Guerendo 79 = Kenny Gainwell 79 > Justice Hill 78 = Samaje Perine 78 = RJ Harvey 78 = Mike Washington Jr. 78 = Braelon Allen 78 = Jadarian Price 78
- Ty Johnson 77 = Dylan Sampson 77 = Chris Rodriguez Jr. 77 > Jonathon Brooks 76 = MarShawn Lloyd 76 > Seth McGowan 75 > Tyler Goodson 74

### Pressure points resolved

- Jaylen Warren grades 88, not as a September reaction, but because 2025 already established a 1,291-scrimmage-yard all-around baseline and 2026 has reinforced it.
- Bucky Irving stays 87: 2024 was elite efficiency and 2026 has rebounded, but the 2025 decline keeps him below the 88-89 band.
- Kyle Monangai reaches 85 because his 2025 rookie season (783 yards at 4.6) provides a real baseline; the hot two-game 2026 opening only confirms rather than creates the grade.
- Ashton Jeanty is 83. Draft pedigree and college dominance are excluded; his actual NFL rushing efficiency (3.6 career YPC) prevents a reputation-based high grade despite receiving value.
- Alvin Kamara is 80. Career greatness is intentionally ignored; 2025 and early 2026 rushing efficiency show genuine current decline.
- Jonathon Brooks remains 76 because the NFL sample is only 18 carries. College evaluation and projection cannot substitute for current NFL evidence.

Result: **locked; no remaining contradiction flags.**

## Distribution check — performed after grading

| Band | Count |
| --- | ---: |
| 95-100 | 4 |
| 90-94 | 4 |
| 85-89 | 9 |
| 80-84 | 29 |
| 75-79 | 18 |
| below-75 | 1 |

Mean: **82.97**  
Median: **82**  
Range: **74-99**

No grade was moved to improve the distribution.

## Version lock

Version: `nfl-wheel-rb-grades-2026-10-03-v1`

Machine-readable authority:

`data/generated/football/wheel-nfl-rb-grades-2026-10-03.json`

Every future actual grade change must preserve:
- previous grade;
- new grade;
- effective date;
- concise reason;
- nearby anchor/peer sanity check.

## Phase boundary

**RB calibration is complete and locked.**

Next position family should begin with anchors only.
