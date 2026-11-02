# NBA GM V7 — Football GM playoff odds parity (November 1, 2026)

**Scope:** private/owner-only NBA GM, new franchise runs only. No NFL code modification; no changes to old V2–V6 NBA game results, contracts, scoring weights, or saved runs.

## Intent

Football GM spent extensive owner calibration on its **six-finish 70–99 Team OVR odds curve**, topping out at a 49.6% title estimate for the highest grade. NFL seasons are simulated game by game; the odds curve describes the expected distribution, **not a predetermined finish**. Preserve that core philosophy for NBA.

## Strength → displayed Team OVR

V6's independent offense/defense skill model, starting five ×0.63 and two backups ×0.50, rim defense and bounded fit remain unchanged. Convert its predicted on-court net-effect value to a Football-style underlying team grade, with anchored net→grade interpolation:

| Net advantage | Raw strength | Display Team OVR |
|---:|---:|---:|
| -13 | 78 | 70 |
| 0 | 86.67 | ~88 |
| +4 | 89 | 94 |
| +6 | 90 | 96 |
| +9 | 92 | 98 |
| +10.5 | 92.5 | 98 |
| +14 | 94 | 99 |

This mapping is **authored gameplay calibration**, not a measured equivalence between NFL ratings and NBA net ratings. It keeps a true Team OVR separate from the independent, historically percentile-calibrated offensive and defensive team grades. Nobody receives a hidden defensive boost from player overall.

## Exactly the same finish probability distribution as NFL v10

The 10 anchor rows from `src/features/back-room/footballGmStrategy.ts` map one-to-one:

| NFL finish | NBA finish |
|---|---|
| Missed Playoffs | Missed Playoffs |
| Wild Card | First Round |
| Divisional | Conference Semifinals |
| Conference Championship | Conference Finals |
| Super Bowl Loss | Finals Loss (stored as `Finals`) |
| Champion | Champion |

At raw strength 92 (display 98), championship odds are **43.4%**. At 92.5 or above, displayed title odds cap at **49.6%**. Every displayed season exposes `teamOverall`, `titleOdds` (0–100), and six `outcomeOdds` (probabilities 0–1). The client shows a compact `OVR · TITLE ODDS` line and a collapsible full outcome breakdown. Earlier saves keep their legacy labels.

## Games still resolve individual series, not a sampled outcome

V7 uses NFL's outcome-distribution curve as an **advancement target**, converts each target conditional advancement chance to a seven-game per-game win probability (inverting the 4-of-7 binomial), then simulates actual games with 2-2-1-1-1 home court, seeded draws and historical opponent teams. Opponent-relative adjustment is limited to ±8 percentage points per round. This gives good and bad variance around the NFL balance instead of setting a finish directly.

Win totals still come from the held-out empirical 2026 net→wins mapping with seeded residual variation. Six-way playoff probabilities are descriptive model estimates; actual frequencies need to approximate them across many seeded seasons, not match exactly for individual users.

## Calibration and caveats

- Automated source regression compares all **10 curve anchor rows** to the NFL implementation.
- Fresh local SQL replay tests five real NBA GM rosters, 60 seeds and three seasons each = **900 NBA seasons**. It checks 82-game records, full normalized odds, deterministic router, old V5/V6 preservation, high/low team separation, realistic champion variability and the owner's exact Luka/Wembanyama/LeBron rotation.
- Preserve the already-verified V6 independence of shooting/creation and perimeter/interior/rebounding impacts, plus old season persistence and score breakdowns.
- All mappings beyond the measured NBA efficiency baselines remain gameplay assumptions. This is intentionally **balanced for fun**, not a claim that Luka–Wembanyama would have a scientifically forecast 43–50% real-world title probability.

No public NBA GM launch is authorized by this change.
