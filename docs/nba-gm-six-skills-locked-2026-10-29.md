# NBA GM — six basketball skills (OWNER LOCKED October 29, 2026)

**Decision: LOCKED.** These are the six and only six separately displayed current-ability skill ratings for NBA GM, in addition to a distinct, independently audited player overall. Do not rename, remove, combine, or add skill categories without later owner feedback. This is an editorial/gameplay contract, not permission to publish unverified player ratings.

## Six skills and their meaning

| Display label | Stable model key | Includes | Avoid double-counting |
| --- | --- | --- | --- |
| **Scoring** | `scoring` | Individual creation, finishing at the rim/in the paint, shot difficulty, sustainable scoring efficiency and volume against NBA defense | A high 3PT percentage by itself is **Shooting**, not proof of comprehensive self-created scoring |
| **Shooting** | `shooting` | 3PT and midrange shotmaking, catch-and-shoot, off-ball movement and gravity, shot versatility and consistency | Shooting may be elite for a low-volume role player with otherwise limited offense; do not require an elite overall |
| **Playmaking** | `playmaking` | Court vision, passing range, ball control, decision quality, generating advantages/quality shots for teammates | Do not award elite playmaking simply for usage or raw assists |
| **Perimeter Defense** | `perimeterDefense` | Point-of-attack and wing defense, lateral positioning, screen navigation, containment, rotations, anticipation and disruptive ability | Do not automatically convert steals into high defense; don't include rim protection as a perimeter skill |
| **Interior Defense** | `interiorDefense` | Rim protection, post containment, help-side rim deterrence, positioning, paint defensive impact | Do not reduce to blocks alone; small guards are not required to excel at rim protection |
| **Rebounding** | `rebounding` | Defensive and offensive boards, box-outs, positioning, contested recoveries and ending/creating possessions | Rebounds are role/opportunity-adjusted, not merely raw totals inflated by minutes |

## Skill grading semantics

- **95–99:** Truly elite, among the best at that specific basketball ability.
- **90–94:** Outstanding.
- **85–89:** Very good.
- **80–84:** Above average.
- **75–79:** Solid/usable.
- **70–74:** Below average.
- **Below 70:** Real weakness; there is **no artificial 70 skill floor**. Keep weaknesses visible, even on 90+ overall superstars.

All six skill ratings are whole-number, athlete-specific current-skill judgments on a **0–99 scale**. Use independent direct evidence and player/role peers. This is the **skill** range, distinct from the separate overall calibration board. No aggregate/distribution quota automatically assigns skills. An isolated skill score of 95–99 is legitimate on a 70–79 overall role specialist; it does not change the overall automatically.

## Overall, roster fit, and scoring

1. **Overall is independently evaluated** using the already approved 99 / 95 / 90 / 85 / 80 / 75 / 70 anchor philosophy. It is **not** the arithmetic mean or a mechanical weighted formula of the six skills.
2. All six **skill values remain comparable at the skill level league-wide**. The *game value* of each skill depends on the player's legitimate role, position eligibility and teammates. Never penalize a PG heavily for not being a paint protector or require a C to lead in passing/shot creation.
3. Team construction should reward **creation + shooting/spacing + perimeter defense + interior defense + rebounding** with role coverage. A pile of stars with duplicated strengths is not automatically better than a balanced roster. But chemistry bonuses must never arbitrarily erase true player talent.
4. Avoid hardcoded position-stereotype grades. Great shooting centers, passing bigs, rebounding guards and exceptional defensive guards are evaluated on demonstrated skills. Do not weight all six skills equally across all seven NBA roster slots.
5. **Athleticism, basketball IQ, clutch, potential and durability are not additional visible skill categories.** Their on-court effects can be evidenced within the six where appropriate; potential belongs in separately audited development, durability/availability in availability/risk logic. No seventh or hidden substitute rating.
6. **2K is a secondary disagreement/error detector, never an automatic skill or overall authority.** No mass 2K attribute copying, name-based inferred skill numbers, or fabricated source records.
7. Gameplay chemistry/position weighting, postseason probabilities and salary economics still require simulation and owner-only testing. This lock approves *what we rate and what it means*, **not** a final numerical chemistry or season-simulation formula.

## Calibration examples (illustrative archetypes, not approved player ratings)

- Elite movement shooter with modest overall: high **Shooting**; may have limited scoring creation, interior defense, or rebounding.
- Elite screen-and-roll rim protector: high **Interior Defense** and **Rebounding**, weak **Shooting** and self-created **Scoring**.
- Defensive guard: high **Perimeter Defense** without matching elite **Scoring**.
- Superstar lead creator: high **Scoring**/**Playmaking**; a less prominent defensive skill must not automatically drag the independently justified overall down.

## Delivery and preservation

The existing NBA GM foundation's stable keys already match these six exactly. Player-by-player skill ratings for the 330 proposed overall candidates remain **unassigned and uncertified**. When those ratings are researched, record source references, confidence, skill peers, exceptions and role notes before publication. Avoid any public data pipeline, migration, live route or production merge until separately authorized.

**Change control:** Owner-approved design is locked; any subsequent implementation must preserve these meanings and display labels unless the owner asks to change them.
