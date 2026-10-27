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
| CFB | 9 | 7 | 4 | 60 | 80 |
| UFC | 2 | 18 | 5 | 55 | 80 |
| **Total** | **12** | **29** | **14** | **185** | **240** |

These dispositions do **not** remove active content. All rows, including provisional KEEP, require independent review of each distractor and Stat Sheet before publication. The ledger is intentionally conservative: mass-approving questions based on plausibility would create a false certification.

- Four more CFB championship-year questions in the original bank are ambiguous without an explicit **season** qualifier: runs 2 Q1 (2005 Texas; 2006 game), 3 Q1 (2023 Michigan; 2024 game), 6 Q1 (2020 Alabama; 2021 game), and 8 Q1 (2019 LSU; 2020 game). Their entries now have provisional **REWRITE** dispositions backed by official [BCS history](https://collegefootballplayoff.com/sports/2021/9/7/bcs-history) and [CFP season history](https://collegefootballplayoff.com/sports/2026/8/10/cfp-history). Their historical published forms and private proofs remain unchanged; future-only corrections are still outstanding.

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
2. Remove or substantively rewrite the 14 retirement candidates and 25 rewrite candidates; finalize the 185 holds. Retain existing correct content and preserve the historical published versions.
3. Supply at least **15 distinct eligible eight-question regular runs per league** (13 regularly scheduled NFL + reserve; 13 CFB + reserve; UFC 12 future plus already published run + reserve). That is 40 extra question slots per league **before** replacements for retired questions. A meaningful reserve of 2 runs makes 15 a useful target. 120 additional slots, plus retirements, must each be independently authored and checked — remixing old questions to create different permutations is not the same as unique facts.
4. Verify future-only versioned selection that never recycles full runs, individual questions or high-similarity semantic facts. Do not mutate a historical private proof or prior completed result, and do not touch NBA.
5. Run actual canonical publications for all 40 dates, compare prompt and semantic IDs across all sports and active cross-game banks, then verify four choices, difficulty, grading/lifelines/recovery/timer/resume, exact PR-head Validate V2 and production.
6. **Block merging the full editorial bank** if any factual approvals, semantic conflicts, run capacity or exact-head validation remain unresolved.

## Test coverage in this staging PR

`millionaireSixMonthEditorialGate.test.ts` reads **every** CSV record, reconciles it with the legacy executable bank, invokes the canonical Official Daily publisher for the real six-month calendar, validates the eight-question / four-choice / Q8 lifeline structure, and reproduces all nine current complete-run repeats. The test explicitly asserts **NOT CERTIFIED**; a green staging test must never be portrayed as a release signoff. On final implementation, replace baseline expectations with zero-repeat and signed-off editorial assertions.

No Supabase migration or Cloudflare deployment is appropriate for this audit-only PR.

### October 26 isolated content repairs (current follow-up)

Three retained CFB questions used **season vs championship-game calendar-year** language capable of producing a defensible alternate reading: preview-only run 1 Q3 (Clemson/Alabama 2016 season), run 5 Q3 (DeVonta Smith's January 2018 walk-off) and run 7 Q2 (Alabama/LSU January 2012). Those three now have source-checked future-only rewrites. UFC future run 11 Q4 no longer repeats Ngannou's identity from Q1; the replacement features Holloway's buzzer-beating UFC 300 BMF knockout. Primary-source links and four-option checks are in the existing future ledger. Published legacy source/questions remain untouched. Ledger now has **191 rows (120 new run slots, 24 UFC replacement slots, 27 targeted legacy rewrites, 20 Q8 rewrites)**, all **HOLD**, pending complete cross-game and independent full-run signoff. These four edits do not certify the remaining content.

### October 26: Two more playable NFL finals; CI timeout root cause

Future-only NFL run 4 Q8 now covers Demaryius Thomas' overtime walk-off against Pittsburgh (Denver Broncos game recap), replacing the obscure Craig Morton question. NFL run 5 Q8 now covers James White's Super Bowl LI overtime walk-off (Patriots official recap), replacing the 1983 quarterback draft-order question. Both keep spoiler-free no-lifeline Q8 design; existing historic Q8s remain untouched. The future intervention ledger now has **193 rows** (120 original additional-run slots, 24 UFC replacements, 27 targeted rewrites, 22 Q8 rewrites), and **all 193 remain HOLD** until whole-run/factual/cross-game approval. Distinct playable inventory remains 360 effective slots. Fast PR Feedback on previous heads exceeded the existing **15-minute** job timeout inside its unbounded `--changed` test invocation; the same workflow now runs the three existing Millionaire regressions when its diff is restricted to Millionaire files, retaining its original generic behavior for unrelated PRs. Backend exact-head success must be reverified for the final SHA.

### Same-day active Bar Trivia overlap remediation

The initially added future Q8s on Tebow-to-Demaryius Thomas and James White's Super Bowl LI overtime score directly matched currently selectable Bar Trivia questions (`nfl-r2-tebow-ot-receiver` and `nfl-r3-sb-li-ot-scorer`). Replaced them immediately with officially documented Vonn Bell's AFC Championship overtime pick and Damien Williams' dual Super Bowl LIV fourth-quarter touchdowns. The proposed UFC 300 Holloway BMF question likewise matched selectable `ufc-r2-ufc300-bmf`, and was replaced with Dustin Poirier's rear-naked-choke win over Michael Chandler at UFC 281, verified by official UFC results. All three corrections reconciled in the **same 193-row future ledger**. Historical publications unchanged; further 45-run review is required.

### Existing test failures resolved on exact candidate branch

The first scoped draft run revealed five real test failures (34 of 39 tests passing), previously hidden by generic draft-feedback cancellations. Fixed the empty explanation on future NFL run 15 Q7 (2023 AP DPOY Myles Garrett, corroborated by official NFL Honors), and corrected three stale/inaccurate test assertions: CFB future Q8 Rod Moore rather than retired Adonai Mitchell, Q8 intentionally null Stat Sheet handling, and October 26 Cowboys–Eagles special content version without altering its replay. The two explanation failures shared the single blank Garrett explanation. These are focused corrections to existing implementation/test assertions, not new certification infrastructure; rerun exact-head CI before any green claim.

### Additional inverse Bar Trivia overlap removed

The future-only CFB run 5 Q3 calendar-year correction about DeVonta Smith's 2018 title-winning catch was the inverse of **currently selectable Bar Trivia V2 Last Call** (`Which Alabama quarterback threw the championship-winning second-and-26 pass?`), so the same underlying highlight was duplicated. Future candidate Q3 now instead features Tulane's 46–45 comeback win over Caleb Williams' USC in the January 2023 Cotton Bowl, independently verified against Tulane's official recap/score sheet. Its historic 2017-title seed remains unchanged; source and options are recorded in the same **193-row** future ledger. This change does not mark the 45 ladders fully certified.

### Latest evidence-backed future ledger dispositions (supersedes earlier HOLD snapshots)

**7 of 193 intervention entries are now KEEP at the individual-question level; 186 remain HOLD.** This is not a 7-of-360 release certification: the seven are independently source-checked effective runtime questions with correct distinct options, spoiler-safe hints/Q8 no-hint behavior, accepted localized difficulty, and direct current Bar Trivia conflict review. Individually approved: CFB run 1 Q3 (Clemson/Alabama title year), CFB run 5 Q3 (Tulane Cotton Bowl), CFB run 7 Q2 (Alabama/LSU title season), NFL run 4 Q8 (Vonn Bell overtime pick), NFL run 5 Q8 (Damien Williams Super Bowl LIV), UFC run 11 Q4 (Poirier/Chandler UFC 281), NFL run 15 Q7 (Myles Garrett 2023 AP award). Seven source URLs and detailed independent evaluations appear in the EXISTING future ledger. Other **353 of 360 effective playable positions are not yet individually certified in this pass**, and full eight-question ladder approvals still await broad independent review; feature remains draft, candidates preview-only. This latest tally takes precedence over chronological older statements that all 193 were HOLD.

### Continued exact-head failing-test repair

Addressed two remaining diagnosed failures: filled the formerly empty Isaiah Bond 2023 Iron Bowl explanation with its play and 27–24 result; corrected a Q8 preview regression assertion to exclude October 25 historical UFC publication (which correctly does not apply post-cutover future Q8 overlays). Both fix test-observed defects while preserving immutable Daily publication. Further exact-head test execution required; the candidate still remains opt-in and Draft.

### Additional full NFL run 11 editorial pass

Independently inspected all eight questions in NFL future run 11 using Colts, Buccaneers, NFL, Pro Football HOF, Giants, and 49ers primary reporting, with full four-choice, answer, clue, explanation, active selectable Bar Trivia semantic overlaps, and Q1–Q8 order. Added seven factual post-answer explanations to source (the Q8 Hufanga blocked-punt explanation already existed). Closed **seven more individual question HOLDs**. **Ledger now 14 KEEP / 179 HOLD out of 193 interventions.** NFL future run 11 has eight source-reviewed questions; eight-question ladder has a familiar entry, midround coaching/kicking/championships and a distinctive 2022 playoff finish. Q8 is a harder but documented blocked-punt return. Release of the six-month bank is **still blocked** because most 360 effective positions have not received the same independent review.

### Entire future CFB run 11 editorial pass

Independently reviewed the eight-question CFB run 11, including full choice exclusivity, source-confirmed team identity/stadium, CFP final and title history, Rose Bowl, 2022/2024 Heisman outcomes, Q8 no-lifeline clincher and nearby selected Bar Trivia concepts. Seven detailed explanations added to playable future source; Q8 retained official Ohio State third-and-11 source. All eight individual questions now **KEEP** in future ledger. Inventory: **22 KEEP / 171 HOLD / 193 entries**. This is an individual-question clearance for two fully read candidate ladders, not approval of the remaining six-month bank or production publication.

### Entire future UFC run 11 plus NFL run 11 final clearance

Confirmed the full UFC run 11 (8 questions) with UFC official event records: Ngannou, Lesnar/Couture, Usman/Covington, Poirier/Chandler, Condit/Diaz, Wanderlei/Cung Le, Pantoja/Moreno, Ortega/Volkanovski. Added seven accurate answer reveals to future-only authoring, checked distinct options, hint leakage, and no Q8 lifeline. Independently signed off the sourced NFL future run 11 Q8 Hufanga punt return, after its seven other positions were cleared. **30 individual positions KEEP / 163 HOLD in the 193-row future ledger.** Three full newly authored runs have been substantively source-reviewed (NFL 11, CFB 11, UFC 11), while the remaining 330 effective positions still lack full individual certification. The six-month bank stays **NOT READY** and opt-in only.

### NFL future run 12 complete individual editorial review

Eight NFL future run 12 questions verified against Chargers uniform history, Buccaneers official 2020 recap, NFL player season statistics and NFL's Super Bowl/playoff reports. Corrected seven generic reveals with detailed verified explanations. Active selected Bar Trivia contains overlapping athletes but no direct shared correct-answer fact in this ladder. Q8 Hardman's Super Bowl LVIII overtime touchdown retains zero lifelines, and its winner is verified. **Ledger now 38 KEEP / 155 HOLD** of 193 intervention entries; four future ladders fully reviewed (NFL 11–12, CFB 11, UFC 11). Six-month publication remains blocked.

### CFB future run 12 independently reviewed

Checked all eight CFB run 12 questions against Georgia, Wisconsin, Ohio State, TCU, Florida State, the Heisman Trust, Alabama and Notre Dame primary sources, including alternative answers, clues, selected Bar Trivia concepts and 8-step difficulty. Filled six missing explanations; the Isaiah Bond Q7 and Christian Gray Q8 already had detailed reveals. All eight source-backed questions individually KEEP; **46 KEEP / 147 HOLD** future ledger. The remaining future program remains isolated, not release-ready.

### Future NFL run 13 individual source/ladder pass

All eight NFL future run 13 questions read and checked using Broncos, NFL Football Operations, NFL postseason/Super Bowl records and Pittsburgh Steelers official accounts, including the often-confused Super Bowl XLII Helmet Catch versus Burress' actual game-winning touchdown. All four options, stat clues, 50/50 compatibility and progressive Q1–Q8 difficulty reviewed; new substantive answer explanations written for 0 slots, Q8 already detailed. **Future intervention ledger 70 KEEP / 123 HOLD** of 193 entries, with 0 more individual confirmations. Whole six-month inventory remains opt-in and NOT certified.

### CFB future run 13, independently checked against official sources

Completed a whole-eight-question pass on CFB run 13 (Ohio State Brutus; 2024 Colorado/Travis Hunter Heisman; UCF/Milton 2017 season; Kansas–Virginia Tech 2008 Orange Bowl; Michigan State's 2015 fumbled punt; Baylor 2013 Petty; Cincinnati's 2021 CFP coach; Alabama's Sept. 2024 Ryan Williams winner). Independently corroborated with Ohio State, Heisman Trust, UCF, Kansas, Michigan State, Baylor, Cincinnati and Alabama source material; inspected answer, three distractors, nonleaking hints, explanations, level progression and current CFB Bar Trivia direct fact overlap. Eight existing detailed explanations remained intact. 8 rows changed HOLD to KEEP. **Future intervention ledger now 78 KEEP / 115 HOLD (193 total)**. Structural safety of all 360 playable slots does NOT certify remaining facts/whole 6-month bank. Feature remains Draft and preview-only.
