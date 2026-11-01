# NBA GM — November 1, 2026 contract rebuild: private STAGING AUDIT

**Status: Incomplete. Do not merge or deploy.** Draft PR #2368: https://github.com/codyking0602/Octagon-HQ/pull/2368 . PR #2367 (visual parity) **merged** into main at 2026-11-01T15:54:58Z (`117238bba93b5b57931dbaf77e83fbeb6911296e`). Our branch starts from its immediately preceding main commit, modifies separate files, and retains merged parity work in the PR's base.

## Owner-approved salary-average rule — NOVEMBER 1 UPDATE

**New locked economic basis (private staging only):** for each of the 330 players, use the *arithmetic average of the actual signed salaries during the relevant part of the 2026-27, 2027-28, 2028-29 game window*. Signed future extensions and options count. This does **not** change any real contract expiration or force a new percentage split:

- **3YR:** signed through 2028-29 or later -> average the three published 2026-27/2027-28/2028-29 salaries and lock that single average game salary for all three game seasons.
- **1YR, deal expires 2027-28:** average the two published 2026-27/2027-28 salaries for Game Year 1, with Game Years 2-3 governed by existing development-based repricing.
- **1YR, deal expires 2026-27:** first-year salary alone is its one signed-season average. Game Years 2-3 reprice as before.
- **Missing future salary:** NOT zero, and NOT a guess using grade/fictional raises. Leave candidate average null and refuse V4 economy launch until sourced and independently checked.

**Actual shared 1YR / 3YR rule comparison:** NFL GM published 594-player sourced catalog from October 26 is **318 1YR (53.5%) / 276 3YR (46.5%)**; NBA GM proposed 330 is **194 1YR (58.8%) / 136 3YR (41.2%)**. NFL salary basis is OverTheCap *contract APY*, not first-year salary. NBA is ~5.3 percentage points more 1YR; **do not artificially adjust cutoff or terms** to resemble NFL.

**Wembanyama:** real signed 2026-27 $16,868,246; 2027-28 $43,500,000; 2028-29 $46,980,000. New staged 3YR salary = **$35,782,749** (rounded average), all three game seasons. Not a fictional Wembanyama premium. https://www.basketball-reference.com/contracts/SAS.html

**Data status:** all **330 source schedule rows staged** in `docs/nba-gm-three-season-salary-averages-2026-11-01.csv`, with isolated migration 905. **258/330 have a mechanically complete candidate average; 72/330 are deliberately null** due to missing or discordant signed future salary sources (including LeBron James, Austin Reaves, several 2026 signings/rookies). Future season data from a July 2 historical snapshot are **not independently verified against November 1**; the rest have other candidate single-source provenance. **0/330 fully independently certified**. The V4 activation gate now checks salary *schedules* as well as contract end dates and refuses any launch with incomplete data.

Sample staged averages: Tyrese Maxey **$43.58M**, Jaylen Brown **$61.02M**, Joel Embiid **$62.75M**, all Philadelphia *game-assigned* 3YR players (not necessarily real Philadelphia employees); some other Philadelphia game players still lack verified future annual salaries.

**Cap impact:** the prior 1,120 Year 1 screens ran on first-year salaries, so are **obsolete for the approved average model**. The screening script now requires all 330 average candidates and fails closed until the remaining 72 salaries are sourced. Cap stays **$155M live**. No justified change to the NBA 7-player game cap without real three-year server playthroughs.

## Audit census and accuracy limits

- **330/330 distinct player identities and original salaries** match the existing NBA GM game catalog.
- **330/330 have a 2026–27 candidate salary**, with an identified source and verification status. These are not individually independently certified for November 1.
- **330/330 have a provisional option-inclusive contractual expiration and corresponding 1YR/3YR game term:** 194 1YR (58.8%), 136 3YR (41.2%). **No missing candidate terms** remain; many source-level cross-checks do remain.
- Status counts: OFFICIAL_EXTENSION_SALARY_CROSSCHECK_REQUIRED: 1; OFFICIAL_TERM_SALARY_CROSSCHECK_REQUIRED: 1; MATCHED_HISTORICAL_END_REVERIFY: 229; INDEPENDENT_SOURCE_CHECK_REQUIRED: 60; CURRENT_NOV_SINGLE_SOURCE_RECHECK: 39. **0 records marked independently verified** in isolated source staging SQL. This is deliberate and prevents using these contracts in the game before secondary validation.
- Source disagreements, minimum cap charge versus base salary, two-way compensation, unsigned/amended extensions, guarantee contingencies and special exceptions are documented per row. No values are silently marked verified.


## Old versus candidate salaries

| Metric | Existing fictional salary | New 2026–27 provisional candidate |
|---|---:|---:|
| Players | 330 | 330 |
| Total catalog salaries | $3164.60M | $5355.79M |
| Average salary | $9.59M | $16.23M |
| Median salary | $6.60M | $9.84M |
| 1YR game terms | 236 (71.5%) | 194 (58.8%) *provisional* |
| 3YR game terms | 94 (28.5%) | 136 (41.2%) *provisional* |
| Still missing term | 0 | 0 |
| Fully independently revalidated for November 1 | No (fictional) | **Not yet** |

The candidate catalog salary is $2191.19M (+69.2%) higher than the fictional baseline. These are all candidate salary distributions, **not final approved real NBA contracts**.


### Ten biggest Year 1 candidate increases

| Player | Old | Candidate | Increase |
|---|---:|---:|---:|
| Jimmy Butler | $12.90M | $56.83M | +$43.93M |
| Paul George | $11.10M | $54.13M | +$43.03M |
| Zach LaVine | $8.00M | $48.97M | +$40.97M |
| Trae Young | $14.80M | $49.49M | +$34.69M |
| Joel Embiid | $24.00M | $58.10M | +$34.10M |
| De'Aaron Fox | $16.90M | $49.80M | +$32.90M |
| Ja Morant | $9.50M | $42.17M | +$32.67M |
| Anthony Davis | $26.70M | $58.46M | +$31.76M |
| Domantas Sabonis | $14.80M | $45.47M | +$30.67M |
| Jordan Poole | $3.70M | $34.04M | +$30.34M |

### Ten biggest Year 1 candidate decreases

| Player | Old | Candidate | Decrease |
|---|---:|---:|---:|
| Victor Wembanyama | $60.50M | $16.87M | -$43.63M |
| LeBron James | $29.50M | $3.88M | -$25.62M |
| Shai Gilgeous-Alexander | $56.50M | $40.81M | -$15.69M |
| Stephon Castle | $24.00M | $10.02M | -$13.98M |
| Jalen Brunson | $49.00M | $37.74M | -$11.26M |
| Deni Avdija | $24.00M | $13.13M | -$10.88M |
| Cooper Flagg | $21.50M | $14.52M | -$6.98M |
| Amen Thompson | $19.20M | $12.26M | -$6.94M |
| Ajay Mitchell | $8.00M | $2.85M | -$5.15M |
| Keyonte George | $11.10M | $6.56M | -$4.54M |


## Philadelphia — all 11 game-assigned players, not seven-person lineup

Game team assignments intentionally preserved (some players now play elsewhere in the real NBA). This is not a claim that all eleven are real Philadelphia employees.

| Player | Prior game salary | Candidate 2026-27 salary | Old term | Provisional new term |
|---|---:|---:|---|---|
| Tyrese Maxey | $35.50M | $40.77M | 3YR | 3YR |
| Jaylen Brown | $35.50M | $57.08M | 3YR | 3YR |
| LeBron James | $29.50M | $3.88M | 3YR | 1YR |
| Joel Embiid | $24.00M | $58.10M | 3YR | 3YR |
| VJ Edgecombe | $9.50M | $11.66M | 1YR | 3YR |
| Kentavious Caldwell-Pope | $4.50M | $3.88M | 1YR | 1YR |
| Anfernee Simons | $6.60M | $6.00M | 3YR | 1YR |
| Labaron Philon Jr. | $2.50M | $3.60M | 1YR | 3YR |
| Dean Wade | $3.70M | $9.00M | 1YR | 3YR |
| Adem Bona | $2.70M | $2.30M | 1YR | 1YR |
| Jabari Walker | $2.50M | $2.58M | 1YR | 1YR |

Philadelphia game-team catalog totals: old $156.50M vs candidate $198.84M. This is *not* a real team payroll or seven-player cap analysis.

## Team-by-team provisional candidate catalog

| Game team | Players | Old salary total | New candidate total | Terms 1YR/3YR/Unknown |
|---|---:|---:|---:|---|
| ATL | 12 | $102.50M | $186.03M | 4/8/0 |
| BKN | 9 | $52.70M | $127.48M | 6/3/0 |
| BOS | 12 | $114.90M | $194.01M | 7/5/0 |
| CHA | 11 | $75.70M | $113.45M | 6/5/0 |
| CHI | 10 | $57.20M | $109.91M | 7/3/0 |
| CLE | 11 | $133.40M | $200.90M | 4/7/0 |
| DAL | 11 | $93.50M | $158.83M | 7/4/0 |
| DEN | 12 | $145.10M | $217.78M | 8/4/0 |
| DET | 11 | $115.60M | $177.82M | 7/4/0 |
| GSW | 12 | $118.00M | $211.45M | 10/2/0 |
| HOU | 13 | $133.10M | $197.27M | 9/4/0 |
| IND | 12 | $120.80M | $199.57M | 9/3/0 |
| LAC | 10 | $62.00M | $147.03M | 8/2/0 |
| LAL | 10 | $114.40M | $182.03M | 5/5/0 |
| MEM | 10 | $55.70M | $92.19M | 7/3/0 |
| MIA | 9 | $121.30M | $194.19M | 8/1/0 |
| MIL | 10 | $60.60M | $120.33M | 5/5/0 |
| MIN | 12 | $135.30M | $207.33M | 6/6/0 |
| NOP | 10 | $79.00M | $181.66M | 6/4/0 |
| NYK | 10 | $150.10M | $211.78M | 5/5/0 |
| OKC | 13 | $169.80M | $205.33M | 6/7/0 |
| ORL | 10 | $97.90M | $201.55M | 4/6/0 |
| PHI | 11 | $156.50M | $198.84M | 5/6/0 |
| PHX | 10 | $93.00M | $179.13M | 5/5/0 |
| POR | 13 | $96.60M | $211.89M | 8/5/0 |
| SAC | 9 | $61.70M | $182.59M | 6/3/0 |
| SAS | 12 | $152.60M | $191.24M | 4/8/0 |
| TOR | 11 | $118.60M | $195.20M | 6/5/0 |
| UTA | 12 | $80.80M | $173.67M | 8/4/0 |
| WAS | 12 | $96.20M | $185.32M | 8/4/0 |


## Strategic concerns: contract economics

- **Victor Wembanyama:** prior Year 1-only candidate $16,868,246 (last rookie-scale salary) is **superseded by the owner's signed-season-average rule**; staged 3YR game salary is now **$35,782,749**. Both sources and math documented above.
- **Nikola Jokić:** candidate $59,033,114 and signed 2027–28 *player option* as final contract year; 1YR. A hypothetical 2027 extension does not count.
- **Herb Jones:** 2026–27 active deal alone misleadingly expires soon; signed extension starting 2027–28 means 3YR.
- **Two-way deals:** Braden Smith and Josh Dix have candidate player base salary $678,882; actual NBA team cap hit can be $0. The game intentionally needs consistent policy for base salary versus cap hits, rather than interchanging values.
- **Veteran minimums:** LeBron, KCP, Trey Lyles, Mario Hezonja differ in salary vs cap charge. Current candidate file uses player base, as requested, flagged to verify.
- **Potential stale prices/option disagreements**: all separate provenance notes and verification statuses in CSV. The July snapshot cannot establish post-July extensions by itself.
- Draft mechanics hide unaffordable candidates by existing owner decision; no over-cap explanations may be added.

## Simulations actually completed, and what remains

**Previously completed on the now-superseded first-year-only salary basis:** 1,120 deterministic **Year 1 only** provisional draft-affordability screens were re-executed after the last salary/term corrections (160 per cap, 8 selection strategies, 7 roster roles, candidate pool from all 30 NBA game teams). Repeatable source: `scripts/nba-gm-cap-screening.mjs`. This is **not** the server-authoritative full three-season game: no seeded real development outcomes, future-year reserve constraints, offseason trades/releases/free agency, scores or championship results.

| Salary cap | Completed | Mean Year 1 payroll | Mean cap room | Mean quality index | Choices offered/spin | Multiple Elite |
|---|---:|---:|---:|---:|---:|---:|
| $155M | 160/160 | $112.85M | $42.15M | 80.87 | 2.96 | 2.50% |
| $165M | 160/160 | $113.30M | $51.70M | 80.75 | 3.04 | 3.13% |
| $175M | 160/160 | $118.64M | $56.36M | 81.17 | 3.03 | 3.75% |
| $185M | 160/160 | $122.48M | $62.52M | 81.43 | 3.04 | 3.13% |
| $195M | 160/160 | $124.31M | $70.69M | 81.33 | 3.11 | 5.00% |
| $205M | 160/160 | $127.78M | $77.22M | 81.36 | 3.12 | 5.00% |
| $220M | 160/160 | $132.58M | $87.42M | 81.74 | 3.14 | 7.50% |

**All table figures above use superseded first-year salary inputs and MUST NOT be used to choose a cap under the approved average method.** The previous first-season-only results showed no strong benefit to automatically raising $155M, but they **cannot decide the cap** before the full development/repricing/retention lifecycle is simulated. The seeds differ across cap scenarios, so these comparisons have sampling noise.

**NOT completed:** valid 330/330 independent source verification (all 330 provisional game term counts ARE now computed), new-run routing to economyVersion 4, three-year true server-affordability/reprice/stress tests, 1,000+ true full franchise playthroughs, saved-run/backward compatibility tests, production SQL migration replay, TypeScript/build/full test suite. **No one preferred cap is defensible yet.** The preliminary Year 1 test does *not* justify automatically increasing $155M but ignores potentially severe future repricing crises.

## Implementation and release boundary

Staged migrations **903, 904, and 905** remain **unmerged**. Migration 905 adds the sourced signed-season average and strengthens the V4 source-readiness gate. Migration 903 inserts 330 *unverified* candidate records into private, RLS-protected source table, with authenticated/anon/public direct privileges revoked. Migration 904 defines isolated `nba_gm_v4_contract` and `nba_gm_v4_salary` functions **fail closed** unless all 330 explicitly certified; no live action, catalog or saved run uses them. Repricing follows existing player-specific seeded grade/market factors. Old V2/V3 economies remain untouched.

Source completeness script `node scripts/nba-gm-contract-coverage.mjs --strict` must **fail** while 330 verification incomplete. Private SQL regression tests assert guard behavior and preservation of original 330 salaries and teams; tests are authored but not verified in a full local migration replay.

Owner approval of **one validated cap** and all verified contracts is required before enabling new-only V4 game starts, merging or deploying. Preserve merged PR #2367 presentation.

## Primary source trail

- Source CSV per-player links and verification flags: `docs/nba-gm-contract-source-audit-2026-11-01.csv`.
- October manually curated 2026–27 salaries: https://github.com/ballacademy/NBA-head-to-head-/blob/main/data/manual/nba-salaries.csv
- July historical 2025–2031 salaries and options: https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json
- Official Wembanyama extension: https://www.nba.com/news/spurs-sign-victor-wembanyama-to-multi-year-contract-extension
- Jokic current signed term: https://www.nba.com/news/nikola-jokic-denver-nuggets-media-day-2026
- NBA 2026-27 league cap reference, **not seven-player game cap**: https://www.nba.com/news/nba-salary-cap-2026-27-season
