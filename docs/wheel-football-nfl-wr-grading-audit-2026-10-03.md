# NFL Wheel of Football — WR grading audit

## Status

**WR grading locked — October 3, 2026.**

Audit-only grading artifact for every wide receiver in the current curated NFL Wheel population.

No runtime grading, Wheel generation, reveal logic, eligibility, or historical result behavior is changed here.

Population source: `data/generated/football/wheel-football-priorities.json` at current main `f295e359d9e70f5c55d0452f4f94d9487fbc3f06`.

Population checked: **103 WR entries**.

Constitution: PR #1641.

## Semantic

Grade **current NFL wide-receiver ability right now**.

Primary components:
- route running and separation;
- releases;
- hands and ball skills;
- contested-catch ability;
- YAC / creation;
- vertical threat;
- ability versus different coverages;
- alignment versatility;
- consistency.

Blocking is only a secondary separator.

Do not grade career greatness, fantasy value, draft status, college reputation, theoretical ceiling, quarterback quality, raw receiving totals by themselves, or a one/two-game hot streak.

## Locked anchor ladder

| Grade | WR |
| ---: | --- |
| 99 | Ja'Marr Chase |
| 99 | Jaxon Smith-Njigba |
| 98 | Puka Nacua |
| 97 | Justin Jefferson |
| 96 | Amon-Ra St. Brown |
| 96 | CeeDee Lamb |
| 93 | George Pickens |
| 92 | Nico Collins |
| 91 | Drake London |
| 90 | Chris Olave |
| 88 | Tee Higgins |
| 86 | Jaylen Waddle |
| 84 | Courtland Sutton |
| 82 | Jakobi Meyers |
| 76 | Mack Hollins |

The user correction is explicitly locked:

**Ja'Marr Chase 99 = Jaxon Smith-Njigba 99 > Puka Nacua 98 > Justin Jefferson 97.**

## Locked grades

| Grade | WR | Team | Confidence |
| ---: | --- | --- | --- |
| 99 | Ja'Marr Chase | CIN | high |
| 99 | Jaxon Smith-Njigba | SEA | high |
| 98 | Puka Nacua | LAR | high |
| 97 | Justin Jefferson | MIN | high |
| 96 | Amon-Ra St. Brown | DET | high |
| 96 | CeeDee Lamb | DAL | high |
| 93 | George Pickens | DAL | high |
| 92 | A.J. Brown | NE | high |
| 92 | Nico Collins | HOU | high |
| 91 | Drake London | ATL | high |
| 91 | Garrett Wilson | NYJ | high |
| 90 | Chris Olave | NO | high |
| 90 | Rashee Rice | KC | high |
| 90 | Tetairoa McMillan | CAR | high |
| 90 | Zay Flowers | BAL | high |
| 89 | Malik Nabers | NYG | medium |
| 88 | DeVonta Smith | PHI | high |
| 88 | DK Metcalf | PIT | high |
| 88 | Rome Odunze | CHI | high |
| 88 | Tee Higgins | CIN | high |
| 87 | Davante Adams | LAR | high |
| 87 | Emeka Egbuka | TB | high |
| 87 | Jameson Williams | DET | high |
| 87 | Mike Evans | SF | high |
| 87 | Terry McLaurin | WSH | high |
| 86 | Brian Thomas Jr. | JAX | medium |
| 86 | DJ Moore | BUF | high |
| 86 | Jaylen Waddle | DEN | high |
| 86 | Jordan Addison | MIN | high |
| 86 | Stefon Diggs | WSH | high |
| 85 | Chris Godwin Jr. | TB | high |
| 85 | Christian Watson | GB | high |
| 85 | Ladd McConkey | LAC | high |
| 85 | Marvin Harrison Jr. | ARI | medium |
| 85 | Michael Wilson | ARI | high |
| 85 | Xavier Worthy | KC | medium |
| 84 | Alec Pierce | IND | high |
| 84 | Courtland Sutton | DEN | high |
| 84 | Deebo Samuel Sr. | SF | high |
| 84 | Jauan Jennings | MIN | medium |
| 84 | Jayden Reed | GB | high |
| 84 | Jerry Jeudy | CLE | high |
| 84 | Josh Downs | IND | high |
| 84 | Khalil Shakir | BUF | high |
| 84 | Luther Burden III | CHI | medium |
| 84 | Rashid Shaheed | SEA | high |
| 84 | Ricky Pearsall | SF | medium |
| 84 | Tank Dell | HOU | medium |
| 84 | Wan'Dale Robinson | TEN | high |
| 83 | Calvin Ridley | TEN | high |
| 83 | Kayshon Boutte | HOU | high |
| 83 | Keenan Allen | IND | high |
| 83 | Michael Pittman Jr. | PIT | high |
| 83 | Quentin Johnston | LAC | medium |
| 83 | Rashod Bateman | BAL | high |
| 83 | Romeo Doubs | NE | high |
| 82 | Cooper Kupp | SEA | high |
| 82 | Darnell Mooney | NYG | high |
| 82 | Dontayvion Wicks | PHI | medium |
| 82 | Jakobi Meyers | JAX | high |
| 82 | Jalen Coker | CAR | medium |
| 82 | Marvin Mims Jr. | DEN | high |
| 82 | Tre Tucker | LV | high |
| 81 | Adonai Mitchell | NYJ | medium |
| 81 | Darius Slayton | IND | high |
| 81 | DeMario Douglas | NE | high |
| 81 | Jalen McMillan | TB | medium |
| 81 | Jalen Nailor | LV | high |
| 81 | Kalif Raymond | CHI | high |
| 81 | Keon Coleman | BUF | medium |
| 81 | Malik Washington | MIA | medium |
| 81 | Matthew Golden | GB | medium |
| 80 | Andrei Iosivas | CIN | high |
| 80 | Devaughn Vele | NO | medium |
| 80 | Dyami Brown | WSH | high |
| 80 | Jahan Dotson | ATL | high |
| 80 | KC Concepcion Jr. | CLE | low |
| 80 | Parker Washington | JAX | high |
| 80 | Tre' Harris | LAC | medium |
| 80 | Xavier Legette | CAR | medium |
| 79 | Carnell Tate | TEN | low |
| 79 | Isaac TeSlaa | DET | medium |
| 79 | Jack Bech | LV | low |
| 79 | Kendrick Bourne | ARI | high |
| 79 | Pat Bryant | DEN | low |
| 79 | Roman Wilson | PIT | low |
| 79 | Ryan Flournoy | DAL | medium |
| 79 | Tyquan Thornton | KC | medium |
| 78 | Jacob Cowing | SF | medium |
| 78 | Malachi Fields | NYG | low |
| 78 | Olamide Zaccheaus | ATL | high |
| 78 | Ted Hurst III | TB | low |
| 78 | Xavier Hutchinson | HOU | high |
| 77 | Isaiah Williams | NYJ | medium |
| 77 | Makai Lemon | PHI | low |
| 77 | Travis Hunter | JAX | low |
| 76 | Denzel Boston | CLE | low |
| 76 | Ja'Kobi Lane | BAL | low |
| 76 | Konata Mumpfield | LAR | low |
| 76 | Mack Hollins | NE | high |
| 75 | Bryce Lance | NO | low |
| 75 | Caleb Douglas | MIA | low |
| 75 | Chris Bell | MIA | low |

## Pairwise contradiction audit

- Ja'Marr Chase 99 = Jaxon Smith-Njigba 99 > Puka Nacua 98 > Justin Jefferson 97 > Amon-Ra St. Brown 96 = CeeDee Lamb 96
- George Pickens 93 > Nico Collins 92 = A.J. Brown 92 > Drake London 91 = Garrett Wilson 91 > Chris Olave 90 = Zay Flowers 90 = Tetairoa McMillan 90 = Rashee Rice 90 > Malik Nabers 89
- Tee Higgins 88 = Rome Odunze 88 = DeVonta Smith 88 = DK Metcalf 88 > Jameson Williams 87 = Davante Adams 87 = Mike Evans 87 = Emeka Egbuka 87 = Terry McLaurin 87
- Jaylen Waddle 86 = DJ Moore 86 = Brian Thomas Jr. 86 = Jordan Addison 86 = Stefon Diggs 86 > Marvin Harrison Jr. 85 = Michael Wilson 85 = Christian Watson 85 = Xavier Worthy 85 = Ladd McConkey 85 = Chris Godwin Jr. 85
- Courtland Sutton 84 = Khalil Shakir 84 = Luther Burden III 84 = Jerry Jeudy 84 = Jayden Reed 84 = Tank Dell 84 = Josh Downs 84 = Alec Pierce 84 = Jauan Jennings 84 = Rashid Shaheed 84 = Deebo Samuel Sr. 84 = Ricky Pearsall 84 = Wan'Dale Robinson 84
- Rashod Bateman 83 = Kayshon Boutte 83 = Keenan Allen 83 = Quentin Johnston 83 = Romeo Doubs 83 = Michael Pittman Jr. 83 = Calvin Ridley 83
- Jakobi Meyers 82 = Jalen Coker 82 = Marvin Mims Jr. 82 = Tre Tucker 82 = Darnell Mooney 82 = Dontayvion Wicks 82 = Cooper Kupp 82
- Keon Coleman 81 = Matthew Golden 81 = Darius Slayton 81 = Jalen Nailor 81 = Malik Washington 81 = DeMario Douglas 81 = Adonai Mitchell 81 = Jalen McMillan 81
- Jahan Dotson 80 = Xavier Legette 80 = Andrei Iosivas 80 = KC Concepcion Jr. 80 = Parker Washington 80 = Tre' Harris 80 = Devaughn Vele 80 = Dyami Brown 80
- Kendrick Bourne 79 = Ryan Flournoy 79 = Pat Bryant 79 = Isaac TeSlaa 79 = Tyquan Thornton 79 = Jack Bech 79 = Roman Wilson 79 = Carnell Tate 79
- Olamide Zaccheaus 78 = Xavier Hutchinson 78 = Malachi Fields 78 = Jacob Cowing 78 = Ted Hurst III 78 > Travis Hunter 77 = Isaiah Williams 77 = Makai Lemon 77 > Ja'Kobi Lane 76 = Denzel Boston 76 = Konata Mumpfield 76 = Mack Hollins 76 > Caleb Douglas 75 = Chris Bell 75 = Bryce Lance 75

### Pressure points resolved

- The user-locked ceiling is Chase 99 = JSN 99 > Puka 98 > Jefferson 97. JSN is not treated as a one-season fluke after a 1,793-yard OPOY season and a league-leading 405 yards through Week 3 of 2026.
- Puka moves to 98 despite the strongest immediate 2025 production because the user prefers Chase/JSN as the true current ceiling; the gap is only one point.
- Jefferson moves to 97. His elite underlying skill remains intact, but the down 2025 season prevents an automatic reputation-based 98-99.
- Malik Nabers lands at 89 rather than 92+ because the dominant 2024 rookie year is now followed by only four 2025 games and a slow 2026 opening. Injury is not directly penalized, but the current evidence base is thinner.
- Tetairoa McMillan reaches 90 because the 2025 Offensive Rookie of the Year season (1,014 yards) plus a productive 2026 start provide real NFL proof, not projection.
- Rashee Rice reaches 90 on demonstrated separation/YAC ability and a strong 2026 return; no fantasy-volume premium is applied.
- Brian Thomas Jr. sits at 86 rather than carrying his rookie reputation into the high-end tier because 2025-26 consistency has not yet supported it.
- Travis Hunter is 77 as a WR because current NFL receiving evidence is almost nonexistent; college greatness and two-way projection are excluded.

Result: **locked; no remaining contradiction flags.**

## Distribution check — performed after grading

| Band | Count |
| --- | ---: |
| 95-100 | 6 |
| 90-94 | 9 |
| 85-89 | 21 |
| 80-84 | 44 |
| 75-79 | 23 |
| below-75 | 0 |

Mean: **83.67**  
Median: **83**  
Range: **75-99**

No grade was moved to improve the distribution.

## Version lock

Version: `nfl-wheel-wr-grades-2026-10-03-v1`

Machine-readable authority:

`data/generated/football/wheel-nfl-wr-grades-2026-10-03.json`

Every future actual grade change must preserve:
- previous grade;
- new grade;
- effective date;
- concise reason;
- nearby anchor/peer sanity check.

## Phase boundary

**WR calibration is complete and locked.**

Next position family begins with anchors only.
