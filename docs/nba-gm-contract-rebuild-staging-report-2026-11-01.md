# NBA GM 2026–27 contracts — staged source audit, NOT a release candidate

**Snapshot request:** November 1, 2026. **Current repo baseline:** main `87448ea131114101625ae3660ca7f9000f2cab4a`. **Branch:** `feature/nba-gm-contract-source-audit-20261101`. **Production economy untouched.**

## Exact status and blockers

- 330/330 current game player IDs, teams, existing salaries and current game terms are represented in `docs/nba-gm-contract-source-audit-2026-11-01.csv`. No identity or team changes.
- 330/330 have a **candidate** 2026–27 salary from public/third-party sources, **not 330 independently verified current contracts**.
- 266/330 have a **provisional** real end-year and derived game 1YR/3YR term; 64 have no substantiated end-year yet. This prevents deployment, definitive new term statistics, and all valid three-year cap simulations.
- Source-status breakdown: 229 matched to July 2 salary/term historical records and awaiting November reconfirmation; 60 October 9 salary candidates awaiting reconfirmation with no end-year; 35 independently identified October/November cases still needing second source/option verification; four carry-forward/estimated cases; plus Wembanyama and Jokić official-news end-year adjudications. These categories overlap conceptually with salary vs term; see source status per row.
- Do **not** activate v4 economy or silently treat provisional salaries as verified. `node scripts/nba-gm-contract-coverage.mjs --strict` must fail until every player has an independently verified, dated 2026–27 salary, options and expiration.
- No migrations, database changes, production cap changes, saved-run mutations, client routing or score recalculations were made.

## Baseline economics compared with provisional source candidates

| Metric | Existing fictional contracts | 2026–27 candidate salary screen |
|---|---:|---:|
| Players | 330 | 330 |
| Total salary across catalog | $3164.60M | $5364.24M |
| Average salary | $9.59M | $16.26M |
| Median salary | $6.60M | $10.01M |
| 1YR game terms | 236 (71.5%) | 155 **among 266 resolved; incomplete** |
| 3YR game terms | 94 (28.5%) | 111 **among 266 resolved; incomplete** |
| No defensible game term | 0 | **64** |

Provisional total salary rises by $2199.64M (about 69.5%). This is a diagnostic, **not** a validated 330-contract replacement.

### Highest salary differences (provisional)
- Jimmy Butler: $12.90M → $56.83M, +$43.93M.
- Paul George: $11.10M → $54.13M, +$43.03M.
- Zach LaVine: $8.00M → $48.97M, +$40.97M.
- Joel Embiid: $24.00M → $58.10M, +$34.10M.
- Victor Wembanyama: $60.50M → $16.87M, −$43.63M.
- LeBron James: $29.50M → $3.88M, −$25.62M.

**Key gameplay issue:** NBA confirmed Wembanyama's July 2026 extension lasts through 2031–32. Under the owner's 3YR rule, he costs only his last rookie-scale salary ($16.87M) in all three game seasons despite a real-world extension that starts around $43.5M in 2027–28. That creates large economic surplus versus the actual market; do not secretly rewrite his salary or term. NBA source: https://www.nba.com/news/spurs-sign-victor-wembanyama-to-multi-year-contract-extension . Conversely, Jokić's 2027–28 player option still gives him **1YR** because no extension had been signed by the snapshot: https://www.nba.com/news/nikola-jokic-denver-nuggets-media-day-2026 .

## Philadelphia 76ers — current GAME team assignments (11 players)

This intentionally preserves the game's 76ers allocations; the team may not match the player's real NBA club.

| Game player | Old Year 1 | Candidate 2026–27 | Old term | Provisional new term |
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

11-player game-team candidate total $198.84M, versus prior $156.50M. This is NOT a seven-player team roster, cap usage or game starting lineup.

Salary-basis distinction requires owner policy validation for partially guaranteed and minimum deals. LeBron/Calwell-Pope/Trey Lyles/Hezonja have differences between player **base salary** and league **cap hit**. Use the owner-approved 2026–27 salary basis consistently and annotate exceptions, not whichever reported amount conveniently improves cap balance.

## Team distribution

Game team totals include all candidates; contract counts display **resolved 1YR / resolved 3YR / unknown** and are not final.

| Game team | Players | Old total | Candidate total | Terms 1YR / 3YR / Unknown |
|---|---:|---:|---:|---|
| ATL | 12 | $102.50M | $186.03M | 4 / 8 / 0 |
| BKN | 9 | $52.70M | $127.86M | 3 / 2 / 4 |
| BOS | 12 | $114.90M | $205.37M | 5 / 4 / 3 |
| CHA | 11 | $75.70M | $113.45M | 6 / 5 / 0 |
| CHI | 10 | $57.20M | $109.91M | 6 / 3 / 1 |
| CLE | 11 | $133.40M | $203.23M | 4 / 5 / 2 |
| DAL | 11 | $93.50M | $158.83M | 7 / 4 / 0 |
| DEN | 12 | $145.10M | $217.80M | 5 / 4 / 3 |
| DET | 11 | $115.60M | $176.65M | 5 / 1 / 5 |
| GSW | 12 | $118.00M | $210.39M | 5 / 2 / 5 |
| HOU | 13 | $133.10M | $197.95M | 6 / 3 / 4 |
| IND | 12 | $120.80M | $198.34M | 7 / 3 / 2 |
| LAC | 10 | $62.00M | $147.03M | 7 / 2 / 1 |
| LAL | 10 | $114.40M | $182.31M | 2 / 1 / 7 |
| MEM | 10 | $55.70M | $92.19M | 7 / 3 / 0 |
| MIA | 9 | $121.30M | $194.19M | 8 / 1 / 0 |
| MIL | 10 | $60.60M | $120.33M | 5 / 5 / 0 |
| MIN | 12 | $135.30M | $207.33M | 4 / 4 / 4 |
| NOP | 10 | $79.00M | $181.66M | 5 / 3 / 2 |
| NYK | 10 | $150.10M | $212.03M | 4 / 3 / 3 |
| OKC | 13 | $169.80M | $205.33M | 5 / 6 / 2 |
| ORL | 10 | $97.90M | $201.54M | 3 / 6 / 1 |
| PHI | 11 | $156.50M | $198.84M | 5 / 6 / 0 |
| PHX | 10 | $93.00M | $179.13M | 4 / 2 / 4 |
| POR | 13 | $96.60M | $211.86M | 8 / 4 / 1 |
| SAC | 9 | $61.70M | $182.59M | 5 / 3 / 1 |
| SAS | 12 | $152.60M | $189.78M | 3 / 7 / 2 |
| TOR | 11 | $118.60M | $195.20M | 6 / 5 / 0 |
| UTA | 12 | $80.80M | $171.78M | 4 / 4 / 4 |
| WAS | 12 | $96.20M | $185.32M | 7 / 2 / 3 |

## Safe next implementation steps (not completed)

1. Revalidate every October 9 salary candidate against November 1 Basketball Reference, Spotrac and official reporting; adjudicate July-to-November extensions and option years. No guesses when a deal is unsigned.
2. Reconcile 64 missing expirations; address all 4 estimated/carry-forward salaries and 2-way/partial guarantee cases separately. Salary versus cap-hit source inconsistencies require independent resolution.
3. Stage **new** `economyVersion:4` data and functions without changing old rows or old V2/V3 behaviors. Record starting salary and real option-inclusive end separately. Do not read the new data for existing runs.
4. Add new-only salary functions and catalog projection. Old saves keep original prices and agreement years. The current `pricingKind` validator only accepts `GAME_FIXTURE_NOT_REAL_CONTRACT`; version the server/client shape deliberately instead of mislabeling real salaries as fixtures.
5. Run exact server-authoritative multi-season spin/pick/offseason/trade/release/reprice/free agency/full scoring tests with >=1,000 randomized franchises across $155M–$220M and refined caps, and keep seed, code revision and aggregate distributions. Do not extrapolate Year 1 checks to championship outcomes.
6. Select one cap from documented statistical results **after** all salaries and terms are confirmed. The true NBA 2026–27 league salary cap ($164.961M) is a context reference for this **seven-player** fictional game, not a gameplay target.
7. Verify state economy routing preserves saved franchise agreements. Complete TypeScript/build, migrations in scratch DB, SQL regression, owner-only access. Require owner approval before merge/release.

## Explicitly out of scope for this staging PR

This branch does NOT replace the live game prices, does NOT change the $155M cap, does NOT classify all 330 terms, does NOT deliver a three-season cap winner, does NOT run 1,000 actual backend three-season simulations and is NOT release-ready. PR #2367 is an independent open draft for visuals/offseason; preserve it when integrating.

## Source provenance

October 9 price inputs (third-party manual curated; some estimates): https://github.com/ballacademy/NBA-head-to-head-/blob/main/data/manual/nba-salaries.csv and https://github.com/ballacademy/NBA-head-to-head-/blob/main/data/manual/nba-salary-supplements.csv

July 2 term input (historical, unsigned extensions possible): https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json

Current 2026 rookie salary reference: https://hoopsmatic.com/salary-season-finder/draft/2026/

Current Philadelphia cross-check: https://www.basketball-reference.com/contracts/PHI.html

Every row's specific candidate source and unresolved issue appears in the CSV.
