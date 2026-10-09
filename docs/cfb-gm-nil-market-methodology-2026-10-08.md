# CFB The GM — first-party college market gameplay prices (October 8, 2026)

The game has a 7-player draft and two shared pricing modes: Powerhouse $11m and Builder $7.5m. Every monetary amount is an **Octagon game estimate**, not a reported NIL contract, salary, private payment, or independently published athlete valuation.

## Method and independence

- Inputs are 2026 CFB player positions, the already manually curated Wheel school depth-chart shortlist (role rank only), AP Top 25 school ordering, and editorial **game prominence** for specific familiar football athletes. Player identities remain distinct from any money source.
- **No third-party NIL valuation numbers, ranks, provider feed or published athlete NIL dollar estimates are copied or embedded** in the app or its source ledger. Independent school-reported football results are used for assessing on-field prominence.
- First-party role baselines are QB $1.50m, RB $600k, WR $845k, TE $430k, Front Seven $870k, Secondary $615k. A shortlist role discount (100%, 78%, 66%, 55%, 47%, 40%, 35%) and school-context factor (top 7: 116%, 8–16: 104%, remaining: 93%) shape the baseline.
- 21 named editorial premium anchors represent especially recognizable college talent; eight were added in this license-safe revision. **They are fictional game-economy opinions**, never quotes of external valuations. Named premiums have medium editorial confidence; generic role/school estimates low individual-price confidence.
- Prices are rounded to $25k increments, minimum $150k, with a provisional +10% Year 2 baseline. Player performance/development outcomes and school salary budgets are **not** inputs to the market price. HQ current grades are completely independent of the price.

## Validation

- The research ledger has all 468 development studies but no third-party NIL valuation metadata. The generated runtime excludes provider NIL data and the generator rejects accidental reintroduction.
- The CFB GM save version is changed to v7 because prices changed. Previous version save objects are rejected, not silently repriced or rewritten.
- Verify project-native TypeScript, Vitest, production build, 2-budget 2-season pathways, injury/eligibility departures and affordability on the exact integration head before any merge.
- Do not alter authoritative Wheel grades, the NFL GM, or production as part of NIL game-price calibration.
