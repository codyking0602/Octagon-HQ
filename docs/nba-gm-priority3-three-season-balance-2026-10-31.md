# NBA GM Priority 3 — Private three-season balance calibration
October 31, 2026. Draft-only. Do not merge without release authorization.

## Owner playtest, root cause
The first reported franchise finished 30–52, 19–63, 20–62, with score 79.3 and the verdict SOLID FOUNDATION. Reconstructing its opening seven (Luka, Edwards, GG Jackson, Michael Porter Jr., Wendell Carter Jr., Desmond Bane and Adem Bona) produces provisional offense 75.0, defense 69.1, and fit 27.7. Original estimated net is −5.61, corresponding to about 28 wins before seeded noise. That explains Season 1, but later results depend on the actual offseason state, which is not present in this source-only audit.

150 observed historical NBA team-seasons support the observed-net-rating to win regression, not the invented seven-player skill-to-net mapping. This PR changes only the provisional skill mapping.

## Change
For NEW V4 player-specific development games ONLY (economyVersion 3, developmentModelVersion 2), the provisional team net receives +3.0 baseline points and 0–3.75 points for the top TWO starters' creation skills (65% scoring, 35% playmaking). Defensive weakness, weak role fit, bench impact and cap remain consequential. Preserve the v4 profile model, unmodified prior versions, 82 games, seeded playoffs, and the Football GM 90% roster / 3% season / 7% postseason scoring.

This is an authored game calibration, not a historical regression estimate or real NBA projection.

## Reproducible three-season results

The exact-head `nbaGmThreeSeasonBalance.test.ts` suite completed **2,500 deterministic seven-player fixture drafts, 7,500 simulated 82-game seasons**, across five strategy policies (500 each). It uses the authored 330-player skills and V4 year-two/year-three development. The before figures are evaluated on the **same exact rotations and seeds** with the old skill-to-net mapping, while after includes the new +3 net baseline and the bounded two-creator term.

| Draft strategy | Original mean wins/season | Calibrated mean wins/season | Calibrated Season 3 mean |
| --- | ---: | ---: | ---: |
| Star-heavy | 22.58 | **30.28** | 29.88 |
| Balanced | 19.29 | **26.69** | 26.39 |
| Defense-first | 22.44 | **29.93** | 29.83 |
| Depth-first | 17.96 | **25.17** | 25.15 |
| Bargain-first | 18.14 | **25.47** | 25.44 |

A star-heavy team does **not** automatically dominate a complementary build under a strict cap. This is deliberate; the same seeded roster gets ~7–8 more wins after model correction without removing the downside of weak defense. This sample remains a **fixture-level simulation**, not an observed NBA dataset or a full server action-by-action playthrough.

The independently exercised local SQL migration suite also completes **3,000 server-owned NBA season outputs** across 5 named rosters × 200 fixed seeds × 3 seasons, checking 82-game integrity, postseason finish enumerations, deterministic replay and unmodified legacy V3 conversion. Existing lifecycle SQL tests separately cover owner authentication, spin, legal draft completion, trades, cuts, free agency and cap recovery. These test scopes are not combined into an unsupported claim of 2,500 fully interactive live backend franchises.

## Result messaging
Do not alter 90/3/7 numerical score. If three seasons all miss playoffs, label as strong potential without pretending a winning franchise was built.

## Release gates / limitations
Local database migration replay, CI exact-head typecheck/build, NBA & Football regressions, and private end-to-end interactive device run remain requirements. Priority 3 is NOT approved for production. Priority 4 is a separate presentation-polish follow-up.
