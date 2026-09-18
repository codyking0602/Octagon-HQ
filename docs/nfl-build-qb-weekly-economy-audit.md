# NFL Build a QB Weekly — economy and completion audit

## Scope

This document defines the six-player economy and completion rules for NFL Build a QB Weekly after the 112-QB grading and 28-card generator calibration.

It supersedes the earlier carry-forward / makeup-card concept.

## Locked field / supply

- Six locked Weekly participants.
- Four required traits per participant: Arm, Accuracy, Processing, Mobility.
- Seven days.
- Exactly four auctions every day: one per trait.
- Exactly 28 auctions for the week.
- Exactly seven opportunities per trait.
- A player who wins a trait is no longer eligible to bid on that trait.
- No extra makeup auctions are generated.

Six players require 24 total trait wins. The four extra cards are exactly one spare opportunity per trait.

## One-pass-per-trait rule

Each participant receives **one free pass for each trait for the entire week**.

For an unfilled trait:

- if that trait's pass is unused, the player may submit $0 and consume the pass;
- once that trait's pass has been used, every later daily offer for that still-unfilled trait requires a bid of at least $1;
- after the player wins the trait, no further bid is allowed for that trait.

A missed day consumes the unused pass for each still-unfilled trait shown that day. If the pass was already used, missing the day forfeits the product completion guarantee for that participant; the system does not place an automatic bid on the player's behalf.

## Why this guarantees enough supply

For any one trait there are seven daily auctions and six players.

A zero-award auction can happen only if every player who still needs that trait chooses to use the free pass on that same day. That consumes every remaining player's pass for the trait.

Therefore, assuming the remaining participants continue submitting on later days, a second zero-award auction for that trait cannot happen: every remaining player must bid at least $1.

So each trait has:

- at most one intentionally unclaimed auction;
- at least six awarded auctions across seven days;
- enough supply to fill all six participant slots.

This preserves the clean four-card daily board and removes the possibility of a 10+ card final day.

## Example

Day 1:

- Arm — Aaron Rodgers
- Accuracy — Tony Romo
- Mobility — Russell Wilson
- Processing — Kirk Cousins

If all six players bid only on Rodgers:

- Arm awards one winner.
- All six Accuracy passes are consumed.
- All six Mobility passes are consumed.
- All six Processing passes are consumed.

From Day 2 forward, every player still missing Accuracy, Mobility, or Processing must bid at least $1 on those daily traits.

No makeup cards are needed. The normal six remaining daily opportunities are enough to award those six slots.

## Bankroll

**Weekly bankroll: $40 per participant.**

Rationale:

- four required traits implies a clean $10-per-trait average budget;
- it matches the established Build a QB $40 mental model;
- it keeps the weekly economy familiar with the current Football Weekly Auction;
- simulation did not show a completion advantage from simply inflating the bankroll to $50 or $60;
- current live CFB Weekly winning bids are already operating near the same per-win scale.

Observed current CFB Weekly through the available resolved days of the 2026-09-15 week:

- winning prices: $25, $10, $2, $6, $19, $13, $3, $3, $6;
- average resolved winning price: about $9.7.

The six-player Build a QB simulation at $40 produced an average winning price of about $9.6.

## Completion-preserving bankroll rule

Losing bids cost nothing. A participant may commit the full remaining bankroll across today's distinct traits **only when every possible set of wins still leaves a viable path to complete all four traits**.

For any possible subset of today's wins:

> remaining bankroll after those wins must be at least $1 for every trait that would still be unfilled.

Examples with $40 and four empty traits:

- $37 Arm / $1 Accuracy / $1 Processing / $1 Mobility is legal.
- $40 Arm / $0 / $0 / $0 is not legal: winning Arm would leave $0 for three required traits.
- $20 / $10 / $5 / $5 is legal: winning all four completes the roster; winning any smaller subset leaves enough money for the remaining traits.
- Once only one trait remains, the player may spend the entire remaining bankroll on it.

This is the four-trait analogue of the existing Weekly Auction completion-preserving bankroll helper. It should reuse that architecture rather than introducing a duplicate money system.

## Six-player simulation

The one-pass-per-trait rule was simulated over 5,000 generated weeks for each bankroll and participation assumption.

### Full daily participation

| Bankroll | All 6 complete | Individual completion | Avg spent | Avg left | Avg winning bid |
| --- | ---: | ---: | ---: | ---: | ---: |
| $40 | 100.0% | 100.0% | $38.3 | $1.7 | $9.6 |
| $50 | 100.0% | 100.0% | $47.9 | $2.1 | $12.0 |
| $60 | 100.0% | 100.0% | $57.4 | $2.6 | $14.4 |

### 97% daily participation

| Bankroll | All 6 complete | Individual completion |
| --- | ---: | ---: |
| $40 | 99.4% | 99.9% |
| $50 | 99.5% | 99.9% |
| $60 | 99.4% | 99.9% |

### 90% daily participation

| Bankroll | All 6 complete | Individual completion |
| --- | ---: | ---: |
| $40 | 95.5% | 99.2% |
| $50 | 96.0% | 99.3% |
| $60 | 95.9% | 99.3% |

The slight completion loss under missed-day scenarios comes from absence, not insufficient auction supply or bankroll. Increasing bankroll does not materially solve it.

## Rejected makeup-card model

A deficit-based makeup-card model was also stress-tested.

When users bid on at least two cards per day, it was usually manageable. But under a plausible extreme strategy where each participant targets only one daily card, the model generated approximately 14 makeup auctions per week and pushed the busiest day to roughly 11 cards on average.

That reproduces the exact failure mode identified during product review: a late-week board can balloon into 10+ options.

The one-pass rule is therefore preferred because it keeps scarcity, preserves player agency, guarantees clean normal supply for active participants, and keeps every day at four auctions.

## Runtime boundary

This remains calibration/design work only.

Before live wiring:

1. repair Dan Fouts's canonical identity in the runtime implementation; Jim Kelly already resolves through the Pro Hall historical seed;
2. implement the one-pass-per-trait state and validation in the existing Weekly backend;
3. generalize the current completion-preserving bankroll helper from three generic teams to four required trait slots;
4. verify six locked participants and late-join exclusion;
5. test missed-day/pass semantics;
6. wire the 112 canonical grades and 28-card generator;
7. exact-head CI must be green before merge.
