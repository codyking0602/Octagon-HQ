# CFB Player Greatness Framework

Status: **LOCKED THROUGH QB / RB / WR DESIGN**  
Decision date: **2026-09-02**

This document is the durable CFB player-career greatness design authority for Stage 16 work. It specializes the universal tier-first philosophy in `docs/football-greatness-tier-philosophy.md` for college player careers.

It is a design/calibration contract, not a second factual owner or ranking engine. Runtime implementation must continue through the existing canonical Football factual/query/comparison ownership described in `docs/football-knowledge-ledger.md`.

## Core CFB philosophy

CFB player-career greatness is **peak-first, resume-supported**.

College opportunity is unusually uneven. Great players may sit behind established stars, become the feature player for one season, then leave for the NFL. A one-season transcendent peak can therefore establish an all-time CFB career case. Multiple elite seasons are a meaningful bonus and confidence signal, not an entrance requirement.

The question is:

> How great was this player as a college football player, considering the highest level he proved he could reach, with sustained excellence and resume evidence supporting that demonstrated peak?

It is not:

> Who accumulated the longest or largest college career?

Permanent rules:

- NFL performance contributes **zero** to CFB greatness.
- Recognizability A/B/C tiers remain completely separate from greatness tiers.
- Same greatness tier remains intentionally unordered.
- No hidden decimal score may manufacture an official winner inside a tier.
- Raw career volume cannot substitute for demonstrated peak greatness.
- Sustained excellence rewards repeated elite proof; merely playing more seasons does not.
- Awards are scored by **national standing reached in a season**, not by stacking overlapping trophies from the same season.
- Era/context adjustments must be evidence-based and bounded; do not add subjective mystery points.
- Team success should matter in proportion to how much the position can reasonably own it.
- Career greatness and single-season greatness remain separate comparison questions even though peak-season evidence is a major career input.

## Five permanent greatness tiers

Every CFB player pool uses the same five greatness tiers. Tier sizes are organic; there are no forced percentiles or equal-size buckets.

### Tier 1 — GOAT Case

A credible case exists that this is one of the greatest college careers ever at the position. A transcendent peak can establish this tier with enough supporting evidence; multi-year greatness is not mandatory.

### Tier 2 — Inner Circle

An unquestioned all-time college legend at the position, but the complete case is not strong enough for The HQ to call the player a legitimate GOAT-case member.

### Tier 3 — All-Time Great

Clearly one of the great college careers at the position, but below the apex/inner-circle neighborhood.

### Tier 4 — Major College Great

An outstanding nationally significant college career with real historical value, but not one The HQ should present as an all-time position great.

### Tier 5 — Strong / Notable Career

A legitimately strong and meaningful college career that belongs in the greatness comparison universe but not in the historical-great neighborhoods above.

Subjects below Tier 5 may remain recognizable and usable in objective factual games without belonging in the greatness pool.

Tiers 1-3 are calibrated first because their boundaries matter most. Tier 4/5 numeric gates should be calibrated from the full calculated pool distribution rather than invented before the real universe is run.

## Shared player-career structure

### Quarterbacks

CFB QB career greatness uses:

- **Peak — 60**
- **Sustained Elite Play — 10**
- **Awards / National Standing — 15**
- **Winning / Postseason — 15**

QB is the exception where team winning remains a substantial input because the position has outsized ownership of team outcomes.

### Non-QB skill players

RB and WR establish the preferred non-QB template:

- **Peak — 70**
- **Sustained Elite Play — 10**
- **Awards / National Standing — 15**
- **Big-Stage Impact — 5**

This template should be the starting hypothesis for TE and other non-QB player pools, not a rule that must be copied blindly. Position-specific evidence and controllability may justify adjustments.

For non-QBs, ordinary team winning is not a greatness component. Big-Stage Impact rewards what the player actually did in championship games, playoff games, conference title games, major bowls, or equivalent stages. A lack of such opportunity is not a penalty.

## CFB QB calibration

### QB Peak

The calibrated QB Peak engine measures on-field season dominance through:

- passing efficiency / passing dominance;
- total offensive value, including legitimate rushing QB value;
- scoring creation;
- era / competition dominance.

The original calibrated Peak shape was 20 / 20 / 10 / 5 on a 55-point scale. The final career architecture moves Peak to 60; implementation should preserve the calibrated relative shape and normalize it rather than inventing a new untested internal weighting.

Peak does **not** contain Heisman or championship points. Those belong in Awards and Winning/Postseason.

Calibration truths:

- Joe Burrow 2019 and Cam Newton 2010 are transcendent Peak cases.
- Vince Young, Tim Tebow, Lamar Jackson, Johnny Manziel, Marcus Mariota, Kyler Murray, and RG3 represent different apex/near-apex statistical shapes.
- Colt McCoy 2008 is historically elite but below the cleanest transcendent Peak cases.
- Huge raw passing volume alone cannot max Peak; rate, volume, rushing value, scoring, era, and competition all matter with diminishing returns on volume.

### QB Sustained Elite Play — 10

Reuse the season Peak engine on additional seasons with steep diminishing returns.

- Best season is already captured in Peak.
- Second-best elite season supplies most of the repeat bonus.
- Third-best elite season supplies a smaller bonus.
- Additional seasons do not keep stacking.
- No opportunity penalty exists for players with only one elite starting season.

A partial season may supply repeat evidence if the demonstrated per-game level and workload are meaningful, but a tiny sample cannot receive maximum repeat-season credit.

Calibration truths:

- Tebow and Kellen Moore are max/near-max repeat-proof archetypes.
- Manziel and Lamar receive strong repeat credit.
- Burrow receives little repeat credit and remains fully eligible for Tier 1.
- Cam can receive zero repeat credit and remain fully eligible for Tier 1.

### QB Awards / National Standing — 15

Score the **level of national standing reached in each distinct season**, not trophy count.

- Best recognition season: up to 10.
- Second distinct elite-recognition season: up to 4.
- Third distinct recognition season: up to 1.

Heisman winner is max-level national standing for a season, but does not automatically equal 15/15 career Awards. Equivalent national standing can also reach the top band, such as a Heisman runner-up combined with major national player/QB awards.

Calibration truths:

- Tebow maxes repeated national standing.
- Lamar, Manziel, Colt, and Mariota gain substantial repeat-recognition credit.
- Vince is not punished simply for never winning the Heisman; his 2005 national standing was top-level.
- Burrow and Cam receive roughly one max-season block, not five stacked award bonuses from one sweep season.
- Kellen Moore receives meaningful repeated recognition without treating repeated lower Heisman finishes as equivalent to winning it.

### QB Winning / Postseason — 15

QB winning is based on the highest team level reached **with the player as the primary QB**, with diminishing returns across later seasons.

- National-title season can max the best-season block.
- A title already encompasses the conference-title/playoff path from that season; do not stack the same run repeatedly.
- Backup/contributor titles receive at most trivial contextual credit.
- Repeated elite winning matters with diminishing returns.
- Program elevation may supply at most a small bounded contextual adjustment when defensible.

A.J. McCarron is an important control: he should score extremely high in this component because he owned major starting-QB team success. If that ever makes his overall greatness too high, Peak or another component is wrong; do not falsify the Winning component to compensate.

### QB Tier gates

Let QB Support = Sustain + Awards + Winning, maximum 40.

**Tier 1 — GOAT Case** if any route is met:

1. Peak >= 58 and a national title as primary QB; or
2. Peak >= 54, a national title as primary QB, and Sustain + Awards >= 17; or
3. Peak >= 54 and Support >= 33 without requiring a title.

**Tier 2 — Inner Circle**:

- Peak >= 54;
- Support >= 14;
- fails Tier 1.

**Tier 3 — All-Time Great** if either route is met:

1. Peak >= 48 and Support >= 12; or
2. Peak >= 45 and Support >= 27;
- fails Tier 2.

Boundary truths that produced these gates:

- Burrow, Cam, Vince, and Tebow belong in the legitimate GOAT-case neighborhood through different resume shapes.
- Manziel and Lamar belong in the Inner Circle neighborhood without being promoted merely by apex individual seasons.
- Colt and Kellen are All-Time Great calibration anchors whose multi-year resumes cannot accumulate past an apex they never demonstrated.
- The original `Peak 54 + national title = Tier 1` shortcut was rejected because Jameis Winston exposed it as too permissive.
- The exceptional-resume Tier 3 route was added because Kellen Moore exposed a model that could otherwise underrate enormous repeated elite bodies of work.

## CFB RB calibration

### RB Peak — 70

The tested internal RB Peak engine is:

- **Rushing dominance — 25**
- **Efficiency / explosiveness — 15**
- **Total scrimmage dominance — 10**
- **Scoring dominance — 5**
- **Era / competition dominance — 5**

That engine totals 60 and should be normalized to the final 70-point Peak share rather than redesigned without new calibration.

Receiving is an additional way to create RB value, not a requirement. A historically overwhelming pure runner can max or nearly max Peak through rushing/scrimmage dominance.

Peak calibration anchors include Barry Sanders 1988 at the ceiling; Reggie Bush 2005, Ricky Williams 1998, Derrick Henry 2015, Christian McCaffrey 2015, Adrian Peterson 2004, and Jonathan Taylor at different apex/near-apex shapes. Huge-volume controls must remain historically strong without raw 2,000-yard volume automatically producing the ceiling.

### RB Sustained Elite Play — 10

Second-best season:

- Peak60 >= 52 -> 7
- 48-51 -> 5
- 44-47 -> 3
- 40-43 -> 1
- below 40 -> 0

Third-best season:

- Peak60 >= 48 -> 3
- 44-47 -> 2
- 40-43 -> 1
- below 40 -> 0

Maximum 10. Fourth seasons do not keep stacking.

Partial seasons may count based on per-game dominance but cannot receive maximum repeat credit without meaningful workload.

Calibration truths:

- Herschel Walker and Jonathan Taylor max repeated elite proof.
- Ricky Williams receives near-max repeat value.
- Barry Sanders can receive zero Sustain and remain a GOAT-case player.
- Derrick Henry receives little repeat credit and is not penalized for Alabama opportunity/timing.

### RB Awards / National Standing — 15

Use the same distinct-season national-standing structure as QB.

For RB, Doak Walker + consensus/unanimous All-America is serious national standing even if Heisman voting was QB-heavy.

Calibration truths:

- Herschel maxes repeated national standing.
- Ricky and Reggie receive near-max repeated recognition.
- Jonathan Taylor receives major repeated credit without pretending repeated top-10 Heisman finishes equal a Heisman win.
- Barry and Henry receive one max national-standing season, not automatic 15/15.
- Bijan Robinson receives meaningful premier-RB/unanimous-AA credit despite not needing Heisman-finalist status.

### RB Big-Stage Impact — 5

This is **player production in major moments**, not team success.

- 5 — historic performance in championship/major-postseason moments;
- 4 — multiple major-stage performances or extremely strong title-run impact;
- 3 — one major bowl/championship-game performance;
- 2 — meaningful production in major games;
- 1 — some legitimate big-stage evidence;
- 0 — none or no opportunity.

Zero is not a penalty.

Derrick Henry, Christian McCaffrey, and Barry Sanders illustrate different valid ways to gain big-stage credit. Bijan Robinson is not meaningfully penalized because Texas did not provide the same championship opportunity.

### RB Tier gates

Let RB Support = Sustain + Awards + Big Stage, maximum 30.

**Tier 1 — GOAT Case** if any route is met:

1. Peak >= 67 and Support >= 10; or
2. Peak >= 61 and Support >= 15; or
3. Peak >= 58 and Support >= 27.

**Tier 2 — Inner Circle** if either route is met:

1. Peak >= 55 and Support >= 10; or
2. Peak >= 52 and Support >= 23;
- fails Tier 1.

**Tier 3 — All-Time Great** if either route is met:

1. Peak >= 50 and Support >= 6; or
2. Peak >= 47 and Support >= 16;
- fails Tier 2.

Calibration truths:

- Barry can reach Tier 1 despite zero Sustain.
- Henry can reach Tier 1 despite limited repeat elite evidence.
- Herschel, Ricky, Reggie, Tony Dorsett, O.J. Simpson, Earl Campbell, Bo Jackson, and Archie Griffin represent different GOAT-case resume shapes.
- McCaffrey, Jonathan Taylor, Marshall Faulk, and Adrian Peterson are important Tier 1/2 boundary tests.
- Bijan belongs in the Inner Circle neighborhood without being penalized for team/championship context.
- Team winning was deliberately reduced from the original 15-point RB experiment because it produced an indefensible gap between backs such as Herschel and Bijan that said more about their teams than their RB greatness.

## CFB WR calibration

### WR Peak — 70

- **Receiving dominance — 30**
- **Efficiency / explosiveness — 15**
- **Scoring dominance — 10**
- **Offensive centrality — 10**
- **Era / competition dominance — 5**

Rushing/return value may enhance scoring and offensive centrality, but it does not receive a giant standalone bucket. A hybrid weapon cannot become a GOAT WR primarily through special-teams value while lacking receiving dominance.

Peak anchors include DeVonta Smith 2020, Larry Fitzgerald 2003, Randy Moss 1997, Michael Crabtree 2007, Ja'Marr Chase 2019, Justin Blackmon 2010, and Troy Edwards 1998 at different apex shapes. Large small-school/system production should be adjusted, not erased.

### WR Sustained Elite Play — 10

Second-best season:

- Peak >= 60 -> 7
- 56-59 -> 5
- 52-55 -> 3
- 48-51 -> 1
- below 48 -> 0

Third-best season:

- Peak >= 56 -> 3
- 52-55 -> 2
- 48-51 -> 1
- below 48 -> 0

Maximum 10.

Corey Davis is a max-repeat archetype. Crabtree and Blackmon receive major repeat bonuses. Marvin Harrison Jr. receives strong repeat evidence. Ja'Marr Chase can receive little/no Sustain without invalidating his apex case.

### WR Awards / National Standing — 15

Use the same distinct-season anti-double-counting structure.

Biletnikoff + consensus/unanimous All-America is serious national standing even without a Heisman finalist slot.

NFL reputation is never imported. Calvin Johnson, Julio Jones, Odell Beckham Jr., and similar names are evaluated only on college evidence.

### WR Big-Stage Impact — 5

Same non-QB principle as RB: reward what the WR actually produced on major stages, not whether the team happened to win a title.

DeVonta Smith's 2020 title-game explosion, Ja'Marr Chase's 2019 title-game performance, and Jaxon Smith-Njigba's Rose Bowl are archetypal high-end evidence.

### WR Tier gates

Let WR Support = Sustain + Awards + Big Stage, maximum 30.

**Tier 1 — GOAT Case** if any route is met:

1. Peak >= 66 and Support >= 8; or
2. Peak >= 63 and Support >= 14; or
3. Peak >= 60 and Support >= 18.

**Tier 2 — Inner Circle** if either route is met:

1. Peak >= 58 and Support >= 8; or
2. Peak >= 55 and Support >= 14;
- fails Tier 1.

**Tier 3 — All-Time Great** if either route is met:

1. Peak >= 52 and Support >= 5; or
2. Peak >= 49 and Support >= 11;
- fails Tier 2.

Broad calibration neighborhoods:

- GOAT-case: Randy Moss, Larry Fitzgerald, Michael Crabtree, DeVonta Smith, Ja'Marr Chase, Justin Blackmon; Troy Edwards is an important Tier 1/2 system/competition boundary.
- Inner Circle: Amari Cooper, Calvin Johnson, Torry Holt, Peter Warrick, Corey Davis, Davante Adams, Marvin Harrison Jr., Desmond Howard, Jordan Addison; Ryan Broyles is an important T2/T3 body-of-work boundary.
- All-Time Great: CeeDee Lamb, Jaxon Smith-Njigba, Tavon Austin, and similar profiles; Percy Harvin is an important WR-vs-hybrid boundary.

## Historical/data coverage rule

Model correctness and data coverage are separate problems.

The current normalized CFB factual source coverage is much stronger for modern FBS/I-A players. Historical and lower-division legends such as Jerry Rice at Mississippi Valley State must not disappear from an all-time college product merely because the convenient FBS source lacks their full career stats.

When a legitimate historical subject lacks required facts, repair/hydrate the canonical factual owner. Do not create a ranking-specific fallback, manual parallel database, or game-specific roster.

## Continuing the remaining CFB player pools

For TE, OL, DL/EDGE, LB, Secondary, and K/P:

1. Start from the five permanent greatness tiers and the peak-first CFB philosophy.
2. Choose the closest proven weight skeleton; non-QBs should begin from 70 Peak / 10 Sustain / 15 Awards / 5 position-appropriate impact unless the position clearly demands a different responsibility split.
3. Design the position-specific Peak engine.
4. Stress-test apex seasons, ordinary elite controls, volume/system outliers, era extremes, and famous-NFL-name college sanity checks.
5. Calibrate Sustain using the same diminishing-return concept rather than raw career longevity.
6. Calibrate Awards by distinct-season national standing using the position's legitimate premier honors and All-America evidence.
7. Keep team success small unless the position genuinely owns it; prefer player-specific big-stage evidence for non-QBs.
8. Build Tier 1-3 gates from anchors and boundary failures; do not use forced percentiles.
9. Run a broader historical calibration board and repair the framework only when a real boundary failure appears.
10. Leave Tier 4/5 numeric cutoffs for the full-pool distribution audit unless a clear boundary truth requires earlier calibration.

Manual review exists to establish truths and inspect weird outputs/boundaries. It must not become hand-tiering the full Football universe.
