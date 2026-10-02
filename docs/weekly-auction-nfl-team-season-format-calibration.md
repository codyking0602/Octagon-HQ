# Weekly Auction — NFL Team-Seasons format calibration

## Scope

This records the locked format calibration for the proposed NFL Weekly Auction subject:

**Best NFL Team-Seasons Since 2000**

Population and hidden grades are owned by `nfl-best-teams-grading-v1.json`. The six normal-day theme generator is documented separately in `weekly-auction-nfl-team-season-themed-generator-audit.md`.

This remains a staged implementation until the subject is wired into the live Weekly Auction rotation.

## Weekly arc

- **Days 1–6:** normal themed sealed-bid auctions.
- **Day 7:** four-card Wildcard replacement finale.
- **After Wildcard:** incomplete collections receive worst-unclaimed autofill from normal Days 1–6.
- **Next week:** the player Reaped on Day 7 receives the one-week bankroll penalty.

Day 7 replaces a normal auction day. It is not an eighth day and does not add another trivia/game requirement.

## Five-player normal-auction baseline

For the current five-player field:

- 4 team-seasons per normal day.
- 6 normal auction days.
- 24 normal lots.
- $50 starting bankroll.
- Best 4 team-seasons determine the final score.
- Maximum 2 normal-auction wins per day.
- Maximum 5 normal-auction wins per player for the week.

The five-team cap gives one real bench/upgrade slot while protecting enough unclaimed inventory for completion.

### Completion calibration

The five-player / 24-lot / max-five structure produced:

- pre-autofill player-weeks short of four: **0.007%**
- post-autofill player-weeks short of four: **0.000%**
- average normal wins/player: **4.55**
- average unclaimed normal teams/week: **1.25**
- average cash remaining after Day 6: **$2.06**
- exactly four normal wins: **44.91%**
- exactly five normal wins: **55.08%**

Autofill is therefore a safety net rather than a normal path to building the collection.

## Elastic normal supply

The subject should size future unrevealed normal supply to the active field while never rerolling an exposed card.

Current six-day baseline:

| Active players | Normal cards/day |
| ---: | ---: |
| 3 | 3 |
| 4 | 3, plus reserve capacity when needed |
| 5 | 4 |
| 6 | 5 |
| 7 | 6 |
| 8 | 7 |

The invariant matters more than the table: enough normal inventory must remain to complete every active player's best-four collection under the max-five ownership cap.

## Themed normal days

Normal themes create identity but do **not** force hidden grade shapes.

Current theme families include:

- Division Spotlight
- Season Spotlight
- Era Spotlight
- Rivalry
- Franchise History
- Great Teams That Fell Short
- AFC vs NFC
- Open Field

Only today's theme is revealed. Future themes remain server-owned.

## Day 7 Wildcard board

Day 7 reveals **4 Wildcard team-seasons before any player chooses entries**.

The player can therefore compare the visible Wildcards with the collection they already built and decide how aggressively to participate.

Wildcard rules:

- four visible Wildcard team-seasons;
- maximum one Wildcard claim per player;
- Wildcard is upgrade-only and cannot fill an empty collection slot;
- player ranks only the Wildcards they would accept;
- player then chooses **0–5 entries**;
- money is not bid on Wildcard Day.

The approved four-card quality shape is approximately:

- **90.5**
- **89.0**
- **87.5**
- **85.5**

Those are calibration targets, not fixed slot grades. Cards are shuffled and selected with natural variation. The board should average roughly **88.0–88.5**, slightly below the 200-team pool mean of **88.99**, because the four-choice replacement structure is already valuable.

A 30,000-week themed-board audit and separate Wildcard simulations showed that four elevated Wildcards would rewrite too much of the first six days. The current four-card calibration keeps Day 7 important without making it the whole week.

## Literal ticket system

Entries are literal weighted-wheel tickets.

Priority weight is exactly the number of entries:

| Entries | Priority tickets | Reaping tickets |
| ---: | ---: | ---: |
| 0 | 0 | 0 |
| 1 | 1 | 1 |
| 2 | 2 | 2 |
| 3 | 3 | 3 |
| 4 | 4 | 4 |
| 5 | 5 | 5 |

There is no triangular Danger formula and no hidden personal percentage schedule.

Example: if four players each choose four entries, the wheel contains 16 equal tickets. Each player owns **4/16 = 25%** of the first Priority spin and **25%** of the separate Reaping spin.

Five entries never guarantees a result. It only increases the player's share of both wheels.

### Zero entries

**0 entries = 0 upside and 0 Reaping risk.**

A player with zero entries:

- is absent from the Priority wheel;
- cannot claim a Wildcard;
- is absent from the Reaping wheel;
- cannot receive the next-week bankroll penalty from that finale.

Passing is a real strategic choice.

## Priority wheel

After entries lock:

1. build the Priority wheel from every player with 1–5 entries;
2. spin using linear ticket weights;
3. persist the winner as Priority #1;
4. remove that player from the wheel;
5. spin again from the remaining entrants;
6. continue until every entrant has a persisted Priority order.

Claim resolution follows that order.

For each player, the engine checks the ranked acceptable Wildcards in order. Already-claimed cards are skipped. A player can receive at most one Wildcard.

The draw order is persisted server-side. Refreshing the app cannot reroll it.

## Reaping wheel

After Priority / claim resolution, run a **separate** wheel using the same entry counts.

Important:

- all players with 1–5 entries are eligible;
- a player can be Reaped even if they failed to win a Wildcard;
- players with 0 entries are excluded;
- exactly one player is Reaped when at least one player entered;
- the Reaping result is persisted server-side.

The same aggression therefore buys more Priority chance and more downside exposure.

## Reaping consequence

The Reaped player receives a **one-week -$5 starting-bankroll adjustment for the next calendar Weekly Auction**.

For the approved $50 NFL Team-Seasons bankroll, that means:

> **$50 normal start → $45 next week**

The implementation stores the consequence as a one-week `-5` adjustment so the penalty remains meaningful if the following rotation subject has a different normal starting bankroll.

The penalty never compounds within one week. A repeated Reaping in consecutive finales creates another single -$5 adjustment for the next week, not a -$10 stack.

No immunity is granted after a Reaping. Immunity would let a protected player safely max five entries the following week.

## Full repeated-week simulation

The complete five-player system was simulated across **50,000 consecutive weeks** with the four-card Wildcard structure and carry-forward bankroll consequence.

Results:

- Wildcard board average: **88.12**
- Wildcard claims: **2.86/week**
- player-weeks with a Wildcard in the final scoring four: **57.2%**
- weekly winner changed by Wildcard: **24.1%**
- top-two group changed: **35.3%**
- average entries/player: **3.37**
- entry distribution:
  - 0: **12.3%**
  - 1: **6.2%**
  - 2: **10.0%**
  - 3: **13.1%**
  - 4: **20.2%**
  - 5: **38.1%**
- final incomplete collections: **0%**

Starting the following normal auction with the penalty was materially meaningful in the model:

- $50 starting bankroll modeled normal-auction win rate: **21.8%**
- $45 starting bankroll modeled normal-auction win rate: **12.6%**

A separate 200,000-week Reaping stress test found the same player was Reaped again the following week about **23%** of the time. The penalty still remained a single one-week -$5 adjustment.

## Completion autofill

Wildcard is an upgrade mechanism, not a completion mechanism.

After Wildcard resolution:

1. identify every participant still below four normal teams;
2. consider only unclaimed team-seasons that actually appeared during Days 1–6;
3. assign the worst hidden-grade eligible unclaimed team first;
4. continue until every player has four teams.

Do not use unseen emergency cards. Do not use unclaimed Day 7 Wildcards for completion.

## Server-owned information

Before resolution, the client may see:

- the four Wildcard team-seasons;
- its own 0–5 entry selection;
- its own ranked acceptable Wildcards.

Before resolution, the client must **not** see:

- other players' entry counts;
- Priority draw order;
- Reaping result;
- hidden grades;
- future themes.

After resolution, the persisted Priority wheel result, claims, and Reaping result may be shown for the finale presentation.

## Runtime boundary

The Wildcard engine migration supplies the dormant server-owned data model and resolver. The next integration step is to wire the NFL Team-Seasons subject population, six normal-day generator, normal bidding/final scoring, Day 7 state, and starting-bankroll adjustment into the shared Weekly Auction router.
