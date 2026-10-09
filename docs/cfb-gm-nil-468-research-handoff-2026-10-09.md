# CFB GM — all 468 individualized 2026 Year 1 NIL estimates

**Completed:** October 9, 2026  
**Research PR:** https://github.com/codyking0602/Octagon-HQ/pull/1816 (draft; do not merge)  
**Isolated branch:** `research/cfb-gm-2026-individual-nil-valuations-20261009`  
**Original main base:** `b1d1fc3a61a6e8434769e018295091d9f62e8768`  
**Valuation data:** `data/curated/football/cfb/gm-2026-nil-individual-valuations.json`  
**Canonical roster source:** `data/curated/football/cfb/gm-2026-classification-evidence.json`

## Completion and provenance reconciliation

**468 distinct player IDs valued out of 468 / 25 schools.** Every record has a player-specific dollar amount for **2026 Year 1**, a separate football/source-evidence note, source URLs, confidence, observation or case-review date, rationale, and uncertainty. This is an *estimated player NIL market price* data product, **not independently audited payments or verified employment contracts**.

| Source category | Unique athletes | Interpretation |
|---|---:|---|
| On3 college football 2026-10-09 top-ranked board (matching in-game identities) | 52 | Publicly published **estimated** NIL value on dated board |
| Archived On3 2026-10-08 ranking, not on the Oct 9 matched board | 6 | Retain dated historical published estimated value, not mislabelled current ranking |
| Individually verified On3 athlete NIL pages, not already ranked matches | 29 | Dated athlete-specific market estimate or provider-confirmed-deal **valuation** |
| Independent Octagon case-specific editorial estimates without athlete-specific published NIL value | 381 | Lower-confidence opinion derived from each named athlete's football facts and public NIL market context |
| **Total** | **468** | **87 unique On3-published estimated value references; 381 individually reviewed editorial valuations** |

**Original research restored:** all **48** Oct 8 On3-ranked player identity/amount/rank/provider/date/source entries recovered from Git history commit `2cd3a5f26ff3f39ef2c63bbda878a6b5736e546f`. Each of those original 48 records appears in `recovered20261008NilReference` *unaltered*, even if a fresher source/reference supplies the chosen Year 1 number. The current 58 rank-backed athletes comprise 52 current and six archived-only. Distinct direct profile URLs belong to the other 29 athletes. **No TNS modeled roster valuations were copied into this data.**

**What 2026 public values mean:** On3 calls some direct athlete entries *Confirmed Deal*, others *Market-based*. The former is a provider designation of its estimated valuation method: we have not independently verified full payment schedules, signed agreement values, or that the displayed number equals cash paid to an athlete. No source is presented as an audited compensation ledger. The separate `sourceBasis`, `publishedNilReference`, `confidence` and `uncertaintyNote` fields identify the distinction.

## Independent price research methodology (381 individual judgments)

1. Match the full 468 canonical 2026 roster and exact ID, school, role, and existing completed player-specific research in the current main classification ledger. Preserve source 2025-26 performances and individual official university/athlete bios. No duplicate or guessed identities.
2. Recover and check dated On3 rankings and direct named On3 profiles, prioritizing a correctly matched newer displayed value where one exists. Keep **original historic values** in a separate field instead of rewriting the old research.
3. For every one of the 381 without a separately usable published player valuation, manually consider that named player's actual college role and starts, quantified production, verified conference/national awards, transfers, injury/inactive periods, true freshman college sample, recruiting visibility and broad transfer-portal market context. Record a **specific case decision** in `marketDecisionNote` and `marketReasoning`, with the original university football evidence in `reviewedFootballEvidence`. These figures are **editorial estimates** (low confidence), not reported NIL offers.
4. Compare price spread **after** individual estimates instead of adjusting values to make Powerhouse or Builder seven-player budgets easier. **No Wheel HQ grades, numeric talent ratings, future 2027 development, rookie contract multipliers, team OVR, or salary cap target is an input.** Preserve plausible overpriced veterans, undervalued emerging starters and top-premium brand performers. Low source-estimate accuracy is acknowledged rather than masked.
5. All figures are integer US dollars for **2026 Year 1 only**. There is no Year 2 baseline or automated annual increase; the integration owner handles 2027 NIL negotiations and retention in existing CFB GM gameplay.

### Reference sources

- [On3 2026 college-football NIL valuation board](https://www.on3.com/nil/rankings/player/college/football/), October 9 snapshot and recovered Oct 8 Git history for the 48 earlier checked individuals.
- [On3 individual player NIL profiles](https://www.on3.com/nil/), directly recorded on each applicable athlete's `publishedNilReference.url` and date. Example: [Ahmad Hardy](https://www.on3.com/rivals/ahmad-hardy-240668/nil/) $1M *Confirmed Deal* valuation; [Ellis Robinson IV](https://www.on3.com/rivals/ellis-robinson-iv-41558/nil/) $750K *Market-based* valuation. Both updated October 9.
- [On3 NIL estimated value explanation](https://www.on3.com/nil/news/about-on3-nil-valuation-per-post-value/) for how published valuation differs from certified income.
- [CBS Sports analysis of 2026 transfer-portal market and positional price bands](https://www.cbssports.com/college-football/news/what-the-transfer-portal-costs-now-position-by-position-price-ranges-amid-a-market-surge/) (published December 30, 2025): **general market context only**, not proof of any player's offer.
- [Opendorse annual NIL report 2026](https://biz.opendorse.com/annual-nil-report-2026/) landing page: supplemental market context, **full gated numeric report not independently ingested or verified**.
- Original 468 player-specific 2026 football university bios and participation source URL(s): retained individually in `reviewedFootballEvidence.sourceUrls` from the separately researched and merged classification ledger. **Not freshly independently reverified one-by-one during this NIL pricing pass.**

**Other publisher previously evaluated in Git history:** The NIL Standard's independent roster valuation records were removed from the earlier integration branch and remain excluded. Its [data use policy](https://thenilstandard.com/data-use) expressly requires permission/license for integration into a product; this research PR does **not** restore them.

## Price distribution, computed after assessment

| Player category | Records | Mean Year 1 NIL estimate |
|---|---:|---:|
| Secondary | 127 | $0.631M |
| Front Seven | 145 | $0.677M |
| RB | 57 | $0.682M |
| TE | 28 | $0.529M |
| QB | 25 | $2.5M |
| WR | 86 | $0.738M |
| **All athletes** | **468** | **$0.765M** |

- **Min:** $0.2M; **median:** $0.625M; **max:** $6.5M.
- No model was fit to these outputs; a wide price/production divergence is part of a defensible market.

Selected source-over-editorial examples (always Year 1, never 2027):

| Player | USD | Chosen evidence tier |
|---|---:|---|
| Darian Mensah (Miami) | $6.5M | On3 individual ranked board |
| Dante Moore (Oregon) | $5M | On3 individual ranked board |
| Jeremiah Smith (Ohio State) | $5M | On3 individual ranked board |
| Arch Manning (Texas) | $2.5M | On3 individual ranked board |
| Ahmad Hardy (Missouri) | $1M | On3 individual dated athlete profile |
| Rolijah Hardy (Indiana) | $0.35M | On3 individual dated athlete profile |
| KJ Bolden (Georgia) | $0.7M | On3 individual dated athlete profile |
| Bo Jackson (Ohio State) | $0.75M | On3 individual dated athlete profile |
| Conner Weigman (Houston) | $1M | On3 individual dated athlete profile |
| Ellis Robinson IV (Georgia) | $0.75M | On3 individual dated athlete profile |
| Holden Geriner (Pittsburgh) | $0.65M | Low-confidence individually reasoned editorial estimate |
| Tony Kinsler (Pittsburgh) | $0.225M | Low-confidence individually reasoned editorial estimate |

Notably, the On3 profile for **Indiana LB Rolijah Hardy** is $350K, far below his original $1.05M editorial estimate. Likewise Ohio State RB **Bo Jackson** $750K vs original $1.25M, and Georgia S **KJ Bolden** $700K vs original $1.425M. These observed provider-derived discrepancies remain **unmodified**, not repriced to match any player grades. The ledger preserves `previouslyReviewedIndependentEstimateUsd` for late-sourced comparisons.

## Mechanical verification

- **468 unique IDs / 468 records / 25 school populations** reconcile to source 2026 roster; original authoritative Wheel grades and roster IDs never edited.
- **48/48** recovered history amounts and ranks retained under original provenance; **87** distinct date+URL+amount published-valuation selections (**58** ranked, **29** direct profile); **381/381** independent remaining estimates contain individual case review date and rationale.
- All athletes have at least one player-identity football research URL and separate football context, and their price uses no numeric HQ/OVR/contract model input.
- This isolated PR adds only the valuation JSON and this handoff Markdown file. No UI, gameplay engine, 2027 logic, test code or Wheel HQ source changed.
- **No production deploy or main merge was performed.** Neither CI green status nor legal source-use authorization is implied by research completion.

## Integration-owner handoff: REQUIRED HOLD

1. Reinspect current `main` and live CFB GM integration; this branch is isolated and parallel gameplay work may have advanced. The canonical roster IDs and existing engine must remain authoritative.
2. **Resolve content-use/commercial licensing before any merge or use of On3 prices in the app.** Earlier #1798 removed published NIL data over licensing. See [On3's Terms of Service](https://www.on3.com/page/terms-of-service/) and [The NIL Standard policy](https://thenilstandard.com/data-use). Attribution does **not** equal a right to copy/reproduce provider values in a commercial game. Obtain consent/permission or have the integration owner choose independently derived, non-copying replacements. This data-only PR is **draft and research-only**, not itself licensing approval.
3. Review price quality, original identity/source matching, source dates, individual estimates, and whether alternative price choices are warranted; do not substitute grades or enforce budget-friendly pricing.
4. If/when approved, explicitly incorporate **2026 Year 1** amounts into the existing GM architecture (with focused separate implementation), maintain same Year 1 price across Powerhouse and Builder, never overwrite the game owner's 2027 development/NIL/portal/retention work.
5. Run full exact-integration-head typecheck, Vitest, build, simulation balancing, rosters/roles, mobile parity, owner preview and production gates **after** independent integration authorization. Only the designated GM integration owner may coordinate changes to `main`.

**Conclusion:** The 468-valuations research dataset and documented handoff are complete; commercial deployment and incorporation intentionally remain blocked pending source rights and integration-owner signoff.
