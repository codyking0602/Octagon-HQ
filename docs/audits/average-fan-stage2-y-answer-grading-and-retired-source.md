# Average Fan Stage 2Y — historic team answer grading and retired fact integrity

Date: October 16, 2026. Based on `main` `26a2ec7dfe82f83cece0fbe096b160f441d15ccc`. This is a future-only accuracy/answer-matching correction following Stage 2X, not a claim that the entire Stage 2 review is finished.

## Decisions and independent evidence

| Candidate | Prior problem | Decision | Source |
| --- | --- | --- | --- |
| NFL `00-team:greatest-show` | Historical team label `St. Louis Rams` in a short-answer prompt rejected valid `Rams` and `The Rams`; `nflKnowledgeQuestions` did not pass through documented author aliases to the short-answer schema | **Rewrite grading:** pass through `KnowledgeFact.aliases`; accept `Rams`, `The Rams`, and `St Louis Rams` without allowing a different team; keep original historic answer and difficulty | [NFL archive: 1999 St. Louis Rams, Greatest Show on Turf](https://www.nfl.com/photos/greatest-show-on-turf-0ap2000000362117) |
| UFC `authored-history:first-170` | Retired early UFC 16 fight-trivia source misspelled Josh **Stuart** as Josh **Stewart**, even though it could be referenced in offline editorial review | **Retire retained**, correct source data spelling to Josh Stuart; do not reinstate an obscure Grade-5 undercard-opponent question | [Official UFC 16 fight card](https://www.ufc.com/event/ufc-16) and [UFC Josh Stuart fighter profile](https://www.ufc.com/athlete/josh-stuart) |

The NFL fix is in the centralized content-bank creation path: original/alias match, difficulty and other questions are unchanged. The former UFC question remains absent from playable banks. No published Daily snapshots, score, answer or rotation is modified.

## Regression

- The selected NFL historical Rams question must credit `Rams`, `The Rams`, `St. Louis Rams` and `St Louis Rams`.
- The previously retired UFC 16 early opponent item remains absent.
- Existing selected bank schema, spelling tolerance, overlapping-fact screens, Grade 2–5 distribution, deterministic future publication, selected generated-fight and 180-day simulations remain release gates.

## Closure work still requiring verification

The **remaining Stage 2 acceptance gates from 2X still apply**: exact-head revised selected board review, primary-source signoff for surviving authored facts and distractors, deeper generated CFB/UFC Final coverage, and green production delivery/validation. Do not label Stage 2 complete on the basis of this two-item correction.
