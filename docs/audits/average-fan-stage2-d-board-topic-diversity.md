# Average Fan Stage 2D — repeated named subjects on real Daily boards

Date: 2026-10-14. **Quality increment; NOT the final question-by-question Stage 2 certification.**

## Evidence: actual published gameplay

Read-only review of the active six Average Fan sport-day publications and their private immutable reveal evidence (48 eight-tile questions) found repeated *subject identity* inside some boards even though the questions, facts and answers differed:

| Published sport-day | Same subject repeated on the board | Why it hurts |
| --- | --- | --- |
| 2026-10-02, UFC | Conor McGregor appears in both Grade-3 prompts (the Nate Diaz loss and the Eddie Alvarez championship win) | Two questions in the same grade ask about the same star |
| 2026-10-02, CFB | Ohio State appears as the answer to the Michigan rivalry question and as the school in a conference question | Repeats one program twice in Grade 2 |
| 2026-10-08, CFB | West Virginia appears in the Mountaineer mascot question and a quarterback current-event question | Repeats one school twice in Grade 4 |

These are **real board-level editorial duplicates**, not identical-question or identical-answer duplicates. The existing factKey and exact/near-text tests did not detect them. Existing published Daily answers, attempts, leaderboards and archived results are deliberately unchanged.

## Candidate selection change

Define normalized *named topic* fingerprints for existing UFC fighters, NFL/CFB players, NFL franchises and college programs from the game's established sourced registries. Inspect both the prompt and correct answer: two different correct answers can still repeatedly quiz Conor McGregor, and a school can be repeated once as the answer and once in the clue. Require whole-name matches, not surname-only or generic word overlaps. Prefer longer specific school names over parent substrings (Georgia Tech vs Georgia).

For each future eight-tile Daily board, prefer a candidate with no named athlete, school or team already shown, while preserving the existing grade/subject/format balances and current-event inclusion rules. Reserve the current event's named topic in advance so earlier grades avoid stealing its one intended appearance. Prefer a Final with a new named topic over an otherwise-equivalent Final that simply repeats an earlier board subject. Neither the underlying bank nor its answer key changes.

Deterministic future board simulations now explicitly check question-ID uniqueness, per-grade structure, no recent 30-day question reuse, and no repeated recognized named topics within the board or its Final.

## Still outstanding

This does not individually verify the surviving factual claims, alternate answers, distractor truthfulness, difficulty, and all 183-day published histories. Automated name matching is an editorial aid, not comprehensive semantic understanding. Stage 2 remains in progress. Stage 3 Blind Resume remains untouched, and the 4x Average Fan / 2x Higher or Lower rotation remains staged for Stage 4.
