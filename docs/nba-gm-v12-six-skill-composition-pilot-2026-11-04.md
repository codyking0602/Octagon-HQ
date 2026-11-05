# NBA GM V12 — Six-skill lineup-composition pilot (NOT LIVE)
November 4, 2026. Owner agreed to redesign and compare before any public cutover.

## Purpose and isolation
This branch adds a versioned **experimental** V12 simulation and future-season lineup selector. It does **not** change the public start model (V11), $175M cap, salaries, contracts, 330 ratings, historical reference dataset, UI, or previously saved runs. There is no production rollout approval yet. V12 fixture states explicitly use simulationModelVersion=12 and lineupModelVersion=2.

## Differences from V11
All six authoritative player skills stay exactly as graded.

| Skill | V12 use |
|---|---|
| Scoring | Position-aware scoring index plus primary and secondary scorer coverage; diminishing secondary credit |
| Shooting | Continuous five-man spacing; single traditional center discounted and overlapping poor shooters penalized |
| Playmaking | Position-aware individual weight, plus first and second creators instead of guard passing expectations for all bigs |
| Perimeter defense | Role-aware index; bounded exposure for multiple truly vulnerable PG/SG/SF defenders |
| Interior defense | One paint anchor is valuable; a second adds less |
| Rebounding | Frontcourt coverage adds offensive second-chance and defensive-possession value |

The starter/bench weights remain .63/.50; the 75% offense and defense impact scale, five-season wins/OVR anchors, seeded playoff engine and 90%/3%/7% final grade remain. Role baselines replace flat offense 75 and defense 74.5. This does **not** grant all centers equal performance: weak centers still incur negative contributions.

Year 2/3 optimizer retains exhaustive legal seven-slot assignment and the five-player talent sum, adding a small cohesion credit. Year-one drafted assignments are unchanged. Core talent must remain the principal driver.

## Preliminary paired simulation
From the live 330-player catalog without editing any player or contract, **984 $175M position-legal seven-player fixtures** were sampled. Each fixture used the same seven players/roles under a reconstructed V11 model and an independently implemented V12 arithmetic proxy, excluding seeded season noise. It is **not** the optimized 2,160-draft V11 cohort, a complete three-season server action, or a regression on actual NBA player minutes.

Raw V12-minus-V11 net shift: mean roughly **+6.01**, median roughly **+6.01**, 10th–90th percentiles **+4.05 to +7.89**. V12 therefore uses a **provisional 6.01-point intercept** (4.80 offense, 1.21 defense for grade presentation). In this intentionally broad, relatively weak sample:
- Mean unseeded expected wins: **V11 32.47**, **V12 arithmetic proxy 32.62**.
- 60-win frequency: **V11 1.63%**, **V12 arithmetic proxy 1.83%**.

The sampled teams are **much weaker** than the optimized wheel picks used in V11 launch calibration (49.5 expected wins). These are guardrails, **not proof** of difficulty parity for competitive draft builds. Next: matched competitive drafts, owner's rosters, 29 legal current-team top-nine cores, and purposely flawed vs complementary starting fives, all run against actual Postgres V12 functions.

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
