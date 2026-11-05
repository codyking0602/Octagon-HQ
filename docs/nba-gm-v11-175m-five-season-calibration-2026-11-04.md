# NBA GM V11 — $175M cap and five-season strength recalibration
November 4, 2026. Owner-approved Go Live. New franchises only.

## Product decision
- Salary cap: **$175M in each of Years 1–3**. All existing V9/V10 and older saved runs keep their run-owned caps and existing results.
- Strength: scale both role-specific, already bounded six-skill offense/defense net impacts to 75%; subtract a 0.6 baseline and bounded missing-primary-creator penalty up to 1.7 net points (for top-five creator below 89). Preserve fit, turnover, seeded games, historical wins/OVR mapping, and NFL-derived descriptive odds.
- Display offense and defense from the same scaled side-specific grade inputs. No independent score haircut.
- Keep real 330-player averaged contracts, deliberate 1YR/3YR classification, NFL-style market repricing V2, automatic developed starting five, and 90% roster / 3% regular / 7% playoffs scoring.
- No rewriting prior result, run, game salary, player or historical-team rows.

## Reference cohorts and simulation
Historical input is the 150 observed team-seasons from 2022–2026 in private.nba_gm_v5_historical_teams and the repository CSV; 8/150 won at least 60 games and the 95th-percentile observed net rating was +7.91. The real net-to-wins conversion remains about 40.9983 + 2.2684 * net, using the heldout 2026 cohort.

The owner-approved comparison used 240 matched NBA-team wheel sequences x 3 draft-selection strategies x 3 caps ($165M/$175M/$185M): **2,160 position-legal draft fixtures**, plus 6 scoring policies (**12,960 Year-1 scoring calculations**). Each candidate selection respected distinct cheapest-reserve fill-ins and actual 330-player Year-1 game salaries. These are **not** 2,160 completed server-action three-season franchises, or empirical estimates of seven-player skill coefficients. Year-2 figures concern preliminary salary forecasts before real development and trades.

| Cap/model | Expected wins | 60+ win builds | Forecast Year-2 over-cap |
|---|---:|---:|---:|
| $165M / V10 | 52.1 | 27.2% | 74.4% |
| $165M / V11 | 48.1 | 8.9% | 74.4% |
| $175M / V10 | 53.8 | 30.6% | 67.8% |
| **$175M / V11** | **49.5** | **11.5%** | **67.8%** |
| $185M / V10 | 56.5 | 37.9% | 62.5% |
| $185M / V11 | 51.5 | 16.1% | 62.5% |

At $175M/V11, owner Kawhi/Cooper Flagg counterfactual: Year 1 92 OVR, +6.08 net, 23.8% title, 54.8 expected wins; Year 2 91 OVR, 22.7%, 54.4 wins; Year 3 90 OVR, 17.1%, 52 wins. Source V10 was 96/96/95 OVR and 46.8%/46.3%/41.7%. The original V10 run is immutable.

## Release gates
- Exact PR head CI must be green including backend migrations and unit/integration tests before merging.
- Backend asserts V9/V10 replay, V11 82-game seasons and cap/version dispatch, 150-team cohort, 90/3/7 preserved.
- Frontend asserts run-owned caps, V11 schema, displayed team OVR, new cap and old-saved cap test.
- Verify live Supabase version/cap and both backend/frontend deployments after merge.
