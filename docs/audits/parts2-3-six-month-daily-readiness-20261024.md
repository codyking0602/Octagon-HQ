# Octagon HQ — Parts 2 & 3: six-month rotation and content readiness

**Status: PROVISIONAL / NOT RELEASE-CERTIFIED.** Last inspected main: \`8b9f2aed26ea10f56c8863e0a0cd5ce6c6d85195\`, October 24, 2026. Part 1 owns sport cadence and eventual immutable SQL schedule versions; **this draft does not update or deploy production schedules**.

## A. Rotation report

Simulation window: **2026-11-01–2027-04-30, inclusive (181 Central calendar dates)**. This is a nonpublishing planning horizon, not an announced extension of the NBA season. The existing NBA \`NBA_REGULAR_SEASON_LAST_DAY\` is **2027-04-11**; extending publication for April 12–30 requires Part 1 / release-owner approval and corresponding backend changes.

| Game | Football weight | UFC weight | NBA weight |
|---|---:|---:|---:|
| Average Fan | 4 | 4 | 4 |
| Sports Feud | 4 | 4 | 4 |
| Millionaire | 4 | 4 | 4 |
| Who Am I | 3 | 3 | 3 |
| Find the Leader | 3 | 3 | 3 |
| Wavelength | 3 | 3 | 3 |
| Bar Trivia | 3 | 3 | 3 |
| Hit the Number | 2 | 2 | 2 |
| Higher or Lower | 2 (not yet certified) | 2 (unfinished) | 2 |
| Blind Resume | — | 2 | — |
| **Cycle size** | **28** | **30** | **28** |

The approved Football/UFC weights already exist in \`dailyContentQualityPolicy.ts\`; **live pre-Part-1 cycles do not match**: both still have Average Fan 5x, and neither includes Higher or Lower. The staged Football Higher/Lower publisher does not imply content certification. NBA already has its approved 28-slot weight cycle.

### Exact simulation of source-code cycles, before Part 1

| Sport | Pre-Part-1 appearances | Six-month preview appearances |
|---|---:|---:|
| Football | 181 | 181 |
| UFC | 181 | 90 |
| NBA | 81, then stops Apr 11 | 91, *the last 10 not currently publishable* |

**Cross-sport same-game collisions: 18 pre-Part-1 → 6 in the proposed *unreleased* weighted/cadence preview.** Before: Football–UFC 4, Football–NBA 6, UFC–NBA 8. Preview: Football–UFC 6, Football–NBA 0, UFC–NBA 0. This is **not a same-cadence isolated algorithm improvement measurement**: the transition from UFC daily to alternate days changes the collision opportunities. It is an honest end-to-end calendar comparison, not a production claim.

The preview uses fixed approved 28/30-game cycles and smooth deterministic cycle construction, penalizes adjacent recurrence, then makes deterministic count-preserving swaps to improve spacing and collisions. NBA's established 28-slot order remains intact. It computes candidates without publishing; Part 1 must own the actual production schedule version/seed and history guards.

| Game | Football preview | UFC preview | NBA preview |
|---|---:|---:|---:|
| Average Fan | 26 | 12 | 13 |
| Sports Feud | 26 | 12 | 13 |
| Millionaire | 26 | 12 | 13 |
| Who Am I | 19 | 9 | 10 |
| Find the Leader | 19 | 9 | 10 |
| Wavelength | 19 | 9 | 10 |
| Bar Trivia | 20 | 9 | 10 |
| Hit the Number | 13 | 6 | 6 |
| Higher or Lower | 13 | 6 | 6 |
| Blind Resume | — | 6 | — |

Spacing observations (calendar days): Football 2x Hit the Number: 13–15 between appearances, UFC 2x Hit the Number: exactly 30, NBA 2x Hit the Number: 24–32. Football 4x Average Fan: 5–8, UFC 4x: 12–18. In the pre-Part-1 cycle, Football Wavelength has a **20-day maximum**, UFC Sports Feud and Wavelength have **23-day maximums** despite their 4x/3x weights and despite UFC erroneously still being daily.

The actual production simulation, schedule/materialization idempotency proof, fallback comparison and parity with the final version **must be rerun against exact Part-1 merged main**. A plan preview is not proof of a published schedule.

## B. Content readiness — six-month demand

Counts below are **planned Daily dates, not guaranteed unique prompts**. A content bank is not certified because its number of source IDs exceeds a count. \`—\` means a production-equivalent factual/semantic count was **not yet demonstrated**. Do not interpret this as zero capacity.

| Sport | Game | Dates | Question/board demand | Verified distinct concepts | Exact/semantic repeats | Status |
|---|---|---:|---|---:|---|---|
| Football | Average Fan | 26 | 26 runs, multiple tiles | — | — | Requires manual factual review |
| Football | Sports Feud | 26 | 26 packs (multi-board) | — | — | Requires runtime concept audit |
| Football | Millionaire | 26 | 26 runs, multiple questions | — | — | Requires runtime concept audit |
| Football | Who Am I | 19 | 19 runs, two identity rounds | — | — | Requires runtime identity audit |
| Football | Find the Leader | 19 | 38 boards | — | — | Requires runtime subject-season audit |
| Football | Wavelength | 19 | 38 rounds | — | — | Requires semantic audit |
| Football | Bar Trivia | 20 | 20 sets | — | — | **Blocked by separate draft #2085** |
| Football | Hit the Number | 13 | **26 boards** | Generator test added, CI pending | — | Provisional; not certified |
| Football | Higher or Lower | 13 | **130 comparisons** | — | — | **Staged #2100, not six-month certified** |
| UFC | Average Fan | 12 | 12 runs, multiple tiles | — | — | Requires runtime audit |
| UFC | Sports Feud | 12 | 12 packs (multi-board) | — | — | Requires concept editorial check |
| UFC | Millionaire | 12 | 12 runs, multiple questions | — | — | Requires runtime audit |
| UFC | Who Am I | 9 | 9 runs, two identity rounds | — | — | Requires history-aware audit |
| UFC | Find the Leader | 9 | 18 boards | — | — | Requires runtime audit |
| UFC | Wavelength | 9 | 18 rounds | — | — | Requires runtime audit |
| UFC | Bar Trivia | 9 | 9 sets | — | — | **Separate draft #2083** |
| UFC | Hit the Number | 6 | **12 boards** | Generator test added, CI pending | — | Provisional; not certified |
| UFC | Higher or Lower | 6 | **60 comparisons** | — | — | **Blocked: separate construction** |
| UFC | Blind Resume | 6 | 6 multi-round runs | — | — | Requires runtime audit |
| NBA | Average Fan | 13 | 13 runs, multiple tiles | — | — | Requires runtime audit |
| NBA | Sports Feud | 13 | 13 packs | — | — | Requires semantic audit |
| NBA | Millionaire | 13 | 13 runs, multiple questions | — | — | Requires runtime audit |
| NBA | Who Am I | 10 | 10 runs, two identity rounds | — | — | Requires history-aware audit |
| NBA | Find the Leader | 10 | 20 boards | — | — | Requires runtime audit |
| NBA | Wavelength | 10 | 10 runs | — | — | Requires semantic audit |
| NBA | Bar Trivia | 10 | 10 sets | — | — | Requires runtime audit |
| NBA | Hit the Number | 6 | 12 boards | — | — | Requires runtime audit |
| NBA | Higher or Lower | 6 | **60 comparisons** | — | — | Requires reverse-pair audit |

Do not activate unfinished games or declare any of the above fully certified before actual production-seed and semantic evidence exists.

## C. Hit the Number deep audit / scoped change

**Source architecture.** Football Official Daily already uses the canonical curated Football Hit the Number model and a random pool. It selects from verified NFL/CFB subjects; generated board size uses **4→12 / 5→14 / 6→16**. The generator exposes real solution IDs and metric values. Its official publication has two games. Existing canonical Football data/tests must be reused, not replaced.

UFC pre-change Official Daily uses the canonical UFC ledger/supplemental stat rows but still permits **7-pick** games through its 4/5/6/7 generator profile and Random Pool uses **8/10/12** instead of 12/14/16. These are source-verified defects against the six-month standard, not invented lack-of-content claims.

**This isolated draft introduces a new Official UFC publication content version** and a scoped wrapper over the *same* quality-gated factual format planner. Only **new UFC Official Daily** plans are constrained to 4–6 picks; Random Pool gains 4 additional fully eligible, deterministic, format-compatible fighters to yield 12/14/16. It preserves existing Casual generation (including preexisting behavior) and already-persisted Daily results. UFC open-roster remains open-roster, so the exact 12/14/16 count rule is tested only for Random Pool.

The generator-backed test builds the **13 Football dates → 26 boards** and **6 UFC dates → 12 boards** from the proposed preview and checks deterministic solution existence, sum of canonical values, identity attribution, choice sizes, full-board uniqueness, and UFC pool-quality metrics. It emits an auditable distribution of picks/formats and maximum subject/stat reuse. **Those numbers must come from the executed test, not from this draft.** Its seed versions are explicitly nonlive; Part 1 schedule version will change generated boards. As a result, even a green test is a necessary rehearsal, **not six-month production certification**.

| Hit the Number dimension | Football | UFC |
|---|---|---|
| Official Daily appearance target | 13 | 6 |
| Required distinct child boards | 26 | 12 |
| Factual source | Football canonical subject/factual registry | UFC canonical fight ledger + audited UFCStats supplement |
| Candidate inventory count | Pending executed generator inventory report | Pending executed generator inventory report |
| Pick-count distribution | Pending CI log | Pending CI log |
| Solvable percentage | Pending CI log | Pending CI log |
| Duplicate full boards | Pending CI log | Pending CI log |
| Repeated subject/stat overlap | Pending CI log | Pending CI log |
| Editorial source re-verification | Required | Required |
| Final six-month verdict | **Not certified** | **Not certified** |

## Blocking handoffs / release gates

1. **Part 1** must finish its cadence and immutable production schedule version and clarify NBA publication after Apr 11; then rebase this branch on fresh main and rerun audit using exact production seeds.
2. **UFC Higher/Lower** stays under its other build owner. **Football Higher/Lower** requires a 130-comparison reversed/semantic-duplicate simulation before activation.
3. **Bar Trivia** remains owned by separate NFL/CFB and UFC editorial draft PRs. Do not duplicate their changes here.
4. **All other game banks** require production-generator question-level extraction and real unique-concept reports. This diagnostic report does not falsely label them Ready.
5. Exact-head TypeScript, targeted Vitest, backend regression and CI results must be green. Do not merge/deploy until the user explicitly authorizes and all content gates are satisfied.

Artifacts:
- \`src/features/play/sixMonthDailyRotationAudit.ts\` (pure future preview / actual baseline diagnostics).
- \`src/features/play/sixMonthDailyRotationAudit.test.ts\` (weights, cadence, spacing, collision assertions).
- \`src/features/play/sixMonthHitNumberReadiness.test.ts\` (production-generator rehearsal).
- \`src/features/play/hitTheNumberDailyRuntime.ts\` (UFC new-Daily-only factual candidate and pick-count correction).

**Release state: no merges, no deployment, no published Daily modifications.**
