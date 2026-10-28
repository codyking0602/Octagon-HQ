# NFL Wheel of Football — Secondary grading audit

## Status

**Secondary grading locked — October 3, 2026.**

Audit-only grading artifact for every Secondary player in the current curated NFL Wheel population.

No runtime grading, Wheel generation, reveal logic, eligibility, or historical result behavior is changed here.

Population source: `data/generated/football/wheel-football-priorities.json` at current main `f295e359d9e70f5c55d0452f4f94d9487fbc3f06`.

Population checked: **168 Secondary entries**.

Constitution: PR #1641.

## Semantic

Grade **current NFL ability in the player's actual secondary role right now**.

Outside corner, slot/nickel and safety are role-normalized inside one grade. Coverage is primary, with assignment difficulty, ball skills, tackling, run support, processing, versatility and down-to-down consistency weighted by role.

Career greatness, fame, fantasy/IDP value, Madden overall, draft status and projection do not determine the grade.

## Locked anchor ladder

| Grade | Player | Anchor |
| ---: | --- | --- |
| 99 | Kyle Hamilton | current secondary ceiling |
| 98 | Trent McDuffie | elite/ceiling-adjacent CB |
| 97 | Christian Gonzalez | elite CB |
| 97 | Devon Witherspoon | elite CB/slot |
| 96 | Pat Surtain II | elite CB |
| 95 | Derek Stingley Jr. | elite/high-end CB |
| 94 | Jalen Pitre | high-end S/slot |
| 93 | Quinyon Mitchell | high-end CB |
| 92 | Cooper DeJean | high-end slot/secondary |
| 91 | Sauce Gardner | very good/high-end CB |
| 89 | Derwin James Jr. | very good S/hybrid |
| 88 | Xavier McKinney | very good S |
| 87 | Jamel Dean | very good/good boundary CB |
| 86 | Antoine Winfield Jr. | good S |
| 83 | D.J. Reed | solid CB starter |
| 78 | Mike Hughes | below-average current starter CB |
| 75 | Nick Scott | weak current Wheel S option |

## Final grade board

**99:** Kyle Hamilton

**98:** Trent McDuffie

**97:** Christian Gonzalez, Devon Witherspoon

**96:** Pat Surtain II

**95:** Derek Stingley Jr.

**94:** Brian Branch, Denzel Ward, Jalen Pitre

**93:** Quinyon Mitchell

**92:** Cooper DeJean

**91:** Sauce Gardner

**90:** Minkah Fitzpatrick

**89:** Derwin James Jr., Kamari Lassiter

**88:** Kerby Joseph, Xavier McKinney

**87:** Carlton Davis III, Jamel Dean, Joey Porter Jr., Joshua Metellus, Julian Love, Kam Curl, Marlon Humphrey, Nate Wiggins

**86:** Antoine Winfield Jr., Bryan Cook, Byron Murphy Jr., Charvarius Ward, Jessie Bates III, Kevin Byard III, Nick Emmanwori, Talanoa Hufanga

**85:** DaRon Bland, Jaylon Johnson, Jevón Holland, Mansoor Delane, Marcus Jones

**84:** A.J. Terrell Jr., Amani Hooker, Antonio Johnson, Caleb Downs, Calen Bullock, Craig Woodson, Deommodore Lenoir, DJ Turner II, Isaiah Rodgers, Jalen Ramsey, Jaycee Horn, Jaylen Watson, Jaylinn Hawkins, Jourdan Lewis, Kamren Kinchens, Kyler Gordon, Malaki Starks, Quentin Lake, Riq Woolen, Tarheeb Still, Taron Johnson, Tykee Smith

**83:** Cam Bynum, D.J. Reed, DeShon Elliott, Dru Phillips, Evan Williams, Grant Delpit, Harrison Smith, Jaquan Brisker, Keisean Nixon, Rasul Douglas, Reed Blankenship, Tre'von Moehrig, Xavier Watts, Zyon McCollum

**82:** Alohi Gilman, Alontae Taylor, Brandon Jones, Budda Baker, Christian Benford, Cole Bishop, Dillon Thieneman, Elijah Molden, Eric Stokes, Garrett Williams, Greg Newsome II, Ja'Quan McMillian, Jacob Parrish, Jeremy Chinn, Justin Reid, Kool-Aid McKinstry, L'Jarius Sneed, Nick Cross, Paulson Adebo, Terrion Arnold, Travis Hunter, Trey Amos, Tyson Campbell, Will Johnson

**81:** Dax Hill, Javon Bullard, Maxwell Hairston, Renardo Green

**80:** Amik Robertson, Andrew Mukuba, C.J. Gardner-Johnson, Cor'Dale Flott, Jordan Battle, Julian Blackmon, Malik Hooker, Malik Mustapha, Nohl Williams, Quan Martin, Riley Moss, Roger McCreary, Tyler Nubin, Xavier Woods

**79:** Asante Samuel Jr., Azareye'h Thomas, Chamarri Conner, Dane Belton, Josh Jobe, Keionte Scott, Ronnie Hickman

**78:** Brandon Stephens, Cam Hart, Chris Johnson, Eric Murray, Jarvis Brownlee Jr., Ji'Ayir Brown, Jonas Sanker, Kevin Winston Jr., Max Melton, Mike Hughes, Mike Sainristil, Tony Jefferson, Tyrique Stevenson Sr., Upton Stout

**77:** AJ Haulcy, Andrew Wingard, Dee Alford, Deonte Banks, Treydan Stukes, Ty Okada

**76:** Billy Bowman Jr., Brandon Cisse, Ennis Rakestraw Jr., JuJu Brents, Lathan Ransom, Malik Muhammad II, Marcus Epps, Marques Sigle, Montaric Brown, Tacario Davis, Will Lee III

**75:** Jay Ward, Justin Walley, Marcus Harris, Markquese Bell, Nick Scott, Quincy Riley

**74:** Akayleb Evans, Denzel Burke, Hezekiah Masses, Jason Marshall Jr., Michael Taaffe

**73:** C.J. Henderson, Dante Trader Jr., Myles Harden

## Pairwise / neighboring audit

Top neighborhoods:

- **99:** Kyle Hamilton
- **98:** Trent McDuffie
- **97:** Christian Gonzalez = Devon Witherspoon
- **96:** Pat Surtain II
- **95:** Derek Stingley Jr.
- **94:** Jalen Pitre = Denzel Ward = Brian Branch
- **93:** Quinyon Mitchell
- **92:** Cooper DeJean
- **91:** Sauce Gardner
- **90:** Minkah Fitzpatrick
- **89:** Derwin James Jr. = Kamari Lassiter
- **88:** Xavier McKinney = Kerby Joseph
- **87:** Jamel Dean = Marlon Humphrey = Nate Wiggins = Joey Porter Jr. = Kam Curl = Joshua Metellus = Carlton Davis III = Julian Love

No unresolved neighboring contradiction remains.

### Corrections produced by the full audit

- Ronnie Hickman 84→79 after a 44.7 current PFF overall grade and 32.8 coverage grade materially contradicted the first-pass placement despite stronger prior multi-year evidence.
- Mike Sainristil 83→78 after a 28.8 PFF overall/28.2 coverage start to 2026; prior NFL evidence keeps him above a pure replacement grade, but current play requires real separation.
- Asante Samuel Jr. 82→79 after a 45.4 PFF overall/49.0 coverage start to 2026.
- Keionte Scott 82→79: his 75.1 NFL PFF grade and strong college baseline are encouraging, but three NFL games do not support an 82 lock yet.
- Will Johnson 84→82 and Nate Wiggins 88→87 after neighboring-player and evidence checks.
- Lathan Ransom 78→76, Dante Trader Jr. 75→73, Michael Taaffe 77→74 and Malik Mustapha 82→80 to avoid lower-tier compression.
- Evan Williams 84→83; current 75.1 PFF overall is good, but the initial grade was a touch aggressive.
- Brian Branch remains 94 despite no 2026 snaps; injury availability is separated from established ability and his 2023-25 body of work remains elite.

## Range / separation audit

The QB blind test exposed a tendency to compress curated lower-tier players upward. Secondary was graded with that lesson from the start and then explicitly re-audited.

- Minimum: **73**
- Median: **82**
- Below 80: **52 players**
- 80–84: **78 players**

Examples of deliberately separated lower options:

- C.J. Henderson: **73**
- Dante Trader Jr.: **73**
- Myles Harden: **73**
- Denzel Burke: **74**
- Michael Taaffe: **74**
- Jason Marshall Jr.: **74**
- Nick Scott: **75**
- Markquese Bell: **75**

Result: **passed.** Curated membership is not treated as an 80+ floor.

## Madden discrepancy audit

Madden is a QA alarm only. A gap forces a fresh football review; it does **not** require HQ to win, Madden to win, or an automatic split-the-difference move.

Rules:
- **7+ points on current official Week 3 Madden rating:** mandatory sanity check.
- **10+ points:** explicit red flag.
- A **6+ launch-rating** gap was pre-screened so an update between launch and Week 3 could not hide a threshold case.

| Player | HQ | Madden | Δ | Resolution |
| --- | ---: | ---: | ---: | --- |
| Budda Baker | 82 | 90 | -8 | keep HQ 82 |
| Jessie Bates III | 86 | 94 | -8 | keep HQ 86 |
| Jalen Pitre | 94 | 86 | +8 | keep locked HQ anchor 94 |
| Antoine Winfield Jr. | 86 | 93 | -7 | keep locked HQ anchor 86 |

### Mandatory-review conclusions

- **Budda Baker — HQ 82 / Madden 90.** Madden is carrying established reputation. Baker entered 2026 after a poor coverage season and is at 53.9 PFF overall/44.7 coverage through Week 3, while remaining useful in run support/blitzing.
- **Jessie Bates III — HQ 86 / Madden 94.** Recent evidence is materially below Madden's elite 94: 64.5 PFF overall in 2025 and 73.4 through Week 3 of 2026. Career track record keeps HQ well above average without preserving an elite current grade.
- **Jalen Pitre — HQ 94 / Madden 86.** Pitre's 83.6 PFF 2025 and 79.5 current grade, including strong coverage/run-defense versatility, support a role-normalized high-end safety/slot grade; Madden undershoots his current all-around impact.
- **Antoine Winfield Jr. — HQ 86 / Madden 93.** Madden still prices in peak reputation. Winfield's 2025 was 74.4 PFF overall and his current 2026 grade is 70.3 with strong run defense but weaker coverage results.

No 10+ red flag remains.

Near-threshold checks:
- Kyle Hamilton HQ 99 / Madden Week 3 94: current gap 5 after Madden's Week 3 increase; no mandatory review.
- Nate Wiggins HQ 87 / Madden Week 3 83: gap 4.
- Evan Williams HQ 83 / Madden Week 3 77: gap 6.
- Mansoor Delane HQ 85 / Madden Week 3 80: gap 5.
- Mike Sainristil HQ 78 / Madden Week 3 75: gap 3 after football-driven correction.
- Asante Samuel Jr. HQ 79 / Madden Week 3 75: gap 4 after football-driven correction.
- Keionte Scott HQ 79 / Madden Week 3 73: gap 6.

## Same-name collision audit

Byron Murphy Jr. (Minnesota secondary) was explicitly excluded from automated Madden name matching to avoid collision with interior defender Byron Murphy II. Secondary/team binding remained authoritative.

This is important because the Madden data also contains interior defender **Byron Murphy II**; the Minnesota secondary player **Byron Murphy Jr.** was not allowed to inherit the wrong player's rating.

## Post-grade distribution

| Band | Count |
| --- | ---: |
| 95-100 | 6 |
| 90-94 | 7 |
| 85-89 | 25 |
| 80-84 | 78 |
| 75-79 | 44 |
| below-75 | 8 |

Mean: **82.13**  
Median: **82**  
Range: **73-99**

Distribution was inspected only after the football grading, pairwise audit, range audit and Madden discrepancy audit.

## Version lock

Version: `nfl-wheel-secondary-grades-2026-10-03-v1`

Machine-readable authority:

`data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json`

Future grade changes must record:
- previous grade;
- new grade;
- effective date;
- concise reason;
- nearby role-normalized peer / anchor check.

## Phase boundary

**Secondary calibration is complete and locked.**

Next position family: **Head Coach anchors only**.
