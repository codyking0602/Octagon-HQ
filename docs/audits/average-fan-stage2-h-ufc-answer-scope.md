# Average Fan Stage 2H — UFC answer-scope review

Date: 2026-10-14. **Additional review pass, not Stage 2 completion.**

## Defect and disposition
- The factual UFC ledger is a curated subset of fighter bouts rather than a guaranteed exhaustive official fight history. The generated `method-win` prompt previously asked for *any opponent* a fighter beat by a method, and the `title-opponent` prompt asked for *any fighter* they faced in a title fight. Both accepted only opponents represented in that partial ledger. A true answer from a missing bout could be incorrectly rejected.
- **Rewrite** those future-only Grade-5 families as four-choice questions tied to a particular documented dated UFC bout. This bounds answer scope; the authored correct choice is unique for that date. Same-gender, division- and era-aware UFC fighter distractors come from the already reviewed selector.
- **Hold** a generated question if the curated fighter record contains more than one bout on that date, or fewer than three same-gender credible wrong choices. Never add unverified answers to satisfy a count.
- Keep existing generated IDs for continuity while leaving all historical Daily setup snapshots, accepted submissions and scoring evidence untouched. This changes only questions chosen for future boards.

## Sources and limitations
- The expansion ledger's provenance is the pinned UFCStats fight-results extract (`data/generated/ufc/factual-expansion-v1.json`), complemented by canonical ranking fighter fight histories. [Official UFC athlete history](https://www.ufc.com/athlete/daniel-cormier) and [UFC's Cormier retrospective](https://www.ufc.com/news/fighter-decade-resume-daniel-cormier) illustrate why the full opponent set matters.
- This pass **does not** independently certify every selected fight result, option, fighter source record, or historic alias. Even bounded option sets still require individual official-source and difficulty editorial checks. Do not mark Stage 2 complete or change the planned Stage 4 rotation.
- Focused regression ties every selected rewritten item to precisely one factual-ledger bout, the actual opponent, win/title status, and bounded four-choice grading.

## Exact-head CI follow-up

The first exact-head test run uncovered **three obsolete numeric-short-answer coverage assertions**, not failures of the new opponent-to-dated-bout verification. After eliminating the two unbounded UFC generated families, the selected bank had 195 short-answer questions (the previous smoke target required >250), 34 surname typo cases (the previous target required >35), and its UFC short-answer share fell to about 9.8%. The approved game contract specifically rejects a mandatory short-answer percentage. Tests now validate **every retained** short answer, authored alternative, normalized spelling, typo and miss; assert each sport retains some free-text opportunities, without incentivizing unbounded answers purely to reach inventory or format quotas. Four-choice diversity and wrong-answer/schema checks remain intact.
