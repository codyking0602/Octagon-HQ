# Weekly Auction — NFL Team-Seasons format calibration

## Scope

This records the calibration work for the proposed NFL Weekly Auction subject:

**Best NFL Team-Seasons Since 2000**

It builds on the locked 200-team auction authority in `nfl-best-teams-grading-v1.json`.

This remains **calibration only**. It does not change the live Weekly Auction runtime.

## Weekly arc

The preferred structure is now:

- **Days 1–6:** normal themed auctions.
- **Day 7:** Wildcard replacement round.
- **After Wildcard:** incomplete collections receive worst-unclaimed autofill.

The goal is to preserve the crisp daily workload while giving the week a real finale.

## Five-player normal-auction baseline

For the current five-player field:

- 4 team-seasons visible per normal day.
- 6 normal auction days.
- 24 normal lots total.
- $50 bankroll.
- Best 4 owned teams determine the score.
- Maximum 2 wins per day.
- Maximum **5 normal-auction wins per player** for the week.

The five-team weekly ownership cap is important. It gives each player one genuine bench/upgrade slot while preserving enough unclaimed inventory to guarantee completion through autofill.

### 12,000-week completion simulation

Using the locked 200-team authority:

- Pre-autofill player-weeks short of four teams: **0.007%**
- Post-autofill player-weeks short of four teams: **0.000%**
- Average normal-auction wins/player: **4.55**
- Average unclaimed normal teams/week: **1.25**
- Average cash remaining after Day 6: **$2.06**
- Tied high bids: **21.6%** of normal lots
- Players finishing Day 6 with exactly 4 normal wins: **44.91%**
- Players finishing Day 6 with exactly 5 normal wins: **55.08%**

The result is the intended shape: nearly everyone earns four teams naturally, roughly half earn one extra upgrade team, and the worst-unclaimed autofill remains a true safety net rather than a routine roster-building path.

## Why the five-team ownership cap matters

With five players, four scoring teams each, and 24 normal lots, capping each player at five normal wins creates a mathematical completion guard.

If one player is short of four, the other four players cannot absorb enough of the 24 lots to eliminate every unclaimed team required to fill that deficit.

That means the rule:

> incomplete players receive the worst unclaimed team-seasons that actually appeared during the six normal auction days

can guarantee completion without inventing unseen emergency candidates.

## Elastic field sizing

The subject should not assume five players forever.

Normal-day supply must use the current **active** field, not a hard-coded launch field.

Base six-day supply target for this subject:

| Active players | Base normal cards/day |
| ---: | ---: |
| 3 | 3 |
| 4 | 3, with at least one extra reserve reveal during the six-day window when needed for completion capacity |
| 5 | 4 |
| 6 | 5 |
| 7 | 6 |
| 8 | 7 |

The core invariant is more important than the literal table:

- best 4 score;
- max 5 normal wins/player;
- enough total revealed normal inventory must remain available for worst-unclaimed autofill to complete every active player;
- future reserve cards may expand or contract;
- already exposed cards never reroll.

For 5 players, 4/day for six days is exactly the preferred calibrated shape.

## Shared Weekly Auction field behavior

This should become a base Weekly Auction standard rather than an NFL-only patch.

- Prebuild reserve inventory server-side.
- Never reroll a card already exposed.
- Let future unrevealed supply expand or contract with the active field.
- Keep a player eligible even if they miss a day.
- A player who misses two consecutive auction days stops counting toward future supply sizing until they return.
- Allow new entrants only through the existing early-week cutoff window; after cutoff, they wait for the next Weekly Auction.
- Each subject supplies its own `cards_for_active_field` / completion-capacity rule; the shared engine owns participation and reserve behavior.

## Themed normal days

Normal-day themes should create identity without forcing grade distributions.

Useful rotating theme families include:

- Division Spotlight
- AFC vs NFC
- Era day
- Playoff Story / Great Teams That Did Not Win It
- Rivalry / Franchise History
- Wildcard / mixed day

The theme controls **candidate eligibility**, not the hidden grade shape.

Future themes remain server-owned and unrevealed.

## Day 7 Wildcard

Wildcard is a one-for-one optional replacement round.

- Wildcard does **not** fill an empty collection slot.
- A player must already have a legitimate collection to use it.
- Maximum one Wildcard replacement per player.
- A claimed Wildcard team replaces one existing owned team.
- Money is irrelevant to Wildcard.
- Players rank the Wildcard candidates they would accept or pass.
- Players voluntarily submit 0–5 priority entries.
- More entries increase claim-order odds.
- The same entries also increase exposure to a separate danger draw.
- Final danger penalty is intentionally **not yet locked**.

The danger mechanic should stay inside Weekly Auction rather than altering unrelated Daily Challenge timers.

## Wildcard quality calibration

The locked 200-team pool has:

- mean hidden grade: **88.99**
- standard deviation: **4.79**

A full +1 SD Wildcard target would therefore average about **93.8**.

That is too strong.

### Initial four-card test

At five players, four Wildcard candidates produced too much rewriting of the first six days:

- +0.5 SD Wildcard average (~91.5): weekly winner changed about **38%**
- +1.0 SD Wildcard average (~94.0): weekly winner changed about **41%**
- at +1.0 SD, a Wildcard team appeared in roughly **79%** of player scoring fours

### Scarcer Wildcard test

Two Wildcard candidates produced a much healthier finale.

| Wildcard quality | Actual avg | Player-weeks with Wildcard in final four | Weekly winner changed |
| --- | ---: | ---: | ---: |
| Normal pool average | 89.0 | 36.5% | 24.5% |
| +0.25 SD | 90.0 | 38.8% | 28.6% |
| +0.50 SD | 91.5 | 39.9% | 35.2% |

### Current recommendation

For a five-player field:

- **2 Wildcard team-seasons**
- target board average around **+0.25 SD** above the normal pool, roughly **90.0–90.5**
- natural internal spread; do not force every Wildcard candidate to be elite
- one replacement maximum

The Wildcard is already structurally valuable because it is an optional replacement after six auction days. It does not need a full standard-deviation grade boost.

## Entry-risk observation

A weak flat danger penalty caused too many simulated players to simply max out at five entries.

The risk should therefore scale meaningfully with aggression.

A promising direction is:

- 0–5 voluntary entries;
- each entry improves priority odds;
- each entry also increases danger exposure;
- if a player is hit by the danger draw, the Weekly Auction penalty should scale with how many entries they submitted.

Example direction only, not locked:

- 1 entry -> small next-auction bankroll penalty
- 5 entries -> materially larger next-auction bankroll penalty

That preserves the intended Hunger Games decision: aggressive Wildcard pursuit should be a real strategic gamble, not an obvious max-entry button.

## Runtime boundary

Nothing in this document is live.

The live implementation should wait until:
1. the Wildcard danger penalty is locked;
2. the adaptive-field standard is generalized across Weekly Auction subjects;
3. themed board generation is validated against the 200-team authority;
4. exact-head CI is green.
