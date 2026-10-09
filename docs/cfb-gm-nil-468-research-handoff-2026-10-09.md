# CFB GM — 468 individual 2026 Year 1 NIL valuations (RESEARCH ONLY)

**Date:** October 9, 2026  
**Research branch:** `research/cfb-gm-2026-individual-nil-valuations-20261009`  
**Snapshot base:** `b1d1fc3a61a6e8434769e018295091d9f62e8768` (main when research branch was created)  
**Source roster:** `data/curated/football/cfb/gm-2026-classification-evidence.json`  
**Deliverable:** `data/curated/football/cfb/gm-2026-nil-individual-valuations.json`

## Handoff and scope

The research task is **complete: 468 distinct athlete IDs and prices / 468; 25/25 schools**.

- **48/48** preexisting On3-ranked player NIL records recovered from the historical Oct. 8 calibration file at Git commit `2cd3a5f26ff3f39ef2c63bbda878a6b5736e546f`. Each record's historical rank, dollar estimate, source/date and confidence remains present separately as `recovered20261008NilReference`, even where its amount was updated.
- **52** roster athletes matched by exact identity to the On3 football board updated Oct. 9, 2026; some overlap the recovered 48. **Two additional** previously evaluated or newly checked direct athlete profiles are separately sourced: Missouri RB Ahmad Hardy and Georgia CB Ellis Robinson IV.
- **60** distinct players therefore use an individually identifiable, dated On3 published valuation reference (52 current board, two direct profiles and six additional archived ranked entries). Remaining **408** have manually reviewed, player-specific Octagon market estimates. Every non-On3 estimate has its own explicit valuation rationale, separately linked player football biographies / evidence and clear low-confidence labeling.
- **All 468** have an evidence narrative, player-specific external football source URL(s), as-of date, dollar value, source category, confidence, price rationale and uncertainty statement. No player is assigned an unreviewed generic school/rating/budget price.
- All amounts are *Year 1 (2026)* in integer USD. **No 2027 NIL escalation or gameplay contract model is supplied** by this research-only PR.
- No Wheel ratings, HQ grades, simulated talent/development outcomes, roster chemistry weights, salary caps, or Powerhouse/Builder budgets were consulted in assigning prices. The game can have genuine expensive underperformers and inexpensive outperformers.

## Research method

1. Use the canonical **468 identity / 2026 roster / source biography** records already individually researched and preserved in current main. Each athlete has unique `schoolId|normalizedName` identity, factual 2025/2026 usage/awards/injury/transfer context and linked official football bios in `reviewedFootballEvidence`.
2. Restore historic source NIL estimates instead of replacing them with a synthetic formula. For 2026-10-09 ranked On3 values, use the most recent matched observation; for six unmatched names, retain the dated 2026-10-08 ranking as historic market evidence rather than claim it is a current ranking.
3. Preserve two direct player-profile checks, including **Ahmad Hardy $1.00M** (On3 profile marked *Confirmed Deal*, updated October 6) and **Ellis Robinson IV $750K** (On3 profile marked *Market-based*, updated October 9). No contract text or actually paid cash was independently verified; these are the provider's published amounts and classifications.
4. For each of the 408 without a player-specific confirmed/reliable public valuation, make a separate editorial judgment using **that athlete's** actual current production, award distinction, starting share, college experience, transfer history, injuries, emerging role, and visibility. Broad QB/skill/defensive portal price reporting supplies *market context*, not a hidden price algorithm. Each athlete's case-specific notes and football source URLs reside in the JSON. Confidence remains **low** because football performance does not verify NIL cash payments.
5. Keep the real source vs. estimate distinction explicit in `publishedNilReference`, `recovered20261008NilReference`, `sourceBasis`, `confidence`, `uncertaintyNote`, and `marketReasoning`. On3-marked profile `Confirmed Deal` is not, by itself, an independently audited pay statement.

### Sources and the previously considered third-party publisher

- [On3 college-football NIL valuation board](https://www.on3.com/nil/rankings/player/college/football/) — 2026-10-09 observation for 52 roster athletes and prior archived 2026-10-08 record for 48, with historical rank and original amount retained separately.
- [On3 valuation methodology](https://www.on3.com/nil/news/about-on3-nil-valuation-per-post-value/) — estimated dollar figures / deal-based sourcing need to be distinguished from confirmed underlying contract payments.
- [On3 Ahmad Hardy player profile](https://www.on3.com/rivals/ahmad-hardy-240668/nil/) — $1.00M, provider label *Confirmed Deal*, page updated October 6, 2026.
- [On3 Ellis Robinson IV player profile](https://www.on3.com/rivals/ellis-robinson-iv-41558/nil/) — $750K, provider label *Market-based*, page updated October 9, 2026.
- [CBS Sports: 2026 transfer-portal position price ranges](https://www.cbssports.com/college-football/news/what-the-transfer-portal-costs-now-position-by-position-price-ranges-amid-a-market-surge/) — wider position compensation ranges based on coach/GM/agent reporting, never presented as a specific athlete's NIL offer.
- [Opendorse: 2026 annual NIL report](https://biz.opendorse.com/annual-nil-report-2026/) — general market context.
- [The NIL Standard data use policy](https://thenilstandard.com/data-use) — this separate publisher's *36 previously evaluated independent player estimates* were found in the older PR history but **were not reintroduced** into this research file. Its policy requires commercial use / redistribution licensing; these 36 are not treated as retained licensed-source valuations. Its published methods were examined only as industry context.

**Source-use gate — mandatory, not a minor note:** The historical integration PR #1798 removed third-party published amounts from the live game over data rights concerns. [On3's terms](https://www.on3.com/page/terms-of-service/) limit website content use to personal/noncommercial purposes without written permission, and explicitly constrain extraction/redistribution/commercial exploitation. The NIL Standard independently requires a license to put its figures in a product. **This research-only file must not be wired into the commercial/live game or merged into production until source terms/permissions and independent replacement options have been reviewed and approved by the integration owner.** Attribution alone does not resolve licensing. A legitimate independent editorial estimate is not a representation of a player's audited NIL payment.

## Distribution and realism checkpoints

| Group | Athletes | Mean 2026 Year 1 market estimate |
|---|---:|---:|
| Quarterbacks | 25 | $2.536M |
| Running backs | 57 | $0.721M |
| Wide receivers | 86 | $0.745M |
| Tight ends | 28 | $0.541M |
| Front Seven | 145 | $0.694M |
| Secondary | 127 | $0.646M |
| **Total** | **468** | **$0.783M overall** |

Range **$200,000–$6,500,000**; median **$625,000**. These descriptive outputs were computed **after** athlete-specific valuations. They were **not** used to force the salary data to game budgets.

Representative price checks:

| Athlete | Research Year 1 | Evidence/rationale |
|---|---:|---|
| Darian Mensah, Miami QB | $6.50M | On3 Oct. 9 rank 1, explicit player-specific valuation |
| Dante Moore, Oregon QB | $5.00M | On3 Oct. 9 ranked published estimate |
| Jeremiah Smith, Ohio State WR | $5.00M | On3 Oct. 9 ranked published estimate |
| Arch Manning, Texas QB | $2.50M | On3 Oct. 9 estimate despite prior first-party game prominence anchor of $4.20M |
| Ahmad Hardy, Missouri RB | $1.00M | Direct On3 Oct. 6 player profile, confirmed-deal-labeled valuation, rather than editorial $1.85M |
| Ryan Wingo, Texas WR | $1.00M | On3 rank-based estimate; current football production is a distinct source |
| Ellis Robinson IV, Georgia CB | $0.75M | Oct. 9 On3 individual market-based estimate, not forced up to our initial editorial $1.4M despite accolades |
| Bray Hubbard, Alabama S | $1.10M | Individual editorial estimate based on All-SEC / All-American evidence; no public NIL contract asserted |
| Holden Geriner, Pittsburgh QB | $0.65M | QB position context but very limited verified college starts; low-confidence editorial estimate |
| Tony Kinsler, Pittsburgh WR | $0.225M | One four-yard 2025 collegiate reception; high school profile not mistaken for college feature production |

These deliberate spreads avoid mapping money to HQ ratings, development potential, or a seven-player lineup budget.

## Reconciliation, validation and integration instructions

### Mechanical data gates already completed

- JSON parses; precisely **468 records** with **468 unique canonical IDs**, corresponding to source player records; all **25 schools** represented.
- All **48 archive source values** reconciled unchanged in separate original-provenance fields; all **60** source-based current chosen prices have individual date, URL and amount.
- All **408 unsourced-price cases** have individual written estimates with dated `marketCaseReviewAsOf`, source football bio, value, confidence and supporting narrative. **0 unsourced unreviewed or fallback-only cases**.
- Min/median/max, confidence flags, no claim of verified actual cash, and no gameplay/rating changes checked.
- Source roster blob remains identical after main advanced during parallel integration work.

### Integration owner — actions required, deliberately outside this PR

1. Inspect this file against the then-current main and current CFB GM player IDs; the source-of-truth Wheel grades, player identity, and any integration-owner changes retain priority.
2. Resolve **On3 commercial/source rights** before displaying, shipping, republishing, or automatically importing published provider values. The provider-derived portions may require permission or independent replacement; source attribution is not a substitute. Consider whether research-only source-derived entries may be made public.
3. After authorization, explicitly map the approved data-only Year 1 field into the *existing* CFB GM market/retention architecture with focused gameplay PRs; do not import this research file as an alternate ratings or 2027 valuation engine. Keep Year 1 prices the same in both budget modes.
4. Simulate Powerhouse and Builder, sample affordability/bargain/overpriced distributions, test player-role fidelity, portal-retention negotiation behavior, 2027 price recalculation independence, save compatibility and mobile parity on the **exact integration head**.
5. The integration owner alone controls main. **Do not merge this PR, deploy gameplay, or deploy third-party market numbers as part of research.** Owner-preview acceptance and deployment are separate decisions.

## Research-only result

This PR adds only the 468-player JSON ledger and this documentation; **zero gameplay/UI/runtime/tests** are modified. It is a completed **research handoff, not a deployment approval or a licensor permission assertion**.
