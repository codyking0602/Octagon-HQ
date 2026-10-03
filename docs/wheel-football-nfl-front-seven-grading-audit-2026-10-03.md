# NFL Wheel of Football — Front Seven grading audit

## Status

**Front Seven grading locked — October 3, 2026.**

Audit-only grading artifact for every Front Seven player in the current curated NFL Wheel population.

No runtime grading, Wheel generation, reveal logic, eligibility, or historical result behavior is changed here.

Population source: `data/generated/football/wheel-football-priorities.json` at current main `f295e359d9e70f5c55d0452f4f94d9487fbc3f06`.

Population checked: **191 Front Seven entries**.

Constitution: PR #1641.

## Semantic

Grade **current NFL ability in the player's actual Front Seven role right now**.

EDGE, interior defensive line and off-ball linebacker are role-normalized inside one grade. A 95 linebacker and a 95 edge defender represent roughly the same quality within their own jobs.

Primary evidence:
- pass-rush disruption;
- run defense / block destruction;
- coverage and space play for linebackers;
- tackling;
- processing;
- versatility;
- down-to-down consistency and impact.

Career greatness, fame, IDP/fantasy value, Madden overall, draft status and future projection do not determine the grade.

## Locked anchor ladder

| Grade | Player | Anchor |
| ---: | --- | --- |
| 99 | Myles Garrett | current ceiling EDGE |
| 99 | Will Anderson Jr. | current ceiling EDGE |
| 98 | Aidan Hutchinson | elite ceiling-adjacent EDGE |
| 97 | Fred Warner | elite LB ceiling |
| 96 | Maxx Crosby | elite EDGE |
| 95 | Jeffery Simmons | elite interior |
| 95 | Zack Baun | elite off-ball LB |
| 94 | Chris Jones | high-end elite interior |
| 93 | T.J. Watt | high-end EDGE |
| 92 | Nik Bonitto | high-end EDGE |
| 90 | Roquan Smith | very good/high-end LB |
| 86 | Kaden Elliss | good starter LB |
| 82 | Alex Singleton | solid starter LB |
| 80 | Jack Gibbens | average/solid LB |
| 76 | Justin Strnad | lower-end Wheel LB |

## Final grade board

**99:** Myles Garrett, Will Anderson Jr.

**98:** Aidan Hutchinson

**97:** Fred Warner

**96:** Maxx Crosby, Micah Parsons

**95:** Cameron Heyward, Danielle Hunter, Jeffery Simmons, Zack Baun

**94:** Chris Jones, Derrick Brown, Nick Bosa

**93:** Jalen Carter, Quinnen Williams, T.J. Watt

**92:** Devin Lloyd, Dexter Lawrence II, Josh Hines-Allen, Nik Bonitto

**91:** Jack Campbell, Trey Hendrickson

**90:** Brian Burns, Greg Rousseau, Kobie Turner, Leonard Williams, Milton Williams, Roquan Smith, Vita Vea, Zach Allen

**89:** Alex Highsmith, Andrew Van Ginkel, Byron Murphy II, Demario Davis, Jared Verse, Jonathan Greenard

**88:** Byron Young, DeForest Buckner, Demarcus Lawrence, Devin Bush, Jonathan Allen, Josh Sweat, Nnamdi Madubuike, Zach Sieler

**87:** Abdul Carter, Dre Greenlaw, Khalil Mack, Laiatu Latu, Nick Bolton, Rashan Gary

**86:** Alim McNeill, Carson Schwesinger, Chase Young, Daiyan Henley, Foyesade Oluokun, George Karlaftis, Grover Stewart, Jaelan Phillips, Jeremiah Owusu-Koramoah, Jordan Davis, Kaden Elliss

**85:** Aaron Donald, Blake Cashman, Braden Fiske, Christian Barmore, Dallas Turner, Daron Payne, Ed Oliver, Ernest Jones IV, Harold Landry III, Jadeveon Clowney, Jihaad Campbell, Mason Graham, T'Vondre Sweat

**84:** Calijah Kancey, Cedric Gray, Edgerrin Cooper, James Pearce Jr., Jordyn Brooks, Montez Sweat, Nakobe Dean, Nate Landman, Quay Walker, Quincy Williams, Robert Spillane, T.J. Edwards, Terrel Bernard, Tremaine Edmunds

**83:** Azeez Al-Shaair, D.J. Reader, David Bailey, Jalen Redmond, Jalon Walker, Kayvon Thibodeaux, Odafe Oweh, Travon Walker, Tuli Tuipulotu, Will McDonald IV, Yaya Diaby

**82:** Alex Singleton, Bobby Okereke, Boye Mafe, Carl Granderson, D.J. Jones, DeMarvion Overshown, Derrick Harmon, Drue Tranquill, Frankie Luvu, Gervon Dexter Sr., Jamien Sherwood, Jermaine Johnson II, John Franklin-Myers, Kwity Paye, Mykel Williams, Osa Odighizuwa, Patrick Queen, Rueben Bain Jr., Walter Nolen III, Zaire Franklin

**81:** Alex Anzalone, Calais Campbell, Devonte Wyatt, Jalyx Hunt, Payton Wilson, Sheldon Rankins

**80:** Arik Armstead, Arvell Reese, Bryan Bresee, Chop Robinson, Demetrius Knight Jr., Derick Hall, Divine Deablo, Donovan Ezeiruaku, Dre'Mont Jones, Grady Jarrett, Harrison Phillips, Jack Gibbens, Javon Hargrave, Keldric Faulk, Kenny Clark, Mack Wilson Sr., Peter Woods, Sonny Styles, Teair Tart, Tyleik Williams

**79:** Anthony Hill Jr., Arden Key, Bradley Chubb, Cameron Jordan, Dalvin Tomlinson, Dee Winters, Derrick Barnes, Drake Thomas, Eric Wilson, Jonah Elliss

**78:** Adam Butler, Austin Booker, DJ Wonnum, Josh Uche, Pete Werner, Trenton Simpson, Za'Darius Smith

**77:** Dayo Odeyingbo, K'Lavon Chaisson, Keion White, Myles Murphy, Princely Umanmielen, Willie Gay Jr.

**76:** Akeem Davis-Gaither, DaVon Hamilton, Denzel Perryman, Dorian Williams, Henry To'oTo'o, Jacob Rodriguez, Justin Strnad, Lukas Van Ness, Zaven Collins

**75:** Barrett Carter, Felix Anudike-Uzomah, Isaiah McGuire, Javon Kinlaw, Josiah Trotter, Lee Hunter, T.J. Sanders, Tavius Robinson

**74:** Dante Stills, Jaylon Carlies, Maason Smith, Ventrell Miller

**73:** Tyrion Ingram-Dawkins

**72:** Tonka Hemingway

## Pairwise / neighboring audit

Top neighborhoods:

- **99:** Myles Garrett = Will Anderson Jr.
- **98:** Aidan Hutchinson
- **97:** Fred Warner
- **96:** Maxx Crosby = Micah Parsons
- **95:** Danielle Hunter = Cameron Heyward = Jeffery Simmons = Zack Baun
- **94:** Chris Jones = Derrick Brown = Nick Bosa
- **93:** Quinnen Williams = Jalen Carter = T.J. Watt
- **92:** Nik Bonitto = Dexter Lawrence II = Devin Lloyd = Josh Hines-Allen
- **91:** Trey Hendrickson = Jack Campbell
- **90:** Roquan Smith = Greg Rousseau = Zach Allen = Kobie Turner = Milton Williams = Brian Burns = Leonard Williams = Vita Vea

The remainder was audited in adjacent grade bands and within role. No unresolved pairwise contradiction remains.

### Corrections produced by the full audit

- **Jack Campbell 94 → 91.** His elite 2025 remains highly meaningful, but a 44.3 PFF start to 2026 is too poor to ignore completely.
- **Edgerrin Cooper 88 → 84.**
- **Cedric Gray 88 → 84.**
- **Nakobe Dean 87 → 84.**
- **Chop Robinson 84 → 80.**
- **Christian Barmore 88 → 85.**
- **T'Vondre Sweat 88 → 85.**
- **Payton Wilson 84 → 81.**
- **Osa Odighizuwa 85 → 82.**
- **Frankie Luvu 86 → 82.**
- **Aaron Donald 87 → 85 → 87 after the Madden discrepancy reconciliation.**
- **Laiatu Latu 89 → 87.**
- **Tuli Tuipulotu 85 → 83.**
- **Jermaine Johnson II 84 → 82.**
- **Maason Smith 76 → 74.**

These were evidence-driven corrections, not attempts to manufacture a distribution.

## Range / separation audit

The QB blind test exposed a tendency to compress curated lower-tier players upward. Front Seven was explicitly checked for that problem before lock.

- Minimum: **72**
- Median: **83**
- Below 80: **46 players**
- 80–84: **71 players**

Examples of deliberately separated lower options:

- Tonka Hemingway: **72**
- Tyrion Ingram-Dawkins: **73**
- Dante Stills: **74**
- Jaylon Carlies: **74**
- Ventrell Miller: **74**
- Maason Smith: **74**
- Tavius Robinson: **75**
- Barrett Carter: **75**
- Justin Strnad: **76**

Result: **passed.** Curated membership is not treated as an 80+ floor.

## Madden discrepancy audit

Madden is used only as a QA alarm. It never sets or averages into an HQ grade.

Rules:
- **7+ points:** mandatory sanity check.
- **10+ points:** explicit red flag and written resolution.

Official EA SPORTS Madden NFL 27 **Week 3** ratings were used for the final flagged checks.

| Player | HQ | Madden | Δ | Resolution |
| --- | ---: | ---: | ---: | --- |
| Jack Gibbens | 78 | 73 | +5 | moved toward Madden |
| Drue Tranquill | 82 | 89 | -7 | keep HQ 82 |
| Calijah Kancey | 82 | 77 | +5 | moved toward Madden |
| Aaron Donald | 87 | 95 | -8 | moved toward Madden |

### Madden review conclusions

- **Jack Gibbens — HQ 78 / Madden 73.** Moved toward Madden after the discrepancy audit exposed residual lower-tier compression. His current PFF overall is 66.7 with an 80.9 pass-rush grade, and his multi-year NFL evidence is materially better than a low-70s weak-option grade.
- **Drue Tranquill — HQ 82 / Madden 89.** Keep HQ 82. His career-best 2025 PFF grade was 76.2 and he is at 69.0 in 2026. Madden's near-elite 89 is not supported by current football evidence.
- **Calijah Kancey — HQ 82 / Madden 77.** Moved toward Madden; good current starter, but the prior 84 overstated the present body of work. His 2026 PFF grade is 76.4, including an 81.5 run-defense mark and seven pressures. Madden looks low.
- **Aaron Donald — HQ 87 / Madden 95.** Moved toward Madden. A 95 remains legacy-heavy, but 85 was too punitive given the established elite baseline and the still-small return sample.

The audit also used a bulk Madden 27 launch-rating export only as a pre-screen for potential discrepancies. Launch ratings never overrode current official Week 3 EA ratings.

## Post-grade distribution

| Band | Count |
| --- | ---: |
| 95-100 | 10 |
| 90-94 | 20 |
| 85-89 | 44 |
| 80-84 | 71 |
| 75-79 | 40 |
| below-75 | 6 |

Mean: **83.48**  
Median: **83**  
Range: **72-99**

Distribution was inspected only after the football grading, pairwise audit, range audit and Madden discrepancy audit.

## Version lock

Version: `nfl-wheel-front-seven-grades-2026-10-03-v1`

Machine-readable authority:

`data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json`

Future grade changes must record:
- previous grade;
- new grade;
- effective date;
- concise reason;
- nearby role-normalized peer / anchor check.

## Phase boundary

**Front Seven calibration is complete and locked.**

Next position family begins with **Secondary anchors only**.


### Final discrepancy-audit principle

A Madden gap is a trigger to reopen the football grade, not a binary HQ-vs-Madden contest. The final resolution may keep HQ, move toward Madden, or move farther away when the evidence supports it. Final reconciliations: Jack Gibbens 78, Calijah Kancey 82, Aaron Donald 87, Drue Tranquill unchanged at 82.
