# NFL Wheel of Football — TE grading audit

## Status

**TE grading locked — October 3, 2026.**

Audit-only grading artifact for every tight end in the current curated NFL Wheel population.

No runtime grading, Wheel generation, reveal logic, eligibility, or historical result behavior is changed here.

Population source: `data/generated/football/wheel-football-priorities.json` at current main `f295e359d9e70f5c55d0452f4f94d9487fbc3f06`.

Population checked: **33 TE entries**.

Constitution: PR #1641.

## Semantic

Grade **current NFL tight-end ability right now**.

Primary components:
- receiving ability;
- route/separation value;
- hands and catch reliability;
- YAC;
- blocking;
- inline usefulness;
- alignment/personnel versatility;
- ability to stay on the field across offensive situations.

Receiving value matters heavily, but the grade is not a fantasy ranking. A complete tight end can grade above a more productive receiving-only player.

## Locked anchor ladder

| Grade | TE |
| ---: | --- |
| 99 | Trey McBride |
| 98 | George Kittle |
| 98 | Brock Bowers |
| 94 | Sam LaPorta |
| 93 | Dalton Kincaid |
| 92 | Tucker Kraft |
| 91 | Colston Loveland |
| 90 | Tyler Warren |
| 89 | Harold Fannin Jr. |
| 88 | Travis Kelce |
| 87 | Kyle Pitts Sr. |
| 85 | Hunter Henry |
| 82 | Dallas Goedert |
| 78 | Tommy Tremble |
| 75 | Drew Sample |

## Locked grades

| Grade | TE | Team | Confidence |
| ---: | --- | --- | --- |
| 99 | Trey McBride | ARI | high |
| 98 | Brock Bowers | LV | high |
| 98 | George Kittle | SF | high |
| 94 | Sam LaPorta | DET | high |
| 93 | Dalton Kincaid | BUF | high |
| 92 | Tucker Kraft | GB | high |
| 91 | Colston Loveland | CHI | high |
| 90 | Tyler Warren | IND | high |
| 89 | Harold Fannin Jr. | CLE | high |
| 88 | Travis Kelce | KC | high |
| 87 | Kyle Pitts Sr. | ATL | high |
| 86 | Juwan Johnson | NO | high |
| 85 | AJ Barner | SEA | high |
| 85 | Brenton Strange | JAX | high |
| 85 | Dalton Schultz | HOU | high |
| 85 | Hunter Henry | NE | high |
| 84 | Colby Parkinson | LAR | high |
| 84 | Mark Andrews | BAL | high |
| 83 | Jake Ferguson | DAL | high |
| 83 | Pat Freiermuth | PIT | high |
| 82 | Dallas Goedert | PHI | high |
| 82 | David Njoku | LAC | high |
| 82 | T.J. Hockenson | MIN | high |
| 81 | Cade Otton | TB | high |
| 81 | Chig Okonkwo | WSH | high |
| 81 | Isaiah Likely | NYG | high |
| 80 | Evan Engram | DEN | high |
| 79 | Greg Dulcich | MIA | medium |
| 79 | Gunnar Helm | TEN | medium |
| 79 | Mason Taylor | NYJ | medium |
| 78 | Charlie Kolar | LAC | high |
| 78 | Tommy Tremble | CAR | high |
| 75 | Drew Sample | CIN | high |

## Pairwise contradiction audit

- Trey McBride 99 > George Kittle 98 = Brock Bowers 98
- Sam LaPorta 94 > Dalton Kincaid 93 > Tucker Kraft 92 > Colston Loveland 91 > Tyler Warren 90 > Harold Fannin Jr. 89 > Travis Kelce 88 > Kyle Pitts Sr. 87
- Juwan Johnson 86 > Hunter Henry 85 = Dalton Schultz 85 = Brenton Strange 85 = AJ Barner 85
- Mark Andrews 84 = Colby Parkinson 84 > Jake Ferguson 83 = Pat Freiermuth 83 > Dallas Goedert 82 = David Njoku 82 = T.J. Hockenson 82
- Isaiah Likely 81 = Cade Otton 81 = Chig Okonkwo 81 > Evan Engram 80 > Greg Dulcich 79 = Mason Taylor 79 = Gunnar Helm 79
- Tommy Tremble 78 = Charlie Kolar 78 > Drew Sample 75

### Pressure points resolved

- Juwan Johnson grades 86 because 889 yards in 2025 plus 173 yards and three touchdowns through three 2026 games establish real receiving ability; weaker inline/blocking value keeps him below Pitts and the star group.
- AJ Barner and Brenton Strange both reach 85 because their receiving production is paired with unusually strong run-blocking evidence; this prevents the system from becoming a receiving-only TE ranking.
- Mark Andrews is 84. His 2025 career-low season matters more than career reputation, while a competent 2026 opening keeps him above the 82-83 group.
- David Njoku and T.J. Hockenson remain at 82 because prior name value does not erase meaningful 2025 decline. Current evidence has not yet justified a rebound into the 84-85 range.
- Colby Parkinson is 84 on a strong 2025 receiving/blocking season, but quiet 2026 usage prevents promotion into the 85 cluster.
- Mason Taylor and Gunnar Helm sit at 79 because each has real NFL starter snaps but limited explosiveness; draft pedigree and youth projection are excluded.
- Charlie Kolar ties Tommy Tremble at 78 because blocking value legitimately counts at tight end even without large receiving volume.

Result: **locked; no remaining contradiction flags.**

## Distribution check — performed after grading

| Band | Count |
| --- | ---: |
| 95-100 | 3 |
| 90-94 | 5 |
| 85-89 | 8 |
| 80-84 | 11 |
| 75-79 | 6 |
| below-75 | 0 |

Mean: **85.33**  
Median: **84**  
Range: **75-99**

No grade was moved to improve the distribution.

## Version lock

Version: `nfl-wheel-te-grades-2026-10-03-v1`

Machine-readable authority:

`data/generated/football/wheel-nfl-te-grades-2026-10-03.json`

Every future actual grade change must preserve:
- previous grade;
- new grade;
- effective date;
- concise reason;
- nearby anchor/peer sanity check.

## Phase boundary

**TE calibration is complete and locked.**

Next position family begins with anchors only.
