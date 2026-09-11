# Today’s Challenge vNext — Stage 11 Slice 1 Audit

**Status:** Complete audit; no live rotation or scoring change in this slice  
**Date:** September 11, 2026  
**Base main:** `30b8d3bf7ea28885ea151d82925bdc8e68140283`

## Decision

Keep the existing Today’s Challenge runtime, persistence owner, active rotations, and scoring formulas unchanged in Stage 11 Slice 1.

Who Am I is mature enough to leave owner-only preview as a **normal public replayable game**, but it is **not yet approved for Today’s Challenge**. Public replayable release and Daily integration are separate decisions.

The next Stage 11 slice should release Who Am I to normal Play while preserving `dailyEligible: false`, then establish the measurement/readiness contract needed before a later Daily integration.

## Canonical Daily ownership

Today’s Challenge already has one shared sport-aware backend owner:

- `supabase/functions/daily-challenge-runtime/index.ts` owns server materialization and progress/grading orchestration.
- `private.daily_challenge_schedule_versions` owns immutable, versioned, Central-time schedules.
- `private.daily_challenge_setups` owns immutable setup identity and private evidence.
- `private.daily_challenges` owns the published sport/day identity.
- `private.daily_challenge_progress` owns cross-device in-progress state.
- `private.daily_challenge_attempts` owns immutable official-first results.
- `src/features/play/todayChallengeRepository.ts` is the shared browser repository for UFC and Football.
- Existing history, streak, standings, leaderboard, and reminder paths remain sport-scoped through the same Daily platform.

Do not create another Daily scheduler, repository, grader, persistence path, or route owner for Who Am I.

## Active production rotations

Production was inspected on September 11, 2026 using aggregate/read-only queries against the canonical Octagon HQ Supabase project.

### UFC — `play-rotation-v6`

The active 60-slot cycle preserves the `play-rotation-v4` five-family mix through the v5/v6 one-day reroll schedule identities:

| Family | Slots | Weight |
| --- | ---: | ---: |
| Find the Leader | 15 | 25% |
| Blind Resume | 15 | 25% |
| Wavelength | 12 | 20% |
| Hit the Number | 12 | 20% |
| Daily Double | 6 | 10% |

The scheduled `keep_4_cut_4` family is the two-stage **Blind Rank 5 → Keep 4, Cut 4 Daily Double**, not a standalone Keep/Cut day. Current UFC rotation does not schedule a separate `blind_rank_5` day.

### Football — `football-daily-v3`

Football uses a deterministic five-day equal rotation:

| Family | Weight |
| --- | ---: |
| Find the Leader | 20% |
| Blind Resume | 20% |
| Wavelength | 20% |
| Hit the Number | 20% |
| Daily Double | 20% |

The Football Daily Double also runs Blind Rank 5 first and Keep/Cut second, with the two halves using opposite NFL/CFB leagues.

### Rotation verdict

Both schedules are deterministic, Central-time based, sport-scoped, versioned, and already owned by the canonical Daily path. There is no Stage 11 Slice 1 evidence that justifies changing the live mix.

## Current score contracts

All official results normalize to 0–100, but the native game economics intentionally differ:

| Family | Current normalized shape |
| --- | --- |
| Find the Leader | Native round 1–10 × 10 |
| Wavelength | `max(0, 100 - 2 × final distance)` |
| UFC Blind Resume V3 | Five reveal-timing round scores summed directly, max 100 |
| Football Blind Resume V4 | Three-round raw ladder normalized against a 30-point max |
| Blind Rank 5 | 10 pairwise comparisons × 10 |
| Keep/Cut | 16 comparisons normalized to 0–100 |
| Daily Double | Rounded mean of Blind Rank and Keep/Cut normalized scores |
| Hit the Number | Perfect 100; under 75–99; bust 0–74 |

The 0–100 layer is a common competitive display contract, not proof that every game has the same score distribution.

## Production score snapshot

The production sample is currently too small to justify formula changes. Aggregate official-first history through September 11, 2026 contains:

- UFC: 108 attempts across 58 played days and 5 distinct players.
- Football: 24 attempts across 14 played days and 6 distinct players.
- Maximum participation on a single sampled day: 4 UFC players / 3 Football players.

Directional current medians by family:

| Sport | Family | Attempts | Median |
| --- | --- | ---: | ---: |
| UFC | Find the Leader | 57 | 90 |
| UFC | Wavelength | 12 | 90 |
| UFC | Blind Resume | 15 | 74 |
| UFC | Hit the Number | 12 | 75 |
| UFC | Keep/Cut / Daily Double history | 10 | 76 |
| Football | Find the Leader | 4 | 60 |
| Football | Wavelength | 6 | 90 |
| Football | Blind Resume | 7 | 53 |
| Football | Hit the Number | 3 | 83 |
| Football | Daily Double | 4 | 82.5 |

These numbers are useful for identifying score-shape differences, not for recalibrating the product. Day difficulty and very small participation counts dominate the sample.

### Scoring verdict

Do **not** recalibrate an existing game from this production sample.

Any future scoring change must:
1. use a new scoring version;
2. preserve historical attempts unchanged;
3. be proven against deterministic simulation and a materially larger human sample;
4. continue to rank a day against the same board/game rather than pretending all games have identical distributions.

## Repetition and deterministic setup

Current Daily repetition protection is mechanic-specific and remains inside the existing game owners:

- Daily schedules deterministically choose the family for a Central day.
- Setup keys/content/scoring versions freeze a published Daily identity.
- Wavelength carries deterministic prior-day history to avoid recent target/clue repetition.
- Find the Leader, Hit the Number, Blind Resume, and Daily Double use deterministic seeded setup owners.
- Football league/pack selection is deterministic and sport-isolated.
- Published evidence and official-first attempts are immutable.

Casual replay repetition policy does not become a Daily input. In particular, Who Am I’s local recent-subject exclusions must never influence an official Daily board.

## Who Am I readiness

### Public replayable: APPROVE for next slice

The completed Stage 10 work provides enough product-quality evidence for normal replayable Play:

- 100 UFC / 200 NFL / 200 CFB audited launch subjects;
- every launch subject can assemble the 10-clue round;
- football launch pool has zero subjects below 12 candidate clues;
- broad → helpful → strong → giveaway progression;
- sports-identity weighting and biography limits;
- replay variation and persisted recent-subject protection;
- mature recovery/endgame;
- full-population quality simulation;
- scoring/UI playtest polish.

Public replayable release does not require Daily persistence or competition ownership.

### Today’s Challenge: NOT YET

Who Am I is not currently a Daily game type and has no canonical Daily:

- server materializer;
- private hidden-subject/clue setup;
- Daily grader/submission contract;
- progress reconstruction;
- adapter;
- database supported-game/scoring-version contract;
- standings per-game projection;
- human competitive score distribution.

The casual scoring ladder is currently:

- natural solve windows: 100 / 95 / 90 / 80 / 70;
- wrong natural guess: −10;
- Recovery Board: 45, then 30;
- two recovery misses: 0.

That is a reasonable replayable game score, but human Daily fairness cannot be inferred from clue-quality simulation alone.

## Stage 11 next slice

**Slice 2 — Public Who Am I release + Daily readiness measurement.**

1. Remove owner-only preview gating from UFC and Football Who Am I.
2. Keep the existing Who Am I engine/data owners.
3. Keep `dailyEligible: false`, challenge/streak/reminder ownership off, and do not alter Today’s Challenge schedules.
4. Preserve the current casual score ladder.
5. Add the minimum measurement/readiness contract needed to evaluate real solve-window and recovery outcomes without creating a second gameplay owner.
6. After enough evidence exists, separately decide whether a versioned server-owned Who Am I Daily contract should be built and added to a new schedule version.

Stage 11 Slice 1 intentionally makes **no production rotation, scoring, database-schema, or Who Am I access change**.
