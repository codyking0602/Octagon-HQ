# Football Higher or Lower — six-month certification staging

Source baseline: main `8b9f2aed26ea10f56c8863e0a0cd5ce6c6d85195`. This PR is content-only and **does not change the live Daily rotation**.

## Coordination boundary

* PR #2100 merged the Official Daily publisher, grader and UI **without calendar activation**.
* PR #2102 (Parts 2 & 3) is a separate draft. The locked cadence and coordinated weighted calendar have **not merged** as of this baseline; its owner controls the final schedule and seeds.
* Football Higher or Lower's approved weight is **2×**. The current main 27-slot Football cycle does not contain this game. Do not edit or independently activate the shared scheduler in this PR.
* Keep NFL/CFB balance exactly 5+5, difficulty 3/5/2, and all existing unrelated weights and historical data.

## Audit instructions

Run `OCTAGON_WRITE_HL_AUDIT=1 npx vitest run src/features/play/footballHigherLowerSixMonthAudit.test.ts`, after `npm run pretest`.

The resulting `artifacts/football-higher-lower-provisional-six-month-boards.json` contains every provisional date, actual official publisher seed, each numbered comparison and its identity, sources bound to canonical ledger facts, numerical values, answers, difficulty, and summary counts.

This is a **14-board provisional capacity test**, not production six-month certification: the dated official 2× Football slots and canonical `scheduleVersion` must come from the eventual coordinated rotation. Do not interpret synthetic test dates, provisional seeds or a green capacity test as evidence the scheduled production inventory passed. Re-run with every actual slot after Part 1/2 merges; if there are more than fourteen, test the entire larger list without reducing demand.

For future publication the real schedule integration must supply the prior published questions to `buildFootballHigherLowerDailyPublication(day, scheduleVersion, previousPublishedQuestions)` (or adopt an immutable precomputed audited schedule). With no previous-question history the older Casual-compatible single-board publisher remains deterministic but **does not guarantee cross-date uniqueness**. This PR makes exclusions available and tests them; it does not install another scheduler.

## Evidence limitations

Each factual value is rechecked against the canonical Football fact ledger, exact metric, identity, formatted value and named evidence source; metadata-only NFL Draft pick rows are explicitly counted for independent verification. A pinned source binding is **not** an independent recheck of a third-party site. Editorial and historical school/season inspection remains a required review before final signoff.

Release gate: final dates + version; zero exact/semantic/subject-metric reuse; 5 NFL and 5 CFB in every board; zero invalid source bindings; owner signoff; green exact-head CI and backend tests. **No merge or deployment without explicit approval.**

## Provisional inventory measured on the 14-date simulation

The generated official-only 14-board pool achieved 140 distinct comparisons (70 NFL / 70 CFB), zero exact or pairwise-semantic repeats, zero repeated subject/metric keys, zero invalid ledger source bindings, zero incorrect graded answers and zero duplicate boards in a green content-audit run. The updated generator uses 8 coherent categories (including defensive and efficiency), the approved 3/5/2 per-board difficulty composition, canonical franchise records with explicit 1999–2025 scope, and a seven-appearance maximum per underlying subject entity. The preliminary run had 154 distinct subject/season IDs, 38 historical comparisons and no registry-only draft metadata facts (NFL draft metadata withheld from Official Daily until independently verified). The final scheduled production certification remains **blocked by Part 1 and Part 2 calendar/version integration** even if the provisional test is green. Any different official seed, appearance count, or actual dates must rerun the exhaustive audit.

## Fact-source strictness

Official Daily excludes the source-unbound legacy NFL draft-pick template. The Casual game continues to offer it unchanged. The certification asserts zero registry-only source rows, not just zero missing source IDs.
