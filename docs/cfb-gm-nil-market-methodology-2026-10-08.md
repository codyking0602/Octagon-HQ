# CFB The GM — NIL market estimation (2026-10-08)

This game needs a balanced seven-player market in which Powerhouse ($11m) sometimes makes compromises and Builder ($7.5m) has meaningful affordable choices. Both modes always share the exact same valuations.

## Source distinction

- **Not actual private deal information:** a player's NIL is generally not public as an audited cash contract. No number here is represented as a verified payment or exact contract.
- Current college market reference: [On3 NIL Rankings](https://www.on3.com/nil/rankings/player/college/football/), especially reported/prominence-based estimates at the top of the college football market. These are contextual benchmarks, **not** a direct lookup of contracts.
- Role/identity authority: the manually audited Octagon 2026 CFB Wheel school depth-chart shortlist and 2026 AP Top 25 scope.
- High-profile subjective anchors are independently reviewed market assumptions. They never read, derive from, or modify a player's current HQ grade.

## Implementation

- footballCfbGmNilMarket.ts provides position-specific market baselines, role-order discounts, modest school-context adjustments, and separate named high-prominence anchors.
- Numeric amounts are game-market estimates rounded to $25k, not source-verified paid amounts.
- Static Year 2 baseline uses 10% market growth; eventual retention/repricing needs to depend on actual seeded development and portal market conditions, not this alone.
- Prices are independent of current HQ grades, future upside probabilities, draft eligibility, and budget mode.
- Confidence is **medium** for manually considered prominent anchors, **low** for role/school formulas. Neither is a verified private contract.

## Outstanding audit gates

The first market formula is an integration input, **not** a claim that 468 players have individualized NIL market evidence. Before owner-release signoff, run thousands of full Powerhouse/Builder builds, verify every spin's legal affordability, examine the top and bottom price ladders, revise the anchor set where researched market evidence demands it, and audit player-specific roles and market premium with sources.
