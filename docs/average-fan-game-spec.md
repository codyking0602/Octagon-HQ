# Are You Smarter Than an Average Fan? — Canonical Game + Content Spec

**Status:** Locked product design; PR1 implementation contract  
**Date:** September 29, 2026  
**Repository:** `codyking0602/Octagon-HQ`

This document is the canonical implementation/content specification for **Are You Smarter Than an Average Fan?**. It converts the approved product design into an engineering contract. Do not reopen product discovery unless Cody changes a locked decision.

## 1. Product identity

Title: **Are You Smarter Than an Average Fan?**

Sports:
- NFL
- CFB
- UFC

Football appearances alternate NFL / CFB. The alternation is continuous across official appearances and does not reset just because a calendar month changes. V1 begins with NFL when the first official Football slot is materialized, then CFB, then NFL, and so on.

Target cadence is approximately five official Daily appearances per month in Football and five in UFC. Scheduling must use the existing immutable Daily schedule/version system. Never rewrite already-materialized days.

This is a Daily-first game. PR2 may expose an owner/Casual preview for QA, but official competition, persistence, history, streaks, standings, leaderboards, and reminders belong to the existing Daily Challenge platform.

## 2. Existing owners to reuse

Current main already has the systems this game needs:

- Frontend Daily repository: `src/features/play/todayChallengeRepository.ts`
- Frontend Daily action queue/runtime: `src/features/play/useTodayChallengeRuntime.ts`
- Daily adapters/registry bridge: `src/features/play/todaysChallengeAdapters.ts`
- Server-owned Daily runtime: `supabase/functions/daily-challenge-runtime/index.ts`
- Daily leaderboard rows already carry `public_result`, `public_state`, and `result_detail`
- Millionaire provides the closest reference for a dramatic money-ladder presentation without owning this game's mechanics
- Bar Trivia provides the canonical current-event metadata shape and expiration behavior

Do not create a second scheduler, Daily repository, persistence table, grading path, leaderboard backend, result-detail system, current-event expiry system, or history owner.

## 3. Show structure

Use the real-show structure as closely as practical while preserving HQ's non-elimination adaptation.

Normal board:
- 10 questions
- five grades
- two subject tiles per grade
- all 10 tiles visible at once
- player chooses tile order
- every answer locks
- wrong answers do not end the game

Final:
- after all 10 board questions, reveal only the Final subject
- player chooses **Walk Away** or **Go for $1,000,000**
- no Peek / Copy / Save on the Final

Money ladder:
1. $1,000
2. $2,000
3. $5,000
4. $10,000
5. $25,000
6. $50,000
7. $100,000
8. $175,000
9. $300,000
10. $500,000
11. Final $1,000,000

The money ladder is presentation/drama. Official HQ score remains 0–100.

Final money presentation:
- Walk Away: $500,000
- Final correct: $1,000,000
- Final wrong: $25,000

## 4. Subjects

### NFL
- Players
- Teams
- NFL History
- X’s & O’s

NFL History includes broad league culture/history, stadiums, rivalries, iconic moments/games, franchise changes, coaches, records, eras, Super Bowls, and milestones.

### CFB
- Players
- Programs
- Traditions
- CFB History

### UFC
- Fighters
- Fights
- Championships
- Octagon IQ

## 5. Question formats

Target bank mix:
- ~60% short answer
- ~25% four-choice multiple choice
- ~15% true/false

Short answer must remain dominant so the game does not collapse into Millionaire.

Canonical format IDs:
- `short-answer`
- `four-choice`
- `true-false`

Four-choice questions author exactly four visible choices. True/false questions do not need an authored choices array; the runtime supplies True / False.

## 6. Grade difficulty

- 1st: "I absolutely should know this." Mainstream stars/teams/basic facts.
- 2nd: easy for a regular fan.
- 3rd: requires actually following the sport.
- 4th: strong fan knowledge.
- 5th: legitimate sports-nerd difficulty without cheap obscurity.
- Final: hard 5th-grade-quality question with one clean defensible answer.

Editorial rule: **hard does not mean old**.

Upper grades should skew roughly 70% modern-era hard / 30% historical hard, flexing by sport. Difficulty should come from deeper roster, award, season, matchup, title, rules, game-context, and history knowledge—not confusing wording or arbitrary stat minutiae.

Each question has `difficultyNudge` from -3 to +3 percentage points. It is difficulty-signed:
- +3 = harder, so fan accuracy drops three points
- -3 = easier, so fan accuracy rises three points

## 7. Canonical question schema

Source owner: `src/features/games/averageFanEngine.ts`.

Each record includes:

- `id`
- `sport`: `nfl | cfb | ufc`
- `grade`: `1 | 2 | 3 | 4 | 5`
- `subject`
- `format`
- `prompt`
- `answer`
- `aliases`
- `choices` when format is four-choice
- `explanation`
- `contentType`: `evergreen | current-event`
- `activeFrom` optional
- `expiresAt` required for current-event questions
- `difficultyNudge`
- `fanMisses` for short-answer questions
- `protectedFinal`
- optional provenance fields `sourceId`, `sourceUrl`, `verifiedAt`

Rules:
- short-answer questions must author 1–3 plausible fan-miss answers
- four-choice wrong fan answers come only from authored wrong choices
- true/false wrong fan answer is the opposite truth value
- protected Final questions must be grade 5
- protected Final questions are excluded from ordinary board selection
- ordinary grade-5 questions are not eligible for the Final unless explicitly authored as `protectedFinal: true`

The runtime/public projection must not expose:
- canonical answer
- aliases
- explanation before reveal
- fan-miss answers
- deterministic fan correctness
- provenance/review metadata not needed by the client

## 8. Current events

Target mix: ~90% evergreen / ~10% current event.

Average Fan reuses the same expiration metadata/behavior as Bar Trivia:
- `contentType: "current-event"`
- optional `activeFrom`
- `expiresAt`

PR1 extracts that date-window decision into `src/features/games/triviaContentExpiry.ts` and keeps Bar Trivia on the same canonical helper. Average Fan does not create a second expiry implementation.

Current-event questions must include `expiresAt` so stale content actually ages out.

Finals should normally be evergreen.

## 9. Board construction contract

A normal run contains exactly:
- two grade-1 questions
- two grade-2 questions
- two grade-3 questions
- two grade-4 questions
- two grade-5 questions
- one separately protected Final question

The entire 10-tile board is public before play. Question prompts/answers remain hidden until the player selects a tile.

Subject distribution should be balanced across the sport bank over time; individual boards may repeat a subject if needed. Do not force an artificial one-of-each distribution that makes generation brittle.

Protected Final questions are selected separately and cannot be consumed by the board selector.

Question order for scoring is the player's chosen order: the first tile answered is Q1, second tile Q2, etc., regardless of grade.

## 10. Scoring

Perfect 10-question board: **90**.

If there is at least one unsaved miss:

`board score = 64 + (2 × first unsaved miss question number) - (5 × each additional unsaved miss)`

Cap at 90 and keep the final result within 0–100.

Locked reference points:
- first miss Q2 -> 68
- first miss Q5 -> 74
- first miss Q8 -> 80
- first miss Q10 -> 84
- perfect board -> 90

A successful Save does not count as a miss and preserves the clean run.

Final:
- Walk Away -> board score
- Final correct -> +10, cap 100
- Final wrong -> -10

Perfect board:
- walk = 90
- correct Final = 100
- wrong Final = 80

## 11. The five Average Fans

V1 fans:
- Cody
- Shane
- Troy
- Tyler
- Lib

The opening uses a report-card/classmate-selection treatment. The player selects one fan and confirms. That fan is locked for the entire run. No switching.

All five should be equally useful overall. Their subject profiles differ, but there is no objectively best fan.

Base grade accuracy:
- 1st: 93%
- 2nd: 88%
- 3rd: 82%
- 4th: 76%
- 5th: 70%

Raw report-card modifiers:
- A+ +10
- A +7
- A- +4
- B+ +2
- B 0
- B- -2
- C+ -5
- C -8

For each fan and sport, center the four raw subject modifiers by subtracting that fan/sport mean. This preserves equal average usefulness while exaggerating specialties.

Example Shane UFC:
- authored raw grades: A+ / A / A- / C+
- raw modifiers: +10 / +7 / +4 / -5
- mean: +4
- centered: +6 / +3 / 0 / -9

Fan accuracy:
`base grade accuracy + centered subject modifier - difficultyNudge`

Clamp to 55%–98%.

V1 report cards are encoded in `AVERAGE_FAN_REPORT_CARDS` and match the approved NFL/CFB/UFC tables.

## 12. Deterministic fan answers

Every selected fan has one locked answer to every question.

Determinism key:
`content version + question id + fan`

Do not include:
- player identity
- Daily date
- device
- session
- answer order

Therefore every HQ player sees the same Cody/Shane/etc. answer on the same question.

Correct/wrong decision uses a stable hash roll against the computed fan accuracy.

Wrong answer source:
- four-choice: deterministic authored wrong option
- true/false: opposite truth value
- short-answer: deterministic selection from the question's 1–3 authored `fanMisses`

Never synthesize nonsense miss text at runtime.

## 13. Peek / Copy / Save

Each is available once per game.

Peek:
- fan answer is already locked
- reveal that answer
- player still submits their own answer

Copy:
- player commits to the fan's already-locked answer without seeing it first

Save:
- automatic one-time rescue when player is wrong and fan is right
- successful Save preserves the clean run and does not count as an unsaved miss
- if player is wrong and fan is wrong, Save is consumed under show-like behavior and the miss remains

Peek and Copy do not cost HQ leaderboard points.

No Peek / Copy / Save on Final.

PR2 owns the exact UI/state transitions; PR1 owns the deterministic answer authority they consume.

## 14. Content-bank targets

Six-month no-repeat target:
- NFL: 220
- CFB: 220
- UFC: 440
- total durable bank: 880

Each official appearance consumes 10 board questions + 1 Final.

Approximate football bank shape:
- grades 1–4: ~40 each
- grade 5 ordinary board: ~45
- protected Final: ~15

UFC approximately doubles that.

Balance:
- four subjects
- grade bands
- 60/25/15 format mix
- ~10% current events
- modern/historical hard mix

Do not casually consume protected Final questions as ordinary fifth-grade tiles.

## 15. Differentiation from Millionaire

Millionaire:
- 8 linear questions
- four-choice
- 50/50 / Stat Sheet / Double Dip
- faster ladder survival

Average Fan:
- open 10-tile subject board
- player chooses order
- mixed short answer / four-choice / true-false
- one selected fan for the whole run
- report-card strengths/weaknesses
- Peek / Copy / Save
- Final subject is shown before risk decision

The money ladder does not justify reusing Millionaire's linear question runtime.

## 16. Persistence/result detail

Official Daily persistence remains server-owned.

The Daily result payload should eventually retain enough public-safe detail to reconstruct a completed run for leaderboard click-through:
- selected fan
- chosen tile order
- per-question grade/subject/format/prompt
- player submitted answer
- fan answer only after the question was resolved
- correct answer/explanation after resolution
- whether Peek/Copy/Save was used
- whether a miss was saved
- running money
- board score
- Final subject
- Final decision/outcome
- final normalized score

Do not expose hidden future questions, answers, fan outcomes, or Final prompt before the appropriate reveal.

Use the existing `result_detail` path already returned by Daily leaderboard rows.

## 17. Implementation sequence

### PR1 — spec + engine/schema + deterministic fan model/tests
- this document
- roadmap pointer
- shared trivia expiration helper reused by Bar Trivia
- canonical Average Fan types/schema/validation
- centered fan report-card model
- deterministic fan answers
- board/final scoring
- focused tests

No route or official schedule changes.

### PR2 — owner/Casual preview UI
- report-card fan selection
- 10-tile board
- short answer / 4-choice / T/F interaction
- Peek / Copy / Save
- money ladder
- Final subject -> Walk Away / Go for $1M
- result presentation

### PR3 — content banks
- NFL 220
- CFB 220
- UFC 440
- protected Final pools
- expiry metadata on current-event records
- deterministic quality/balance tests

### PR4 — official Daily integration
- add canonical game type/registry mapping
- server Daily publication + grading
- immutable schedule integration
- Football NFL/CFB alternation
- history/streak/standings
- leaderboard result-detail click-through

### PR5 — QA/polish only if needed
- mobile fit
- accessibility
- animation/pacing
- exact result reconstruction
- final content balance audit

Every PR follows the repository release standard: exact head typecheck, full tests, production build, relevant backend verification, then merge only when green.
