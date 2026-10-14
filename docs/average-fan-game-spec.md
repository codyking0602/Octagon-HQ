# Are You Smarter Than an Average Fan? — Canonical Game + Content Spec

**Status:** LIVE canonical Daily game
**Calibration:** October 1, 2026; content quality audit updated October 14, 2026
**Repository:** `codyking0602/Octagon-HQ`

This is the locked product and engineering contract for **Are You Smarter Than an Average Fan?**. Preserve the approved visual treatment and reuse the existing Daily platform.

## Product identity

Sports: NFL, CFB, UFC, with MLB postseason appearances using the same gameplay contract.

Football alternates CFB and NFL across official Average Fan appearances using publication history. The live rotation remains five Average Fan slots per 27-day Football / 29-day UFC cycle; the approved future target is **four per 28-day Football / 30-day UFC cycle**, only after Higher or Lower is fully integrated in Stage 4.

## Game structure

The board contains **8 questions**:
- 2nd Grade: 2 subjects
- 3rd Grade: 2 subjects
- 4th Grade: 2 subjects
- 5th Grade: 2 subjects

There is no 1st Grade row. Keeping 5th Grade is intentional because it is core to the show's identity.

All eight tiles are visible before play. The player chooses the order. Wrong answers do not end HQ play.

After the board, reveal only the Final subject. The Final question remains hidden. The decision screen must explicitly show the banked score, the +10 correct score, and the -10 wrong score before the player chooses **Walk Away / Bank Score** or **Play Final**. The player does not choose the subject. Once Play Final is chosen, walking away is no longer available. Peek / Copy / Save are unavailable on the Final.

Money ladder presentation:
1. $1,000
2. $2,000
3. $5,000
4. $10,000
5. $25,000
6. $50,000
7. $100,000
8. $500,000
9. Final $1,000,000

The money ladder is presentation only. Official score remains 0–100.

## Difficulty calibration

The game is designed to be fun before it is punishing.

- **2nd Grade:** very accessible. Mainstream stars, teams, rules, iconic facts. A regular fan should feel good here.
- **3rd Grade:** regular-fan knowledge.
- **4th Grade:** meaningful challenge for someone who follows the sport.
- **5th Grade:** legitimately hard sports-fan knowledge, but recognizable rather than cheap obscurity.
- **Final:** hardest clean, defensible 5th-grade-quality question.

Legacy source records may still use Grade 1 internally before calibration. The playable bank remaps old 1→2, 2→3, 3→4 and old 4/5→5.

Hard does not mean old. Upper-grade history is valid, including deep Heisman or early-UFC facts, but difficulty must come from knowledge rather than arbitrary wording.

## Answer formats

Formats:
- `short-answer`
- `four-choice`
- `true-false`

Do **not** preserve a target short-answer percentage at the expense of fun.

Use short answer when blank recall is natural: recognizable player/fighter names, teams/schools, common terminology, and famous landmark facts.

Default to four-choice when the fact already carries substantial recall burden, especially:
- rivalry trophy names
- exact historical years
- exact draft slots or niche numbers
- obscure opponents
- deep statistical minutiae
- other facts where recognition is fairer than unaided recall

Tolerant short-answer grading continues to accept reasonable punctuation, accent and small spelling variants without accepting authored wrong answers.

## Current events

Average Fan **must not reuse the same authored current-event questions or materially identical fact families as Bar Trivia**. It can reuse the existing event provenance and expiry infrastructure, but its own current-event questions require independent editorial verification before entry.

Current-event records use:
- `contentType: "current-event"`
- optional `activeFrom`
- required `expiresAt`

A Bar Trivia current event is **not** automatically eligible for Average Fan; only separately approved Average Fan questions are eligible. Once an approved question's `expiresAt` passes, it becomes ineligible.

A current-event fact is keyed by `sourceId` across Daily games. If that source has already appeared in an earlier Daily for the same sport while it is still eligible, Average Fan must skip it and use another unused current event or evergreen content. A single Average Fan board uses at most one current-event question.

New story authoring/ingestion remains subject to the existing shared event pipeline, but **question and fact reuse across games is prohibited**. Stage 2 retires the old directly borrowed events until independently verified nonoverlapping Average Fan questions exist.

Average Fan applies its own difficulty calibration on top of that pool. **Current events do not appear in 2nd Grade by default**, even when the Bar Trivia source labels them easy/Round 1.

Finals should normally remain evergreen.

## Scoring

Perfect 8-question board: **90**.

With at least one unsaved miss:

`board score = 68 + (2 × first unsaved miss question number) - (5 × each additional unsaved miss)`

Cap board score at 90.

Reference points:
- first miss Q1 → 70
- first miss Q2 → 72
- first miss Q4 → 76
- first miss Q6 → 80
- first miss Q8 → 84
- perfect board → 90

A successful Save does not count as an unsaved miss.

Final:
- Walk Away → board score
- correct Final → +10, cap 100
- wrong Final → -10

An 80 should still feel like a good run.

## Fans and help

Fans: Cody, Shane, Troy, Tyler, Lib. Each fan remains equally useful overall while subject strengths differ.

Base fan accuracy for the playable grades:
- 2nd: 93%
- 3rd: 88%
- 4th: 82%
- 5th: 74%

Subject report-card modifiers remain centered per fan/sport and `difficultyNudge` remains ±3 percentage points.

Peek, Copy and Save are each available once:
- **Peek:** reveal the fan's locked answer, then player answers.
- **Copy:** commit to the fan's locked answer without seeing it first.
- **Save:** automatic when the player is wrong. If the fan is right, the miss is saved; if the fan is also wrong, Save is consumed and the miss remains.

That unsuccessful Save behavior is intentional.

## Durable bank

Retain a quality-first bank with room for six months of Daily selection; **bank sizes are ceilings, not required quotas**. As of the Stage 2C review, ceilings are:
- NFL: 220
- CFB: 158
- UFC: 440
- total: 818

Actual selected inventories may be smaller. Retire unverified, repeated, ambiguous, or low-enjoyment items rather than refill to meet a target.

Ordinary playable shape:
- NFL: 40 Grade 2 / 40 Grade 3 / 40 Grade 4 / 85 Grade 5 + 15 protected Finals
- CFB: 40 / 40 / 40 / 85 + 15 protected Finals
- UFC: 80 / 80 / 80 / 170 + 30 protected Finals

Shortening the board increases no-repeat runway. Do not discard strong questions merely because their old grade or answer format was wrong; regrade or reformat them.

## Persistence and runtime

Official Daily persistence, grading, history, standings, leaderboard detail, current-event expiry and scheduling remain server-owned by the existing Daily Challenge platform.

Canonical versions after the four-grade calibration:
- content: `average-fan-v4`
- Daily runtime: `average-fan-daily-v3`
- scoring: `average-fan-score-v2`

A canonical Daily setup contains exactly eight board question IDs plus one separately protected Final. Server grading rejects legacy ten-question completion evidence under the v2 scoring contract.

MLB Average Fan uses the same 2nd–5th Grade / 8-question board and scoring experience.

## Design intent

Preserve the approved classroom/chalkboard presentation, fan selector, report cards, money rail, Peek / Copy / Save treatment, non-elimination verdict, and Final.

Equivalent Football, UFC and MLB Average Fan experiences should feel like the same product. Mobile landscape overflow/truncation and stale 10-question/1st-grade UI assumptions are product bugs.
