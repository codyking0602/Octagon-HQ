# Football comparison depth II evidence

This note records the evidence boundary for Football roadmap PR3. It supports the existing canonical comparison owner; it is not a second ratings provider.

## Scope

PR3 expands the reviewed comparative universe to 13 packs and 350 unique subjects, including:

- NFL tight end careers
- NFL defensive careers across EDGE/DL/LB/CB/S
- NFL quarterback seasons
- NFL team seasons
- college head-coaching careers
- college program eras
- deeper college quarterback careers, programs since 2000, and team seasons

All comparative contracts use the shared Football 0–100 bands and store a short `ratingBasis`. The game generators still consume `footballRankFiveModel.ts`; PR3 does not introduce a new route, provider, or grading engine.

## Evidence rule

Ratings are category-specific comparative judgments, not raw-stat formulas. Each reviewed rating uses:

1. factual résumé / results,
2. era and role context,
3. the documented category rubric,
4. whole-pool calibration,
5. pairwise sanity checks.

Raw counting stats do not directly compare different defensive positions. For the cross-position NFL defensive-career pack, sacks, interceptions and tackles are evaluated relative to position and era before the shared impact judgment is made.

## Current-season cutoff

PR3 is reviewed through the completed 2025 NFL and college football seasons. Current facts materially used in calibration include:

- Matthew Stafford won the AP 2025 NFL MVP.
- Myles Garrett won the AP 2025 Defensive Player of the Year after a record 23-sack season.
- Mike Vrabel won the AP 2025 Coach of the Year after New England went 14–3 and reached Super Bowl LX.
- Seattle beat New England 29–13 in Super Bowl LX.
- Indiana finished 16–0 and won the 2025 college football national championship, beating Miami 27–21.

Those completed-season results are why PR3 refreshes Stafford and Vrabel rather than preserving stale PR2 calibration.

## Primary current sources

- NFL Honors 2025 award winners: https://www.nfl.com/news-migrated-v2/list-of-nfl-honors-award-winners-from-2025-nfl-season
- NFL Super Bowl LX recap: https://www.nfl.com/news-migrated-v2/seahawks-patriots-in-super-bowl-lx-what-we-learned-from-seattle-s-29-13-win
- AP Indiana national championship recap: https://apnews.com/article/8b4fb15e43e10c890e16b57551b48523
- AP final 2025 college football poll: https://apnews.com/article/d20d33aecbec2021a90e1f8ce8eead7c

Historical career/season inputs continue to use authoritative league/college records and Pro Football Reference / Sports Reference-style career and season tables as evidence inputs. They do not replace the versioned category rubrics.

## Pairwise calibration examples

PR3 specifically locks comparisons where simplistic formulas can fail:

- Lawrence Taylor > Aaron Donald on the current all-time defensive-career calibration, while both remain benchmark-level careers.
- Myles Garrett > Luke Kuechly after Garrett's second DPOY and 23-sack 2025 season.
- Jadeveon Clowney > Morris Claiborne > Dion Jordan > Vernon Gholston across recognizable lower-end defensive outcomes.
- Tony Gonzalez > Travis Kelce > Jason Witten on the current completed-career/active-career calibration.
- 2007 New England > 2015 Carolina despite both losing the Super Bowl; team-season grading is not ring-only.
- 2025 Indiana > 2022 TCU > 2012 USC > 2022 Texas A&M on the CFB team-season scale.
- Nick Saban > Curt Cignetti > Tom Herman > Chad Morris on the college head-coaching career scale.

These anchors are regression checks, not substitutes for whole-pool review.
