# Updated integration gate — 2026-10-25 (after Part 1 merged)

**Part 1 is merged**, main includes the future 48-hour UFC cadence, daily Football cadence, season-limited NBA cadence, and a no-collision canonical schedule. The historical discussion below is retained only as a comparison against the pre-Part-1 baseline; it is not current production state.

New `auditMergedPartOneCalendar()` proves the **actual** Oct 25, 2026–Apr 24, 2027 schedule from current code: Football **182**, UFC **91**, NBA **81** (last NBA publication Apr 10; board playable Apr 11), **0 cross-sport same-game collisions**. Current future live cycles have 26 Football and 28 UFC entries because their **Higher or Lower 2× slots are still excluded pending the separate two-game content certification/integration**. All currently scheduled other weights remain at their previously approved 4×/3×/2× values (within active non-Higher-or-Lower games). NBA's 28-game cycle already contains Higher or Lower.

Actual current Part 1 six-month Hit the Number demand: **15 Football appearances → 30 child boards**, **6 UFC appearances → 12 child boards**. The executable Hit the Number test now uses precisely those canonical dates and schedule versions (Football v20 only for the existing Oct 25 board, v21 afterward; UFC v21 after Oct 25). Production publication, content correctness, historical result preservation, and final six-month editorial certification remain contingent on passing CI and the separately owned question banks.

The following **28/30-entry cycles remain proposed, NON-PUBLISHING**, not activated by this change, and their November–April preview extends NBA beyond the approved April 11 end for stress testing only. **Do not confuse a preview with a release-certified live schedule.**

---

# Octagon HQ — Parts 2 & 3: six-month rotation and content readiness

**Status: PROVISIONAL / NOT RELEASE-CERTIFIED.** Last inspected main: \`8b9f2aed26ea10f56c8863e0a0cd5ce6c6d85195\`, October 24, 2026. Part 1 owns sport cadence and eventual immutable SQL schedule versions; **this draft does not update or deploy production schedules**.

## Executed post-Part-1 generator findings (October 25, 2026)

The canonical-date generator test passed for **15 Football Hit the Number appearances / 30 child boards** and **6 UFC appearances / 12 child boards**. All 42 are independently solvable, contain canonical sourced stat values, have 4–6 picks, satisfy approved Random Pool sizes (12/14/16), and have **no duplicate entire boards**. Football used 553 identified source subjects (526 NFL and 27 CFB) and 13 metrics; UFC used 82 fight-ledger fighters and 12 stat definitions, with sparser coverage of some special stats. The maximum athlete+metric reuse was **6**; full-board uniqueness does NOT establish 42 semantically unrelated games.

The broader generator availability probe found a **real pre-fix regression**: legacy Millionaire appearance-index checks rejected 23 of 28 canonical Football Millionaire dates and 11 of 14 UFC dates. This PR changes the new-date runtime to count canonical Part 1 cycle entries, while preserving all historical ordinal/run identities; a six-month regression now **fails** if any actual Football or UFC Millionaire date cannot generate. The Oct 25 UFC v20 board remains immutable, with appearance index 5; the first new UFC v21 Millionaire board begins at index 6.

Other-game prompt fingerprint counts in the generator probe are **diagnostics only** (not historical publication-aware): Football Feud had 21 repeated prompt fingerprints across 28 packs; Average Fan and Bar Trivia also showed substantial repeated prompt keys. This may include template recurrence or the same authored questions emitted more than once by test extraction. It has NOT passed the source-level semantic no-repeat and editorial fact review. Football/UFC Higher or Lower 2× activation and the separate Bar Trivia editorial drafts are also still outstanding; no new SQL cadence is applied by this PR.

**Certification verdict:** The current 26/28-slot canonical cadence, scoped UFC Hit the Number rules, and Millionaire publication-availability regression are testable on exact CI. **Full 28/30-slot approved 2× Higher or Lower rotation and six-month all-game factual uniqueness remain UNVERIFIED**, and must not be represented as shipped by merging this focused PR.

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

1. **Part 1 is merged.** Canonical schedule and season boundary are locked; Hit the Number and other-game probes now use its exact dates/seeds. The proposed 2× Higher or Lower frequencies still require a separate future-only schedule migration once the two-game content publisher is certified.
2. **UFC Higher/Lower** stays under its other build owner. **Football Higher/Lower** requires a 130-comparison reversed/semantic-duplicate simulation before activation.
3. **Bar Trivia** remains owned by separate NFL/CFB and UFC editorial draft PRs. Do not duplicate their changes here.
4. **All other game banks** require production-generator question-level extraction and real unique-concept reports. This diagnostic report does not falsely label them Ready.
5. Exact-head TypeScript, targeted Vitest, backend regression and CI results must be green. Do not merge/deploy until the user explicitly authorizes and all content gates are satisfied.

Artifacts:
- \`src/features/play/sixMonthDailyRotationAudit.ts\` (pure future preview / actual baseline diagnostics).
- \`src/features/play/sixMonthDailyRotationAudit.test.ts\` (weights, cadence, spacing, collision assertions).
- \`src/features/play/sixMonthHitNumberReadiness.test.ts\` (production-generator rehearsal).
- \`src/features/play/hitTheNumberDailyRuntime.ts\` (UFC new-Daily-only factual candidate and pick-count correction).

**Release state of this PR: no cadence SQL changes, no backfill of published Daily attempts, and no permission to claim six-month editorial certification without the separate 2× Higher or Lower/Bar Trivia/factual content release gates.**
