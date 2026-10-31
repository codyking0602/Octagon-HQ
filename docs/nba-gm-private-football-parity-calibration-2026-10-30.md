# NBA GM private Football parity — implementation and calibration

**Status: draft-only owner playtest, not publicly released.** NFL Football GM remains the reference UX. Never represent these game mechanics as real NBA contract agreements or an independently validated season forecast.

## Preserved foundations

- All 330 established NBA editorial identities, six skill assessments and source flags remain intact.
- PG / SG / SF / PF / C / Guard / Big remain exactly seven legal rotation slots; SF wings qualify for Guard or Big only through their actual SG/PF secondary eligibility.
- The 2021–22 through 2025–26, 150 NBA team-season research already in `nba-gm-150-team-season-calibration-2026-10-30.md` establishes a held-out 2025–26 conversion of observed net rating to wins: `W = 40.9983 + 2.2684 × observed NRtg` (RMSE 3.339). **This does not validate player-skills-to-team-net-rating conversion.** The playable game uses a provisional seven-player mapping with this measured win-conversion layer, seeded variance and non-deterministic postseason advancement.
- Earlier `nba-gm-dev-v2` saved runs have no `economyVersion` and retain their original V2 MD5 contracts/salary curve. New private starts carry `economyVersion:3`; the server owns all development and finances.

## Age provenance and development

- The repo's existing 301-player NBA Stats API identity evidence (dated October 29, 2026) is matched by player ID to the pinned source `EasySportsApps/nba_api_25_26_data@f785bb34415b2bf4c80614dcfa4a305cc9969ee5`, `nba_players_regular_season_25_26_wide_data.csv`. Each identity is also matched to the established 330 editorial player bank.
- **301 / 330 players** receive a sourced birthdate. **29 players remain NULL**, not approximated. Their age adjustments are neutral.
- Each 1→2 and 2→3 season step uses a seeded development roll, an independent seeded magnitude, age-sensitive breakout/decline odds, skill-specialist upside, a ceiling relative to each player's existing editorial grade, and history-aware damping after a prior surge.
- Expected direction: developing young players have additional breakout probability and greater room to improve; older players face stronger decline and a lower headroom cap. These parameters are **transparent editorial game assumptions**, not regressions trained on an individual longitudinal player dataset.
- The player's numerical ability changes in the server season model. Frontend displays Football-style categorical breakout/improvement/steady/regression/major regression and letter-grade scouting.

## Salary cap and contract design

- **$155.0 million** for each of three seasons, for a fictional seven-player NBA rotation, instead of the prior forgiving $192.5 million. Salaries retain the reviewed fictional grade-based price curve (median initial salary around $6.6M; highest around $60.5M), **not real NBA salary commitments**.
- Purposeful game contract bands replace the opaque last-MD5-digit term assignment for V3. Exactly 1YR and 3YR. 3YR pay remains fully locked; a 1YR player's new salary is priced from the developed grade and year-specific market factor. Cap limits and approval remain backend owned.
- Bench replacement candidates are distinct real players, never the same cheap athlete allocated to multiple slots.
- Twelve sample seven-player draft combinations from the 330 bank using fixed team-selection and four different drafting policies (highest-graded, cheapest, near-85, most versatile): **12/12 completed** under the new $155M cap. Sample Year 1 payrolls ranged from $27.5M to $135.2M; top-graded-policy rosters carried meaningful star trade-offs. This is a reproducible **scenario feasibility check**, not a randomized production population benchmark. Re-run full server-integration draft policy samples before release.
- New Year 2 cap overruns force offseason trades/cuts/replacements; 3YR locking provides strategic contrast with repricing volatility.

## Trade and free agency mechanics

- All unowned athletes on the server-chosen trade partner are shown; visibility is not equated with one-for-one eligibility.
- Up to two offered packages; a second owned outgoing player may be included, with backend team value, position reflow, cap and replacement validation. A rejected package is not silently converted into a transaction.
- Three market visits maximum. Voluntary cut allowance remains limited; genuine cap crises can allow additional cuts. After visits are exhausted, restricted affordable 1YR depth players provide an emergency path to a complete roster.
- Trade and market restrictions are **fictional game rules** rather than a full NBA CBA simulation.

## Private release gates

- Exact-head typecheck, built assets, NBA/Football regressions, local migration replay and private owner mobile playthrough must pass.
- Validate legacy V2 save continuation, a 1YR repricing cap squeeze, a two-player trade with an opened slot, and depleted-visit emergency recovery end-to-end in a disposable local database.
- Revisit 29 unverified birthdates, positional/source conflicts, player-specific medical/availability risk, scientifically unvalidated skill-to-efficiency conversion, and exact NBA mobile layout before public exposure.
