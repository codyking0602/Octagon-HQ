# NFL Wheel of Football — Head Coach grading audit

## Status

**Head Coach grading locked — October 3, 2026.**

Audit-only grading artifact for all 32 current NFL Wheel head coaches.

No runtime grading, Wheel generation, reveal logic, eligibility, or historical result behavior is changed here.

Population source: `data/generated/football/wheel-football-priorities.json` at current main `f295e359d9e70f5c55d0452f4f94d9487fbc3f06`.

Population checked: **32/32 head coaches**.

## Semantic

Grade **current NFL head-coaching ability right now**.

Unlike player grading, coaching uses a longer evidence window because three games are a much noisier signal. Scheme/play-calling where applicable, game management, adaptability, staff construction, player development, culture, talent maximization and sustained results all matter.

Team record alone, career fame and historical greatness do not determine the grade.

## Locked anchor ladder

| Grade | Coach | Anchor |
| ---: | --- | --- |
| 99 | Sean McVay | current HC ceiling |
| 98 | Mike Macdonald | elite/ceiling-adjacent |
| 97 | Kyle Shanahan | elite |
| 96 | Andy Reid | elite with slight current-era deduction |
| 94 | Sean Payton | high-end elite |
| 93 | Mike Vrabel | high-end |
| 92 | Ben Johnson | high-end rising HC |
| 91 | Dan Campbell | very good/high-end CEO coach |
| 90 | Jim Harbaugh | very good |
| 89 | Kevin O'Connell | very good |
| 88 | DeMeco Ryans | very good |
| 87 | Matt LaFleur | good/high-end offensive HC |
| 85 | Liam Coen | good |
| 83 | Nick Sirianni | solid/good HC |
| 81 | Brian Schottenheimer | solid |
| 79 | Zac Taylor | below-average current HC |
| 76 | Mike LaFleur | unproven/lower Wheel option |
| 74 | Aaron Glenn | current bottom anchor |

## Final grade board

**99:** Sean McVay

**98:** Mike Macdonald

**97:** Kyle Shanahan

**96:** Andy Reid

**94:** Sean Payton

**93:** Mike Vrabel

**92:** Ben Johnson

**91:** Dan Campbell

**90:** Jim Harbaugh

**89:** Kevin O'Connell

**88:** DeMeco Ryans, John Harbaugh

**87:** Matt LaFleur

**85:** Liam Coen

**84:** Joe Brady, Kevin Stefanski, Klint Kubiak, Mike McCarthy

**83:** Jesse Minter, Nick Sirianni

**82:** Dan Quinn, Kellen Moore

**81:** Brian Schottenheimer, Shane Steichen

**80:** Todd Bowles, Todd Monken

**79:** Dave Canales, Zac Taylor

**78:** Robert Saleh

**77:** Jeff Hafley

**76:** Mike LaFleur

**74:** Aaron Glenn

## Pairwise / neighboring audit

- Sean McVay 99 > Mike Macdonald 98 > Kyle Shanahan 97 > Andy Reid 96 > Sean Payton 94 > Mike Vrabel 93 > Ben Johnson 92 > Dan Campbell 91 > Jim Harbaugh 90
- Kevin O'Connell 89 > DeMeco Ryans 88 = John Harbaugh 88 > Matt LaFleur 87 > Liam Coen 85
- Joe Brady 84 = Kevin Stefanski 84 = Klint Kubiak 84 = Mike McCarthy 84 > Jesse Minter 83 = Nick Sirianni 83
- Kellen Moore 82 = Dan Quinn 82 > Brian Schottenheimer 81 = Shane Steichen 81 > Todd Monken 80 = Todd Bowles 80
- Dave Canales 79 = Zac Taylor 79 > Robert Saleh 78 > Jeff Hafley 77 > Mike LaFleur 76 > Aaron Glenn 74

### Key resolutions

- John Harbaugh lands at 88 rather than being graded off career résumé alone. His long-term CEO-coach value remains high, while a new-team reset and recent Baltimore ending keep him below the top current tier.
- Joe Brady lands at 84 rather than being treated like a generic first-time coach. Buffalo is 3-0 and his prior continuity as offensive coordinator reduces the uncertainty penalty, but three games are not enough for an upper-80s grade.
- Klint Kubiak lands at 84 after Las Vegas opened 3-0 and his offense became an early 2026 surprise; the small head-coach sample still caps him below established top coaches.
- Jesse Minter lands at 83. His defensive-coordinator résumé is excellent and Baltimore has shown promising early results, but he remains a first-time head coach with only three regular-season games of direct evidence.
- Dave Canales lands at 79. Winning the NFC South at 8-9 in 2025 earns credit, but the broader body of work and uneven 2026 opening do not support an above-average current grade.
- Mike McCarthy 84 and Kevin Stefanski 84 retain meaningful prior head-coaching evidence without allowing career résumé to override recent performance.

No unresolved neighboring contradiction remains.

## Range / separation audit

- Minimum: **74**
- Median: **84**
- Maximum: **99**
- Below 80: **6 coaches**
- 80–84: **12 coaches**

Result: **passed.** The pool deliberately reaches 74; NFL-head-coach membership does not create an 80 floor.

## External-ranking discrepancy audit

There is no useful Madden head-coach overall rating, so HC uses credible external coach rankings as its QA alarm.

Rules:
- **8+ ranking spots versus Sharp's preseason all-32 2026 ranking:** mandatory review.
- **12+ spots:** major discrepancy.
- External ranking is never a formula or required midpoint.

| Coach | HQ grade | HQ rank | Sharp rank | Rank gap | Resolution |
| --- | ---: | ---: | ---: | ---: | --- |
| Joe Brady | 84 | 15 | 28 | +13 | keep HQ 84 |
| Klint Kubiak | 84 | 15 | 26 | +11 | keep HQ 84 |
| Dave Canales | 79 | 27 | 17 | -10 | keep HQ 79 |
| Jesse Minter | 83 | 19 | 27 | +8 | keep HQ 83 |

### Review conclusions

- **Joe Brady:** Sharp's preseason ranking heavily reflected first-time-HC uncertainty. Buffalo's 3-0 start plus Brady's continuity as the existing offensive architect materially reduces that uncertainty, but HQ still stops at 84 rather than overreacting.
- **Klint Kubiak:** Las Vegas is 3-0 after a three-win 2025 and Kubiak is an early Coach of the Year favorite; current evidence has already moved beyond the conservative preseason ranking, while the small sample prevents a higher grade.
- **Dave Canales:** Sharp was more optimistic entering 2026 after Carolina's 8-9 division title. The larger current-ability view remains closer to average/below-average because the 2025 record was losing and the 2026 opening has been uneven.
- **Jesse Minter:** Minter's elite coordinator résumé and early Baltimore results justify ranking him above a pure first-time-HC placeholder, but limited direct head-coaching evidence keeps him in the low 80s.

Joe Brady is the only 12+ ranking-position discrepancy. It was reviewed and intentionally retained at 84 rather than mechanically following the conservative preseason first-time-HC rank.

## Post-grade distribution

| Band | Count |
| --- | ---: |
| 95-100 | 4 |
| 90-94 | 5 |
| 85-89 | 5 |
| 80-84 | 12 |
| 75-79 | 5 |
| below-75 | 1 |

Mean: **85.56**  
Median: **84**  
Range: **74-99**

Distribution was inspected only after football grading and QA.

## Version lock

Version: `nfl-wheel-head-coach-grades-2026-10-03-v1`

Machine-readable authority:

`data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json`

Future changes must record:
- previous grade;
- new grade;
- effective date;
- concise reason;
- neighboring-coach comparison.

## Phase boundary

**Initial grading is now complete for every NFL Wheel position family.**

Next phase: final cross-position calibration sweep for QB, RB, WR, TE, Front Seven, Secondary and Head Coach using the locked separation/discrepancy rules.
