# Millionaire Editorial Rebuild — Isolated Draft Status (October 25, 2026)

> **HOLD / NOT CERTIFIED / NOT MERGE READY.** This is a work-in-progress evidence record for draft PR #2139, not an approval to release. Production, main, migrations, schedules and published results must remain untouched.

## Repository integrity and provenance

- Working branch: `editorial/millionaire-six-month-rebuild-isolated-20261025`.
- Main resolved at branch creation: `cb10ff1f28cc7137eefceddab125dd002e4b3822`.
- Main advanced after branch creation: later observed `203b8c923a501eb692db7c24a09af8327dfaf206`; the four newer commits touched no Millionaire, Bar Trivia, Feud, Average Fan or rotation file in the narrow filename comparison. Recheck before any later integration.
- Original #2131 audit and its entire 240-question ledger were copied to this branch unchanged; #2131 was not closed, edited or merged.
- #2129's six prior corrections and #2132's backend verification fix were already in the branch's starting main commit.

## Inventory (provisional, not approved)

| League | Original bank | Original full runs | New 8Q runs | New future-only legacy slot rewrites | New future-only entire-run replacements | Total new question drafts | Future selectable 8Q runs | Future selectable questions |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| NFL | 80 | 10 | 5 (40) | 2 | 0 | 42 | 15 | 120 |
| CFB | 80 | 10 | 5 (40) | 4 | 0 | 44 | 15 | 120 |
| UFC | 80 | 10 | 5 (40) | 4 | 3 (24 questions) | 68 | 15 | 120 |
| **Total** | **240** | **30** | **15 (120)** | **10** | **3 (24)** | **154** | **45** | **360** |

The new 154-row future candidate disposition ledger deliberately marks **every authored question HOLD**. Thus the count of newly source-/distractor-/difficulty-certified questions is **0**, despite evidence gathered for a limited subset. The existing original 240-row ledger remains: KEEP 12, REWRITE 25, RETIRE 14, HOLD 189 (first-pass **proposals**, not final editorial signoffs).

## Content improvements staged

1. Five new ladders per league add across-era and across-role subjects: title-game turns, coaches, rivalries, positions, notorious plays, underdog teams, wrestling/striking styles, women's UFC, heavyweight pioneers and recent memorable fights. Questions are still drafts.
2. UFC's previously repetitive runs 7–9 are replaced **in future selection only** with 24 distinct new questions distributed among fighters and divisions. Original three historic boards and IDs are unchanged.
3. Ten further future-only slot rewrites remove repeated NFL Joe Burrow draft facts, Ray Lewis award facts, overlapping CFB Heisman / Ohio State / Saban / Auburn facts, and several UFC repeated champions, events and same-answer cases. Their question IDs are individually versioned.
4. Every Q1–Q7 new Stat Sheet is a draft contextual hint checked by source-text heuristics for an obvious answer surname leak. Q8 contains no Stat Sheet and remains ineligible for lifelines. Tests enforce per-run eight questions, four unique choices, a unique answer ID, distinct correct answers within every new run, and no identical candidate prompts.
5. Official Daily's existing renderer, grading, eight-step loop, time bank, hosts, scoring and lifelines are not rewritten; the branch stages an opt-in-by-date v6 publication selector using existing canonical generator and runtime. **Do not deploy this draft**.
6. The candidate selector has 15 runs per league, which is sufficient to avoid full-run repetition under the 14/13/13-appearance six-month schedule observed in the copied audit. This must pass the canonical publication tests before it can be reported as tested. **No automated quantity check establishes factual certification.**

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
- Fundamental blockers: 189 held original source facts + unsolved REWRITE/RETIRE ledger; 154 newly drafted candidates all HOLD; incomplete 4-choice fact evidence, no full cross-game semantic signoff, incomplete Q1–Q8 holistic difficulty/Stat Sheet expert review; no actual fully green Validate V2 at exact draft head; no end-to-end real-player grading/resume tests shown to cover every day.
- Owner authorization remains mandatory for any later integration. No green CI result allows merging this PR automatically.

**Release decision: NOT CERTIFIED. KEEP IN DRAFT. NO PRODUCTION ACTION.**
