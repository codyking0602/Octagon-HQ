# Wheel monitoring — October 14, 2026 (partial, not release approved)

**Status: STOP / NOT MERGE-READY.** October 14 is the first scheduled **full biweekly CFB + NFL** grade review, as well as the **weekly full UFC** and **weekly NFL GM authority** refresh. The changes below cover *ranking data only*; they do not meet the requested Wednesday package release gates. Historical Wheel selections and prior migrations must remain immutable.

## Actual before → proposed after

| Authority | Before (main at start) | Proposed versioned change |
| --- | --- | --- |
| CFB AP Top 25 | October 4 poll | October 11 poll, all 25 orders synchronized in frontend and a new additive backend poll date |
| AP additions | Oregon / Florida / Pittsburgh in prior poll | Kentucky #15, Wake Forest #21, Northwestern #25 enter; old three exit. All entering schools already exist in the audited 68-school base; Boise State #23 retains its Oct 3 external audit |
| UFC official ranking source | Standard UFC.com All Rankings dated September 29 | Standard UFC.com All Rankings updated October 10; not UFC Meta rankings |
| UFC ranking/category correction | Bantamweight and two heavier divisions at old ranking numbers | 8 ranked-place moves in Bantamweight; 7 placements in Light Heavyweight plus 2 previous ranked fighters becoming unranked; 2 placements in Heavyweight. All other official ranked division entries remain aligned with the available October 10 table |
| UFC selectable pool | 170 active fighter/division rows / 168 fighter IDs | No membership changes staged; all 8 divisions preserve one champion and exactly #1–#15 |
| UFC grades | Current Oct 4 anchor audit | **Not regraded**; no grade-version updates staged; *unchanged data is not equivalent to reviewed* |
| NFL grade population | 594 non-coach rows across 6 grade files; 32 head coaches | **Not fully reviewed or revised**. All 34 current-ability overrides in Oct 8 server migration match the existing six Wheel JSON grade file values exactly. |
| CFB grade population | 1,338 base-school entries across 7 families + 19 Boise State extra-team grades = 1,357 | **Not fully reviewed or revised** |
| NFL GM contracts | October 5 OTC/nflverse snapshot, 594 rows | **Not refreshed**; canonical Oct 14 contract generation needs a runnable repo environment and live source. GM six grade imports still point to Oct 3 versioned files |
| GM projections/economy | Existing curated adjustment file and Oct 5 salary snapshot | **Not fully reviewed / simulated** |

### UFC verified snapshot shape

Read-only live Supabase query before these un-applied migrations: Flyweight 20, Bantamweight 21, Featherweight 20, Lightweight 23, Welterweight 22, Middleweight 22, Light Heavyweight 20, Heavyweight 22 active rows (170 total). Each had exactly one champion and official ranks #1–#15, and no null photo URL. All 94 referenced repository-local headshot files exist in `public/`; **76 external headshot URLs were not verified with HTTP requests, so zero broken headshots is not certified**. Each active grade remained labeled `ufc-wheel-current-v3-anchor-audit-20261004`.

Representative proposed official ranking changes: Payton Talbott Bantamweight #12 → #7; Muhammad Saidov and Reinier de Ridder newly #13/#14 Light Heavyweight; Jamahal Hill and Johnny Walker are no longer ranked Light Heavyweight; Aleksandar Rakić now #14 Heavyweight and Mario Pinto #15. Source: https://www.ufc.com/rankings (standard first All Rankings table, not Meta).

### Scope and safety

- New SQL migrations are **additive**; no earlier production migration, completed pick grade, historical spin category, or old GM contract artifact is modified.
- Ranking labels on previously saved UFC results are allowed to follow new *factual* rankings; use the existing canonical division-aware label function.
- Regression coverage was added to assert October 11 AP frontend/backend parity and 128 UFC official rows across eight champions and fifteen distinct ranks each.
- These checks are **structural**, not substitute evidence for individual grading judgments, late-game spin probability simulations, live external-media HTTP checks, or the GM economy release gate.
- The Oct 8 34-identity NFL server-migration updates were compared 1:1 against all 594 current six-family JSON grades; **no mismatches** were found. Still must review every candidate and every head coach on this scheduled full cycle.

## Required work before release approval

1. Independently review all **170 active UFC fighter/division rows** against reliable current results and nearby peers; record held/changed grades and source-backed reasons, grade version, complete fighter-media HTTP coverage and all category/late-game simulations.
2. Full present-ability review for **626 NFL** and **1,357 CFB** curated grade records including Boise State, with injury/absence neutrality, pairwise contradiction audit, mandatory EA/Madden and coach discrepancy reviews, roster/priority/team movement, Flex-inheritance tests, refreshed date-versioned grading artifacts and append-only server authority migration.
3. From those finalized NFL identities run `node scripts/refresh-wheel-nfl-gm-authority.mjs --date=2026-10-14`; capture OTC/nflverse snapshot metadata and contract change records; rebind to newest six files; inspect every GM-selectable NFL future outlook in `data/curated/football/nfl/wheel-nfl-gm-projection-adjustments.json`, with held/changed evidence.
4. Enforce exact GM-Wheel 594-ish **recomputed** population match (do not assume current count), validate age, contract classification, grade joins; run authority regression and greedy-vs-random $150M 3-year economy tests (including exploit checks).
5. Run SQL/backend, local simulations, full TypeScript/test/build and every required exact-head GitHub CI check. Repair any failures; reconcile with newer main and recertify exact head.

**Do not merge or deploy.** This is an explicit partial audit record only; a complete Wednesday refresh has not been performed.
