# CFB GM 2026 NIL — 468-player isolated research handoff

**Status:** Full **468/468** 2026 candidates have explicit Year 1 dollar estimates in the data-only research ledger. This is **not** a live gameplay update, a publication of confirmed NIL contracts, or a release recommendation.

**Branch:** `research/cfb-gm-2026-nil-468-20261009`
**Ledger:** `data/curated/football/cfb/gm-2026-nil-valuation-research.json`
**Population authority:** 468 distinct IDs across 25 teams, from `data/curated/football/cfb/gm-2026-classification-evidence.json`, main resolved at branch creation to `b1d1fc3a61a6e8434769e018295091d9f62e8768`.

## Coverage and confidence

| Evidence class | Players | Confidence | Interpretation |
| --- | ---: | --- | --- |
| On3 football board restored from Git | 48 | Medium | Historical October 8, 2026 third-party valuation estimates, exact identity and rank linked |
| Additional On3 individual profiles restored from Git | 2 | Medium | Player-specific published market estimates, not audited compensation |
| Other published individual modeled values (The NIL Standard) | 338 | Low | Distinct 2026 player-by-player third-party **modeled** values, school/player checked, not actual contracts |
| Individual editorial estimates using sourced football biographies | 80 | Low | No usable verified market figure established; each has its own official source evidence and rationale |
| **Total** | **468** | | 468 complete proposed Year 1 records, no grade-based or budget-based prices |

**Recovered historical commits:** `6528dfbcbcabf2c99ceae9631a9a67da115b719b` contains the 48 original `nilMarketEvidence` On3 entries; `2cd3a5f26ff3f39ef2c63bbda878a6b5736e546f` contains 36 additional individual comparison records, including 2 distinct On3 player pages. The historical entries had been deliberately removed from the current main gameplay economy. Restoring them here **does not** restore them to production.

**Primary research sources:**
- On3 football NIL valuations (historical 2026 ranking and player profile evidence): https://www.on3.com/nil/rankings/player/college/football/
- The NIL Standard 2026 football per-team/player model and historical analyses: https://thenilstandard.com/football/teams and individual cited URLs in the ledger.
- Official 2025–26 school biographies/rosters, separately recorded in `footballEvidenceSources` for every player. These support the actual player's career history, role, recent production, awards, starts, injuries, transfer context and exposure—not an independently verified cash NIL payment.

**Precedence and estimation:** Preserved original On3 published deal-informed **estimates** when identity-matched; used separately published individual model values otherwise. On3 and The NIL Standard often report different values; both are recorded in `comparatorSources` when observed. Published-model figures are rounded to $25,000 for the proposed game price while the exact raw published dollar value is retained for research review. For the remaining 80, low-confidence Year 1 editor estimates use the player's own official biography and distinct on-field facts, position demand, honors, production, role, injury status and transfer circumstances. These fallback judgments use a documented, reproducible position-market reference and football evidence signals; they are **not** claimed to be published deal prices or independently negotiated market contracts. No player was assigned a value using their HQ grade, development odds, salary-cap mode, player rating, or roster affordability. No price fitting, artificial equalization or budget caps.

### Example market disagreements — review, do not silently average

| Player | Research ledger's On3-preferred estimate | Alternative published modeled figure | Difference |
| --- | ---: | ---: | ---: |
| Arch Manning (Texas) | $2.50M | $6.80M | $4.30M |
| Trinidad Chambliss (Ole Miss) | $5.00M | $6.00M | $1.00M |
| Jayden Maiava (USC) | $1.50M | $2.50M | $1.00M |
| Mark Bowman (USC) | $1.00M | $2.00M | $1.00M |

Those are **different third-party estimates**, not verified payments. The choice deliberately permits potential bargains and overpriced players. Do not use the HQ rating to decide which publisher must be right; compare the source snapshot and the player's actual NIL exposure and football reputation on their own merits.

## What the integration owner receives

Each `records[]` entry has the **canonical 2026 player ID**, team, name, position group, **Year 1 USD amount**, estimation kind, research date, explicit confidence, exact published market value if available, `primaryMarketSource` provider/link/source date, historical On3 rank if present, alternative source comparison(s) where found, individualized `marketRationale`, and `footballEvidenceSources`. No Year 2 price is imposed; model Year 2 separately as already approved.

**Release and reuse rights are not cleared.** The NIL Standard expressly says that product/application/internal-dataset incorporation, bulk collection and redistribution require a separate license: https://thenilstandard.com/data-use . Attribution alone is insufficient. On3's figures also require a specific reuse review. This data-only PR should **not** be merged as a ready-to-publish provider feed or plugged into runtime without that rights check. If use is not permitted, replace the third-party source-specific prices with genuinely independent player market research rather than obfuscating or lightly perturbing the copied numbers. The 80 editorial estimates are distinct and transparently labeled.

## Exact integration handoff / guardrails

1. The sole CFB GM integration owner reviews all 468 IDs and the 80 low-confidence player estimates, the largest provider disagreements, source recency, valuation-use rights, and approved handling of published valuation numbers. Do not treat valuation estimates as disclosed contracts.
2. **Only after review/authorization**, prepare a **separate** integration PR to project approved amounts into CFB GM's existing runtime pricing system; preserve the established player IDs, real identity/source links, HQ grades, current NFL GM and Wheel. Do not rewrite gameplay in this research PR.
3. Verify that the same immutable Year 1 number applies to both Powerhouse and Builder and that future independent Year 2 rules do not retroactively rewrite 2026 published values. No budget-driven fitting. Run the full 468-ID assertions, price/economy simulations, CFB parity tests, typecheck and production build on the **exact integration PR head**. Do not merge until green and owner-authorized.
4. This research PR intentionally stops **before** gameplay changes, CI-driven production release, merge, and live verification. Its PR should remain open as a documented, data-only source handoff.

## Research-ledger self-check

- 468 IDs, 25 schools, no duplicate ID
- 468 finite positive Year 1 USD estimates, all with as-of date, confidence, player-specific rationale and independent football source
- 388 published-valued cases and 80 explicitly estimated cases — no unknown/unpriced entries
- Range **$50,000–$6,500,000**, median **$600,000**; no game-cap rescaling
- Main, live runtime, NFL GM, Wheel grades, and gameplay components not modified by this branch
