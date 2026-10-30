# NBA GM — practical ratings closeout and next-phase handoff

**October 30, 2026 | PR #2321 | EDITORIAL CALIBRATION COMPLETE FOR ISOLATED PROTOTYPING; NOT RELEASE-CERTIFIED.**

## Decision

Stop the open-ended *re-review the same 330 names* cycle. The original 330-player, six-skill board is fully populated and has undergone anchor, specialist, outlier, low-overall-cohort, identity and source checks. **Accept the current numeric proposals as the practical editorial baseline for the next isolated NBA GM prototype**—not as verified real-life measurements, an approved production player database, or a warrant to merge. Major overall changes remain separate owner decisions.

The strict independent six-skill research checklist remains **0/330 certified**. That number describes the *higher standard of evidence*, not 330 unfilled ratings. Do not silently re-label editorial judgment as empirical certification merely to close the task. A next-phase game build may use draft ratings behind an isolated, unpublished test fixture once explicitly authorized; no production ingestion has been performed.

## Verified working inventory

| Measure | Current editorial result | Meaning |
|---|---:|---|
| Named candidates / trait cells | **330 / 1,980** | Six non-null integer skill proposals per person, overalls separate |
| NBA 2025–26 season profiles | **301/330** | Pinned historical NBA API sourced regular-season records; not six-trait validation |
| Source-linked numerical observations / awards in board | **951 / 37** | Additional contextual evidence, not independent full-film certification |
| No 2025–26 NBA-season cases | **29/29 classified** | Injury, rookie, returning and absent-season reasons; do not assign zero skills |
| 2026–27 official NBA roster team matches | **330/330**, 30 teams | Snapshot only; recheck transactions before release |
| Directly pinned official NBA IDs in roster crosswalk | **232/330** | 98 await equivalent direct current roster/profile confirmation |
| 75–79 overall peer cohort | **149/149 inventoried** | Evidence triage done; not individually independently certified |
| Evidence-led skill adjustments | **23** | Targeted, logged editorial changes; no automatic overall revisions |
| Fully independently certified six-skill profiles | **0/330** | Conservative evidence standard preserved |
| Public imports, migrations, production changes | **0** | This PR remains draft and isolated |

### Final four targeted revisions in this continuation

| Candidate | Trait | Decision | Factual grounding and comparison |
|---|---|---|---|
| **Michael Porter Jr.** | Scoring | **81 → 86** | Brooklyn 2025–26: 52 games, 24.21 PPG, 18.42 FGA, 59.51% estimated TS, 3.04 APG compared with Denver 2024–25 18.2 PPG. New higher first-option shot burden warrants very-good 86 scoring, but not top-tier 90+; Shooting 92 and overall 83 stay separate. [Official Nets season notes](https://www.nba.com/gamenotes/nets.pdf); [multi-season NBA record](https://www.basketball-reference.com/players/p/portemi01.html). |
| **Jrue Holiday** | Playmaking | **79 → 81** | Portland 2025–26: 53 games, 322 assists / 146 turnovers (6.08 / 2.75 per game) as an expanded on-ball guard, versus Boston 2024–25 3.9 APG in a reduced creation role. Value above 79 justified, not an automatic elite 90. 87 Perimeter Defense and overall 80 retained. [Season history](https://www.basketball-reference.com/players/h/holidjr01.html); [NBA player profile](https://www.nba.com/stats/player/201950/). |
| **Keegan Murray** | Shooting | **85 → 81** | Sacramento 2025–26: 31/112 threes (27.7%) over 23 games; 2024–25 34.3%, 2023–24 35.8%, 2022–23 41.1%. Multi-year record supports above-average spacing potential but not a current 85 specialist. Position candidate **SF/PF** is consistent with historical SF (2022–24) / PF (2024–26) season listings; official NBA roster says broad F, **exact game eligibility not certified**. Overall 81 unchanged. [Official NBA year-by-year](https://www.nba.com/stats/player/1631099/); [historical positions](https://www.basketball-reference.com/players/m/murrake02.html). |

| **DeMar DeRozan** | Shooting | **66 → 80** | Sacramento 2025–26: **NBA leader with 232 made mid-range field goals**, approximately 47.6% on 487 mid-range attempts; also 86.8% FT. Three-point shooting remains limited (47/147; 32.0% at 1.9 attempts/game), preventing an 85+ specialist grade, but the original 66 wrongly labeled one of the NBA’s most reliable high-difficulty mid-range shooters a poor overall shooter. Scoring 80 and overall 80 remain separate. [Official Kings end-of-season notes](https://www.nba.com/gamenotes/kings.pdf); [2025–26 shot zone breakdown](https://nba.highlightfactory.app/team/sacramento-kings/demar-derozan). |

All four are **specific skill judgments**, not mechanical transforms from raw statistics. The earlier **19** evidence-led corrections and three preceding closeout edits are preserved. Another five traits per player do not become certified by changing one.

## Frozen editorial decisions for the handoff

- Keep exactly the six owner-locked categories: Scoring, Shooting, Playmaking, Perimeter Defense, Interior Defense, Rebounding. Skill numbers use the existing absolute benchmark ladder with **no artificial 70 floor** and no imposed distribution quota.
- Preserve original overall ratings across the 330 players, including potential **Chet Holmgren, Joel Embiid, Jalen Johnson and Ja Morant** independent-overall questions. Do not bump overalls mechanically from any six skills. Availability/durability remains separate from on-court ability.
- Preserve specialist strengths and honest weaknesses: a 78-overall shooter can have 95 Shooting; a star guard need not be a paint defender. Keep peer calibration role-relative while grades remain league-wide comparable.
- Do not manufacture a 2025–26 NBA sample for the 29 missing-season cases or conflate season-source NBA IDs with current-official roster/profile verification.
- Do not auto-publish these JSON ratings. The existing `src/features/nba/nbaGmFoundation.ts` deliberately does **not** import this editorial file.

## Clean handoff vs. actual outstanding prerequisites

**For practical editorial calibration:** DONE. Only reopen a specific player when a concrete contradiction, changed current ability, or verified identity/position error is discovered; avoid a full 330-player perpetual audit.

**For a playable isolated NBA GM prototype:** separate design/implementation authorization, game economy, roster composition, roster-slot eligibility, substitution/chemistry, contracts, progression, win simulation and test fixtures remain. These were not the ratings task.

**Before any public player-data release:** recheck all 2026–27 clubs and unresolved canonical IDs, adjudicate exact roster slot eligibility, calibrate impact and source gaps with meaningful independent evidence, confirm sensitive edge cases, run current exact-head tests/typecheck and CI, and obtain explicit release approval. **No merge, deploy, migration or public gameplay binding is approved by this closeout.**

Primary artifacts: `docs/nba-gm-330-six-skills-PROVISIONAL-2026-10-29.json`, `docs/nba-gm-practical-peer-calibration-2026-10-30.md`, `docs/nba-gm-2025-26-nba-api-301-player-stat-evidence-2026-10-29.json`, `docs/nba-gm-official-nba-30-team-roster-crosswalk-2026-10-29.json`, and `src/features/nba/nbaGmSixSkillProposals.test.ts`.
