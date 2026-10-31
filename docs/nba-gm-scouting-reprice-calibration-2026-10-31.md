# NBA GM Priority 2 — scouting, tier and repricing calibration

**31 October 2026 · owner-only, unmerged PR #2346 · baseline main 7c9b06e88da01426d9d6d0ded2d317a4edb2243c**

## Decision and evidence

Keep the 330 established overall ratings, six basketball skills, actual development profiles and $155M/three-season server economy. The issue is an NFL-specific **presentation mapping** that incorrectly calls 264 of 330 NBA players *Depth*. NBA teams typically use five starters rather than an NFL-style larger position group; the original 83 starter floor put several credible opening-lineup players in Depth. Do not manufacture more superstar grades to repair the words on screen.

| Label | Previous Football-derived cutoff | Previous players | Revised NBA cutoff | Revised players |
|---|---|---:|---|---:|
| Elite | 94–99 | 10 | **94–99** | **10** |
| Impact | 89–93 | 17 | **88–93** | **23** |
| Starter | 83–88 | 39 | **79–87** | **135** |
| Depth | ≤82 | 264 | **≤78** | **162** |
| **Total** | | **330** | | **330** |

Elite and Impact combined: **27 → 33** across 330 players. Starter-or-higher: **66 → 168**, or 5.6 players per 30 franchises; Depth is **49.1%**, rather than 80%. **No existing player rating or salary changed.** These are grades of playable game value, not claims about which five are starting on a specific real-world game night. The 79 grade remains an intentionally competitive boundary, not a blanket assertion that every 79-rated athlete is a real starting-five regular.

Borderline review from the October 29–30 330-player editorial board and the 330 identity-specific development research:

- **Alperen Şengün, Paolo Banchero, Deni Avdija and Joel Embiid (88)** become Impact, rather than Starter. Excellent NBA players should feel like a substantial draw; Embiid's health-related uncertainty remains modeled separately from ability.
- **OG Anunoby, Austin Reaves, Cooper Flagg and LaMelo Ball (87)** are high-end Starters immediately below Impact. Their distinctive skills and development/risk profiles remain visible and can be more valuable than a flat tier implies.
- **P.J. Washington, Tari Eason, Tobias Harris, Mark Williams and Quentin Grimes (79)** move from Depth to Starter caliber; this corrects some obviously unhelpful gameplay labels without altering their six skills.
- **Luke Kennard and Sam Hauser (78)** remain Depth overall despite specialist shooting advantages. Elite *trait* and Elite *overall* must remain distinct.
- **Victor Wembanyama (99), Nikola Jokić (98), Shai Gilgeous-Alexander (98), Jayson Tatum (94)** remain genuinely rare Elite.

The underlying source board has **301 player-year NBA API matches and 29 documented no-sample/other cases**, with independently certified six-skill profiles still *provisional*. These labels do not certify the ratings. Refer to `docs/nba-gm-practical-ratings-closeout-2026-10-30.md`, `docs/nba-gm-330-six-skills-PROVISIONAL-2026-10-29.json` and `data/curated/nba/gm-nba-development-profiles-2026-10-30.json`.

## Position and team coverage

Under revised tiers, the eligibility pools below include players with verified/pending editorial secondary positions and overlapping Guard/Big eligibility; counts are **not mutually exclusive**.

| Slot eligibility | Eligible players | Elite | Impact | Starter |
|---|---:|---:|---:|---:|
| PG | 57 | 4 | 7 | 27 |
| SG | 96 | 2 | 5 | 49 |
| SF | 132 | 2 | 6 | 54 |
| PF | 61 | 3 | 9 | 31 |
| C | 76 | 2 | 7 | 27 |
| Backup Guard | 134 | 5 | 8 | 63 |
| Backup Big | 122 | 5 | 15 | 47 |

The 330 player bank spans **30 teams with 9–13 candidates each**. Ten teams have no Elite/Impact candidate, ten have one, and ten have two or more. Thus a wheel spin does not routinely guarantee an Impact or Elite; the highs remain rewarding. The distribution is uneven on purpose, as team quality differs.

## Server-owned LOW / MED / HIGH risk

New optional API field: `NbaGmDevPlayer.repriceRisk?: "LOW" | "MEDIUM" | "HIGH" | "LOCKED" | null`. It comes from `private.nba_gm_v5_reprice_risk(state, player_id)`, exposed through the already owner-gated `public.nba_gm_dev_catalog()`.

- **3YR → SALARY LOCKED** (94 athletes): the existing three-year actual game pay stays identically fixed; never call the risk model for it.
- **1YR → LOW / MED / HIGH REPRICE** (236 athletes): evaluate **36 deterministic, unseeded scenarios** across all four exact v4 player-specific outcomes, three conditional development magnitudes and three market-variance samples. Weight each scenario using the actual authoritative profile probabilities.
- For each scenario, use the same v4 grade ceilings, annual development magnitudes, 1.105 grade salary elasticity, 1.065 Year 2 / 1.12 Year 3 market factor, player-specific market variance, $2.5M floor, $100K rounded dollars and final factor clamps as the actual server salary model.
- Measure *positive salary overhang* above the original salary budget already shown to the owner for the relevant future year. Average over the scenario weights, divide by the game's **$155M cap** and also calculate likelihood of a **large shock** (more than $1M or 12% of initial salary) and **very large shock** (more than $2.4M or 15% of initial salary).
- **HIGH**: expected positive overhang ≥0.8% of the cap; alternatively ≥0.3% plus ≥17% probability of a very large shock.
- **MED**: expected positive overhang ≥0.3% of the cap, or ≥12% chance of a large shock.
- **LOW**: neither threshold reached. These are **NBA game-budget exposure** thresholds and are never borrowed from Football GM's NFL salary dollar ranges.

| New Year 1 contract/risk catalog | Players |
|---|---:|
| HIGH REPRICE | **31** |
| MED REPRICE | **121** |
| LOW REPRICE | **84** |
| SALARY LOCKED | **94** |
| **Total** | **330** |

Examples: **Cooper Flagg, Jalen Duren, Amen Thompson, LaMelo Ball** show High exposure because they have authentic basketball upside and meaningful salary pressure. **Wembanyama and Jokić** can be Medium due to large existing dollar exposure even with minimal grade headroom. **James Harden, Rudy Gobert, Julius Randle** are Low risk when the authored odds skew toward staying flat or declining. This is *salary-increase exposure*, **not** a player's overall ability or a prediction that his actual next contract will be expensive.

During drafting, **no actual seeded Year 2 grade or salary is consulted**: the forecast uses v4 probabilities and the current visible grade only. During an offseason, Year 2 has already been revealed, so Year 3 is forecast from the newly visible Year 2 grade and authoritative updated Year 3 odds. The SQL price simulation remains the sole authority for realized grades/contracts. Estimates may be wrong for an individual player; that uncertainty is the gameplay point.

For old saved **V2 and untagged V3** runs, 1YR risk is null (the previous generic label remains), while existing 3YR players still report **SALARY LOCKED**, even if the V2 contract terms differ from V3. Their historical age-based outlook fallback and salary/progression behavior remain unchanged. Do not backfill a V4 forecast into legacy saves.

## Scouting odds and progression

New `developmentModelVersion: 2` runs already use the reviewed `private.nba_gm_v4_odds` **both for scouting and the server's seeded `private.nba_gm_v4_grade`**. HIGH UPSIDE / RISING / STEADY / BOOM/BUST / DECLINE RISK reuse Football GM's established *odds-to-label* ordering, **not** Football GM's talent tiers. The current V4 source has player-specific probabilities, gain/loss limits, career headroom and market variance, plus age/surge adjustment for Year 3. A 2026–27 unknown birthdate is kept null rather than guessed.

A label is a **probability forecast**, not the actual result. The game retains its already-seeded BREAKOUT / IMPROVED / HELD STEADY / REGRESSED / MAJOR REGRESSION display only after the season. 1YR price labels are similarly probabilistic.

## Deterministic draft and salary scenario study

Reproducible **400** seven-player fixture draft scenarios, 100 each of four strategies. Teams are sampled from the **eligible** wheel, roles are constrained to C/PG/SF/SG/PF plus one legal backup Guard and Big; every chosen player is distinct. A reserve of distinct cheapest eligible fillers protects remaining roster construction; every future-year contract window is checked against the $155M cap. These are deliberately conservative, *fixture-level* client selection simulations; **they do not establish that all real interactive server/offseason flows pass**.

| Draft policy (100 each) | Full rosters | Median peak annual payroll | Highest annual payroll | Elite picks | Impact picks |
|---|---:|---:|---:|---:|---:|
| Best current grade | 100 | $136.4M | $155.0M | 59 | 134 |
| Cheapest | 100 | $35.9M | $74.0M | 4 | 11 |
| Balanced quality/price | 100 | $113.6M | $154.5M | 18 | 147 |
| High-upside priority | 100 | $69.6M | $138.0M | 6 | 62 |
| **Total** | **400** | | | **87** | **354** |

These test the *visible draft budget estimates*, not realized offseason overages. The differences confirm meaningful strategy tradeoffs: a star-chasing roster approaches the cap and requires repricing awareness, while bargain and upside choices accept more starter/depth talent. The `nbaGmScoutingCalibration.test.ts` fixture reproduces this study and simulates 64 seeded salary outcomes for every 1YR player to verify projected HIGH cohorts suffer larger real pay overhang on average than LOW cohorts.

**Remaining explicit gates:** actual local migration replay and `supabase/tests/nba_gm_scouting_reprice.sql`; full private device playthrough; stress real server spin/advance, offseason cap crisis, release, trade and legacy save. The separate visual owner remains responsible for presentation; this branch does not edit their files.

## Integration instructions for Priority 1

1. **Merge only after exact-head CI and migration review**. The additive migration is `supabase/migrations/202612310900_nba_gm_scouting_reprice_signals.sql`. No existing migration is edited.
2. In `NbaGmDevPage.tsx`'s `ScoutBadges`, import `nbaGmRepriceLabel` from `./nbaGmScouting`. Replace the current hardcoded `player.gameContract==="3YR"?"SALARY LOCKED":"REPRICE RISK"` with `nbaGmRepriceLabel(player.repriceRisk, player.gameContract).label`. The helper's `.tone` is `low | med | high | locked | unknown` for matching Football-styled pills. **Do not duplicate risk math on the client.**
3. `nbaGmScoutTier` now returns the NBA cutoffs without changing the Football GM implementation or any numeric grades. Reuse the existing Elite/Impact/Starter/Depth CSS treatments, but leave all Priority 1 layout/headshots to its owner.
4. After `offseason`, refresh the catalog with the existing `repo.catalog()` call so risk projections advance to Year 3. Keep 3YR locks visible and display actual development separately.
5. If the Priority 1 branch added another `202612310900_...` migration, resolve sequence **before** integrating. Never overwrite applied migrations or modify production in this PR.
