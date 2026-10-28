# Football Sports Feud NFL/CFB future-authoring rebuild

**Status:** Candidate bank and future-only publishing logic; production activation requires green exact PR-head validation and merging.

Historical baseline: production main at `ec0944bb62ece69f70cc3c86b2611bfbde589ce7` contained 350 authored question strings per sport but only 70 five-variant question families per sport. Quality was not measured by the number of strings.

## Rebuilt inventory (no paraphrase inflation)

| | NFL | CFB |
|---|---:|---:|
| Independently selected retained KEEP concepts | 21 | 23 |
| Newly authored distinct concepts | 118 | 117 |
| Total distinct candidate concepts | **139** | **140** |
| Main | 40 | 40 |
| Fast Money | 99 | 100 |

All new question rows include eight editorial ranked examples and at least three additional accepted examples; each has its own question ID and semantic lane. Historic IDs and result scoring remain unchanged. Editorial rankings are *never represented as actual surveys*.

The new question corpus is built across `footballSportsFeudRebuildNflMain.ts`, `footballSportsFeudRebuildNflFast.ts`, `footballSportsFeudRebuildCfbMain.ts`, `footballSportsFeudRebuildCfbFast.ts`, and the versioned expansion batches.

## Release behavior

- Sports Feud remains on its **existing Football Daily schedule**, roughly four appearances per 22 days, alternating NFL/CFB.
- Official Football Daily publishes the rebuild starting **October 29, 2026**, the next NFL Sports Feud appearance; prior dates continue to use the frozen legacy bank.
- Two Main + five Fast Money per appearance, old point ladder and 50-second timer unchanged.
- **Seventeen independent appearances per sport** (34 Football appearances) use 34 Main + 85 Fast per sport, leaving a newly added reserve without repeating a question ID. About six months at the present Daily weighting. Subsequent cycles may reuse editorial content.
- Deterministic cycle-seeded selection: every player gets the same seven questions on an official appearance.
- Versioned pack IDs and distinct rebuilt question IDs keep new and old history separate.
- Full question entities and off-board accepted answers persist in the Daily private setup. The backend grades from the published immutable snapshot, not a freshly generated roster.
- Drilldown metadata registers new IDs alongside old; UFC, NBA, MLB are unaffected.

## Verification

The branch adds a comprehensive 34-appearance rotation test, publisher parity across legacy and new dates, complete eight-ranked integrity checks, duplicate semantic-lane checks, and canonical accepted-answer matching on materialized future packs. The release must pass exact-head CI before merge. Exhaustive primary-source auditing of every subjective accepted example remains a continuing editorial process; legitimate fan answers should never be rejected because a subjective category is incomplete.

The expanded NFL pool is one Fast Money concept short of 20 full no-repeat appearances per sport. The CFB pool has the 40 Main and 100 Fast needed for 20 appearances, but the validated publisher remains deliberately locked at 17 per sport to preserve existing six-month release cadence. It does meet the request for 20 consecutive combined Football Feud appearances and roughly six months of alternating NFL/CFB appearances without repeated authored concepts.

Source spot-checks: NFL career receiving totals, Pro Football Hall of Fame classes, College Football Hall of Fame inductees, CFP 2024/2025 results, Davey O'Brien and Biletnikoff historical awards. Keep bank authoring and fact acceptance as a long-lived editorial task; never generate fake survey points or five wordings per concept.
