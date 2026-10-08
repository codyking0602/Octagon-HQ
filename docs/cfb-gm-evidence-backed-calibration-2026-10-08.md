# CFB The GM — October 8, 2026 player research calibration (partial, isolated PR)

## Explicit quality status

This PR does **not** complete the requested 468 individual performance/NIL/eligibility studies.
The 468-player source roster is preserved and still playable; **12 specific players** have sourced individual calibration records, while **456** use clearly marked provisional development and/or market priors. These fallbacks must never be called researched.
The existing Wheel of Football HQ grades are unchanged. There are **no new HQ grade proposals** in this isolated change.

## Evidence inventory

- 468/468 exact CFB GM ID/classification rows; 85 official school class overrides, including the correction of Arch Manning's 2026 official Texas **senior** designation.
- 12 individual GM research entries in the **existing** `data/curated/football/cfb/gm-2026-classification-evidence.json` ledger, with dated source links and player-specific trajectory/risk judgments.
- 12 individually assessed 2027 NFL timing fields, including two players modeled ineligible for 2027: Keelon Russell and Dakorien Moore (entered college 2025).
- Five assessed remaining-season fields: Mohamed Toure and Gunner Stockton have no further normal college season after 2026; Arch Manning, Dante Moore and Sam Leavitt have one plausible further year based on documented 2023 start, redshirt/college history and 2026 transition rules. The latter three are **inferences, not institution-certified eligibility rulings**.
- 456 players retain **null** for unresearched remaining seasons, draft timing and 2027 eligibility rather than a fabricated verified declaration.
- One materially repriced player: Texas WR Cam Coleman **$1.975m → $3.000m Year 1**, **$3.300m Year 2 baseline**, a conservative **game estimate** informed by press reports of a much larger transfer-market valuation. This is not verified NIL compensation.
- Remaining approved prominence anchors retain existing estimates. Other unanchored player NIL values still use position/role/school-market models, not individualized NIL research.

## Player-by-player research sources and football reasoning

Each of the 12 records has its own `calibration.summary` and `calibration.sources` in the existing ledger, not in a new standalone athlete database:

| Player | Key documented reason and game treatment |
| --- | --- |
| Colin Simmons | Texas 2025 SEC sack leader and 2026 impact; CBS mock projects near top of 2027; modeled 98% draft declaration |
| Jeremiah Smith | Unanimous 2025 All-American, record-setting Ohio State production, CBS mock at No. 1; 98% draft declaration |
| Arch Manning | Texas 2026 Senior (not previous ESPN Junior), more 2027 eligibility is plausible, declaration uncertain; 62% model |
| Dante Moore | Oregon opted out of a realistic 2026 draft candidacy; high but non-certain 2027 declaration, 86% |
| Sam Leavitt | LSU redshirt junior, productive ASU transfer; 77% declaration estimate |
| Ryan Wingo | Third-year Texas receiver and 2025 All-SEC selection; 56% declaration estimate |
| Cam Coleman | Productive Auburn past, 2026 Texas transfer and reported NIL demand, uneven four-game sample; market raised to $3m |
| Keelon Russell | First 2025 enrollment, emerged as Alabama starter in 2026; not modeled NFL eligible for 2027 |
| Dakorien Moore | Oregon sophomore with meaningful 2025 freshman production despite injury; volatility elevated |
| Mohamed Toure | Documented 2026 eighth/last season after medical/COVID exceptions; always leaves after Year 1 |
| Gunner Stockton | Official Georgia fifth-year QB, first enrolled 2022; modeled final season 2026 under normal rules |
| CJ Carr | 2024 matriculation and demonstrated 2025 Notre Dame production; 2027 draft choice possible, not certain |

## Authority and engine

- The 468-player **curated research ledger** is authoritative for source notes and sourced vs provisional distinction.
- Existing `scripts/generate-cfb-gm-class-runtime.mjs` projects compact source-backed override data into the existing generated 468-player runtime; rejects negative/invalid probabilities and NIL amounts.
- `footballCfbGmDevelopment.ts` prioritizes individually researched outcome/bounds/volatility over class priors, with deterministic seeded rolls and unchanged Wheel HQ grades.
- `footballCfbGmNilMarket.ts` prioritizes supported player-specific market estimates over prior named anchor/role formula and remains independent of HQ grade and game-budget mode.
- `footballCfbGmEngine.ts` prioritizes a researched player's NFL declaration and transfer risk, lets known remaining eligibility override synthetic senior-class exhaustion, and always exits known final-year players.
- Owner-save version upgraded from v5 to v6, preventing old result snapshots from silently inheriting changed outcomes.

## NCAA rules caution

The NCAA's June 23, 2026 [age-based eligibility model](https://www.ncaa.org/news/division-i-adopts-age-based-eligibility-model/) includes transitional protections for present athletes: prior four-seasons/five-year rules or the new age-based rule, whichever is more favorable. Thus an official school class label **cannot** itself establish exact remaining eligibility. Individual waivers, prior participation and time of original enrollment still matter.

NFL draft declaration odds are **game probability judgments**, not actual declarations or guaranteed draft outcomes. Individual source records distinguish public performance evidence from guessed likelihood.

## Outstanding 468-player quality gate

**This PR remains incomplete versus the owner-requested full calibration.** Remaining work:
1. Review all 456 additional existing IDs using official biographies/statistics and capture 2025/2026 production, transfers, position roles, years first enrolled, redshirt history and actual remaining eligibility where documented.
2. Research 455 further personalized NIL price judgments (other than Coleman; 12 other legacy prominence anchors still lack complete individualized provenance).
3. Set 456 individual breakout/improve/steady/decline and gain/loss/volatility assessments, without generating superficially varied numbers from a generic formula.
4. Research per-player transfer and 2027 declaration risks; review all unusual sixth-to-eighth-year cases and NCAA transitional exceptions.
5. Run extended affordability simulations for both budgets and full two-year playthroughs, reconcile the grade and price distributions and any proposed HQ grade flags separately.
6. Run complete CI on exact PR head, then integration owner/owner decides on merge. This branch must not be deployed as a purported full 468-player research completion.

## Safety

No NFL GM runtime changes, no Wheel of Football grade changes, no unrelated migrations, no direct `main` edits, no merge/deploy.
