# Daily Challenge content quality program — approved 13-stage rollout

Status: **Stage 1 complete; Stage 2 Average Fan in progress. Future rotation not yet activated.**
Baseline inspected: main at `374f130988d6d70c018145881a1e3fcfffe4bca3` (2026-10-13).

## Decision and release rule

Quality beats quantity. Retire a question instead of padding inventory, retaining an unverified claim, or manufacturing an alternate phrasing of the same fact. Existing tests for bank *size* are not editorial approval. Lower those size assertions during each bank's own audit instead of refilling with weak material.

Every bank needs **question-by-question** review and visible disposition:
- **Keep:** factual source checked, unambiguous, enjoyable, fair for its difficulty and format, not materially repeated.
- **Rewrite:** identifiable defect with an independently verified replacement that does not duplicate another game.
- **Retire:** unsupported, unfair, confusing, trivial, repetitive, impossible to grade fairly, or materially identical to another fact. No minimum inventory quota.
- **Hold:** unresolved fact or sourcing; not eligible for publication until checked.

Review each accepted answer, alternate/alias, distractor, season, team, statistic, and candidate grouping; verify data against authoritative primary or reputable sport-specific sources. Model-generated scoring or prose is not proof of factual correctness. Test actual authored/generated boards and grading, not just bank rows. Mobile UI must not hide years or key context.

### Before each game audit PR can merge

1. Inventory all active NFL/CFB/UFC or MLB material in that game, including dynamically generated boards and official Daily publication paths.
2. Record counts **before / kept / rewritten / retired / held**, a documented reason for every changed item, and factual-source checks for surviving factual claims.
3. Check same-game repeats, shared topics or answers, cross-game repeats, and a rolling published Daily history. A reworded fact is not new content.
4. Verify difficult questions are answerable, middle rounds vary meaningfully, and incorrect answers/distractors are plausible but definitively wrong.
5. Add bank-specific regression tests plus deterministic Daily simulations; confirm legacy published answers/attempts remain stable.
6. Obtain green verification on the **exact PR head**; merge only with owner authorization, then verify production.

### Existing confirmed problem; not yet remediated

CFB Bar Trivia published on **October 1, 2026** asked:
“Florida won its first national championship by beating which rival in the Sugar Bowl?”

CFB Average Fan published the **identical prompt** on **October 2, 2026**. Average Fan currently reuses authored CFB Bar Trivia questions by construction. We must stop that overlap during **Stage 2**, rather than merely disguise it with wording changes. Existing publication history must not be rewritten.

Sports Feud currently enforces **1,050 prompts across 210 topical families** (five variants per family); this count alone does not establish 1,050 genuinely distinct questions. Its editorial and answer-bank audit belongs to Stage 5.

Automatic normalization/overlap candidates are provided by `dailyContentQualityPolicy.ts`. This is only a **review aid**; it does not guarantee fact-checking or discover every semantic duplicate. Add editorially assigned `factKey` values when auditing banks to catch different phrasings of the same trivia fact.

## Rotation target: stage, do not activate prematurely

| Game | Football | UFC |
| --- | ---: | ---: |
| Average Fan | 4 | 4 |
| Sports Feud | 4 | 4 |
| Millionaire | 4 | 4 |
| Who Am I | 3 | 3 |
| Find the Leader | 3 | 3 |
| Wavelength | 3 | 3 |
| Bar Trivia | 3 | 3 |
| Hit the Number | 2 | 2 |
| Higher or Lower | 2 | 2 |
| Blind Resume | 0 | 2 |
| **Days per cycle** | **28** | **30** |

Current production remains **27 Football / 29 UFC**, with Average Fan 5x and Higher or Lower 0x. Do **not** publish a new cycle merely by adding `higher_or_lower` to the schedule: it lacks official Daily persistence, grading, page routing, leaderboard/result integration, and UFC content. Stage 4 must implement these and migrate app + backend schedules **atomically**, with a future-only effective date, preserving previously published challenges, attempts, history, and streaks. Do not inadvertently reactivate Football Blind Resume.

## Ordered stage ledger

| Stage | Game or gate | Status |
| --- | --- | --- |
| 1 | Quality policy, cross-game audit aid, approved rotation target | Complete (#1903 merged) |
| 2 | Average Fan — NFL, CFB, UFC, reduced quality-first banks | In progress: #1904/#1905 merged; #1907 editorial PR; source review unfinished |
| 3 | Blind Resume — format/difficulty, especially UFC | Pending full review |
| 4 | Higher or Lower — Football audit, UFC game, official Daily x2 both | Pending |
| 5 | Sports Feud — 1,050 existing prompts and answer sets | Pending full review |
| 6 | Bar Trivia — all sports | Pending full review |
| 7 | Millionaire — all league runs and difficulty ladders | Pending full review |
| 8 | Who Am I — identities, sources, full clue ladders | Pending full review |
| 9 | Find the Leader — all seasons/players/stats | Pending full review |
| 10 | Wavelength — all subjects/clue sequences | Pending full review |
| 11 | Hit the Number — curated targets/players/boards | Pending full review |
| 12 | MLB — all live game banks | Pending full review |
| 13 | Cross-game semantic overlap + simulated rotation + production rollout | Pending |

**Important:** This stage does not represent a reviewed or cleaned content bank. Do not mark a game complete on the strength of a schema test or sample inspection.
