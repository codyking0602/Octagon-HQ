# NFL Build a QB Weekly — generator calibration

## Scope

This document defines the Weekly Build a QB board-generation layer that sits **after** the locked 112-QB population and trait grades.

It does not change any player grade.

The Weekly generator exists to create interesting auction markets from truthful grades. It may choose which player/trait cards appear; it may never raise, lower, or infer a trait grade.

## Locked weekly board structure

- Seven days.
- Exactly four auctions per day.
- Exactly one auction for each trait every day:
  - Arm
  - Accuracy
  - Processing
  - Mobility
- Twenty-eight total weekly cards.
- Exactly seven cards per trait.
- Each card is bound to its trait before bidding.
- The winner receives that player for that specific trait; there is no post-win trait assignment.
- Hidden grades.
- No quarterback may appear twice in the same week, even for different traits.
- Future daily boards remain server-owned until reveal.

With six weekly players, 24 trait wins are required to complete six four-trait quarterbacks, leaving four extra weekly cards as market slack.

## Core generator principle

The full 112-QB master population is **not** a uniform Weekly draw bag.

A low trait grade belongs in the canonical population because it is truthful. That does not mean it should consume one of only seven weekly opportunities for that trait during a normal week.

Weekly caliber is therefore a generation rule, not a grading rule.

## Hidden weekly caliber mix

The week receives one hidden caliber at generation time.

### Premium — 15%

Per trait:

- 2 cards at 96+
- 3 cards at 90.0–95.5
- 2 cards at 84.0–89.5

**Trait floor: 84.0**

Intent: expensive decisions everywhere. There are no cheap weak cards; the strategy is deciding which elite differences are worth paying for.

### Standard — 60%

Per trait:

- 1 card at 96+
- 2 cards at 90.0–95.5
- 2 cards at 84.0–89.5
- 2 cards at 78.0–83.5

**Trait floor: 78.0**

Intent: default Weekly experience. Good-to-elite talent dominates, but there is enough separation to make bankroll discipline matter.

### Grinder — 20%

Per trait:

- 1 card at 90.0–95.5
- 2 cards at 84.0–89.5
- 2 cards at 78.0–83.5
- 2 cards at 70.0–77.5

**Trait floor: 70.0**

Intent: an intentionally lower-caliber week where identifying the least-damaging compromise matters. This is where recognizable weaker trait cards can become legitimate weekly choices.

### Chaos — 5%

Per trait:

- 1 card at 96+
- 1 card at 90.0–95.5
- 1 card at 84.0–89.5
- 1 card at 78.0–83.5
- 1 card at 70.0–77.5
- 2 unrestricted cards from the remaining population

Protection:

- At most one sub-70 card per trait in the week.
- No duplicate quarterback in the 28-card week.

Intent: intentionally irregular valuation. This is the only default weekly caliber where the true bottom of a trait can surface.

## What this means for low-end grades

The low-end grades remain real and useful without polluting normal Weekly play:

- **Premium:** no trait below 84.
- **Standard:** no trait below 78.
- **Grinder:** no trait below 70.
- **Chaos:** sub-70 is allowed, but capped at one per trait and Chaos occurs only 5% of weeks.

A 55 Accuracy Tim Tebow, 52 Processing Johnny Manziel, or 58 Mobility Philip Rivers is therefore **not** a normal random weekly card.

Those grades matter for the canonical player model, Casual modes, future special formats, and the rare intentionally chaotic Weekly board.

## Specialist rule

Specialists are desirable when their **target trait is legitimately strong**.

Examples:

- Jay Cutler can be a premium Arm card even though his overall four-trait average is much lower.
- Chad Pennington can be a strong Accuracy/Processing card while never appearing as a normal Arm option.
- Michael Vick can be a premium Mobility/Arm card while his weaker Accuracy/Processing grades remain truthful.

Weekly selection is trait-specific. The generator never evaluates a quarterback's overall average to decide whether his strong trait is allowed to appear.

A specialist may receive a modest selection preference within the appropriate trait band, but only after he naturally qualifies for that band.

## Board-generation protections

- Exactly seven cards per trait.
- Exactly one card from each trait per day.
- No quarterback repeats in the same week.
- Trait grade determines band eligibility; reputation does not.
- Week caliber is generated server-side with the entire seven-day board.
- Future cards and hidden grades do not enter browser-owned generator inputs.
- If a no-duplicate constraint makes a particular draw impossible, regenerate the week rather than weakening a grade-band rule.

## Simulation audit

50,000 weeks were generated from the locked 112-player grading artifact with the no-repeat rule and up to 12 deterministic generation retries.

| Caliber | Weight | Generation failures | Avg card grade | Lowest observed | Avg trait spread | Avg sub-70 cards/week |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Premium | 15% | 0 | 92.58 | 84.0 | 13.18 | 0.00 |
| Standard | 60% | 0 | 88.47 | 78.0 | 18.01 | 0.00 |
| Grinder | 20% | 0 | 82.29 | 70.0 | 20.47 | 0.00 |
| Chaos | 5% | 0 | 86.48 | 52.0 | 26.54 | 0.70 |

Across all 50,000 simulated weeks:

- no generation failures after retry;
- no duplicate quarterback inside a generated week;
- Premium, Standard, and Grinder produced zero sub-70 cards;
- true low-end cards appeared only in the 5% Chaos caliber;
- Standard remains the dominant experience.

## Economy / completion handoff

The downstream six-player economy calibration is now complete:

- $40 bankroll.
- One free pass per trait for the week.
- After that trait's pass is used, later offers for the still-unfilled trait require at least a $1 bid.
- Exactly four auctions remain on every day; there are no makeup cards.
- Completion-preserving bid validation must protect at least $1 for each trait that would remain unfilled under every possible set of today's wins.
- Full-participation simulation completed all six four-trait rosters in 100% of tested weeks.

See `docs/nfl-build-qb-weekly-economy-audit.md`.

## Runtime boundary

This remains calibration/design work rather than a live Weekly cutover.

Runtime implementation must reuse the existing sealed-bid Weekly architecture, repair Dan Fouts's canonical identity in the runtime implementation, preserve the existing field-lock behavior, and keep future cards / grades server-owned.
