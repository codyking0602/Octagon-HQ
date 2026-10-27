# Millionaire Editorial Rebuild — Isolated Draft Status (October 25, 2026)

> **HOLD / NOT CERTIFIED / NOT MERGE READY.** This is a work-in-progress evidence record for draft PR #2139, not an approval to release. Production, main, migrations, schedules and published results must remain untouched.

## Repository integrity and provenance

- Working branch: `editorial/millionaire-six-month-rebuild-isolated-20261025`.
- Main resolved at branch creation: `cb10ff1f28cc7137eefceddab125dd002e4b3822`.
- Main advanced after branch creation: later observed `203b8c923a501eb692db7c24a09af8327dfaf206`; the four newer commits touched no Millionaire, Bar Trivia, Feud, Average Fan or rotation file in the narrow filename comparison. Recheck before any later integration.
- Original #2131 audit and its entire 240-question ledger were copied to this branch unchanged; #2131 was not closed, edited or merged.
- #2129's six prior corrections and #2132's backend verification fix were already in the branch's starting main commit.

## Inventory (provisional, not approved)

| League | Original bank | Original full runs | New 8Q runs | Targeted slot rewrites | Replaced UFC legacy runs | Future-only Q8 rewrites | Total draft entries | Future selectable 8Q runs | Future selectable questions |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| NFL | 80 | 10 | 5 (40) | 2 | 0 | 6 | **48** | 15 | 120 |
| CFB | 80 | 10 | 5 (40) | 4 | 0 | 8 | **52** | 15 | 120 |
| UFC | 80 | 10 | 5 (40) | 4 | 3 (24 questions) | 5 | **73** | 15 | 120 |
| **Total** | **240** | **30** | **15 (120)** | **10** | **3 (24)** | **19** | **173** | **45** | **360** |

The 173 entries are **120 new-run questions + 24 full UFC run replacements + 10 targeted future-only rewrites + 19 future-only Q8 replacements**. These are not additive playable slots: the rewritten questions replace individual legacy positions in the existing 120-slot-per-league future selection.

The new 173-row future candidate disposition ledger deliberately marks **every authored question HOLD**. Thus the count of newly source-/distractor-/difficulty-certified questions is **0**, despite evidence gathered for a limited subset. The existing original 240-row ledger remains: KEEP 12, REWRITE 29, RETIRE 14, HOLD 185 (first-pass **proposals**, not final editorial signoffs).

## Content improvements staged

1. Five new ladders per league add across-era and across-role subjects: title-game turns, coaches, rivalries, positions, notorious plays, underdog teams, wrestling/striking styles, women's UFC, heavyweight pioneers and recent memorable fights. Questions are still drafts.
2. UFC's previously repetitive runs 7–9 are replaced **in future selection only** with 24 distinct new questions distributed among fighters and divisions. Original three historic boards and IDs are unchanged.
3. Ten further future-only slot rewrites, plus 19 Q8 replacements, remove repeated NFL Joe Burrow draft facts, Ray Lewis award facts, overlapping CFB Heisman / Ohio State / Saban / Auburn facts, and several UFC repeated champions, events and same-answer cases. Their question IDs are individually versioned.
4. Every Q1–Q7 new Stat Sheet is a draft contextual hint checked by source-text heuristics for an obvious answer surname leak. Q8 contains no Stat Sheet and remains ineligible for lifelines. Tests enforce per-run eight questions, four unique choices, a unique answer ID, distinct correct answers within every new run, and no identical candidate prompts.
5. Official Daily's existing renderer, grading, eight-step loop, time bank, hosts, scoring and lifelines are not rewritten; the branch stages an opt-in-by-date v6 publication selector using existing canonical generator and runtime. **Do not deploy this draft**.
6. The candidate selector has 15 runs per league, which is sufficient to avoid full-run repetition under the 14/13/13-appearance six-month schedule observed in the copied audit. This must pass the canonical publication tests before it can be reported as tested. **No automated quantity check establishes factual certification.**

## Further independent spot-checks and corrections (October 25)

- Rechecked **seven** additional candidate questions against the league's official event/stadium records and reauthored their provisional future-only versions. Every one remains **HOLD** until the other choices, Stat Sheet, cross-game semantics, question-level progression and entire run are independently signed off. No released or historical bank was edited.
- CFB future run 11 Q1 now asks about Miami's "The U" identity instead of a second Bo Jackson question, and avoids back-to-back stadium questions ([University of Miami logo history](https://miamihurricanes.com/news/2009/06/11/205551818-2)).
- NFL future run 12 Q5 now covers James Harrison's 100-yard Super Bowl XLIII interception return, removing a second Super Bowl XVIII question in the same run ([NFL account](https://www.nfl.com/news/harrison-s-100-yard-interception-return-for-td-paid-dividends-f-09000d5d80e979ba)).
- UFC future run 11 was overly heavyweight-concentrated; Q3 now covers Usman's UFC 245 stoppage of Covington ([UFC 245 card](https://www.ufc.com/event/ufc-245)), Q5 covers Condit's interim UFC 143 decision over Diaz ([UFC 143 card](https://www.ufc.com/event/ufc-143)), and Q7 now covers Alexandre Pantoja's split-decision title win over Brandon Moreno at UFC 290 ([UFC official results](https://www.ufc.com/news/ufc-290-volkanovski-vs-rodriguez-results-highlights-winner-interviews?language_content_entity=en)). Two earlier UFC Q7 drafts were independently found to **repeat active Bar Trivia facts**: Sterling–Yan at UFC 259 (`ufc-r2-sterling-yan-dq`) and Dillashaw–Barao at UFC 173 (`ufc-r2-dillashaw-barao`). Both were replaced, with UFC 290 chosen to avoid those known overlaps. It remains HOLD pending full-bank comparison.
- Draft head `4fce14e3cd5c1be2bcf404e349db5bab0b2e086b` passed standard TypeScript checks and 239 test files in Fast PR Feedback, but **the fast workflow FAILED** because `millionaireSixMonthEditorialGate.test.ts` called `readFileSync()` on a Vite-generated non-`file:` URL. That CI defect was corrected on the isolated branch by resolving the ledger under `process.cwd()`. This correction still requires a new exact-head green check. Generalized Daily Backend passed on the earlier head; Validate V2 was skipped as a draft, **not passed**.

- Four original CFB Q1 championship-year prompts (runs 2, 3, 6 and 8) were escalated from HOLD to provisional REWRITE after checking CFP/BCS season-versus-calendar-year records. They remain unaltered in the immutable historical bank; future-safe rewrites have **not** been implemented or certified. See the updated original disposition ledger.

### Verified active Bar Trivia collisions identified during an expanded semantic spot-check

The following cross-game comparisons used the **current active** `BAR_TRIVIA_QUESTION_BANK` filtering logic, rather than raw authoring files alone. Active selection into a specific future Daily date was **not** proven. A question's same athlete is not automatically a conflict; these are the same memorable facts or inverse-question equivalents.

| Provisional Millionaire question | Active Bar Trivia fact ID | Editorial action |
|---|---|---|
| NFL extra run 11 Q7: Dwight Clark, “The Catch” | `nfl-r1-the-catch-receiver` | **Replaced in draft only** with NFL-verified Talanoa Hufanga blocked punt TD against Green Bay (2021 season) |
| UFC extra run 11 Q7: Sterling vs Yan, UFC 259 | `ufc-r2-sterling-yan-dq` | **Replaced in draft only**; initial alternative Dillashaw–Barao also collided with `ufc-r2-dillashaw-barao`; current candidate is UFC 290 Pantoja–Moreno |
| UFC extra run 13 Q1: Charles Oliveira nickname Do Bronx | `ufc-r1-do-bronx` | **Replaced in draft only** with UFC-verified Yair Rodriguez nickname El Pantera |
| CFB extra run 13 Q8: Terry Baker's Heisman/Final Four feat | `cfb-r3-terry-baker-final-four` | **UNRESOLVED — must replace** before certification |
| CFB extra run 15 Q7: Ernie Davis, first Black Heisman recipient | `cfb-r1-first-black-heisman` | **UNRESOLVED — must replace** |
| UFC future replacement run 9 Q3: Edson Barboza spinning wheel-kick KO | `ufc-final-barboza-etim` / `ufc-r3-first-wheel-kick-ko` | **UNRESOLVED — must replace** |
| UFC new run 13 Q6: Anderson Silva's front-kick KO of Vitor Belfort | `ufc-r3-silva-belfort-front-kick` | **UNRESOLVED — must replace** |
| UFC future Q8: Chan Sung Jung's first Twister submission | `ufc-r3-zombie-first-twister` | **UNRESOLVED — must replace** |
| UFC future replacement run 8 Q3: Julianna Peña submission of Amanda Nunes | `ufc-r2-pena-nunes` | **UNRESOLVED — must replace** |
| UFC new run 15 Q4: Leon Edwards' famous head-kick finish of Kamaru Usman | `ufc-r2-edwards-usman` | **UNRESOLVED — same iconic highlight tested from another angle** |
| UFC targeted run 1 Q7: Carlos Newton submission of Pat Miletich | `ufc-r2-newton-title-opponent` | **UNRESOLVED — inverse question about same championship win** |

The UFC v3 editorial retirement list removes various similar authored source entries (e.g., some UFC 1 trivia); those retired entries are *not* counted as currently active conflicts above. This list is a **bounded partial conflict audit**, not an exhaustive census of NFL, CFB, UFC Bar Trivia, Sports Feud, Average Fan or other Daily banks. Until all direct conflicts are resolved and all remaining questions independently checked, **there are zero certified runs** in any sport.

Further citations: [NFL blocked punt return](https://www.nfl.com/news/matt-lafleur-takes-responsibility-for-special-teams-mistakes-following-packers-); [UFC fighter identity](https://www.ufc.com/athlete/yair-rodriguez); [UFC 290 title result](https://www.ufc.com/news/ufc-290-volkanovski-vs-rodriguez-results-highlights-winner-interviews?language_content_entity=en).

## Main codepaths and history

- No changes to NBA Millionaire, current weighted Daily schedules or cron, production backend and Supabase.
- Existing `millionaireDailyRun()` remains unchanged for historic reproduction.
- The `millionaireFutureEditorialDailyRun()` path and `millionaire-daily-v6-editorial-candidates` publication version apply to branch-built days from `2026-10-27` onward; earlier original and themed boards retain v5. **Before separately authorized integration, move this cutover into the actual future relative to deployment so no newly historical board is regenerated with different content.**
- Existing themed boards, including October 10 Ditka memorial and October 26 Dallas Cowboys, remain handled by the canonical themed overlay. Oct 25 UFC is still historical.
- The previously identified nine full-run repeats belonged to the unexpanded 10-run six-month scenario. The branch's new zero-repeat expectation is not an independent fact-check or a completed full test report.

## Independently consulted official evidence — bounded claims only

The following primary-source pages contain the specific historical results referenced in *some* new questions. They do not verify the entire bank or even necessarily every distractor in the cited question. Relevant proof assertions (rather than naked URLs) are included:

- [UFC championship lineage, welterweight](https://www.ufc.com/news/ufc-welterweight-title-lineage?language_content_entity=en): Carlos Newton submitted Pat Miletich at UFC 31.
- [UFC 219 event](https://www.ufc.com/event/ufc-219): Cris Cyborg faced Holly Holm and won a five-round unanimous decision.
- [UFC Lawler fighter ledger](https://www.ufc.com/athlete/robbie-lawler): Lawler defeated Rory MacDonald at UFC 189 with a fifth-round stoppage.
- [UFC 289 event results](https://www.ufc.com/news/ufc-289-nunes-vs-aldana-results-highlights-winner-interviews-vancouver): Nunes defeated Irene Aldana unanimously at the event before retiring.
- [UFC 274 event](https://www.ufc.com/news/ufc-274-oliveira-vs-gaethje-namajunas-esparza-2-results-highlights-winner-interviews): Chandler knocked out Ferguson with a front kick, and Esparza beat Namajunas by split decision.
- [UFC first lightweight champion](https://www.ufc.com/news/jens-pulver-named-ufc-hall-fame-class-2023): Jens Pulver beat Caol Uno at UFC 30; initial 155-lb belt then called bantamweight.
- [UFC 139 report](https://www.ufc.com/news/ufc-139-main-card-results-axe-murderer-back-business): Wanderlei Silva stopped Cung Le in the second round.
- [NFL AP award](https://www.nfl.com/news/packers-cb-woodson-voted-defensive-player-of-the-year-09000d5d815ade86): Charles Woodson was named AP's 2009 Defensive Player of the Year.
- [BYU 1984 team](https://byucougars.com/staff/1984-national-champions): LaVell Edwards coached the 13-0 BYU title team.
- [Nebraska Frank Solich bio](https://huskers.com/sports/football/roster/season/2001/staff/frank-solich): Solich coached Nebraska in the 2001 season BCS title game.
- [Heisman 2025 winner](https://www.heisman.com/heisman-winners/fernando-mendoza/): Fernando Mendoza won the 2025 Heisman at Indiana.
- [Oregon State Terry Baker](https://osubeavers.com/honors/hall-of-fame/terry-baker/154): Baker won the Heisman and helped OSU to 1963 NCAA basketball Final Four.

Other claims and the **incorrectness of all 3 distractors per question** remain unsworn. A few supporting `evidence` entries in the targeted rewrite code have partial evidence, and some entries are blank. Preserve their HOLD status.

## Cross-game review, partial

Initial prompt/fact similarity comparisons covered original source files for portions of approved Football/UFC Bar Trivia and its editorial retirement policy. Confirmed direct overlaps caused replacement or removal of draft material about the Purple People Eaters, Joe Namath's Super Bowl III opponent, Super Bowl XXXIV's 1-yard tackle, Chuck Howley, Devin Hester's kickoff return, Jerome Bettis's nickname, the 1983 Miami coach, Charles Woodson's Heisman, Paul Hornung's Heisman losing-record fact, the Korean Zombie nickname and UFC 1 tournament winner. Some similar labels concern different facts or retired Bar Trivia entries and should not be treated as proof of overlap.

**Still missing:** complete active-bank semantic normalization (including Bar Trivia generated/retired selection), NFL and CFB Sports Feud, UFC Sports Feud, Average Fan, other Daily games, the full 240 original question duplication matrix, and expert editorial resolution of all material collisions. Matching actor names alone is not disqualifying.

## Technical status and remaining release blockers

- Candidate modules were inspected programmatically for 5/3 complete runs, exactly 8 questions each, four distinct choices, one matching answer, no within-run answer duplication and no obvious surname revelation in new Stat Sheets. These are **static draft checks**, not actual Vitest or official publication certification.
- New and carried-forward Vitest cases enforce the canonical 182-day generator, candidate inventories, historical versioning, themed boards, Q8 no-lifelines, and zero repeated full-run fingerprints; exact-head CI outcomes are recorded separately in the draft PR.
- Full Validate V2 may be skipped by GitHub on draft PRs; skipped is never green. Do not enable deploy or un-draft to bypass authorization.
- Fundamental blockers: 185 held original source facts + unsolved REWRITE/RETIRE ledger; 173 newly drafted candidates all HOLD; incomplete 4-choice fact evidence, no full cross-game semantic signoff, incomplete Q1–Q8 holistic difficulty/Stat Sheet expert review; no actual fully green Validate V2 at exact draft head; no end-to-end real-player grading/resume tests shown to cover every day.
- Owner authorization remains mandatory for any later integration. No green CI result allows merging this PR automatically.

**Release decision: NOT CERTIFIED. KEEP IN DRAFT. NO PRODUCTION ACTION.**

## October 25 follow-on editorial pass — supersedes the earlier draft inventory

**Draft only. Still NOT fact-/difficulty-certified and NOT authorized for release.** The preceding tables and collision statuses record the *earlier* baseline; this section records the later isolated-branch changes.

- Future-only candidate ledger now has **177 HOLD entries**: 120 new-run questions, 24 replacement UFC board questions, 14 targeted future rewrites (the original ten with one replaced, plus five additions), and 19 Q8 rewrites. Existing 240 original questions and historic Daily proofs remain immutable.
- Inspected the complete question/answer progression of **all 45 draft 8-question runs** (360 slots). A structural pass across the current authored modules found 15 new boards, 27 carried-forward boards, three UFC fully replaced boards, and no identical authored prompts across the 360 positions. This is **not** a visual user playtest or complete independent verification of all 1,080 wrong answers and 360 correct answers.
- Re-sequenced early/middle difficulty in selected NFL, CFB and UFC ladders. Specifically moved easier college identities, Travis Hunter and memorable knockout moments toward Q1–Q3; moved more esoteric history to later positions; replaced an obscure 1994 FSU kicker question with Jake Plummer's iconic 1996 Arizona State run; replaced a low-stakes UFC Hall of Fame Q8 with the Jackson–Silva PRIDE rivalry payoff.
- Replaced direct overlaps with currently authored Bar Trivia facts involving Terry Baker's Final Four, Ernie Davis's first Heisman, Edson Barboza–Etim, Julianna Peña–Nunes, Anderson Silva–Belfort, Leon Edwards–Usman, Carlos Newton–Miletich, the Korean Zombie's Twister, UFC 113 Rua–Machida, UFC 302 Makhachev–Poirier, and the first BMF belt. **Active-selection/exhaustive cross-game checks remain pending**, so replacement does not mean that cross-game originality has been certified. UFC 113 and UFC 302 candidates were themselves replaced again when the expanded Bar Trivia lookup found the overlap.
- Four legacy CFB championship-year ambiguities have future-only season-explicit replacement questions: Texas 2005 season (January 2006 game), Michigan 2023 (January 2024), Alabama 2020 (January 2021), and LSU 2019 (January 2020). No historical question or October 26 Cowboys content was edited.
- Corrected a duplicate key for a future-only UFC rewrite after an exact-head CI TypeScript failure; one key now selects Maurice Smith at UFC 14 without silently shadowing the old Carlos Newton proposal.
- The existing candidate-calendar regression expects **40 actual Millionaire publication appearances over 182 days** (14 NFL, 13 CFB, 13 UFC), no identical complete-run repeats, unchanged historical setup and disabled candidates in default Official Daily. Structural results remain conditional on the latest exact-head CI; test success cannot certify question meaning.
- **Remaining blockers:** independently validate *every* correct fact and three wrong choices for all publishable content; finish full active-game semantic deduplication; perform complete human difficulty/Stat Sheet signoff across all 45 boards; verify exact PR head; and move the **October 27, 2026** preview date safely beyond every published board before an authorized integration. Every candidate remains HOLD until then.

**Final editorial release verdict: BLOCKED / NOT CERTIFIED / KEEP DRAFT.**

## October 26 superseding addendum (draft / HOLD)

Three focused, source-backed future-only Q8 corrections were committed with matching 178-row HOLD ledger edits:
- UFC run 11: Brian Ortega's dramatic failed guillotine and triangle attacks on Volkanovski at UFC 266, https://www.ufc.com/news/ufc-266-volkanovski-vs-ortega-results-shevchenko-murphy-diaz-lawler-highlights-interviews-winners. The intermediate UFC 217 draft was withdrawn after discovery that it duplicated original UFC run 2 Q8. It replaces the earlier obscure UFC 8 winner trivia.
- NFL run 12: Mecole Hardman's overtime Super Bowl LVIII winning catch, https://www.nfl.com/news/chiefs-qb-patrick-mahomes-named-super-bowl-lviii-mvp, replaces Jack Squirek's Super Bowl XVIII interception trivia.
- CFB run 15: Blake Corum's January 2024 Rose Bowl overtime touchdown, https://collegefootballplayoff.com/news/2024/1/1/rose-recap, replaces Glenn Davis's 1940s nickname trivia.
The three Q8 outcomes and options were reviewed individually; selected Bar Trivia material showed no direct identical fact in those replacements. Full active-feud/fan/trivia uniqueness remains **unverified**.

All 144 directly authored new/replacement candidate question slots passed a bounded parse-based check: four distinct choices, listed correct answer, no whole-answer Stat Sheet string leak, and all 18 authored Q8s have answer-containing explanations and no Stat Sheet. An existing future-candidate test now protects the three revised Q8s. This is **not** executed Vitest or human/factual certification of 360 slots.

Previous backend CI on `2267bbdc` stopped at an exact-checkout trailing-whitespace error (not a SQL assertion); repaired in isolated branch. The old UFC streak fixture was separately reconciled to main's active UFC publication day with one test-only assignment; no backend logic changed. Exact-current-head CI is **unverified** and draft Validate V2 is skipped.

**178/178 future ledger entries remain HOLD; 0/45 full runs and 0/360 slots fully independently certified.** Blockers: every answer/distractor/hint factual check, full active cross-game originality, difficulty, final six-month replay and exact-head CI. The Oct 27 preview cutover also needs safe future recalibration before any separately authorized integration. Do not merge, undraft, deploy or change production.

### Subsequent intra-Millionaire duplication correction (supersedes three-Q8 count above)

Full original-bank prompt/answer comparison found two recurring historical anchors: the initial UFC 217 future run 11 draft directly repeated UFC original run 2 Q8, so the UFC run 11 Q8 now asks about Brian Ortega's near-submissions of Volkanovski at UFC 266, with https://www.ufc.com/news/ufc-266-volkanovski-vs-ortega-results-shevchenko-murphy-diaz-lawler-highlights-interviews-winners as primary evidence. CFB future run 14 Q8 originally asked for the Oklahoma coach behind the 47-game streak while CFB future run 12 Q8 already tested the end of that same streak. Run 14 now asks about Jack Sawyer's 83-yard scoop-six versus Texas in the January 2025 CFP Cotton Bowl semifinal, sourced to https://ohiostatebuckeyes.com/news/2025/1/10/football-post-game-story-cotton-bowl. Both corresponding ledger entries remain HOLD. Existing candidate Vitest expectations now lock **four** authored Q8 replacements (NFL12, CFB14, CFB15, UFC11) and their source-specific answers.

A static read of the **240 original legacy question seeds** found four distinct options per question, a listed answer, no full-answer string in Stat Sheets, and null Stat Sheets for original Q8s. Alongside the separately scanned 144 directly authored future/replacement rows, this supplies shape-screening evidence across raw source populations, but does not constitute runtime simulation or independent truth/distractor certification of the effective 360 slots (targeted legacy Q8/errata rewrites are additional overlays). Release verdict stays BLOCKED.

### October 26 future-only corrections (three playable slots)

- CFB run 11 Q8 replaces obscure 1985 Heisman margin with Jeremiah Smith's 56-yard third-and-11 catch in the January 2025 Ohio State/Notre Dame title game ([CFP recap](https://collegefootballplayoff.com/sports/2025/1/21/NCG-recap)).
- UFC run 14 Q2 corrects Henderson's UFC 100 right-hand knockout and subsequent airborne forearm ([UFC recap](https://www.ufc.com/news/gsp-guts-out-win-over-alves-hendo-kos-count)).
- UFC replacement run 7 Q6 corrects Nelson/Kimbo Slice to a mounted-crucifix referee stoppage ([UFC TUF recap](https://us.ufcespanol.com/news/ultimate-fighter-season-10-cheat-sheet)).
- The playable candidates, ledger and regression test were updated in tandem; **178/178 candidate ledger entries remain HOLD**. These focused verifications do not certify 360 questions or authorize release.

### October 26 editorial execution — 27 further playable replacements and corrected inventory

Following the prior three-source correction pass, **27 additional playable future-only question positions** were corrected across NFL, CFB and UFC (30 corrected positions in these two contiguous execution passes). The edits are in the authored NFL/CFB/UFC candidate banks, the UFC future-only legacy replacement, and the final-runtime Q8 overlay; no released questions, original historical seeds or themed October 26 Cowboys game were edited. Edits prioritize recognizability, recent title games, award seasons, landmark postseason plays and accurate UFC results, with synchronized source/disposition evidence and authored regression assertions. Examples: Cooper DeJean's Super Bowl LIX interception return, Sam Hubbard's 98-yard fumble return, the 2024 Daniels–Noah Brown Hail Mary, Matthew Golden's 2025 Peach Bowl catch, Adonai Mitchell's 2022 Peach Bowl touchdown, Procházka–Teixeira, and Aspinall–Pavlovich. All remain HOLD for full independent signoff.

A source-to-final-candidate static review assembled **45 playable eight-question runs / 360 positions** from the actual legacy bank, 120 additional authoring slots, three future-only UFC full-run replacements, 15 targeted overlays, and **20** future Q8 overlays. That review caught **three duplicate correct-answer collisions within individual future ladders** (CFB run 14, UFC runs 6 and 13); these were repaired in playable code and ledger with contemporary sourced alternatives (Trevor Etienne, Tom Aspinall, Paddy Pimblett). Recheck of all 360 reconstructed positions found **zero identical full prompts, zero duplicate correct answers within any eight-question run, no wrong answer ID/missing four-choice mappings, and no literal full-answer Stat Sheet leaks.** This is static structural QA, **not** independent factual or gameplay certification.

**Ledger accounting correction:** the original 178-row future ledger inadvertently omitted a playable 20th Q8 overlay for NFL run 7 (Charles Woodson/Tuck Rule). Added that omitted record rather than claiming all 178 were exhaustive. The corrected ledger therefore has **179 entries, all 179 HOLD**. No unverified HOLD was falsely certified. The 240 legacy triage rows remain preliminary and are tracked separately.

**Main reconciliation:** main independently introduced an October 26 Cowboys–Eagles replay content version and a newer UFC 48-hour-cycle SQL test fixture. The isolated branch's runtime now explicitly preserves the Cowboys replay version while allowing future preview only on opt-in; candidate tests expect the current replay version. The newer main SQL test uses the same playable UFC publication-day computation as the branch fixture. A safe merge of current main into this feature branch and CI on the resulting exact head remain required. **Do not merge, undraft, deploy, or activate future candidates.**

### October 26 — Additional actual question edits (isolated)

- Corrected three CFB championship season/calendar-year ambiguities in preview-only targeted errata (run 1 Q3, run 5 Q3, run 7 Q2). CFP and Alabama Athletics official game recaps verified the source claims, alternatives and non-leaking hints. Historical seeds not changed.
- Replaced UFC additional run 11 Q4's redundant Francis Ngannou matchup with Max Holloway's UFC 300 last-second BMF knockout, verified against UFC's official results. Four viable options and spoiler-safe clue retained.
- Future ledger reconciled to 191 unique intervention entries, which are **not** 191 distinct overall playable positions; the 45 playable ladders remain 360 positions, including retained legacy slots. All entries still HOLD because these localized repairs have not completed every full ladder / active cross-game check.

- NFL future run 4 Q8 (Craig Morton) and future run 5 Q8 (1983 QB draft order) replaced by two officially documented overtime playoff/Super Bowl endings: Demaryius Thomas against Pittsburgh (2012) and James White against Atlanta (2017). Historical source bank not modified.
- Future-only ledger now 193 unique change/overlay entries, **not** 193 unique games or necessarily 193 entirely distinct effective positions; actual inventory remains 360 across 45 authored runs. All 193 interventions are HOLD until independent remaining content, choice, clue, pacing and active-game checks. Scoped existing Fast PR Feedback's affected-test step to three existing Millionaire suites when the PR only changes Millionaire files, avoiding the previous 15-minute unbounded test timeout without adding a new certification gate.

- Resolved three newly identified active Bar Trivia collisions: Tebow/Thomas, James White Super Bowl LI, and Holloway/Gaethje UFC 300. Final future-only replacements: Vonn Bell's January 2022 overtime interception, Damien Williams' Super Bowl LIV fourth-quarter touchdowns, and Poirier's UFC 281 R3 rear-naked choke. Verified via NFL/Chiefs/UFC primary sources, synchronized regression checks and existing future ledger. None is being represented as exhaustive cross-game certification.
