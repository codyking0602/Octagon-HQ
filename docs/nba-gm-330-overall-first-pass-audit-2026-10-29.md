# NBA GM — 330-player first-pass grading census and next certification gates

**As-of October 29, 2026. STATUS: First-pass editorial population complete; NO GAME RATINGS CERTIFIED.** There has been no merge, backend migration, production gameplay change or finished team-contract/skill catalog.

## Census of named first-pass proposals

The five individual editorial batches now have 100 + 38 + 6 + 94 + 92 = **330 distinct identities**. Normalized-name uniqueness checks found **0 duplicates**. Proposed grades are all whole numbers **71–99**, using the previously approved NFL-style semantic anchors.

| Overall band | Calibrating target (not a quota) | Proposed count | Difference |
|---|---:|---:|---:|
| 99 | 1 | 1 | 0 |
| 95–98 | 7 | 6 | −1 |
| 90–94 | 17 | 15 | −2 |
| 85–89 | 35 | 28 | −7 |
| 80–84 | 75 | 82 | +7 |
| 75–79 | 110 | 149 | +39 |
| 70–74 | 85 | 49 | −36 |
| **Total** | **330** | **330** | **0** |

Observed median = **79**, mean = **79.51**. There are **22 at 90+**, **50 at 85+**, **132 at 80+**, and **198 below 80 (60.0%)**.

**Interpretation:** This is not an inflated board by the prior NFL 80-floor measure. But it also compresses a large group at 75–79, and has fewer 70–74s than the initial curve. This demands a fresh *evidence-based* lower-rotation audit; do not lower individuals merely to hit quota.

## Verified aspects and limits

**What is documented:** All 330 have a name, first-pass proposed overall and an individual qualitative rationale. The added 186 have 2026–27 team evidence, and the original 144 now have a separately validated [name-to-2026 team crosswalk](nba-gm-original-144-team-crosswalk-2026-10-29.md). Together this creates **330/330 documented club associations across all 30 teams** (not official ID certification). No names are duplicated after accent/suffix normalization. Names such as Alexandre/Alex Sarr, Herb/Herbert Jones, and Jimmy Butler/Butler III still need NBA ID binding, not string-based guessing.

**What remains unverified:** Fully reconciled canonical NBA player IDs for 330, final NBA-official-as-of-publication team/eligible positions, exact contract annual salary/option treatment and non-guaranteed years, source-level skill grades, 2025–26 game/impact comparisons, injury availability treatment, development probabilities, and multi-year cap/game simulator outcome calibration. The count of **certified** player profiles is therefore **0/330**. There is no actual 330-player playable catalog yet.

Source baseline: [Official 2026–27 NBA opening-roster census](https://www.nba.com/news/nba-rosters-set-for-2026-27-regular-season) includes the 30-team 2026–27 opening night; [NBA Communications opening-roster count](https://www.nba.com/news/2026-27-rosters-by-the-numbers) = 519 including two-way players as of October 20; the [live NBA league roster](https://www.nba.com/players) can change after that snapshot; current team-specific links appear in the two new conference documents. NBA 2K27 differences remain review signals, never a conversion formula.

## Focused deep-review queue (do NOT silently auto-edit grades)

1. **99/98/97 premium ceiling:** Wembanyama 99; Jokić 98; Shai 98; Luka 97; Giannis 97. Compare current two-way impact and offensive carrying, postseason performance and peer anchors before locking the single 99.
2. **90-borderline:** Jalen Johnson 90, Scottie Barnes 90, Jamal Murray 90, Chet Holmgren 89, Bam Adebayo 89, Jalen Williams 89. Source multi-year two-way impact and avoid using 2026–27 opening-week box scores as hard evidence of seasonal quality.
3. **Availability versus ability:** Jayson Tatum 94, Kawhi Leonard 94, Joel Embiid 88, Anthony Davis 89, Tyrese Haliburton 90, Kyrie Irving 87, Damian Lillard 82, Kristaps Porziņģis 84, Ja Morant 81. Ratings must capture demonstrated current ability while availability/durability are explicit independent risk signals.
4. **Rookie current ability:** Cameron Boozer 77, AJ Dybantsa 77, Caleb Wilson 77, Darryn Peterson 77, Darius Acuff Jr. 78, Aday Mara 76, Bruce Thornton 71. Their early NBA roles may differ dramatically from three-year potential. Revisit the small NBA sample and don't penalize role opportunity mechanically.
5. **Elite specialist value:** Luguentz Dort 80, Alex Caruso 81, Rudy Gobert 85, Isaiah Joe 78, Luke Kennard 78, Keon Ellis 78, Moussa Diabaté 79. The overall must reflect full basketball value without upgrading/degrading a player solely because a single trait is elite.
6. **75–79 compression:** Audit 149 names head-to-head in position/role batches to distinguish dependable rotation talent from lower-ability roster depth. No fixed 75 floor. Keep genuinely useful specialists; consider 70–74 only with individual supporting evidence.
7. **Team/roster drift:** 2026 movement (e.g. Giannis to MIA, LaMelo to MIN, Paul George to BOS, Santi Aldama to DAL, Jaren Jackson Jr. to UTA, Ja Morant to POR) makes legacy team associations unsafe. Reconcile 330 identities using league roster source on publication day.

## Objective acceptance gates before any NBA GM player scores become runtime data

- 330 unique canonical player IDs, 30-team coverage, full current-roster reconciliation, meaningful positional eligibility and no orphaned/retired identities; stable source snapshot date and identity migration strategy.
- 2025–26 baseline (minutes, efficiency, impact) and individual role/film/source crosschecks for **all 330**; independent grade-neighbor review, skill evidence and exception log. No 2K-derived grade owner, no artificial target curve enforcement.
- Research-backed six category grades, with trait separation from overall ability.
- Fully verified year-one compensation, contract option treatment and honest game-year repricing. Actual salary cap mechanics vs game-simplified salary budgets are distinct.
- Individual development-upside and age/decline probabilities, no generic age-to-potential grade inflation.
- Simulate realistic 30-team wheel completion under all salary scenarios; evaluate three-year championship outcomes, specialist value and star-vs-depth roster builds.
- Tests green at exact PR head, plus backend/data migrations when gameplay is added. **Nothing in these editorial docs authorizes publishing or merging.**

## Current isolated PR assets

- Pure model: src/features/nba/nbaGmFoundation.ts
- Tests: src/features/nba/nbaGmFoundation.test.ts and nbaGmEditorialBoard.test.ts
- Method: docs/nba-gm-rating-anchor-ladder-2026-10-29.md
- Candidate batches: first-100, 38 specialist, 6 lower-rookie, 94 East, 92 West
- 21-player 2K gap review and targeted outlier flags

The approved **product philosophy** is locked; individual 2026 grades are still provisional.
