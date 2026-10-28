# NFL current HQ-versus-EA grade discrepancy — October 27, 2026

**Exact data evidence:** Official EA Madden NFL 27 live PR capture, 1,941 source players, compared against six current HQ grade authority files, 594 player slots. Source: GitHub PR #2254 workflow artifact 'wheel-nfl-current-hq-gap-review'. **No grades changed.**

## Verified counts after New York team-label correction

- 584 of 594 HQ slots matched current EA by **team + position family + normalized name**.
- 26 players had current HQ/EA differences of 7–9 points; **one player had a 10+ red-flag gap** (Geno Smith). Total mandatory review: **27**.
- Ten team/position identities remained unmatched and must be verified; they are **not scored as zero difference or cleared**.
- These current-rating gaps are independent of the earlier unreliable Week 3-to-October 27 historical comparison. They are the proper locked 7-point and 10-point QA alarm, not a copying formula.

## All 27 mandatory discrepancies — individual first-pass editorial judgments

| Team | Player | HQ | EA current | HQ minus EA | First-pass judgment and reason |
|---|---|---:|---:|---:|---|
| WSH | Jayden Daniels | 84 | 76 | +8 | Hold 84: original HQ mid-80s calibration already reflects talent; avoid copying sharp Madden drop. |
| HOU | C.J. Stroud | 88 | 81 | +7 | Hold 88: recent separately approved HQ upgrade; reassess recent decision against film, not EA baseline. |
| NYJ | Geno Smith | 85 | 74 | +11 | **Explicit 10+ defense; retain 85 provisionally:** NYJ official 2026: 1,623 yards, 10 TD/2 INT, 105.2 passer rating; PFF grade 74.3 ranked 13/34 QBs. A competent upper-middle starter is not a Madden 74-level QB; still review aging/pressure. |
| LV | Kirk Cousins | 85 | 77 | +8 | Hold pending film: prior upgrade was intentional; age/decline risk warrants independent review. |
| CLE | Deshaun Watson | 78 | 70 | +8 | Hold 78: underwhelming but playable 2026 QB sample (1,482 yards, 7 TD), below-average current HQ tier already. |
| ATL | Michael Penix Jr. | 83 | 75 | +8 | Hold 83 while reviewing full game tape; recent HQ grade decision already moved him upward. |
| NYJ | Braelon Allen | 82 | 75 | +7 | Hold 82; established physical traits and past grade revision, but current role/health unverified. |
| HOU | Marvin Harrison Jr. | 85 | 77 | +8 | Hold 85 pending positional film; preserve stable player ID despite Arizona-to-Houston roster association. |
| JAX | Brian Thomas Jr. | 86 | 79 | +7 | Hold 86 pending route/target quality; established receiving ceiling, avoid reacting to EA. |
| WSH | Dyami Brown | 80 | 73 | +7 | Hold 80 at lower starter/role-player tier; review precise efficiency if sustained. |
| BAL | Mark Andrews | 82 | 90 | -8 | Hold 82: mature player with recent decline and limited current evidence for 90-level ability. |
| BUF | Dalton Kincaid | 91 | 83 | +8 | Hold 91 pending film and availability/usage review; early-season output was strong but recent box scores sparse; potential HQ overvaluation deserves priority. |
| PHI | Dallas Goedert | 82 | 89 | -7 | Hold 82: veteran volume/usage not enough to support 89; inspect current target-role health. |
| DAL | Rashan Gary | 87 | 78 | +9 | Hold 87 pending pass-rush win-rate/role review; pure Madden gap isn't a credible downgrade. |
| DAL | DeMarvion Overshown | 82 | 75 | +7 | Hold 82 pending recovery/coverage role check; existing mid-tier grade remains conservative. |
| DAL | Dee Winters | 79 | 72 | +7 | Hold 79 as lower-end player, needs defensive snap-quality context. |
| IND | Laiatu Latu | 87 | 80 | +7 | Hold 87 until pressure quality and opponent evidence checked. |
| KC | Drue Tranquill | 82 | 89 | -7 | Hold 82: linebacker value/coverage film needed before accepting Madden's near-elite 89. |
| LAC | Tuli Tuipulotu | 88 | 79 | +9 | Hold 88 with external 2026 PFF rank 14/106 edges as of Oct 14; large Madden discrepancy justified provisionally. |
| LAR | Aaron Donald | 87 | 95 | -8 | Hold 87 pending active-role verification; don't use historic reputation or EA roster rating as current ability. |
| ATL | Jessie Bates III | 86 | 94 | -8 | **Propose 89** for peer review: as of Oct 26 PFF grades him 6/93 safeties overall, 4/93 in coverage; history of high-level play suggests HQ86 too low, but not automatic EA94. |
| BAL | Jaylinn Hawkins | 84 | 77 | +7 | Hold 84 pending coverage/role breakdown; current projection not solely tied to EA. |
| DAL | DaRon Bland | 85 | 77 | +8 | Hold 85 pending current coverage evidence; known interception/corner skill shouldn't be erased without film. |
| HOU | Jalen Pitre | 94 | 86 | +8 | Hold 94 pending coverage/slot pass-defense review; the high HQ tier requires written current evidence. |
| MIN | Harrison Smith | 80 | 87 | -7 | Hold 80: age-37 decline explicitly part of HQ philosophy; Madden may overweight career reputation. |
| PIT | Jalen Ramsey | 84 | 92 | -8 | Hold 84: late-career role transition/age need consideration versus 92 EA rating. |
| TB | Antoine Winfield Jr. | 86 | 93 | -7 | Hold 86 pending coverage and availability review; no automatic recovery to EA93. |

## Ten unresolved source identity matches

- Najee Harris (NYG RB)
- Darius Slayton (IND WR)
- Travis Hunter (JAX WR)
- Chig Okonkwo (WSH TE)
- Josh Uche (MIA front seven)
- Willie Gay Jr. (MIA front seven)
- Cameron Heyward (PIT front seven; likely EA uses Cam Heyward)
- Xavier Woods (CHI secondary)
- Cam Bynum (IND secondary)
- Joshua Metellus (MIN secondary)

These may reflect current team moves, source omissions, alias differences or player availability. Do not infer a roster transfer from a name mismatch.

## External source checks used for provisional judgment

- [NY Jets official Geno Smith 2026 stats](https://www.newyorkjets.com/team/players-roster/geno-smith/): 1,623 pass yards, 10 TD and 2 INT, passer rating about 105 after seven games.
- [PFF Geno Smith 2026](https://www.pff.com/nfl/players/geno-smith/7820): grade 74.3, 13th of 34 QBs, updated Oct 26. This is a *different scale* from HQ and Madden; do not numerically convert.
- [PFF Jessie Bates III 2026](https://www.pff.com/nfl/players/jessie-bates/49162): grade 81.4, 6th of 93 safeties; coverage grade 82.5, 4th of 93, updated Oct 26.
- [PFF Tuli Tuipulotu 2026](https://www.pff.com/nfl/players/tuli-tuipulotu/131840): grade 80.0, 14th of 106 edges, updated Oct 14.
- [NFL Dalton Kincaid 2026 logs](https://www.nfl.com/players/dalton-kincaid/stats/logs/2026/) and [NFL Deshaun Watson splits](https://www.nfl.com/players/deshaun-watson/stats/splits/2026/) for availability and recent production context.

## Proposed action

**Only one provisional player grade change has sufficient initial reason to bring forward for further film/peer review:** Jessie Bates III 86 → 89. No numeric change is authorized or applied by this document. All others have explicit provisional holds or source-quality holds, not closed final reviews. Player film plus position-peer comparison is the outstanding verification gate.

After any HQ grade is explicitly approved and published, run the separate existing post-rating development workflow so that the affected player's development is automatically **reexamined**, not automatically changed.
