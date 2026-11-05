# NBA GM V12 — Six-skill lineup-composition pilot (NOT LIVE)
November 4, 2026. Owner agreed to redesign and compare before any public cutover.

## Purpose and isolation
This branch adds a versioned **experimental** V12 simulation and future-season lineup selector. It does **not** change the public start model (V11), $175M cap, salaries, contracts, 330 ratings, historical reference dataset, UI, or previously saved runs. There is no production rollout approval yet. V12 fixture states explicitly use simulationModelVersion=12 and lineupModelVersion=2.

## Differences from V11
All six authoritative player skills stay exactly as graded.

| Skill | V12 use |
|---|---|
| Scoring | Position-aware scoring index, primary/secondary coverage and smoothly diminished individual tertiary usage value |
| Shooting | Continuous five-man spacing; single traditional center discounted and overlapping poor shooters penalized |
| Playmaking | Position-aware weights (center 15% vs PG 40%), first/second creators, and diminished overlapping tertiary creation |
| Perimeter defense | Role-aware index; bounded exposure for multiple truly vulnerable PG/SG/SF defenders |
| Interior defense | One paint anchor is valuable; a second adds less |
| Rebounding | Frontcourt coverage adds offensive second-chance and defensive-possession value |

The starter/bench weights remain .63/.50; the 75% offense and defense impact scale, five-season wins/OVR anchors, seeded playoff engine and 90%/3%/7% final grade remain. Role baselines replace flat offense 75 and defense 74.5. This does **not** grant all centers equal performance: weak centers still incur negative contributions.

Year 2/3 optimizer retains exhaustive legal seven-slot assignment and the five-player talent sum, adding a small cohesion credit. Year-one drafted assignments are unchanged. Core talent must remain the principal driver: the lineup-fit credit is clamped to ±1.5 before applying its two-overall-point weight, so composition cannot displace a substantially better star.

## Preliminary paired simulation
From the live 330-player catalog without editing any player or contract, **984 $175M position-legal seven-player fixtures** were sampled. Each fixture used the same seven players/roles under a reconstructed V11 model and an independently implemented V12 arithmetic proxy, excluding seeded season noise. It is **not** the optimized 2,160-draft V11 cohort, a complete three-season server action, or a regression on actual NBA player minutes.

**The original arithmetic proxy predated the tertiary-usage refinement.** A later matched proxy rerun found V11 32.47 vs V12 32.46 mean expected wins, a 1.63% vs 1.12% 60-win rate, and a +5.94 mean raw net shift. Raw initial V12-minus-V11 net shift: mean roughly **+6.01**, median roughly **+6.01**, 10th–90th percentiles **+4.05 to +7.89**. V12 therefore uses a **provisional 6.01-point intercept** (4.80 offense, 1.21 defense for grade presentation). In this intentionally broad, relatively weak sample:
- Mean unseeded expected wins: **V11 32.47**, **V12 arithmetic proxy 32.62**.
- 60-win frequency: **V11 1.63%**, **V12 arithmetic proxy 1.83%**.

The sampled teams are **much weaker** than the optimized wheel picks used in V11 launch calibration (49.5 expected wins). These are guardrails, **not proof** of difficulty parity for competitive draft builds. Those additional real-Postgres paired fixtures have since been run; see the verified results below.

## Actual V12 Postgres pilot verification (November 4)
The isolated exact-head fresh-database CI runs the **real V11 and V12 server functions**, not the JavaScript arithmetic proxy:

- **120 matched team-wheel-like, position-legal, $175M cap-validated drafts** (0 failures): V11 **48.63** mean wins / **86.81** mean OVR vs V12 **47.14** mean wins / **85.77** mean OVR; 50+ wins **50 vs 46**, 60+ wins **8 vs 11**. This approximates per-round random team access, but is **not** an actual user's production wheel history or a three-season franchise.
- **29 legal current-team top-nine cores**, including 15 affordable under the authoritative average-contract $175M cap: V11 mean **38.17** wins vs V12 **38.90** wins. Contender shifts (BOS 51→45, NYK 51→44, OKC 57→52, HOU 53→56) are diagnostic, not historical accuracy claims; many current-team composites exceed $175M.
- **Owner prior contender fixture:** V11 92 OVR, 57 wins and 23.8% title odds vs V12 91 OVR, 56 wins and 20.9%.
- The alternate **240 full-catalog greedy picks** yielded V11 **70.90** mean wins and V12 **65.28**. Those builds have universal access to every current player, unlike the actual team wheel, so they are **not appropriate** to set V12 difficulty.
- Role floor audit on all 61 centers: V11 hits minimum individual offense on **41/61**, experimental V12 on **5/61**. No player ratings were changed.

The most extreme wheel-like pair illustrates why roster composition changes results:
- **Seed 86**: Luka Dončić, Stephen Curry and Jalen Johnson, but Yves Missi (**15 shooting**) and Mark Williams (**25 shooting**) both start, with Kon Knueppel (**90 shooting**) stuck on the bench for position coverage. **V11 46 wins → V12 34**, severe spacing overlap and weak bench-frontcourt coverage. This is deliberate but merits continued high-end basketball judgment.
- **Seed 35**: Anthony Davis and Cooper Flagg anchoring the frontcourt, alongside Michael Porter Jr. and Norman Powell shooting and credible reserve coverage. **V11 46 → V12 57 wins**. V11's role-blind model understated this construction.

The five-year historical cohort anchors *net rating to wins* and the display team OVR. It does not independently validate these roster-to-net coefficients. The **6.01 provisional normalization offset** is retained in the pilot: wheel-like mean is only 1.49 wins below V11 and the 60-win tail is not universally reduced. Do not retune from the extreme or full-catalog greedy examples alone.

### Controlled six-skill sensitivity (same seven, no season randomness)
In a reversible SQL transaction, one player's named skill was changed while all other skills stayed constant. The isolated V12 engine produced:

| Test | Win-equivalent change |
|---|---:|
| Cason Wallace scoring 67 → 87 | +3.83 |
| Cason Wallace shooting 79 → 80 | +0.18 (no abrupt 80 cutoff) |
| Kristaps Porziņģis playmaking 60 → 80 | +1.18 |
| Cason Wallace perimeter defense 90 → 70 | −4.19 |
| Kristaps Porziņģis interior defense 92 → 72 | −4.99 |
| Kristaps Porziņģis rebounding 79 → 59 | −1.98 |
| Bench Mark Williams shooting 25 → 50 | +2.11, **without changing starting-five spacing** |

These are model sensitivities, **not forecasts of real NBA wins**. The SQL transaction restores the underlying ratings.

### Public cutover blockers
The current live action still starts V11 and saves the V10-based Year-3 lineup. Public V12 promotion must atomically activate its own version/lineup model, use the V12 lineup optimizer in offseason final-roster snapshots, cover Year 1–3 and previous saved-run compatibility, and clear exact-head backend/frontend tests. **This experimental branch intentionally does none of that.**

Historical 150-team-season input validates the net-to-wins conversion, not the six-skills-to-net coefficients. OFFENSE and DEFENSE here are centered magnitude grades, **not historical percentile ranks**.

## Behavior and release gates
- A lineup with four 80+ shooters plus one rim-running center must space better than three 80+ shooters plus two severe non-shooting frontcourt starters.
- No 79-to-80 cliff; 25, 50 and 79 shooting ratings must have differentiable effects. Bench-only changes cannot alter five-man spacing.
- Weak players still count; role-aware baselines avoid the 41/61-center offensive floor saturation seen in V11.
- Overlapping vulnerable wing/point defenders must matter without reintroducing V9's double defensive tax; single rim protector and two-way rebounding must matter.
- Elite star combinations retain top-end dominance; composition never guarantees a win regardless of talent.
- V11 saved/current runs, $175M cap, existing ratings/contracts, future-year repricing and 90/3/7 grading remain intact.
- Exact PR head migration/SQL tests green on fresh database and competitive-draft simulation before any default switch.

## Release status
**Experimental only. No public default cutover or production merge.** Correct any test/performance problems and recalibrate against competitive fixture cohorts. Public V12 requires separate owner-approved go-live decision.
