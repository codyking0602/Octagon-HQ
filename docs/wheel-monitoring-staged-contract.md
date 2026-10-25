# Wheel read-only census — staged acceptance contract

This is an infrastructure-only collector **foundation**, not approval to publish roster, ranking, contract or rating changes.

## Authorities

- Current NFL/CFB identities come from the latest **effective** version of `private.wheel_football_grade_authority`. Never sum all historical rows and call them active population.
- Current UFC identities come from active `private.wheel_ufc_fighters`, with exactly one champion plus #1–15 per eight men's divisions. UFC source authority is official **All Rankings**, not Meta.
- NFL grades consumed by GM remain `src/features/back-room/wheelFootballNflCurrentAuthority.ts`; no auto-generated alternative authority.
- NFL/CFB ESPN rosters are comparison signals, not automatic delete/regrade authority. Coaches, performance trends, UFC authoritative source verification and GM contracts remain separately required inputs.

## Stages and failure boundaries

1. Collect entire production DB identity and grade-version census through a read-only credential, plus authenticated source receipts. Every identity gets accounted for, even if unchanged.
2. Build ESPN roster presence/name evidence for all 32 NFL and 69 CFB teams (including Boise). Unmatched names must be reconciled, not silently deleted.
3. Validate official UFC **All Rankings**, each division champion and contender #1–15, against current production. A rank change is a **factual correction**; it does not change a grade by itself.
4. Independently refresh NFL GM contract source in an isolated output and compare with the versioned historical snapshot. Do not rewrite existing files.
5. Classify changes, preserve all unchanged grades, produce a dated JSON evidence receipt with source URLs, previous state and reason. Deep evaluation is *editorial*, not automated grade arithmetic.
6. Only after every required upstream gate passes, persist one last-good factual checkpoint. A partially failed cycle must keep the previous checkpoint, record the error and never publish partial ratings or silently claim freshness.

The pure policy and fixture tests ship first to enforce no-change stability, no automatic grading, mandatory source provenance, UFC rank shape and never-commit-partial behavior. A real collector/scheduler will only be enabled when the whole production sourced loop is proven; do not confuse **policy fixtures** with live source certification.

Do not enable the existing disabled Wheel Grade Refresh or restore the independent AP cron. NBA remains out of scope.
