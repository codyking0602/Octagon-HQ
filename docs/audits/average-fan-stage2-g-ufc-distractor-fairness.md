# Average Fan Stage 2G — UFC fighter-choice fairness

Date: 2026-10-14. **Small quality correction; Stage 2 remains in progress.**

## Actual published board defect

The UFC Average Fan board published October 9 included a Grade-4 four-choice question asking which UFC fighter **Daniel Cormier defeated**. The correct response, **Alexander Gustafsson** (UFC 192), was presented alongside **Greg Hardy, Henry Cejudo and Holly Holm**. Cejudo competed at much smaller weight classes and Holm in the women's divisions, so the wrong answers were not genuinely credible contenders. This was a gameplay-quality failure even though the correct answer was factually sound. [UFC 192 event result](https://www.ufc.com/event/ufc-192).

## Future-only selection fix

Generated UFC opponent-choice questions and fighter-identity puzzles now select three wrong fighters from a **same-gender, weight-division- and active-era-ranked** pool of existing UFC factual subjects. Favor the exact primary division, then shared secondary divisions, then adjacent weight classes, then other fighters of the same gender. Within those tiers favor closer overlapping career windows. All options remain deterministic for the published question ID and seed. For the "who did this fighter defeat?" question, **every documented win opponent** remains excluded from the distractor set, not just the selected correct option. For generated identity riddles, previously implemented multi-opponent uniqueness checks still apply.

Do not relax the factual standard to hit a quota, insert an opposite-gender fighter when a division is sparse, or alter historical published evidence. The October 9 board and everyone's previous results are immutable. Regression tests check the entire selected generated UFC question family and specifically prevent another impossible Cormier/Holm/Cejudo distractor pairing.

## Audit scope still open

This fix is one editorial pass, **not** a complete source audit of every bank item or difficulty/answer audit. All other selected UFC, NFL and CFB question families still require individual source, alias and distractor review; the approved four-Average-Fan/two-Higher-or-Lower rotation remains reserved for Stage 4.
