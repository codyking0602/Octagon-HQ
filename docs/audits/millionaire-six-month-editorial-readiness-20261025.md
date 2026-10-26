# Millionaire six-month editorial audit — staging, NOT certified
**Inspection baseline:** `main` at `25d5a49c4e8acc4b411f047a6fb579d9865c4930`, October 25, 2026.
**Window:** 2026-10-25 through 2027-04-24 inclusive (182 calendar days).
**Status:** **NOT READY TO MERGE OR DEPLOY AS A SIX-MONTH CONTENT REBUILD.**

This is a question-by-question **triage inventory**, not 240 completed factual approvals. See [the 240-row CSV](millionaire-question-disposition-ledger-20261025.csv). A KEEP proposal means the narrow underlying fact has been corroborated; it **does not** certify distractors, clue quality, difficulty, or cross-game originality. A source URL is never a substitute for review. Rows without a checked claim remain HOLD. The existing production bank and archived boards were not modified by this audit PR.

## Canonical implementation and actual schedule

- **Bank:** `src/features/play/millionaireDailyQuestionBank.ts` contains 10 fixed runs of 8 questions **per league**.
- **Selection:** `millionaireDailyRuntime.ts` maps league-specific appearance ordinal modulo `MILLIONAIRE_DAILY_RUN_COUNT = 10` and balances answer order. `buildMillionaireDailySetup` builds a persisted public/private Official Daily setup; no substitute generator is needed.
- **Schedule:** `dailyChallengeRotation.ts` uses the approved 28-slot Football and 30-slot UFC rotations after October cutovers; UFC publishes every other day.
- **Special history:** Oct 25 UFC was previously published; Oct 26 Cowboys–Eagles NFL Millionaire is a themed board in `footballTeamThemeDailyPacks.ts`. Preserve historic Oct 10 Ditka and Texas–Oklahoma material and all earlier attempts. NBA is outside scope.
- **Core gameplay:** `millionaireDailyAdvance.ts`, `millionaireAuthority.ts`, `millionaireEngine.ts` and Casual studio/scoring/lifelines remain untouched.

| League | Existing authored questions | Existing regular runs | Appearances Oct 25–Apr 24 | Special/historic appearances | Distinct regular runs appearing | Complete regular runs repeated |
|---|---:|---:|---:|---|---:|---:|
| NFL | 80 | 10 | **14** | Oct 26 themed NFL | 10 | **3** |
| CFB | 80 | 10 | **13** | None in this window | 10 | **3** |
| UFC | 80 | 10 | **13** | Oct 25 already published | 10 | **3** |
| **Total** | **240** | **30** | **40** | **2 special/historical** | **30** | **9** |

Football has **27** Millionaire dates (NFL 14 / CFB 13), not 26. UFC has 12 future releases **plus** the already published October 25 board. Any capacity claim excluding those dates must explicitly distinguish future-only from full-window. The source-bank appearance index wraps and guarantees the repeats below; this is not a theoretical bank-size issue.

**Repeated full runs (earlier → repeat):**

- NFL: run 4, 2026-11-04 → 2027-03-24; run 5, 2026-11-18 → 2027-04-07; run 6, 2026-12-02 → 2027-04-21.
- CFB: run 4, 2026-10-31 → 2027-03-20; run 5, 2026-11-12 → 2027-04-01; run 6, 2026-11-28 → 2027-04-17.
- UFC: run 6, 2026-10-25 → 2027-03-22; run 7, 2026-11-06 → 2027-04-03; run 8, 2026-11-22 → 2027-04-19.

## First-pass editorial disposition (proposals only)

| League | KEEP (narrow verified fact) | REWRITE | RETIRE | HOLD / unverified | Total |
|---|---:|---:|---:|---:|---:|
| NFL | 1 | 4 | 5 | 70 | 80 |
| CFB | 9 | 3 | 4 | 64 | 80 |
| UFC | 2 | 18 | 5 | 55 | 80 |
| **Total** | **12** | **25** | **14** | **189** | **240** |

These dispositions do **not** remove active content. All rows, including provisional KEEP, require independent review of each distractor and Stat Sheet before publication. The ledger is intentionally conservative: mass-approving questions based on plausibility would create a false certification.

### Confirmed factual / clue defects

1. **NFL run 1 Q6 is false.** The old answer to “Which quarterback has never been named first-team All-Pro?” is Matthew Stafford. Stafford was first-team AP All-Pro after the **2025 season**, announced January 2026, and won AP MVP. This question must not appear in a future board in that form. A narrowly sourced, future-only fix is staged separately as PR **#2129**; historical questions are not rewritten. [AP/NFL All-Pro roster](https://www.nfl.com/news/2025-all-pro-team-matthew-stafford-bijan-robinson-jsn-highlight-roster).
2. **CFB run 10 Q1 is ambiguous.** “Who won the 2025 national championship?” could mean the 2025 **season** (Indiana, game played January 2026) or the game played **January 2025** (Ohio State). The prompt must name the season. [CFP championship history](https://collegefootballplayoff.com/sports/2026/8/10/ncg-history).
3. **UFC run 10 Q7 leaks the answer.** Grasso is literally named in the Stat Sheet for a question whose correct answer is Alexa Grasso. The fourth-round UFC 285 submission is documented by [UFC official results](https://www.ufc.com/news/ufc-285-jones-vs-gane-results-highlights-winner-interviews-las-vegas); an indirect clue should replace the original.

### Repeated concepts and experience quality

- CFB run 1 Q2 / run 3 Q4 both ask about the first No. 4-seed CFP champion. CFB runs 1 Q5 / 2 Q5 repeat USC's three Heismans in 2002–05. CFB runs 3 Q5 / 4 Q5 repeat Saban's titles at LSU and Alabama. CFB runs 6 Q7 / 7 Q8 repeat Auburn's low preseason AP rank.
- NFL runs 1 Q1 / 10 Q1 both ask Joe Burrow's No. 1 overall selection. NFL runs 7 Q7 / 8 Q6 both test Ray Lewis combining DPOY and Super Bowl MVP.
- UFC runs 1 Q4 / 8 Q2 ask who GSP beat for his first welterweight belt; UFC runs 3 Q3 / 5 Q2 ask whom Jon Jones beat for his first UFC championship.
- **Run-level cohesion** is particularly poor for UFC runs **7, 8 and 9**: repeated Israel Adesanya, Georges St-Pierre and Khabib Nurmagomedov questions dominate almost entire boards. These are distinct facts but repetitive, unsuitable general Daily experiences.
- Repeated **correct answers within one run** were detected in UFC runs 1, 7, 8, 9 and 10 (seven additional answer occurrences). Identical answers aren't necessarily identical facts, but they are a warning for pacing and distractor design.
- Q8 in all 30 legacy runs has no Stat Sheet by design. Keep that locked rule; review Q8's rewarding sports significance rather than using arbitrary season stat comparisons.

### Cross-game candidates — must resolve against active selector

Direct or near-direct *source-bank* overlaps found in Bar Trivia:
- NFL Millionaire 7 Q2: Music City Miracle touchdown scorer (same prompt family as Bar Trivia).
- NFL 5 Q2: Buffalo Bills' four straight Super Bowl appearances.
- UFC 6 Q3: UFC 1 host city Denver.
- UFC 10 Q2: Rousey–Carmouche, first UFC women's fight opponent.
- UFC 3 Q1: first simultaneous UFC double champion.

**Active-bank resolution of the five direct cross-game candidates:** `nfl-r3-music-city`, `ufc-r2-first-city`, `ufc-r1-first-women` and `ufc-r2-double-champ` are explicitly excluded by `BAR_TRIVIA_EDITORIAL_RETIREMENTS` and therefore **are not current playable Bar Trivia duplicates**. The Buffalo four-straight-Super-Bowls item `nfl-r3-four-super-bowls` is **not excluded** by the present Bar Trivia retirement or Football V2 retirement lists, so it remains an **active-bank factual overlap** with NFL Millionaire 5 Q2. An active-bank collision is not proof of a collision on two six-month scheduled Daily dates; scheduling still requires separate verification. This distinction was verified against the actual `BAR_TRIVIA_QUESTION_BANK` filter, not just raw source prompts. Generic Feud prompts mentioning the same athlete are **not** duplicate facts. Average Fan, latest approved Feud expansions and semantic topic families still need complete question-level cross-game comparison before certification.

## Minimum readiness work before an editorial go-live

1. Independently check every surviving question, all four choices and useful/non-leaking Q1–Q7 Stat Sheets against authoritative primary records; capture source **evidence**, not just a URL. Confirm each complete ladder is satisfying from Q1 to Q8.
2. Remove or substantively rewrite the 14 retirement candidates and 25 rewrite candidates; finalize the 189 holds. Retain existing correct content and preserve the historical published versions.
3. Supply at least **15 distinct eligible eight-question regular runs per league** (13 regularly scheduled NFL + reserve; 13 CFB + reserve; UFC 12 future plus already published run + reserve). That is 40 extra question slots per league **before** replacements for retired questions. A meaningful reserve of 2 runs makes 15 a useful target. 120 additional slots, plus retirements, must each be independently authored and checked — remixing old questions to create different permutations is not the same as unique facts.
4. Verify future-only versioned selection that never recycles full runs, individual questions or high-similarity semantic facts. Do not mutate a historical private proof or prior completed result, and do not touch NBA.
5. Run actual canonical publications for all 40 dates, compare prompt and semantic IDs across all sports and active cross-game banks, then verify four choices, difficulty, grading/lifelines/recovery/timer/resume, exact PR-head Validate V2 and production.
6. **Block merging the full editorial bank** if any factual approvals, semantic conflicts, run capacity or exact-head validation remain unresolved.

## Test coverage in this staging PR

`millionaireSixMonthEditorialGate.test.ts` reads **every** CSV record, reconciles it with the legacy executable bank, invokes the canonical Official Daily publisher for the real six-month calendar, validates the eight-question / four-choice / Q8 lifeline structure, and reproduces all nine current complete-run repeats. The test explicitly asserts **NOT CERTIFIED**; a green staging test must never be portrayed as a release signoff. On final implementation, replace baseline expectations with zero-repeat and signed-off editorial assertions.

No Supabase migration or Cloudflare deployment is appropriate for this audit-only PR.
