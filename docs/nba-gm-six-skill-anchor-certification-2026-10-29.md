# NBA GM six-skill anchor ladders — October 29, 2026

**EDITORIAL DRAFT ONLY. Not a source-certified or gameplay-ready player database.** The player grades in `nba-gm-330-six-skills-PROVISIONAL-2026-10-29.json` are proposals; they never alter overall ratings and are never imported by runtime. The positions are candidate eligibility, not NBA-verified. All 330 need per-player corroboration before final signoff.

## Locked skill benchmark ladder

The ladder is **absolute for each skill**, not scaled to overall or distributed to a quota. Numeric examples are Octagon judgments. 99 is reserved for the rare current outlier; grades below 70 are permitted.

| Skill | 99 | 95 | 90 | 85 | 80 | 75 | 70 | Example materially below 70 |
|---|---|---|---|---|---|---|---|---|
| Scoring | Shai Gilgeous-Alexander: high-volume, efficient first-option self-creation | Luka Dončić: extreme scoring difficulty and volume | Jaylen Brown: major primary-wing burden | Desmond Bane: strong multilevel option | DeMar DeRozan: midrange shotmaking, more limited present volume | Alex Caruso: occasional offense, not lead creation | Luguentz Dort: scoring secondary to defense | Rudy Gobert (65): restricted self-creation |
| Shooting | Stephen Curry: movement, gravity, difficulty, repeatability | Luke Kennard: leading qualified 2025–26 3PT percentage; smaller creation burden than Curry | Kon Knueppel: elite movement/volume spacing | Trey Murphy III: valuable long-range threat | Darius Garland: pull-up/off-ball combination | Josh Hart: acceptable/uneven spacing | Scottie Barnes: limited modern spot-up reliability | Rudy Gobert (31): almost no jumper |
| Playmaking | Nikola Jokić: league-leading assist production from center | Luka Dončić: crosscourt reads, elite on-ball creation | Cade Cunningham: 2025–26 9.9 assists per game | Jalen Johnson: exceptional forward creator | Derrick White: reliable secondary advantage creation | Tre Jones: floor-organization specialist | OG Anunoby: useful, not a primary passer | Rudy Gobert (49): narrow connective passing |
| Perimeter Defense | Ausar Thompson: disruptive, multiple-matchup first-team defense | OG Anunoby: premier wing containment | Luguentz Dort: physical screen/point-of-attack stopper | Derrick White: elite-leaning two-way guard defense | Mikal Bridges: versatile wing coverage | Christian Braun: dependable matchup defender | Luka Dončić: workable but not standout containment | Trae Young (43): significant point-of-attack liability |
| Interior Defense | Victor Wembanyama: DPOY, league-leading blocks, paint deterrence | Chet Holmgren: All-Defense rim protection/help | Rudy Gobert: elite interior positioning, rebounding anchor | Jarrett Allen: dependable paint defense | Isaiah Hartenstein: strong positioning/vertical containment | Scottie Barnes: weak-side big-wing help, not a full-time center | Alperen Şengün: paint defense remains vulnerable | Trae Young (23): little credible rim protection |
| Rebounding | Nikola Jokić: 2025–26 NBA RPG leader and elite possession control | Karl-Anthony Towns: league-leading-tier total volume | Donovan Clingan: led NBA in total boards | Jalen Duren: strong physical rim rebounding | Jalen Johnson: 10.3 rebounds per game from forward | Josh Hart: unusually valuable guard/wing rebounding | Pascal Siakam: useful forward rebounding | Damian Lillard: guard rebound impact limited |

**Evidence grounding:** [NBA 2025–26 official awards and All-Defense](https://pr.nba.com/voting-results-2025-26-nba-regular-season-awards/), [NBA official season statistical leaders](https://www.nba.com/news/season-review-2025-26), [2025–26 Basketball-Reference per-game](https://www.basketball-reference.com/leagues/NBA_2026_per_game.html), [2025–26 shooting leaderboard](https://www.basketball-reference.com/leagues/NBA_2026_leaders.html), [NBA official 2026–27 opening rosters](https://www.nba.com/news/nba-rosters-set-for-2026-27-regular-season). Award votes and box scores inform anchors but **do not automatically convert into ratings**. A specialist can rate 95 shooting and 78 overall; an MVP can be weak at a position-irrelevant trait.

## Scope and provenance

- **330/330** candidate records have six numeric proposals (1,980 skill cells), but **0/330 full evidence certifications**. 204 now carry individual hand-calibrated editorial reviews, and 126 remain lower-confidence dossier/role inferences. Manual review is not a claim of individual stat or film corroboration.
- All six values were determined **independently of provisional overall**. No averaging, overall-to-skill formula, 70 skill floor, 2K import, or quota reshaping. Default role/trait inference is explicitly flagged as low-confidence and must not be passed as completed research.
- Every player has an original editorial rationale and cited supporting *season-wide* sources. Generic stats/roster URLs do **not** establish that each individual was verified in those pages. No canonical player IDs or individually validated position eligibility are asserted.
- Roster associations follow the existing five batch docs/crosswalk (some are from third-party HoopsNightly); **NBA official team/ID reconciliation remains mandatory** before signoff. Unverified team or position should never enter live game code.

## Overall discrepancy queue — do not silently mutate

| Player | First-pass overall | Problem to resolve |
|---|---:|---|
| Jalen Johnson | 90 | Independent high-volume forward creation/rebounding supports real star value; verify 90 vs 89 and impact on weaker shooting |
| Chet Holmgren | 89 | 2025–26 first-team All-Defense and third-team All-NBA; compare big-man peer grades 89–92 rather than ignoring his defense |
| Joel Embiid | 88 | Elite demonstrated healthy scoring and paint defense; separate medically affected availability from current skill ceiling |
| Ja Morant | 81 | Substantial gap between prior peak and recent sustained performance; demand fresh sample before final overall |

## Certification to finish

Require 330 canonical NBA IDs; player-specific NBA 2025–26 stats/advanced defense and efficiency context (or explicit no-sample reason); independent review of every non-overridden skill inference, especially 149 OVR-75–79 names; proven current team and positional eligibility; matchup-specific peer comparisons; flags for 2026 rookies and returnees; updated exact-head test/typecheck and CI. **No player is signed off as fully researched; no gameplay imports are permitted.**

## Quantitative confidence and duplication audit

- 204 hand-calibrated provisional players; 126 low-inference players; 26 players have at least one individually sourced season fact, **not** a full six-skill verification.
- 7 repeated six-skill tuples occur in groups of at least four (28 affected players). All are explicitly flagged `rating-cluster-peer-review`; these are an editorial blocker, not an excuse to jitter numbers to meet a quota.
- All 2026 rookies/depth in the six-player supplemental group now retain their actual individually worded evidence and profile URLs; the first generation had incorrectly picked up their team code as a rationale, and that defect was corrected.
- Candidate positions have been specifically corrected for major PGs, SGs and PFs but remain **provisional** pending verified NBA positions. The next gate is independent NBA ID/team and position reconciliation.
