# NFL The GM development calibration — 2026-10-07

## Authority, population, and scope

- Source of truth: `data/generated/football/wheel-nfl-gm-contracts-2026-10-05.json` and the six Wheel NFL grade authorities dated 2026-10-03.
- 594 contracts, 594 matched HQ grades, 32 teams, and **594 explicit, identity-keyed development profiles** in `data/curated/football/gm-nfl-development-profiles-2026-10-07.json`.
- Position populations: 34 QB, 65 RB, 103 WR, 33 TE, 191 Front Seven, 168 Secondary.
- Every profile records the current grade, grade confidence, age, draft investment, explicit breakout/improvement/decline likelihood, maximum annual upside/downside, and market-spread volatility. Steady probability is the remainder of 100%.
- **All 594 have been reviewed for their development profile**, not regraded. The first 177 priority subjects received specific progression calibrations in the initial pass. On Oct 8 the other 417 were each explicitly assigned a review class (rising, breakthrough, volatile, established, role, veteran, limited, or proven); their previous generic probabilities were revised with class-specific upside/downside, position context, original HQ grade, draft status, age and confidence. The resulting gameplay odds are stored in the lightweight runtime profile; all 594 player-specific review decisions, rationale and supporting references are stored separately in `data/curated/football/gm-nfl-development-review-audit-2026-10-08.json` (not shipped to clients).
- Second-pass breakdown of those 417: 115 rising, 90 established, 59 volatile, 49 role, 41 veteran, 40 proven, 21 limited, 2 breakthrough.
- For all **123 remaining RB, WR and TE profiles**, the explicit original HQ grade audit rationale is linked directly to the development decision; it captures demonstrated role, production, or injury evidence rather than relying on age/draft alone. This second review changed six particularly constrained profiles (Javonte Williams, MarShawn Lloyd, Tank Dell, Parker Washington, Isaiah Williams, Chris Godwin Jr.). Defensive grade authorities have position-wide 2025/2026 PFF evidence plus pairwise checks rather than an individual `reason` string for every player. Do not fabricate independent film notes for those 294 defenders.
- The `proven` category describes established and relatively stable players, **not necessarily elite HQ ratings**: an 83–87 grade stays an 83–87 even if the development distribution is relatively stable.
- This is **a player-by-player game-design judgment based on the existing HQ grade authority**, not 417 independently verified film-study/scouting reports. Current confirmed injury reporting was separately checked for 10 subjects, and those risk outlooks were adjusted without changing any base HQ grades. Do not claim wider 2026 medical or individual scouting sourcing than these reviews establish.

## Model behavior

- New `:gmdev1` seeds opt in. Previously created runs without this suffix retain their exact deterministic model.
- All outcomes are generated per player per game seed. No hidden rerolls or changes after reload; Year 2 and Year 3 draw separate development steps.
- **Year 2** applies the player's authored breakout / improve / steady / decline probabilities directly against the existing HQ grade. **Year 3** recalculates the outcome probabilities (not the HQ base grade) using the player's realized Year 2 grade, their gain or loss relative to Year 1, and their age. High-graded players and players who just made a large jump become progressively less likely to break out again; players who struggled keep comeback upside. Aging increases regression pressure at role-specific thresholds.
- The Year 3 adjustment does not give every player the same odds: it scales the 594 player-specific profiles, and the reduction in breakout/improvement odds flows primarily into *steady*, not an arbitrary increased bust chance. There is still only one offseason; Year 3 rating changes don't trigger another contract renegotiation.
- Established prime stars have constrained year-to-year downside while late-career stars are exposed to age risk; first-round developing quarterbacks have meaningful upside **and** nonzero bust probabilities.
- Contract repricing happens **once** between Year 1 and Year 2. 1YR offers depend on the simulated Year 2 grade plus a separate player-specific market variance factor. Their agreed demand is stable for both later seasons. 3YR contracts never reprice; their on-field grade can still change.
- Travis Hunter's two roster positions use a shared development direction roll to avoid simultaneously becoming a breakout WR and collapse DB due purely to separate identity namespaces. Offense and defense retain their distinct HQ grade/role baselines.
- The existing league/postseason simulation, team grades, cap checks, CPU cleanup, trade prices, and head-to-head match seed authority are reused.

## Individual calibration anchors (illustrative)

| Player | Current grade | Breakout | Improve | Regress | Annual gain / loss range | Why |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Josh Allen | 99 | 2% | 15% | 4% | +1.5 / −1.3 | Demonstrated top-tier stability |
| Patrick Mahomes | 97 | 2% | 16% | 5% | +2.0 / −1.5 | Established elite, limited genuine collapse |
| Caleb Williams | 87 | 27% | 37% | 18% | +8.0 / −5.7 | Former No. 1 pick with breakout and disappointment paths |
| Drake Maye | 88 | 22% | 41% | 11% | +7.0 / −3.8 | Advanced young baseline, less downside than speculative peers |
| Jayden Daniels | 84 | 24% | 34% | 23% | +8.0 / −6.5 | High creation ceiling with more variation |
| Bryce Young | 82 | 23% | 28% | 28% | +8.5 / −7.0 | Uncertain conversion to elite upside |
| Justin Herbert | 88 | 8% | 25% | 30% | +5.6 / −6.6 | Greater year-to-year downside than stable elite QBs |
| Aaron Rodgers | 79 | 1% | 3% | 62% | +1.3 / −7.0 | Late-career decline dominates development |
| Brock Bowers | 98 | 2% | 21% | 6% | +2.3 / −1.9 | Demonstrated elite despite youth |
| Ashton Jeanty | 83 | 27% | 33% | 22% | +7.8 / −6.6 | Premium draft prospect with volatile outcomes |
| Kyle Hamilton | 99 | 1% | 15% | 5% | +1.2 / −1.3 | Already elite and highly stable |
| Caleb Downs | 84 | 24% | 29% | 23% | +7.5 / −5.8 | High young ceiling but unproven NFL trajectory |

The categories are *outcome likelihoods*, not separate percentage allocations for a locked team rating. The implicit steady scenario is the remaining probability. Within each category, a deterministic roll determines severity up to the player's documented annual bounds. Realized grades remain 70–99.

## Required regression and future upkeep

- Complete profile census: all 594 runtime profiles must be explicitly marked `individual-review`, and the separate review audit must bind all 594 identities, including 417 new classification notes and 123 original RB/WR/TE grade-rationale references; current HQ grade and player identity matching; odds and cap limits.
- Injury cross-check sources (2026-10-05 to 2026-10-08): Packers official report on Edgerrin Cooper (Achilles), Lions official report on Brian Branch (Achilles), NFL report on Kerby Joseph (knee), Reuters NFL injury roundup and Broncos ankle/rib injuries, Lions local reporting on Tyleik Williams, and 49ers local reporting on Mykel Williams, Marques Sigle and Upton Stout. Injury risk never directly overwrites audited present-ability grades.
- Year 1 salary never changes; 1YR offers fixed across Years 2–3, 3YR salaries locked.
- New seeds vary outcomes; repeated seeds replay exactly; previous untagged seeds retain old behavior.
- Year 3 conditional probability tests cover a breakout followed by lower repeat-breakout odds, a setback with comeback potential, age-related regression, and valid probability distributions for all 594 profiles at different Year 2 grades.
- Three-year simulations for value, balanced, and upside roster approaches **plus 64 wheel-constrained completed drafts and their three-season records**, including CPU cap repairs, year-by-year results, and records. Refer to `footballGmFullDevelopmentCalibration.test.ts` for simulated metrics.
- After each biweekly roster/grade update, **review any new, removed, traded, or materially regraded NFL player** and update both the lean runtime profile table and its review ledger. Do not silently substitute a generic progression rate for any new member. The profile-coverage test is intended to fail closed on new identities until curated.
- This calibration does not modify the established Wheel ratings or the upstream grade-refresh schedule.

## Deployment / release safety

- Stacked on PR #1759. The current PR targets the #1759 branch rather than `main`.
- Neither PR may be merged on a stale or red validation head; production rollout requires the usual approval and post-deploy smoke check.
