# NBA GM — November 1, 2026 contract rebuild: private STAGING AUDIT

**Status: Incomplete. Do not merge or deploy.** Draft PR #2368: https://github.com/codyking0602/Octagon-HQ/pull/2368 . PR #2367 (visual parity) **merged** into main at 2026-11-01T15:54:58Z (`117238bba93b5b57931dbaf77e83fbeb6911296e`). Our branch starts from its immediately preceding main commit, modifies separate files, and retains merged parity work in the PR's base.

## Audit census and accuracy limits

- **330/330 distinct stable game identities**, same game team and unchanged original in-game salary in each row.
- 330/330 **candidate** November 2026 year-one salaries assembled from October 9 manually curated BRef/Spotrac, July 2 option table, rookie-scale data and specific SalarySwish pages. These are **not 330 independently certified salaries**.
- **291/330 provisional option-inclusive contract terms**, including 166 1YR and 125 3YR. **39 missing end dates**. New final contract counts and percentages remain unknown.
- Verification status counts: OFFICIAL_EXTENSION_SALARY_CROSSCHECK_REQUIRED: 1; OFFICIAL_TERM_SALARY_CROSSCHECK_REQUIRED: 1; MATCHED_HISTORICAL_END_REVERIFY: 229; INDEPENDENT_SOURCE_CHECK_REQUIRED: 60; OCT_09_SNAPSHOT_REVERIFY: 37; ESTIMATE_OR_CARRY_FORWARD_NOT_VERIFIED: 2. Independently certified 330/330 count = **0**. Special disagreements listed in individual CSV rows.
- Do not fill unknown expiration, 2-way, cap-hit vs base salary, partial guarantee, or newly signed contract with guesses. No provisional record is marked certified.

## Old versus candidate salaries

| Metric | Existing game fixture | Provisional salary candidate |
|---|---:|---:|
| Players | 330 | 330 |
| Catalog total | $3164.60M | $5352.02M |
| Mean salary | $9.59M | $16.22M |
| Median salary | $6.60M | $9.84M |
| 1YR | 236 (71.5%) | 166 provisional, not final |
| 3YR | 94 (28.5%) | 125 provisional, not final |
| No classified end date | 0 | 39 |
| Verified 330-player contract population | No — fictional | No — current salary/term gaps |

The candidate total is $2187.42M higher (+69.1%) than the fictional fixture. This is a provisional **distribution** comparison, not a release certification.

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

| Game team | Players | Old total | New candidate total | Terms 1YR/3YR/unknown |
|---|---:|---:|---:|---|
| ATL | 12 | $102.50M | $186.03M | 4/8/0 |
| BKN | 9 | $52.70M | $127.98M | 5/3/1 |
| BOS | 12 | $114.90M | $194.01M | 7/5/0 |
| CHA | 11 | $75.70M | $113.45M | 6/5/0 |
| CHI | 10 | $57.20M | $109.91M | 7/3/0 |
| CLE | 11 | $133.40M | $200.90M | 4/7/0 |
| DAL | 11 | $93.50M | $158.83M | 7/4/0 |
| DEN | 12 | $145.10M | $217.80M | 6/4/2 |
| DET | 11 | $115.60M | $176.66M | 5/2/4 |
| GSW | 12 | $118.00M | $210.39M | 5/2/5 |
| HOU | 13 | $133.10M | $197.95M | 6/4/3 |
| IND | 12 | $120.80M | $198.34M | 8/3/1 |
| LAC | 10 | $62.00M | $147.03M | 7/2/1 |
| LAL | 10 | $114.40M | $182.18M | 2/4/4 |
| MEM | 10 | $55.70M | $92.19M | 7/3/0 |
| MIA | 9 | $121.30M | $194.19M | 8/1/0 |
| MIL | 10 | $60.60M | $120.33M | 5/5/0 |
| MIN | 12 | $135.30M | $207.33M | 5/5/2 |
| NOP | 10 | $79.00M | $181.66M | 5/4/1 |
| NYK | 10 | $150.10M | $212.03M | 4/3/3 |
| OKC | 13 | $169.80M | $205.33M | 5/7/1 |
| ORL | 10 | $97.90M | $201.54M | 3/6/1 |
| PHI | 11 | $156.50M | $198.84M | 5/6/0 |
| PHX | 10 | $93.00M | $179.13M | 5/2/3 |
| POR | 13 | $96.60M | $211.86M | 8/4/1 |
| SAC | 9 | $61.70M | $182.59M | 5/3/1 |
| SAS | 12 | $152.60M | $191.24M | 4/8/0 |
| TOR | 11 | $118.60M | $195.20M | 6/5/0 |
| UTA | 12 | $80.80M | $171.78M | 4/4/4 |
| WAS | 12 | $96.20M | $185.32M | 8/3/1 |

## Strategic concerns: contract economics

- **Victor Wembanyama:** candidate $16,868,246 (last rookie-scale salary) but confirmed 2026 extension carries through 2031–32. That is a 3YR **salary lock** under the owner rule even though real salary increases massively in 2027–28. Distorts economic price/performance unless accepted as the reward for a bargain contract; do not fudge his base.
- **Nikola Jokić:** candidate $59,033,114 and signed 2027–28 *player option* as final contract year; 1YR. A hypothetical 2027 extension does not count.
- **Herb Jones:** 2026–27 active deal alone misleadingly expires soon; signed extension starting 2027–28 means 3YR.
- **Two-way deals:** Braden Smith and Josh Dix have candidate player base salary $678,882; actual NBA team cap hit can be $0. The game intentionally needs consistent policy for base salary versus cap hits, rather than interchanging values.
- **Veteran minimums:** LeBron, KCP, Trey Lyles, Mario Hezonja differ in salary vs cap charge. Current candidate file uses player base, as requested, flagged to verify.
- **Potential stale prices/option disagreements**: all separate provenance notes and verification statuses in CSV. The July snapshot cannot establish post-July extensions by itself.
- Draft mechanics hide unaffordable candidates by existing owner decision; no over-cap explanations may be added.

## Simulations actually completed, and what remains

**Completed:** 1,120 deterministic **Year 1 only** provisional draft-affordability screens (160 each across seven cap scenarios and eight selection policies). The seed-based screening file is `scripts/nba-gm-cap-screening.mjs`. These screens are **not actual full 3-season server action playthroughs**, use conservative distinct lower-cost slot reserves, and do not model development/repricing, cap crises, trade/release, free agency, full GM scores, playoffs/championships, or legacy saves. Prior screen sample (before final salary cross-check corrections):

| Salary cap | Completed | Mean payroll | Mean room | Mean roster quality | Mean offers per spin | Multiple Elite |
|---|---:|---:|---:|---:|---:|---:|
| $155M | 160/160 | $112.75M | $42.25M | 80.84 | 2.95 | 2.5% |
| $165M | 160/160 | $113.33M | $51.67M | 80.75 | 3.03 | 3.13% |
| $175M | 160/160 | $118.43M | $56.57M | 81.13 | 3.03 | 3.13% |
| $185M | 160/160 | $122.52M | $62.48M | 81.40 | 3.04 | 3.13% |
| $195M | 160/160 | $124.26M | $70.74M | 81.31 | 3.10 | 5.0% |
| $205M | 160/160 | $127.80M | $77.20M | 81.36 | 3.12 | 5.0% |
| $220M | 160/160 | $132.61M | $87.39M | 81.72 | 3.14 | 7.5% |

Re-screening against the latest candidates yielded 160/160 drafts completed per cap again, with mean payrolls approximately $112.79M/$113.08M/$118.48M/$123.52M/$124.56M/$127.22M/$132.73M at $155M/$165M/$175M/$185M/$195M/$205M/$220M respectively. This still does not constitute a cap recommendation.

**NOT completed:** valid 330/330 independent source verification, complete 1YR/3YR counts, new-run routing to economyVersion 4, three-year true server-affordability/reprice/stress tests, 1,000+ true full franchise playthroughs, saved-run/backward compatibility tests, production SQL migration replay, TypeScript/build/full test suite. **No one preferred cap is defensible yet.** The preliminary Year 1 test does *not* justify automatically increasing $155M but ignores potentially severe future repricing crises.

## Implementation and release boundary

Staged migrations 903 and 904 remain **unmerged**. Migration 903 inserts 330 *unverified* candidate records into private, RLS-protected source table, with authenticated/anon/public direct privileges revoked. Migration 904 defines isolated `nba_gm_v4_contract` and `nba_gm_v4_salary` functions **fail closed** unless all 330 explicitly certified; no live action, catalog or saved run uses them. Repricing follows existing player-specific seeded grade/market factors. Old V2/V3 economies remain untouched.

Source completeness script `node scripts/nba-gm-contract-coverage.mjs --strict` must **fail** while 330 verification incomplete. Private SQL regression tests assert guard behavior and preservation of original 330 salaries and teams; tests are authored but not verified in a full local migration replay.

Owner approval of **one validated cap** and all verified contracts is required before enabling new-only V4 game starts, merging or deploying. Preserve merged PR #2367 presentation.

## Primary source trail

- Source CSV per-player links and verification flags: `docs/nba-gm-contract-source-audit-2026-11-01.csv`.
- October manually curated 2026–27 salaries: https://github.com/ballacademy/NBA-head-to-head-/blob/main/data/manual/nba-salaries.csv
- July historical 2025–2031 salaries and options: https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json
- Official Wembanyama extension: https://www.nba.com/news/spurs-sign-victor-wembanyama-to-multi-year-contract-extension
- Jokic current signed term: https://www.nba.com/news/nikola-jokic-denver-nuggets-media-day-2026
- NBA 2026-27 league cap reference, **not seven-player game cap**: https://www.nba.com/news/nba-salary-cap-2026-27-season
