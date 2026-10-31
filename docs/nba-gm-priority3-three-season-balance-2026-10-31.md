# NBA GM Priority 3 — Private three-season balance calibration
October 31, 2026. Draft-only. Do not merge without release authorization.

## Owner playtest, root cause
The first reported franchise finished 30–52, 19–63, 20–62, with score 79.3 and the verdict SOLID FOUNDATION. Reconstructing its opening seven (Luka, Edwards, GG Jackson, Michael Porter Jr., Wendell Carter Jr., Desmond Bane and Adem Bona) produces provisional offense 75.0, defense 69.1, and fit 27.7. Original estimated net is −5.61, corresponding to about 28 wins before seeded noise. That explains Season 1, but later results depend on the actual offseason state, which is not present in this source-only audit.

150 observed historical NBA team-seasons support the observed-net-rating to win regression, not the invented seven-player skill-to-net mapping. This PR changes only the provisional skill mapping.

## Change
For NEW V4 player-specific development games ONLY (economyVersion 3, developmentModelVersion 2), the provisional team net receives +3.0 baseline points and 0–3.75 points for the top TWO starters' creation skills (65% scoring, 35% playmaking). Defensive weakness, weak role fit, bench impact and cap remain consequential. Preserve the v4 profile model, unmodified prior versions, 82 games, seeded playoffs, and the Football GM 90% roster / 3% season / 7% postseason scoring.

This is an authored game calibration, not a historical regression estimate or real NBA projection.

## Before vs after screening
2,500 deterministic legal seven-slot fixture drafts before the +3 global term, 500 per strategy:
| Strategy | Before average wins | After creator-only adjustment | Median peak payroll |
| --- | ---: | ---: | ---: |
| Star heavy | 28.97 | 30.68 | $133.6M |
| Balanced | 17.84 | 18.25 | $56.2M |
| Defense focused | 29.87 | 31.17 | $111.6M |
| Depth focused | 15.75 | 16.04 | $47.9M |
| Bargain focused | 13.31 | 13.63 | $40.4M |

New +3 net yields another ~6–7 wins where clamping does not intervene. Directional tests are not population-calibrated NBA historical claims. The Vitest fixture runs 2,500 deterministic three-season franchises / 7,500 synthetic seasons; the SQL regression runs 5 concrete strategies x 200 seeds x 3 years = 3,000 actual authoritative SQL season outcomes, including deterministic postseason and legacy-path checks. Existing backend tests cover spin, trade, release, cap and sign routes; these new harnesses do NOT constitute 2,500 complete live interactive franchise RPC sessions.

## Result messaging
Do not alter 90/3/7 numerical score. If three seasons all miss playoffs, label as strong potential without pretending a winning franchise was built.

## Release gates / limitations
Local database migration replay, CI exact-head typecheck/build, NBA & Football regressions, and private end-to-end interactive device run remain requirements. Priority 3 is NOT approved for production. Priority 4 is a separate presentation-polish follow-up.
