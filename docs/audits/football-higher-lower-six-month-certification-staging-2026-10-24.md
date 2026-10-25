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
