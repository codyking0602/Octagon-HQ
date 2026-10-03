# NFL Wheel of Football — Final cross-position calibration audit

## Status

**Final NFL Wheel grading calibration complete — October 3, 2026.**

This audit closes the initial NFL Wheel grading project across:
- QB
- RB
- WR
- TE
- Front Seven
- Secondary
- Head Coach

Flex inherits the underlying RB/WR/TE grade and is not graded separately.

No runtime/gameplay behavior is changed by this calibration branch.

## Source of truth

Population source:
`data/generated/football/wheel-football-priorities.json`

Current main validated:
`f295e359d9e70f5c55d0452f4f94d9487fbc3f06`

Total graded curated entries: **626**

Every position family validates with **0 missing, 0 extra, 0 duplicate** entries.

## Final process

The final grading workflow is now:

1. Curated population
2. Position semantic
3. Player/coach anchors
4. Full position grading
5. Pairwise / neighboring-player audit
6. Range / separation audit
7. Madden discrepancy audit for players
   - current official gap of 7+ points = mandatory review
   - current official gap of 10+ points = explicit red flag
   - Madden is an error detector, never a formula
   - review may keep HQ, move toward Madden, or move farther away
8. External-ranking discrepancy audit for Head Coach
9. Distribution inspection only after football grading
10. Lock / version

## What the blind QB test changed

The blind comparison exposed a real calibration issue: the lower half of the initial QB scale was compressed upward.

The fix was **not** to copy Madden. The fix was to allow the 70s to mean something.

Final QB corrections included:

- Jalen Hurts: 87 → **85**
- Jayden Daniels: 87 → **84**
- C.J. Stroud: 84 → **82**
- Caleb Williams: 84 → **87**
- Geno Smith: 83 → **82**
- Kyler Murray: 84 → **80**
- Daniel Jones: 83 → **80**
- Kirk Cousins: 83 → **80**
- Jaxson Dart: 83 → **82**
- Jacoby Brissett: 82 → **80**
- Deshaun Watson: 83 → **78**
- Bo Nix: 81 → **79**
- Aaron Rodgers: 80 → **79**
- Michael Penix Jr.: 80 → **78**
- Malik Willis: 78 → **76**
- Cam Ward: 77 → **75**
- Fernando Mendoza: 75 → **73**
- Jameis Winston: 74 → **72**

Stafford remains **95**; the blind tester independently placed him in the 93-95 range rather than Madden's 99.

Final QB range: **72-99**
Mean: **84.41**
Median: **84**
Below 80: **8**

## RB final calibration

RB was already comparatively healthy, so the final sweep was targeted rather than broad.

Corrections:
- Kyle Monangai: 85 → **82**
- Emmett Johnson: 79 → **75**
- Seth McGowan: 75 → **72**
- Mike Washington Jr.: 78 → **76**
- Isaac Guerendo: 79 → **77**

Bhayshul Tuten remains **83** because his current performance supports the separation from Madden.

Final RB range: **72-99**
Mean: **82.75**
Median: **82**
Below 80: **19**

## WR final calibration

The top and upper-middle WR ladder remained strong. Cleanup focused on lower-tier overcompression.

Corrections:
- Malik Washington: 81 → **78**
- Jahan Dotson: 80 → **78**
- Tre' Harris: 80 → **78**
- Andrei Iosivas: 80 → **79**
- Roman Wilson: 79 → **77**
- Pat Bryant: 79 → **76**
- Jack Bech: 79 → **76**
- Jalen McMillan: 81 → **79**
- Jacob Cowing: 78 → **75**
- Isaiah Williams: 77 → **72**

Christian Watson remains **85** despite Madden being lower because his current football evidence supports the HQ grade.

Final WR range: **72-99**
Mean: **83.42**
Median: **83**
Below 80: **28**

## TE final calibration

TE was the most compressed initial position. The original mean of roughly 85 treated too many merely solid starters as high-end players.

Major corrections:
- Dalton Kincaid: 93 → **91**
- Tucker Kraft: 92 → **87**
- Colston Loveland: 91 → **87**
- Tyler Warren: 90 → **86**
- Harold Fannin Jr.: 89 → **84**
- Kyle Pitts Sr.: 87 → **84**
- Hunter Henry: 85 → **82**
- Dalton Schultz: 85 → **83**
- Brenton Strange: 85 → **80**
- AJ Barner: 85 → **81**
- Mark Andrews: 84 → **82**
- Colby Parkinson: 84 → **79**
- Isaiah Likely: 81 → **83**
- Evan Engram: 80 → **78**
- Greg Dulcich: 79 → **75**
- Mason Taylor: 79 → **76**
- Gunnar Helm: 79 → **76**
- Tommy Tremble: 78 → **76**
- Charlie Kolar: 78 → **73**
- Drew Sample: 75 → **72**

Juwan Johnson remains **86** because his current and 2025 performance support a high-end current receiving-TE grade.

Final TE range: **72-99**
Mean: **83.09**
Median: **82**
Below 80: **10**

## Defensive groups and Head Coach

Front Seven, Secondary and Head Coach were already graded using the improved separation/discrepancy process.

They were revalidated in this final sweep and required **no additional grade changes**.

### Front Seven
Range: **72-99**
Mean: **83.47**
Median: **83**
Below 80: **47**

### Secondary
Range: **73-99**
Mean: **82.13**
Median: **82**
Below 80: **52**

### Head Coach
Range: **74-99**
Mean: **85.56**
Median: **84**
Below 80: **6**

Head Coach uses credible external all-32 coaching rankings instead of Madden because Madden does not provide a meaningful head-coach overall rating.

## Final scale behavior

The project no longer treats curated membership as an implicit 80+ floor.

The intended interpretation is approximately:

- **95-99:** true elite / position ceiling
- **90-94:** high-end / near-elite
- **85-89:** clearly above-average / very good
- **80-84:** average-to-good starter range
- **75-79:** below-average, shaky starter, specialist, developmental or lower Wheel option
- **low 70s:** weak curated option / limited current evidence

These are semantic guides, not quotas.

## Final validation

| Position | Count | Range | Mean | Median | Below 80 |
| --- | ---: | ---: | ---: | ---: | ---: |
| QB | 34 | 72-99 | 84.41 | 84 | 8 |
| RB | 65 | 72-99 | 82.75 | 82 | 19 |
| WR | 103 | 72-99 | 83.42 | 83 | 28 |
| TE | 33 | 72-99 | 83.09 | 82 | 10 |
| Front Seven | 191 | 72-99 | 83.47 | 83 | 47 |
| Secondary | 168 | 73-99 | 82.13 | 82 | 52 |
| Head Coach | 32 | 74-99 | 85.56 | 84 | 6 |

Total: **626/626**

Missing: **0**
Extra: **0**
Duplicates: **0**

## Authority

Machine-readable position artifacts are the final grade authority.

Earlier per-position audit documents record the initial anchor/position work. Where an earlier board conflicts with this final calibration audit or a machine-readable artifact, the **final machine-readable artifact controls**.

## Runtime boundary

This PR remains grading/calibration only.

No runtime Wheel behavior, selection logic, reveal behavior, historical game freezing, or production code is changed.

Do not merge until Cody explicitly says **Go live**.
