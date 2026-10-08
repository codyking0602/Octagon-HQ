# NFL The GM development calibration — 2026-10-07

## Authority, population, and scope

- Source of truth: `data/generated/football/wheel-nfl-gm-contracts-2026-10-05.json` and the six Wheel NFL grade authorities dated 2026-10-03.
- 594 contracts, 594 matched HQ grades, 32 teams, and **594 explicit, identity-keyed development profiles** in `data/curated/football/gm-nfl-development-profiles-2026-10-07.json`.
- Position populations: 34 QB, 65 RB, 103 WR, 33 TE, 191 Front Seven, 168 Secondary.
- Every profile records the current grade, grade confidence, age, draft investment, explicit breakout/improvement/decline likelihood, maximum annual upside/downside, and market-spread volatility. Steady probability is the remainder of 100%.
- **177 explicit priority-player scouting adjustments** cover high-profile quarterbacks, breakthrough prospects, prime superstars, declining veterans, top receivers, star defenders, and the top secondary. **417 remaining subjects have a distinct persisted evidence-derived profile** from their already-audited grade, confidence, age, and draft context. They are not 417 independently researched player reports. Do not describe this as individual film/scouting verification of every bench player.

## Model behavior

- New `:gmdev1` seeds opt in. Previously created runs without this suffix retain their exact deterministic model.
- All outcomes are generated per player per game seed. No hidden rerolls or changes after reload; Year 2 and Year 3 draw separate development steps.
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

- Complete profile census; current HQ grade and player identity matching; odds and cap limits.
- Year 1 salary never changes; 1YR offers fixed across Years 2–3, 3YR salaries locked.
- New seeds vary outcomes; repeated seeds replay exactly; previous untagged seeds retain old behavior.
- Three-year simulations for value, balanced, and upside roster approaches, including CPU cap repairs, year-by-year results, and records. Refer to `footballGmFullDevelopmentCalibration.test.ts` for simulated metrics.
- After each biweekly roster/grade update, **review any new, removed, traded, or materially regraded NFL player** and update this explicit profile table. Do not silently substitute a generic progression rate for any new member. The profile-coverage test is intended to fail closed on new identities until curated.
- This calibration does not modify the established Wheel ratings or the upstream grade-refresh schedule.

## Deployment / release safety

- Stacked on PR #1759. The current PR targets the #1759 branch rather than `main`.
- Neither PR may be merged on a stale or red validation head; production rollout requires the usual approval and post-deploy smoke check.
