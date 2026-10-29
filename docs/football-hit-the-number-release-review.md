# Football Hit the Number — release review

Status: **off-main feature-stack proposal; owner has not authorized merge/deploy**.

## Locked gameplay contract

- NFL and CFB use the same model in Casual and Official Daily.
- 4 picks (85%): exactly 12 candidates; 5 picks (15%): exactly 14.
- No 6- or 7-pick boards. Pick count is chosen once, before format/metric selection.
- Daily presents two scored games, one NFL and one CFB, with the rounded-average result.
- Preserve approved Bob Barker under-target and bust scoring and existing presentation.

## Editorial intent

- NFL: memorable quarterback passing seasons, occasional INT surprises, RB rushing,
  receiving greats and iconic team scoring. No passer-rating arithmetic, overlapping
  raw team points and postseason-inclusive win-total puzzles.
- CFB: recognizable team-scoring seasons plus peak-season QB, RB and receiver
  performances. Require a sourced season year for CFB peak-season candidates;
  don't infer a college's logo from a later transfer.
- Four formats are retained; progression boards require every offered selection
  to leave a legal completion.

## Release gate (before approving the PR stack)

1. Latest PR head must run the complete Validate V2 suite and pass.
2. Review an actual sample of Daily NFL/CFB and Casual boards for compelling
   player recognition and intuitive target decisions; math-only quality is not enough.
3. Verify six-month Daily publication has 2 boards per Hit the Number date,
   correct NFL/CFB pairing, no repeats/failed generation, and approved picks.
4. Stress-test Casual seeds, 85/15 distribution, non-repeated person identities,
   peak-year labels, actual facts and slot completion paths.
5. Inspect 390px mobile in a browser (headings, stat year, picker slots,
   target visibility, result and other-player Daily drilldown).
6. Keep all four PRs off main until explicit owner approval.

No claim of completed human board review or mobile browser certification is made
by this document; automated tests and exact-head CI provide the code gates.
