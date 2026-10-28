# Weekly Auction — Best CFB Teams grading audit

## Scope

This is the grading-only calibration record for the first Football Weekly Auction subject: **Best CFB Teams Since 2000**.

It does not change runtime behavior, the existing 1v1 Best CFB Teams Draft Room mode, or the approved 132-team pool already in production.

The audited Weekly Auction ladder is:

- 132 existing approved anchors, unchanged.
- 101 additional team-seasons.
- 233 total calibrated team-seasons.
- 100-point hidden scale in 0.5-point increments.
- Current audited range: 86.0–100.0.

The expansion rows are stored in `data/generated/football/cfb/weekly-auction-team-grade-expansion-v1.json`.

## Grading model

Grade the **actual season**, not the school name.

Primary evidence:

1. Season result and championship outcome.
2. Era-relative dominance.
3. Strength of schedule.
4. Quality wins.
5. Postseason / championship performance.
6. Quality, timing, and context of losses.
7. Full-season consistency.

Titles matter, but they are not automatic trump cards. A dominant non-champion can grade above a weaker champion, and an undefeated season with a materially lighter schedule is not automatically placed on the same curve as an undefeated elite-schedule champion.

Modern seasons are not rewarded merely for playing more games. Shortened or structurally unusual seasons, especially 2020, are judged in context.

## Calibration process

1. Preserve the already approved ladder as the anchor curve.
2. Add candidate seasons only when they clear the quality bar for a useful Weekly Auction subject.
3. Place each addition relative to neighboring approved seasons from the same era and quality range.
4. Cross-check the placement against season record, final ranking, schedule strength, and season-level rating evidence.
5. Run a second pairwise pass for obvious ordering contradictions.
6. Audit the completed distribution by era, current-conference board bucket, and grade band.
7. Lock grades before board generation. The weekly generator may choose from the ladder but may never create, raise, lower, or infer a grade.

## Evidence standard

Historical season results and rating/schedule context were cross-checked primarily against Sports-Reference College Football yearly rating tables and team-season pages, with championship/postseason outcomes used as contextual evidence rather than a standalone formula.

The scale remains a curated product grade rather than a mechanical SRS ranking. SRS/SOS are evidence inputs, not the grade itself.

## Locked anchors

The existing approved top curve remains unchanged, including:

- 2019 LSU — 100.0
- 2001 Miami — 100.0
- 2020 Alabama — 99.0
- 2018 Clemson — 99.0
- 2005 Texas — 98.5
- 2004 USC — 98.5
- 2013 Florida State — 98.5
- 2022 Georgia — 98.5
- 2025 Indiana — 98.5

No expansion season was allowed to displace those anchors simply to create more high-end inventory.

## Expansion calibration notes

The second pass deliberately compressed several strong Group-of-Five / wildcard seasons after comparing them with the approved Utah, UCF, TCU, Cincinnati, and power-conference anchors. Undefeated record alone was not treated as equivalent to elite schedule quality.

The expanded pool also adds more strong-but-imperfect seasons in the high-80s and low-90s. This is intentional: Weekly Auction needs real valuation decisions and cannot be a repeating sequence of obvious 97+ teams.

Current combined distribution:

| Grade band | Team-seasons |
| --- | ---: |
| 97.0–100.0 | 13 |
| 94.0–96.5 | 36 |
| 91.0–93.5 | 80 |
| 88.0–90.5 | 85 |
| 86.0–87.5 | 19 |

Era distribution:

| Era | Team-seasons |
| --- | ---: |
| 2000–2006 | 45 |
| 2007–2012 | 56 |
| 2013–2018 | 60 |
| 2019–2025 | 72 |

Current-conference board buckets plus wildcard inventory:

| Bucket | Team-seasons |
| --- | ---: |
| SEC | 63 |
| Big Ten | 59 |
| Big 12 | 44 |
| ACC | 43 |
| Notre Dame | 11 |
| Wildcard | 13 |

Conference bucket is a **board-generation mechanic**, not a claim about the historical conference membership of that season.

## Runtime boundary

This artifact is not the Weekly Auction runtime catalog.

When the Weekly Auction backend is implemented:

- grades must remain server-owned and absent from browser payloads;
- future daily boards must remain server-owned until reveal;
- the generator must consume the locked grading table rather than recalculate grades;
- `Wildcard` support must be added intentionally to the Weekly Auction schema rather than changing the existing 1v1 Draft Room contract by accident;
- the existing 1v1 Best CFB Teams population and grading must remain untouched unless separately approved.

## Status

**Calibration pass complete.**

The 233-team ladder is ready to be used as the input to Weekly Auction board-generation simulations. It is not yet live and does not affect production.
