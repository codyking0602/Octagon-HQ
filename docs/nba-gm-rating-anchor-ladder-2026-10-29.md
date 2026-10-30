# NBA GM overall grading — anchor-first calibration
Date: October 29, 2026
Status: Editorial calibration DRAFT. No real NBA grades published. No approval for gameplay or data migration.

## Philosophy inherited from NFL GM

1. Define what a grade **means** and create empty numeric slots before discussing individual NBA names.
2. Start with the 2026–27 active-player pool (research target 300–360, **330 for this calibration**). An athlete does **not** become 80+ merely by qualifying for the player pool.
3. Place established ability, not age, draft status, contract, projected upside, reputation, popularity, or NBA 2K overall.
4. Calibrate cross-position: 90 PG versus 90 C should represent similar overall basketball impact, but guard and big skills are position-specific. No implicit 90+ for the best player on each NBA team or at each position.
5. Place players blind against anchors, then compare near-peers and check external rankings as **error detectors**; never convert someone else's ranks or 2K ratings directly into HQ ratings.
6. Apply the same strictness to the low end. A 72–79 specialist should still have meaningful NBA skills, e.g. strong shooting or defense, without a generously inflated overall. **Trait 95 does not imply overall 95**.
7. Base ability = what a player can currently produce in an NBA rotation. Future potential belongs to independently reviewed three-year development probabilities, not current-grade inflation. Injuries and availability should be modeled explicitly rather than blindly treating temporary absences as ability loss.
8. After grading, simulate lineups and check for position/role biases, salary/overall outliers, hidden compression, unearned 80+ inflation, and implausible star-versus-role-player separation.
9. Do not rewrite historical game results when publishing later corrections. Ratings and source snapshots must be versioned for future runs.

## Empty anchor ladder (meanings, not player assignments)

| Overall | Calibration meaning |
| --- | --- |
| **99** | The current best, virtually unique generational impact; only if the individual independently earns it |
| **95** | True MVP-level / franchise-defining superstar |
| **90** | Genuine All-NBA / high-level All-Star caliber, capable of being a leading star |
| **85** | Very strong starter, well above ordinary rotation impact, but not automatically an All-Star |
| **80** | Dependable NBA starter or strong sixth man; genuinely good, not just someone with a contract |
| **75** | Legitimate rotation player, specialist, or uncertain/developing starter |
| **70** | Marginal rotation/depth player or currently limited contributor |

Between anchors, use individual comparative evidence. 99 does not have to be awarded; 70 is not a mandatory floor if the researched player pool expands beyond playable contributors.

## Provisional 330-player population curve

**These are calibration targets only: no automated quotas, no enforced rank-to-grade conversion.** The target counts are intended to reveal accidental generosity after independently researched ratings have been assigned.

| Overall band | Approximate number | Cumulative at or above band |
| --- | ---: | ---: |
| 99 | 1 | 1 |
| 95–98 | 7 | 8 |
| 90–94 | 17 | 25 |
| 85–89 | 35 | 60 |
| 80–84 | 75 | 135 |
| 75–79 | 110 | 245 |
| 70–74 | 85 | 330 |
| **Total** | **330** | |

Under this reference: **8/330 (2.4%) at 95+**, **25/330 (7.6%) at 90+**, **135/330 (40.9%) at 80+**, and **195/330 (59.1%) below 80**. If independent grading yields different values, investigate the difference rather than automatically moving players to reach a target. The eventual exact distribution should reflect the actual validated population.

## Anchor-first player placement workflow

### Pass 1: establish extremes and recognizable anchors

Start by reviewing the current MVP-tier candidates **Victor Wembanyama, Nikola Jokić, Shai Gilgeous-Alexander, Luka Dončić, and Giannis Antetokounmpo** against 99/95 definitions. This is a *review queue*, **not assigned ratings**. The league's 2025–26 All-NBA and award voting and October 2026 independent top-100 lists identify these as appropriate top-end comparators.

Find identifiable players representing the 90, 85, 80, 75, and 70 points before filling all positions. Use multiple reviewed candidates for each integer anchor when possible, especially 80/75/70. The anchors should demonstrate actual demonstrated ability, not merely where an external ranking placed a player.

### Pass 2: fill the population in relative batches

Create a verified 2026–27 identity/roster ledger, grouped by observed NBA role and team. Grade stars, starters, reserve rotation contributors and lower-end players independently. For each subject, retain:
- identity key, current 2026–27 team, eligible NBA positions and baseline role;
- proposed overall and confidence; evidence and cross-position neighbors;
- relevant 2025–26 production, efficiency, usage/minutes, two-way contribution, and 2026–27 observations as they accumulate;
- uncertainty and injury/availability treatment;
- independent skill evaluations (scoring, playmaking, shooting, perimeter defense, interior defense, rebounding);
- any disagreement with media consensus or another grade system, documented as a review trigger.

No player should receive a final rating based only on a list rank or an isolated box score. A long gap due to injury should remain explicit.

### Pass 3: calibration and owner preview

Audit 70–79 placements as rigorously as 90–99. Compare near neighbors blindly, check every position for compression and cohort bias, then report *actual* distribution versus the provisional curve, 99/90/80/75/70 anchors, and outlier holds/corrections. Only publish versioned game grades after editorial certification and owner go-live authorization.

## Reference evidence (editorial, not machine-assigned ratings)

- NBA official 2025–26 voting: https://pr.nba.com/voting-results-2025-26-nba-regular-season-awards/
- NBA official 2025–26 All-NBA teams: https://www.nba.com/news/2025-26-all-nba-teams-announced
- Basketball-Reference 2025–26 player advanced stats: https://www.basketball-reference.com/leagues/NBA_2026_advanced.html
- The Ringer 2026–27 top 100, October 14 snapshot: https://www.theringer.com/nba-ranked/top-100
- CBS Sports 2026–27 player rankings, October 13: https://www.cbssports.com/nba/news/ranking-nba-top-100-players-2026-27-season/
- Prior Octagon HQ NFL grade methodology: docs/wheel-football-nfl-final-calibration-audit-2026-10-03.md

This file is a **grading methodology only** and must not be imported by production grading, challenge, wheel or simulation modules.
