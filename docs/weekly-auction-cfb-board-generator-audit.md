# Football Weekly Auction — CFB board generator audit

## Scope

This is the calibration record for the first Football Weekly Auction subject: **Best CFB Teams Since 2000**.

It builds on the locked 233-team grading universe from the grading audit. It does **not** implement the live Weekly Auction lifecycle yet.

## Locked weekly structure

- Seven days.
- Three team-seasons per day.
- Twenty-one total auction subjects.
- One shared $40 bankroll.
- Daily boards lock at midnight America/Chicago.
- Players may bid on any or all three daily subjects.
- The sum of active bids for that day may not exceed remaining bankroll.
- Losing bids cost nothing.
- Highest bid wins.
- Bid tie: fewer subjects already won, then less money spent, then random.
- Best three owned team grades determine final score.
- Final-score tie: lower total cost of the three scoring teams, then random.

## Weekly theme mix

The hidden week is generated in advance from this theme inventory, then shuffled:

- SEC — 2 days / 6 subjects.
- Big Ten — 2 days / 6 subjects.
- Big 12 — 1 day / 3 subjects.
- ACC — 1 day / 3 subjects.
- Wildcard — 1 day / 3 subjects.

Wildcard draws from Notre Dame plus the audited national wildcard inventory.

Conference bucket is a board mechanic. It does not rewrite historical conference membership.

## Hidden daily shapes

The generator does not use a fixed “elite + great + great” template.

| Hidden shape | Weight | Intent |
| --- | ---: | --- |
| Wide | 19% | Meaningful top-to-bottom separation |
| Compressed | 18% | Three teams packed closely together |
| TopHeavy | 17% | Two premium options plus a cheaper lower tier |
| MiddleHeavy | 20% | Good teams without an automatic superstar |
| Trap | 14% | A more recognizable program can grade below a less obvious option |
| Chaotic | 12% | Intentionally irregular quality spacing |

Additional protections:

- The same hidden shape may not appear three days in a row.
- No school may appear twice in the same week.
- No team-season may repeat in the same week.
- Future daily boards remain server-owned when runtime is implemented.
- Hidden grades never become client-owned generator inputs.
- The generator is allowed to choose from grades; it may never alter them.

The only week-level quality guardrail is intentionally broad: at least one and no more than six subjects graded 96+ among the 21. This prevents extreme all-flat or all-superstar weeks without making the daily pattern inferable.

## Board simulation

30,000 generated weeks were audited.

Results:

- School-repeat weeks: **0**
- Longest same-shape streak: **2**
- Average daily grade spread: **4.17 points**
- Tight days, spread <= 2: **27.9%**
- Wide days, spread >= 6: **25.5%**
- Notre Dame appeared somewhere in **99.9%** of weeks

Realized hidden-shape shares:

| Shape | Realized |
| --- | ---: |
| Wide | 19.8% |
| Compressed | 17.1% |
| TopHeavy | 17.7% |
| MiddleHeavy | 18.8% |
| Trap | 13.5% |
| Chaotic | 13.0% |

Realized subject-grade mix:

| Grade band | Share |
| --- | ---: |
| 97–100 | 5.4% |
| 94–96.5 | 22.0% |
| 91–93.5 | 35.3% |
| 88–90.5 | 32.5% |
| 86–87.5 | 4.7% |

That distribution is intentionally middle-heavy. Most auction decisions should be about value among good teams, not simply locating the obvious all-time team.

## $40 market validation

The calibrated boards were also tested against the locked multiplayer market model.

### Four players

Across 8,000 simulated weeks:

- Players finishing with fewer than three teams: **0.00%**
- Average teams won: **5.25**
- Average bankroll remaining: **$8.42**
- Average largest single-player share of the 21 subjects: **30.9%**
- Unbid subjects: **0.02%**
- Tied high bids: **25.5%**

### Five players

Across 8,000 simulated weeks:

- Players finishing with fewer than three teams: **0.18%**
- Average teams won: **4.20**
- Average bankroll remaining: **$10.76**
- Average largest single-player share of the 21 subjects: **25.6%**
- Unbid subjects: **0.00%**
- Tied high bids: **23.1%**

Whole-dollar bids create ties often enough that the locked catch-up tiebreaker materially helps distribution. The simulation supports keeping the $40 bankroll and the existing tie rule.

## Runtime boundary

This calibration PR is intentionally not the live feature.

The later runtime implementation must:

- generate and persist the complete seven-day board server-side;
- reveal only the current day’s three subjects;
- use America/Chicago for midnight locks;
- prevent future-board leakage through browser payloads;
- keep grades server-owned;
- enforce combined active daily bids <= remaining bankroll transactionally;
- resolve all three daily lots independently at lock;
- persist tie-resolution inputs so results are deterministic and auditable;
- integrate the Daily Challenge gate without duplicating the existing 1v1 Draft Room backend.

## Status

**Generator calibration complete.**

The board mix and $40 economy are ready for implementation.
