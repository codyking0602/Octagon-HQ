# Today's Challenge vNext — Stage 11 Slice 1 Audit

**Date:** September 11, 2026  
**Scope:** Current Daily ownership, live rotations, scoring shape, repetition/versioning, and Who Am I release readiness.  
**Change policy:** Audit only. No live rotation or scoring changes in this slice.

## Canonical ownership

The existing Daily platform is structurally sound and remains the sole owner:

- Supabase private Daily schedule/setup/challenge/attempt/progress state owns official identity and persistence.
- `daily-challenge-runtime` is the shared Edge runtime/materialization owner.
- Daily identity is sport-scoped and Central-time based.
- Schedule versions are immutable; first official completion is immutable.
- UFC and Football share persistence/competition ownership without sharing incompatible game engines.
- Historical setup/scoring versions remain readable instead of being rewritten.

No second scheduler, repository, grader, or persistence path is needed for Stage 11.

## Current live schedules

Production was inspected directly on September 11, 2026.

### UFC — `play-rotation-v6`

The active 60-slot cycle is:

| Daily family | Slots | Share |
| --- | ---: | ---: |
| Find the Leader | 15 | 25% |
| Blind Resume | 15 | 25% |
| Wavelength | 12 | 20% |
| Hit the Number | 12 | 20% |
| Daily Double (Blind Rank 5 → Keep 4, Cut 4) | 6 | 10% |

The published `keep_4_cut_4` schedule identity owns the two-stage Daily Double. There is no separate active Blind Rank slot in the current UFC cycle.

### Football — `football-daily-v3`

The active five-day cycle is evenly weighted:

1. Find the Leader
2. Blind Resume
3. Wavelength
4. Daily Double (Blind Rank 5 → Keep 4, Cut 4)
5. Hit the Number

Each family appears 20% of the time. The September 4 Blind Resume one-day schedule override is historical; `football-daily-v3` resumed the canonical five-day cycle on September 5.

## Production score audit

Aggregate official-first results were inspected directly. These are small samples, especially in Football, so they are directional rather than a reason to rewrite scoring immediately.

### UFC

108 attempts across 58 played days; average 75.4, median 80.

| Game identity | Attempts | Avg | Median | 90+ |
| --- | ---: | ---: | ---: | ---: |
| Find the Leader | 57 | 76.3 | 90 | 57.9% |
| Blind Resume | 15 | 74.7 | 74 | 6.7% |
| Wavelength | 12 | 89.0 | 90 | 50.0% |
| Hit the Number | 12 | 62.7 | 75 | 0.0% |
| Daily Double / Keep-Cut identity | 10 | 73.2 | 76 | 0.0% |

Two historical standalone Blind Rank attempts exist and are not part of the current rotation.

### Football

24 attempts across 14 played days; average 71.6, median 81.5.

| Game identity | Attempts | Avg | Median | 90+ |
| --- | ---: | ---: | ---: | ---: |
| Find the Leader | 4 | 60.0 | 60 | 25.0% |
| Blind Resume | 7 | 56.9 | 53 | 14.3% |
| Wavelength | 6 | 82.7 | 90 | 66.7% |
| Hit the Number | 3 | 86.0 | 83 | 33.3% |
| Daily Double / Keep-Cut identity | 4 | 81.8 | 82.5 | 25.0% |

### Score conclusion

The app already normalizes every official result to 0–100, but equal numeric ranges do not yet imply identical score distributions. Current samples are too small and player-mix-sensitive to justify another broad scoring recalibration.

Stage 11 should preserve current scoring formulas unless a focused defect or materially larger evidence set proves a specific game is miscalibrated.

## Repetition and deterministic setup

Current Daily behavior is deterministic by sport/day/schedule version.

Wavelength also owns explicit recent-history avoidance. Other Daily families rely on deterministic day/version seeds and their canonical generators rather than a shared cross-game recent-subject memory.

That is acceptable for the current rotations. If Who Am I enters Daily, its casual local-storage recent-history path must **not** become the Daily owner. Daily Who Am I needs one deterministic server-materialized setup for everyone on that sport/day, plus explicit cross-day subject/clue repetition protection in the canonical Daily generation path.

## Who Am I decision

### Public Play readiness: APPROVED

Who Am I has completed:

- 100 UFC / 200 NFL / 200 CFB launch populations;
- clue-depth and source/provenance audits;
- mature full-population simulation;
- clue progression, sports-identity weighting, and biography limits;
- replay variation;
- recovery/endgame flow;
- first-person copy polish;
- persistent casual recent-subject rotation.

There is no remaining product-quality reason to keep normal replayable Who Am I owner-only.

### Today's Challenge readiness: NOT YET

Do not add Who Am I to the Daily rotation in this audit slice.

The current official Daily contract does not yet own:

- a `who_am_i` Daily game type;
- deterministic sport/day subject and clue materialization;
- server-private answer/clue grading evidence;
- Who Am I Daily advance/final-submission semantics;
- server-side Who Am I scoring/version compatibility;
- adapter/result/history/standings support;
- cross-day Daily subject/clue repetition rules.

Who Am I's casual score ladder is already 0–100 bounded and competitive-looking (natural windows 100/95/90/80/70, wrong-guess penalties, then 45/30 recovery), but Daily fairness requires deterministic shared setup and server grading before schedule activation.

## Locked Stage 11 sequence

1. **Slice 1 — audit:** complete with this document. No live rotation change.
2. **Slice 2 — public Who Am I release:** remove owner-preview gating in UFC and Football while keeping `dailyEligible: false`.
3. **Slice 3 — Daily Who Am I runtime/scoring proof:** extend the existing canonical Daily owner, never create a second path.
4. **Slice 4 — rotation decision:** only after Slice 3 is green, decide whether and at what weight Who Am I enters UFC and Football Daily.

Existing rotations remain unchanged until Slice 4.
