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

### Batch: 12 future-only UFC semantic duplicate repairs

Identified a further twelve legacy Millionaire questions with exact or inverse answer/fact repeats in selectable UFC Bar Trivia, primarily title-lineage and nickname items. Preserved all published original BANKS; added **12 distinct, primary-source-backed playable replacements** exclusively to future preview for UFC runs 1–4. Sources are UFC official 269, 274, 278, 285, 293, 300, and 311 result records and UFC's 2022 knockout awards. Each has four distinct multiple-choice choices, a spoiler-safe Stat Sheet, specific post-answer explanation and its own future ID. Added regression assertions for all 12. Their 12 individual interventions were independently reviewed and recorded KEEP; **future ledger 90 KEEP / 115 HOLD / 205 total**. The wider 360-position bank is **NOT READY**, remains Draft/opt-in; no historical, main, or production edit.

### Cross-game semantic duplication repair — CFB future run 15 final

Replaced the Michigan–Alabama 2024 Rose Bowl Blake Corum Q8 because active CFB Bar Trivia already asks the same game's opponent, defeating cross-game originality even though its answer differed. The replacement is Adonai Mitchell's go-ahead 10-yard touchdown catch with 54 seconds left in Georgia's 42–41 December 2022 Peach Bowl semifinal win over Ohio State, corroborated by [Georgia Athletics](https://georgiadogs.com/news/2022/12/31/football-bulldogs-rally-past-buckeyes-in-playoff-semifinal). Three distinct Georgia pass-catcher alternatives, no Q8 Stat Sheet or lifelines; future-only source, test and disposition synchronized. This question remains HOLD until the full release review.

### Batch of 15 additional UFC legacy fact-collision repairs

Expanded the future-only, primary-source UFC dedup replacements by **15 distinct playable positions** across legacy runs 4–6 and 10. UFC official event coverage validates outcomes at UFC 261, 275, 277, 291, 292, 297, 300 and 306. All 15 now have unique future IDs, four separate answers, non-revealing pre-answer hints, substantive result explanations and explicit official evidence URLs. Added regression assertions. The 193-row original intervention ledger is now expanded to **220 rows: 105 individually verified KEEP, 115 HOLD**. Original historic BANKS, current Daily, October 26 special, main and production remain untouched. **Full 360-position certification / six-month launch remains blocked.**

### Batch of twelve sourced NFL/CFB semantic duplicate replacements

Compared 160 old NFL and college Millionaire questions with current selectable Bar Trivia factual answers. Prepared **12 future-only question replacements** at six NFL and six CFB positions using NFL.com, College Football Playoff, Indiana and Michigan sources. Included four verified answer choices, non-leaking hints, substantive result explanations and independent IDs. Preserved all old historical questions in BANKS, added twelve regression assertions and records. The future intervention ledger now has **232 entries: 117 KEEP / 115 HOLD**. This is an individual-position fix, not 360-question release certification; PR remains draft, no production modification.

### Four polished future-only replacements in run 14/15

Replaced the 1990 Giants backup quarterback and 1976 Pitt title questions with DeVonta Smith's Super Bowl LIX 46-yard touchdown and Cam Skattebo's 2025 Peach Bowl trick-pass touchdown. Replaced a redundant TUF coaches question with Dricus du Plessis' UFC 305 title defense and obscure early-TUF knockout trivia with Ilia Topuria's UFC 317 knockout of Charles Oliveira. All four source-supported with precise winners, three distractors, answer-safe hints, and new answer reveals; original future question IDs stay within their 8-question run and current historic Daily is unchanged. **Future ledger: 121 KEEP / 111 HOLD / 232 entries.** Release still blocked pending independent review of all 360 effective positions and cross-game full bank.


### Oct 26: UFC replacement runs 7–9 substantive playable reveal repair (draft-only)

- Replaced the auto-generated answer-plus-hint reveal with 21 standalone, informative post-answer explanations across UFC future-only legacy replacement runs 7–9. All 24 question positions now have authored payoff reveals, including three previously explicit Q8s (one now replaced).
- Corrected UFC replacement run 8 Q7's overly precise 15-seconds-remaining Volkov description to the source-safe 'closing seconds'; UFC reporting varies slightly on exact stoppage timestamp. Correct fighter is Derrick Lewis, and his comeback remains intact.
- Replaced UFC replacement run 8 Q8's underwhelming Esparza–Namajunas UFC 274 decision with Cory Sandhagen's officially documented 28-second flying-knee knockout of Frankie Edgar. The four options and spoiler-free Q8/no-lifeline format are retained. An alternative Yair Rodriguez–Korean Zombie final was **rejected** because active Bar Trivia Evergreen UFC Wave 5 already asks about that same last-second elbow fact.
- Synchronized all 24 UFC replacement ledger rows and added explicit tests for those authored explanations, choice integrity, non-leaking Stat Sheets and the changed final. This work is actual future candidate content, not a certification framework. The ledger's 111 remaining HOLD labels are **not** promoted by these changes; editorial verification of the full 360 effective positions remains outstanding.
- Sources checked for the two repaired finishes: https://www.ufc.com/news/lewis-stuns-reyes-impresses-ufc-229-main-card and https://www.ufc.com/news/ufc-fight-night-overeem-vs-volkov-results-winners-vegas-18. This does not establish comprehensive source review or active-bank collision clearance.

**Status stays DRAFT / NOT CERTIFIED / no main or production changes.**

### October 26 — fix duplicate UFC title finish across distinct candidate runs

Future UFC new run 15 Q7 had repeated the **exact same UFC 317 Topuria–Oliveira first-round lightweight title knockout** already present in the UFC future replacement run 7 Q8. Replaced only run 15 Q7 with **Pereira's 80-second TKO of Ankalaev at UFC 320**, checked against UFC's official Oct 4, 2025 main-card report. Kept four distinct alternatives, answer-safe hint and explanatory reveal, updated regression expectation and changed this slot from provisional KEEP to **HOLD** pending distinct-fact and all-choice certification. This is a genuine within-Millionaire factual collision, not merely a repeat athlete. Same source bank, feature branch and draft PR; no main or production changes.

Source: https://www.ufc.com/news/ufc-320-ankalaev-vs-pereira-2-event-tonight-main-card-results-recaps-highlights-interviews

The candidate ledger should now read **120 KEEP / 112 HOLD / 232 total**; no blanket certification is claimed.

### Oct 26 — superseding Q8 uniqueness correction after 360-position similarity scan

The proposed Sandhagen–Edgar UFC replacement run 8 Q8 was rejected after scanning all 360 authored effective positions: UFC newly authored run 13 Q6 already uses the **identical 28-second Frankie Edgar flying-knee finish**. The Q8 now instead asks about **Jack Della Maddalena defeating Belal Muhammad at UFC 315** (official UFC 315 main-card recap confirms 48–47, 48–47, 49–46). Four valid unique options, independent payoff and no Stat Sheet/lifelines. Kept HOLD. Source: https://www.ufc.com/news/main-card-results-highlights-winner-interviews-ufc-315-muhammad-vs-della-maddalena-montreal . Added targeted guard against repeating the Sandhagen finish or the Topuria UFC 317 title result between the specific future runs. Automated lexical analysis flags many common labels/athletes as possible overlaps; these are **not** blanket content defects or an exhaustive semantic clearance. Full signoff of 360 still outstanding.

### Oct 26 — active UFC Bar Trivia V3 collision removed (UFC replacement run 8 Q7)

The UFC 229 Derrick Lewis knockout of Alexander Volkov in future Millionaire UFC run 8 Q7 is already represented in currently curated UFC Bar Trivia V3 question `ufc-bt-v3-e-015` ("My balls was hot", tied by UFC V3 editorial fact-family mapping to `ufc-final-lewis-volkov-quote`). The same fight appears in source Average Fan but that ID is expressly **retired** via `RETIRED_REPEATED_FACT_ID_PREFIXES`; the live Bar Trivia selection, rather than an inactive Average Fan seed, necessitated the change. Replaced Millionaire run 8 Q7 with Josh Emmett's 1:57 first-round knockout of Bryce Mitchell at UFC 296, preserving four choices, source-supported explanation and a nonleaking hint; related ledger row stays HOLD and regression expectation updated. Primary source: https://www.ufc.com/news/ufc-296-edwards-vs-covington-results-highlights-winner-interviews . The now-rejected Lewis timing wording is no longer in the candidate board. No modification of other Daily games, legacy published questions or production.

### Oct 26 — additional direct UFC Bar Trivia V3 fact collision fixed (replacement run 8 Q2)

UFC Bar Trivia V3 Hard Final explicitly asks **who submitted Cain Velasquez at UFC 188**, the exact inverse of the previous Millionaire UFC future replacement run 8 Q2 (Fabricio Werdum). Replaced only that future Q2 with **Cody Garbrandt's Round 2, 4:59 right-hand knockout of Raphael Assunção at UFC 250**, an officially recorded dramatic finish following three losses. Authored four exclusive options, a non-spoiling hint, a substantial answer reveal and matching HOLD ledger/test expectation. UFC source: https://www.ufc.com/news/ufc-250-results-nunes-spencer-apex-garbrandt-assuncao . This is an active cross-game fact repair, not an arbitrary shared-fighter exclusion. No historical Daily or other game modification.

### Oct 26 — UFC run 8 difficulty-ladder Q2/Q4 balancing

Kept both independently sourced future-only questions but **swapped the question positions** in the replacement run: the recognizable Kamaru Usman–Tyron Woodley UFC 235 title victory now sits at Q2, and Cody Garbrandt's more specialist last-second knockout of Raphael Assunção at UFC 250 moves to Q4. The unchanged original historic run and live games remain untouched. Reconciled slot-specific IDs in the candidate ledger, maintained both HOLD, and updated exact run assertions. This improves early accessibility without discarding a sports-first middle question.

### Oct 26 — independent position-by-position UFC legacy replacement certification (runs 7–9 only)

**24 of 24 future-only UFC replacement slots in runs 7–9 were individually verified and promoted from HOLD to KEEP** (new intervention-ledger totals: **144 KEEP / 88 HOLD / 232 reviewed interventions**; this does **not** certify the separate 128 positions outside the intervention ledger or the remaining 88 HOLD). Verifications used each fight's UFC official event result, athlete profile or retrospective; exact citations are stored in every corresponding ledger `evidence_url`. For each question, four distinct exclusive choices, answer-safe nonleaking hint (Q1–Q7), no Stat Sheet at Q8, substantive reveal and run-level accessibility/difficulty were checked. Cross-game evaluation included the original and V3 and seven Evergreen UFC Bar Trivia sets, Average Fan retire-filter distinctions and the active Sports Feud fact themes. The genuinely duplicated UFC 188 Werdum–Velasquez and UFC 229 Lewis–Volkov candidate facts were replaced *before* this limited approval; sharing a card, participant or broader event is not automatically a duplicate.

**Accuracy repair in this signoff batch:** Changed Miocic–Overeem UFC 203 from a generic 'knockout' to UFC's listed first-round **TKO at 4:27**; changed Masvidal–Till narrative from inaccurate 'return to welterweight division' to **return after more than a year away from the Octagon**. All 24 direct primary evidence URLs and individual review rationale are in the existing ledger. No changes to public Daily, legacy board identity, source UFC Bar Trivia/Feud/Fan banks, or production.

**Overall status remains NOT CERTIFIED**: 88 HOLD interventions and remaining effective positions still need exhaustive independent checks. The Draft PR must not be made ready/merged solely on this 24-position signoff.

### October 26 — independent NFL/CFB/UFC primary-source review batch

- Confirmed the correct-answer fact, alternatives and answer-safe Stat Sheet for 14 unsourced future-run slots and recorded authoritative team/league/university links in the existing ledger: NFL run 14 Q2–Q3 and run 15 Q2,Q4,Q5; CFB run 14 Q2,Q5,Q6 and run 15 Q2–Q5; UFC run 14 Q3,Q5. These remain HOLD until comprehensive active-game originality and difficulty signoff; these are not new certified runs.
- Improved the actual NFL run 15 Q4 post-answer explanation with the contemporary 2001 Michael Strahan sack-record context (Giants season finale against Brett Favre, later tied by T.J. Watt). This is a future-only authored improvement with historical seeds unchanged.
- Most recent independently observed ledger before this batch: 232 interventions, 144 KEEP and 88 HOLD, after adjacent UFC source-backed fixes. Do not infer 360/360 certification from these counts. Full active Bar Trivia, Average Fan, Sports Feud, remaining original legacy questions and four-choice/difficulty signoff remain outstanding.
- Current PR remains draft, isolated from `main`, production, NBA and Oct 26 Cowboys–Eagles. Verify required CI on the final exact SHA before treating this as review-ready; draft's skipped Validate V2 is not a pass.

### October 26 — three active NFL Average Fan direct-fact collisions repaired

The full effective bank cross-game sweep exposed three NFL newly authored Millionaire questions repeating specific active Average Fan facts. NFL run 12 Q5 James Harrison's 100-yard Super Bowl XLIII interception return became Troy Polamalu's 40-yard AFC title interception-return touchdown (https://www.nfl.com/news/flacco-continues-struggles-against-steelers-in-season-ending-lo-09000d5d80e36bb6). NFL run 15 Q4 Strahan's 22.5-sack record became Corey Webster's overtime NFC title interception (https://www.nfl.com/news/giants-ride-road-of-redemption-to-super-bowl-xlii-09000d5d80624541). NFL run 15 Q5 Jacoby Jones's Mile High Miracle became Mike Alstott's two-yard Super Bowl XXXVII rush (https://www.buccaneers.com/news/today-in-bucs-history-champs-14845205). All three newly sourced questions have four distinct plausible alternatives, nonleaking hints and informative answer reveals. The former r12Q5 KEEP became HOLD because a new question requires signoff. No other game, published Daily or production change.

**Intervention ledger: 143 KEEP / 89 HOLD, 232 interventions.** Six-month 360 effective positions still **NOT CERTIFIED**. Draft PR must not merge.

### October 26 — Superseded concurrent NFL run 15 review (reconciled to exact branch head)

A concurrently authored review used the earlier NFL run 15 Q4/Q5 **Strahan (22.5 sacks)** and **Jacoby Jones (Mile High Miracle)** draft questions. Both old questions were actually **replaced** in commit `de03f5f7` and should not be described as unresolved current-game duplicates. The new effective NFL run 15 Q4 asks about **Corey Webster's Brett Favre overtime interception** in the 2007-season NFC Championship, and Q5 asks **Mike Alstott's two-yard Super Bowl XXXVII touchdown**. Primary NFL and Buccaneers source links, explanation, alternatives and Stat Sheets are in the corresponding rows. Both new questions remain HOLD for independent bankwide clearance, **not** because the old Strahan/Jacoby duplication still exists. The note suggesting a new Dwight Smith replacement is therefore superseded; no unnecessary further replacement is warranted. Keep this Draft PR isolated.

### Oct 26 — NFL run 15 difficulty progression, primary-source rectification

Reordered two **future-only** candidates within NFL run 15: Myles Garrett's accessible 2023 Defensive Player of the Year award now appears at Q4 instead of Q7; Corey Webster's obscure 2007-season NFC-title overtime interception now appears at Q7 instead of Q4. Existing distinct sources, four choices, answer-safe hints and authored explanations move with the question; no change to score mechanics, run size or historical Dailies. Matching candidate-ledger dispositions and regression assertions were moved alongside the content. Also corrected an unrelated Super Bowl **XLIV** evidence link incorrectly attached to NFL run 14 Q3: official NFL 2006-season Super Bowl XLI schedule confirms the Colts beat Chicago 29–17 on February 4, 2007. Counts remain **143 KEEP / 89 HOLD** out of the 232 intervention rows, not complete certification. No main or production change.

### October 26 — remaining two source gaps closed, CFB active-bank conflicts flagged

- Filled the final two missing authoritative evidence links in the 232-row **intervention** ledger: Chargers' own Drew Brees 2001–2005 retrospective for NFL legacy-future run 10 Q1, and Mississippi State's 2020 Mike Leach appointment announcing his immediately previous Washington State coaching role for CFB legacy-future run 3 Q4. All 232 intervention rows now have a source reference; source coverage is NOT independent 360/360 editorial certification.
- **CFB future run 15 Q4 is HOLD:** Millionaire's question identifying 2025 Heisman winner Fernando Mendoza directly reuses an achievement already disclosed by a still-selectable Average Fan Mendoza transfer question. The 2025 Heisman ballot is source-confirmed; this is an originality/playability conflict, not a historical fact error.
- **CFB future run 15 Q7 is HOLD:** Bar Trivia `cfb-easy2-crimson-tide` already tests the identical Kalen DeBoer Alabama coaching transition. A distinct source-confirmed alternative is Michigan running back Donovan Edwards' 41- and 46-yard rushing touchdowns against Washington in the January 2024 CFP final (Michigan's official title-game scoring and postgame notes). Do not approve an unimplemented replacement as a completed correction.
- The draft PR is still isolated, and these marked conflicts require changes to actual future candidate questions, their ledger rows, and regression verification. Neither factual source URLs nor green unit tests establish full run-by-run certification.

### October 26 — seven confirmed active cross-game overlaps repaired in playable preview content

Seven real future-only candidate questions were corrected in this isolated PR. The original historical Daily questions, published proofs, all other games, main, Supabase and production were not changed.

- CFB original run 10 Q8: replaced Kelee Ringo's 2022 title-sealing interception (an exact active Bar Trivia duplicate) with Javon Bullard's **two interceptions and one fumble recovery** vs TCU in the January 2023 championship. CFP/Georgia records confirm this; importantly, Bullard recovered rather than necessarily caused the fumble.
- UFC original run 3 Q8: replaced the active UFC Bar Trivia V3 Procházka–Teixeira UFC 275 finish with Poirier's second-round KO of Benoit Saint Denis at UFC 299.
- UFC original run 6 Q8: replaced the identical UFC Bar Trivia V3 Aspinall–Pavlovich UFC 295 finish with Nate Diaz's Round 4 guillotine of Tony Ferguson after the UFC 279 opponent shuffle.
- UFC original run 1 Q8: replaced the active Gordeau–Tuli UFC 1 first-bout pairing with Ngannou's 20-second knockout of Rozenstruik at UFC 249.
- UFC original run 5 Q8: replaced the active Henderson–Shogun UFC 139 named-fight duplication with Machida's second-round title-winning knockout of Evans at UFC 98.
- CFB new run 15 Q4: replaced Mendoza's 2025 Heisman win, disclosed verbatim by active Average Fan, with Vanderbilt quarterback Diego Pavia's verified **2025 runner-up finish**.
- CFB new run 15 Q7: replaced DeBoer's Alabama hiring, already tested in active Bar Trivia, with Michigan's Donovan Edwards scoring **41-yard and 46-yard rushing touchdowns** against Washington in the January 2024 title game.

Sources were checked against official UFC event results, College Football Playoff, Michigan Athletics and Heisman Trust records. Five Q8 replacements retain four exclusive choices, disabled lifelines and substantive explanations. Existing regression tests now assert the corrected Q8 winners/choices and the CFB run 15 rewrites; these changes are specifically protected from regression in the candidate preview.

All seven positions remain **HOLD** in the existing disposition ledger, because verifying those specific corrections does **not** certify the other effective candidate positions, every semantic collision, and complete 8-question pacing/player experience. No merge, rollout, preview default activation or production deployment is authorized by this record. Check exact-head CI separately; a skipped Validate V2 is not a pass.

### October 26 — eighth future-only NFL Q8 active-game collision repaired

The NFL original run 2 future Q8 had asked for Tracy Porter's two 2009-season playoff interceptions, explicitly including his Peyton Manning Super Bowl XLIV pick-six. Active NFL Average Fan `porter` tests that same Manning interception and identifies Porter as the answer. The proposed Millionaire Q8 now tests **Willie Brown's 75-yard interception-return touchdown against Minnesota in Super Bowl XI**, with same-era Raider defensive back distractors Jack Tatum, Skip Thomas and George Atkinson. Official Raiders Super Bowl XI history: https://www.raiders.com/history/super-bowl-xi . Source file, regression expectation and existing ledger row were updated together. This new question remains **HOLD**, not certified by the substitution alone.

Separately, the CFB run 15 Q7 Donovan Edwards candidate's fourth alternative was changed from Hassan Haskins (no longer on the 2023 Michigan roster) to **Benjamin Hall** (on the 2023 roster), based on Michigan Athletics' 2023 roster and player notes. The matching regression and ledger row now require the season-correct four Michigan running backs. Full-difficulty, broad semantic and independent Q1–Q8 review remain outstanding. No production publication or merge.

### October 27 — playable content improvements on isolated PR #2139 (still not certified)

- NFL future run 14 Q4: replaced an overly easy Trevor Lawrence comeback prompt with **Riley Patterson's 36-yard walk-off kick** against the Chargers. Jaguars' official January 14, 2023 report verifies the 27-point rally and 31–30 result. Four distinct kicker alternatives, answer-safe Stat Sheet and substantive post-answer explanation are in the actual future-only bank.
- NFL future run 15 Q3 (Ja'Marr Chase), CFB future run 15 Q4 (Diego Pavia) and UFC future run 15 Q5 (Shavkat Rakhmonov): adjusted the actual Stat Sheets to remove college/program or nationality shortcuts that could uniquely expose the answer. The source-backed answers and four alternatives remain unchanged.
- Regression assertions and the existing future intervention ledger were synchronized with all four edits. No new certification infrastructure or ledger was created. Intervention statuses remain **143 KEEP / 89 HOLD of 232**; this is not the full 360-slot approval. Exact-head CI and remaining full-bank source, choice, semantic collision and 45-run difficulty review are outstanding. Remain Draft; no merge/deployment/activation.

### October 27 — CFB future run 14, eight individual fact/choice approvals (not release certification)

- Re-reviewed all 8/8 CFB future run 14 questions against Alabama Athletics, Heisman Trust, Michigan Athletics, Southeastern Conference, Georgia Athletics, Texas Tech Athletics and Ohio State official histories and game recaps. Checked the season/event, four distinct alternatives, non-answer-leaking hints, and Q1-Q8 sports-first progression. **Eight existing ledger rows advance HOLD → individual KEEP.** This does **not** grant final 45-run/360-position certification or remove future-only HOLD activation protections.
- Three playable explanations strengthened: Griffin's 2011 regular-season vs bowl-inclusive passing totals; Palmer's 2002 award in USC's 2002/2004/2005 sequence; Terrell Davis's Long Beach State → Georgia 1992-94 → Broncos 1995 draft and title years. Source links were upgraded for Griffin and Davis.
- Existing candidate tests now assert CFB run 14's exact eight outcomes, answer-mapping exclusivity, spoiler-safe hints, and Q8 lifeline/Stat Sheet rules. The other 37 authored runs and cross-game full selectable pool remain unresolved. **Existing 232 intervention statuses: 151 KEEP / 81 HOLD.** No main, NBA, production, database or other content modified; PR must remain Draft.

### October 27 — UFC future run 14 source and choice review (no publication approval)

- Verified eight questions in UFC future run 14 against UFC official athlete/event results and histories: Moreno nickname, Henderson/Bisping UFC 100, Couture/Liddell TUF 1, du Plessis/Adesanya UFC 305, St-Pierre/Penn UFC 94, Liddell/Ortiz UFC 47, Chimaev/du Plessis UFC 319 and Ngannou/Velasquez Phoenix. For each, assessed all four alternatives, event years, name-free Stat Sheets and eight-rung progression; 7 HOLD entries progressed to individual KEEP; the already KEEP du Plessis Q4 was retained.
- Three real post-answer reveals improved in the future-only gameplay bank (Moreno nickname origin, St-Pierre/Penn title context, Chimaev's UFC 319 domination). Synchronized first-party evidence URLs in the existing 232-row intervention ledger and reinforced the existing regression suite with all eight UFC run 14 answers, distractor uniqueness and no final-rung lifelines.
- Existing intervention counts now **158 KEEP / 74 HOLD**; **not** 360/360 approval and not full 45-run semantic/difficulty certification. Historical boards, active games, main, NBA, Supabase and production unchanged. Draft and preview-only protections remain.

### October 27 — NFL future run 14 difficulty rebalance and individual source reviews

- Fixed real gameplay difficulty: the 46-yard DeVonta Smith Super Bowl LIX TD moved from Q6 to Q4; Brandon Aiyuk's Lions NFC-title helmet deflection moved from Q7 to Q6; Riley Patterson's specialist 36-yard walk-off winning kick after 27–0 deficit moved from the too-hard-for-Q4 slot to Q7. Preserved all facts, other question sequences, and eight-question structure. Nick Collins Q8 post-answer explanation now includes 37 yards, first-quarter 14-0 lead and final score 31-25.
- Evaluated all eight NFL run 14 choices/answers/hints against Titans, Seahawks, NFL, Jaguars, 49ers and Packers-first-party reporting; six additional HOLDs and one more HOLD moved to individually source-backed KEEP; DeVonta's previously KEEP entry moved with its question. The existing eight-question regression assertions were updated for new order, answer exclusivity and spoiler-free Stat Sheets. Source upgraded from CBS to official 49ers for Aiyuk.
- Existing 232 intervention entries now **165 KEEP / 67 HOLD**; no 360-position release certification, no whole-bank gameplay signoff, no broad semantic final certificate. This remains isolated future-only draft content; nothing published or deployed.

### October 27 — Nine-question cross-sport gameplay correction batch on Draft branch

Nine actual preview-only question positions improved (NFL, CFB, UFC): removed Georgia/Manziel answer giveaways, misleading unique 'fullback'/'French' giveaways, ineligible 2002 Buccaneers and 2008 Texas Tech distractors; made hints more sports-first, and preserved another editor's strengthened Heisman explanation. Updated the existing ledger and existing preview regression suite, plus aligned two CFB clue drifts. 7 individually checked HOLD entries became KEEP; **172 KEEP / 60 HOLD among 232 intervention records.** The bank remains 360 effective positions, **not** certified; full 45 runs, exhaustive active-game collisions and exact-head 182-day replay remain outstanding. No merge, Supabase, production or main modifications.
