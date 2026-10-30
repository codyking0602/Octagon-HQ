# NBA GM — practical six-skill editorial close and development handoff

**October 30, 2026 | PR #2321 | Internal draft only — not merged, deployed, or released.**

## Decision

The **risk-based practical calibration pass is complete for this phase**. The preexisting 330-name board, six fixed independent skills and separately assessed overall values remain intact. Stop repeating broad provisional-rating research merely to change the label “certified.” The remaining technical/operational work should begin from this preserved foundation, not from a replacement ratings board.

**This is not evidence that every one of the 1,980 skill cells has been independently film-verified.** The old all-six empirical certification criterion remains **0/330**; publishing any grade as individually source-certified would be misleading. The board is suitable for **internal prototype/gameplay development subject to explicit owner approval**, not public use.

## Final source inventory

| Item | Practical handoff |
|---|---|
| Distinct proposed players | 330 |
| Complete six-column skill proposals | 1,980 |
| Locked skill axes | Scoring, Shooting, Playmaking, Perimeter Defense, Interior Defense, Rebounding |
| Players with archived 2025–26 NBA regular-season profiles | 301 / 330 |
| Alternate no-NBA-season classifications | 29 / 29 (do not fabricate NBA observations) |
| Individually attached numerical facts / awards | 951 / 37 |
| Proposed current teams matched to official NBA team roster leads | 330 / 330 |
| Official individual NBA.com player ID crosswalk | 232 / 330 |
| Evidence-led individual skill adjustments | 22 |
| Historical exact-position eligibility | Provisional; never inferred solely from broad G/F/C |
| Full six-skill independent certifications | 0 / 330 |
| Player overall changes during this phase | 0 |
| Imported into runtime or public game | No |

The **149 players rated 75–79 overall** have an existing full peer-comparison inventory. It is a reviewed triage ledger, not 149 independently certified full six-skill profiles. Player sample size, absent seasons, offensive usage, defensive assignment and shot difficulty remain case-dependent uncertainty, not reasons to erase valid specialist strengths.

## Last three focused evidence-led corrections

| Player | Rating change | Interpretation and peer anchors |
|---|---|---|
| **Michael Porter Jr.** | **Scoring 81 → 86** | Brooklyn 2025–26: **24.21 PPG, 18.42 FGA, 59.51% TS in 52 games** vs **18.2 PPG** for Denver 2024–25. His larger first-option workload and sustained efficiency warrant a **very-good** scoring grade above his former 81. He remains below 88 Brandon Ingram's broader off-dribble repertoire; 92 Shooting is separately untouched. [NBA Brooklyn 2025–26 notes](https://www.nba.com/gamenotes/nets.pdf), [NBA API archived season totals](nba-gm-2025-26-nba-api-301-player-stat-evidence-2026-10-29.json), [Basketball-Reference career](https://www.basketball-reference.com/players/p/portemi01.html). |
| **Jrue Holiday** | **Playmaking 79 → 81** | Portland 2025–26: **322 assists to 146 turnovers (6.08 / 2.75 per game), 53 games** in an expanded on-ball role; Boston 2024–25 was **3.9 APG** with lighter creation burden. A measured bump to **above-average secondary/starting-guard creation**, not elite point-guard 90+. Compare Derrick White 80 and Davion Mitchell 83. [Official NBA career by year](https://www.nba.com/stats/player/201950/). |
| **Keegan Murray** | **Shooting 85 → 81** | Sacramento 2025–26: **31/112 threes (27.7%) across only 23 GP**, after **34.3%** in 2024–25 and **35.8%** in 2023–24, versus a **41.1%** rookie season. Shooting still merits 81 for volume and established range, but 85 overstated recent demonstrated accuracy. Compare John Collins 81 vs high-level movement shooter Desmond Bane 90. Small latest sample is a reason for restraint, not overcorrection. [Official NBA season history and shot volume](https://www.nba.com/stats/player/1631099/). |

**Keegan Murray identity/position:** pinned official NBA ID **1631099** to the Sacramento crosswalk, with historical **2023–24 SF / 2024–26 PF** usage supporting **provisional SF/PF** rather than SF-only. Broad official **F** designation does not independently validate both exact GM slots. The exact eligibility remains marked unverified.

The three corrections above add to **19 earlier documented, independent provisional adjustments**, totaling **22**. No six-value vector was mechanically rescaled, no overall recomputed, and no skill floor/grade quotas used. The other five traits on each corrected player remain unchanged.

## Risk-based dispositions — hold rather than invent certainty

- **Chet Holmgren 89 overall:** evidence supports a **future reviewed 90–91 proposal** but no silent overall raise.
- **Joel Embiid 88 overall:** scoring talent and missed games must be separated; the proposed 90–91 range requires whole-player impact/availability adjudication.
- **Jalen Johnson 90 overall; Ja Morant 81 overall:** both **held** pending defensible full-player evidence rather than forced changes.
- **Oscar Tshiebwe rebounding 96:** plausible specialist strength with limited starter-role NBA sampling; held as a known high-leverage outlier instead of invented certainty.
- **Keegan Murray other five skills, all broad-position conflicts, and missing official NBA player IDs:** **not certified**, and not blockers to closing practical calibration as an internal proposal.

## Handoff / what happens next

1. Keep the **330-player provisional JSON** and evidence/peer ledgers as the source for eventual *internal* NBA GM test fixtures; **do not wire it to production** without owner authorization.
2. Before *public release*, resolve publication-level NBA identities/eligibility, audit highest-impact role mismatches, implement salary/cap and simulator rules, exercise balance/playtests, and obtain owner approval. Do not portray the current document as individual film verification.
3. Retain the known uncertainty as flags rather than repeating open-ended certification exercises; address a rating only when new decisive film, official roster, statistical context or test data actually challenges it.
4. Exact PR head must pass relevant tests/CI before any future merge. This document itself **does not authorize a merge, Supabase change, or deployment**.

**Practical editorial phase: closed. Public ratings certification and gameplay launch: not authorized.**
