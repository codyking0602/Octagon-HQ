# Ciryl Gane — UFC V2 all-time inclusion (isolated, 2026-10-27)

## Evidence and cut-off

Cut-off: **October 27, 2026**. This addition includes precisely 14 UFC appearances, **11 wins, 2 losses, one no contest**. Non-UFC bouts and the scheduled November 14, 2026 Josh Hokit bout are deliberately excluded.

Primary source: [official UFC athlete profile and full event-by-event history](https://www.ufc.com/athlete/ciryl-gane).
Corroboration: [Sherdog event ledger](https://www.sherdog.com/fighter/Ciryl-Gane-293973); [UFC Freedom 250 official results](https://www.ufc.com/news/ufc-freedom-250-results-highlights-interviews); [UFC 321 official no-contest report](https://www.ufc.com/news/ufc-321-aspinall-vs-gane-event-tonight-main-card-live-results-recaps-highlights-interviews-abu-dhabi).

The two **earned** title victories are 2021 interim heavyweight vs Derrick Lewis (TKO) and June 14, 2026 interim heavyweight vs Alex Pereira (TKO). The January 2022 undisputed unification loss to Francis Ngannou, March 2023 vacant undisputed title loss to Jon Jones, and October 2025 undisputed title-bout no contest vs Tom Aspinall remain recorded with their proper classifications. A no contest creates no win or opponent-quality credit and is not a loss. Gane became **undisputed champion administratively in September 2026** after Aspinall vacated: that is documented in presentation only, not fabricated as a third title victory, a defense, or a fight-level championship credit. Source: [UFC September 20 confirmation](https://us.ufcespanol.com/news/gane-hokit-harrison-nunes-headline-ufc-334-new-york-city); [MMA Fighting title clarification](https://www.mmafighting.com/ufc/511569/dana-white-admits-he-fcked-up-ciryl-gane-announcement-reacts-to-josh-hokit-getting-title-shot).

## Canonical UFC ledger

| Date | Opponent | Result | Stakes |
|---|---|---|---|
| 2019-08-10 | Raphael Pessoa | W, submission | UFC debut |
| 2019-10-26 | Don'Tale Mayes | W, submission | Non-title |
| 2019-12-21 | Tanner Boser | W, decision | Non-title |
| 2020-12-12 | Junior dos Santos | W, TKO | Former champion, late career |
| 2021-02-27 | Jairzinho Rozenstruik | W, decision | Top heavyweight contender |
| 2021-06-26 | Alexander Volkov | W, decision | Five-round contender fight |
| 2021-08-07 | Derrick Lewis | W, TKO | **Interim title #1** |
| 2022-01-22 | Francis Ngannou | L, decision | Undisputed unification |
| 2022-09-03 | Tai Tuivasa | W, TKO | Contender |
| 2023-03-04 | Jon Jones | L, submission | Vacant undisputed title |
| 2023-09-02 | Serghei Spivac | W, TKO | Contender |
| 2024-12-07 | Alexander Volkov | W, split decision | Contender rematch |
| 2025-10-25 | Tom Aspinall | NC, accidental eye poke | Undisputed title bout; excluded from outcome scoring |
| 2026-06-14 | Alex Pereira | W, TKO | **Interim title #2**; promoted undisputed later |

Decision-scorecard confirmations: [UFC Rozenstruik 50-45 sweep](https://www.ufc.com/news/ufc-fight-night-rozenstruik-vs-gane-fight-results-winners-recap-ufc-vegas-20), [UFC Volkov 2021 unanimous 50-45/50-45/49-46](https://www.ufc.com/news/official-scorecards-ufc-fight-night-gane-vs-volkov). The rounds field records reviewed whole-round winners only when sufficient evidence exists; otherwise it uses `unavailable` rather than a fabricated 0-0 audit.

## Judgment review

- **Title wins:** Two genuine interim wins are credited at 0.65 (Lewis) and 0.75 (Pereira) on the existing benchmark 14.54. This differentiates interim achievements from defended undisputed reigns. Aspinall promotion contributes zero fight wins/defenses.
- **Opponent quality:** The full 11-win ledger is represented, with strongest credit to Pereira (1.05) for his two-division title pedigree but discounted because heavyweight was a crossover debut. Volkov (twice), Lewis, Rozenstruik, Tuivasa and Spivac supply ranked heavyweight depth. Late-career Junior dos Santos is not valued as prime JDS. The shared diminishing-returns scale and benchmark 14.54 apply.
- **Prime:** Starts February 27, 2021, with Rozenstruik; remains open after the Pereira win. Ngannou and Jones are both prime champion-level home-division losses; the Jones submission gets appropriate finish penalty. Aspinall NC does not count toward a win or loss rate.
- **Apex:** Lewis interim-title stoppage and Pereira interim-title stoppage. Reviewed component total 4.48 / 6 (1.88 + 1.20 + 0.75 + 0.65). Neither is an undisputed defense.
- **Longevity:** Open elite window from February 2021 through 2026, using the engine's shared 18-month inactivity cap, status multiplier 1.05, heavyweight division multiplier 1.05. Promotion does not create activity.
- **Era:** New-blood era, heavyweight depth index 0.90, calculated depth correction, no manual rank or preassigned OVR.
- **Presentation:** Existing local `ciryl-gane-thumb.webp` is reused in both slots pending a separately curated high-resolution profile. No invented video link or unreliable remote fighter asset is introduced.

## Calculation and population verification

The canonical roster uses `src/features/rankings/data/v2RankingRoster.ts` with this fighter supplied by `cirylGaneV2.ts`; the sealed 80-fighter migration JSON is untouched, as are every existing fighter's fights and judgments. Population: **83 total V2 fighters** (the historical 80 + RDA + Joshua Van + Ciryl Gane).

The engine owns rank, score, category contributions and division-relative placement. `cirylGaneV2.test.ts` emits the exact actual calculated score and immediate overall/heavyweight neighbors to CI under `[GANE_V2_CALCULATED]` for auditable reconciliation. Do **not** state a rank or score without reading this actual calculation from exact-head CI.

### Isolation
No Supabase migration, UFC official divisional ranks, Wheel of UFC, Natalia Silva files, other games, main, or production touched. Draft PR only; do not merge or deploy.
