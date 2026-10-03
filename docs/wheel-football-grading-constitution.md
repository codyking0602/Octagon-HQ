# Wheel of Football grading constitution

## Status

**Locked product decision — October 3, 2026.**

This document owns the grading philosophy and maintenance process for:
- NFL Wheel of Football
- future current-player CFB Wheel of Football

The grading system must follow the same anchor-first editorial philosophy used by the strongest Football auction calibrations.

Grades are **not** generated from Madden, PFF, rankings, awards, fantasy value, recruiting stars, or any other single external rating source. Those sources may be evidence. They are never the grade.

## Core order of operations

The order is intentional and must not be reversed:

1. Lock the playable population.
2. Define exactly what the grade measures.
3. Lock positional calibration anchors.
4. Grade the full population relative to those anchors.
5. Run within-position pairwise contradiction audits.
6. Inspect the resulting distribution only after grading.
7. Lock/version the grades.
8. Let game presentation adapt to the grades — never change grades to manufacture prettier game outcomes.

The generator, shortlist logic, game economy, or desired score distribution may consume grades, but may never create, raise, lower, infer, or rebalance them.

## NFL grading semantic

A Wheel grade measures **current NFL ability at that position right now**.

It is not:
- career greatness;
- career peak;
- fame or reputation;
- fantasy value;
- positional value above replacement;
- Madden overall;
- a one- or two-game hot streak;
- a projection of what a player may become.

The evaluation should be stable enough that ordinary weekly variance does not move a grade materially, while still being responsive to real in-season development, decline, role changes, and demonstrated breakouts.

### Position normalization

Grades are normalized within football role groups.

A 95 quarterback and a 95 corner mean each is similarly elite **relative to his own role group**. The grade does not claim quarterback and corner have equal league-wide positional value.

Current NFL grading groups:
- QB
- RB
- WR
- TE
- Front Seven
- Secondary
- Head Coach

### Flex

Flex never receives a second grade.

A player carries the same underlying RB, WR, or TE grade when used at Flex.

## Population and roster membership

Population membership and grading are separate decisions.

Only players/coaches in the curated current Wheel population should be graded for normal Wheel gameplay.

Roster/team transactions do not automatically alter ability grade:
- a trade changes team binding, not the player's grade;
- a release/removal changes Wheel eligibility, not the player's historical ability grade;
- a newly eligible player must receive an explicit grade before normal Wheel use.

The playable population remains its own audited source of truth.

## Injury handling

Injury status should primarily affect **eligibility**, not ability.

A major injury does not instantly make a player's football skill worse. A long-term unavailable player should normally be removed from the current playable pool rather than artificially downgraded.

If the player returns and sustained evidence shows a materially changed level of play, then a grade review may be warranted.

## Anchor-first calibration

Every role group gets an explicit anchor ladder **before** the full population is graded.

Anchors are comparative commitments, not decorative examples.

If Player A is a 95 anchor, then every player graded above 95 must have a genuinely stronger current-football case in that role group. Every player placed materially below the anchor must have a correspondingly weaker case.

Anchors should cover the useful range of the playable pool, including:
- current positional ceiling;
- clear elite;
- high-end;
- good starter;
- solid/average starter;
- below-average starter or strong role player;
- weak Wheel option where the current population contains one.

The exact numeric ladder should emerge from the anchor calibration, not from a quota.

### Pairwise contradiction rule

After a position group is graded, run a pairwise/local ordering audit.

For neighboring grades, ask:
- Do we actually believe the higher-graded player is currently better at this role?
- If two players are effectively equivalent, should they tie?
- Is reputation overriding current evidence?
- Is a recent hot/cold streak being overweighted?
- Would the ordering still make sense if player names/logos were hidden?

Resolve contradictions before locking the group.

## Full grading process

Grade one role group across the entire population at a time.

Recommended sequence:
1. QB
2. RB
3. WR
4. TE
5. Front Seven
6. Secondary
7. Head Coach

Do **not** grade team-by-team. Position-first grading produces better comparative consistency.

Do **not** force a bell curve or target counts in a grade band.

If the evidence naturally creates more elite Front Seven players than elite running backs, keep that distribution.

## Evidence philosophy

Use multiple football evidence types where appropriate:
- recent game performance;
- multi-game and season production;
- role/snap share;
- film/scouting consensus;
- advanced metrics;
- honors/All-Pro recognition where relevant;
- quality of opposition and assignment difficulty;
- positional responsibilities;
- injury/availability context;
- historical/current peer comparisons.

No single source owns the grade.

External ratings may help identify players who deserve review, but they do not mechanically set the number.

## Grade maintenance

### Normal cadence: biweekly exception audit

Do **not** re-grade the full population every two weeks.

Every two weeks, run a targeted exception scan for:
- major risers / breakout players;
- meaningful fallers;
- material role changes;
- starter promotions/demotions;
- trades and team changes;
- rookies/young players who now have enough evidence for recalibration;
- returns from long absences where current ability looks materially different;
- coaches whose current performance meaningfully changes the evaluation.

Cross-reference those names against the current Wheel population.

Only flagged players/coaches receive a grading review.

### Change threshold

Ordinary weekly noise should not move a grade.

General maintenance principle:
- minor short-term noise: no change;
- credible sustained change: small adjustment;
- major breakout/decline: larger adjustment;
- structural re-evaluation: rare, anchor-checked adjustment.

Exact point movement is editorial, not formulaic.

Two hot games alone are normally insufficient for a major move.

### Local audit after a change

When a grade changes, audit only the relevant neighborhood around the new grade.

Example:
If an RB moves from the mid-80s into the high-80s, compare him against the nearby high-80s/low-90s RB anchors and peers. A full RB re-audit is unnecessary unless the position ladder itself has become contradictory.

### Anchor review

Anchors should be stable and move much less often than normal player grades.

Use deeper checkpoint reviews roughly around:
- quarter-season;
- midseason;
- late season / postseason transition.

An anchor should change only when the underlying positional hierarchy genuinely changes.

## Versioning and history

Every grade change should be versioned with:
- previous grade;
- new grade;
- effective date;
- concise reason/evidence note;
- nearby anchor/peer sanity check.

Historical completed Wheel games preserve the grade that existed when the player was selected. Later grade updates must never rewrite historical results.

## CFB application

Future current-player CFB Wheel uses the same architecture:
- population first;
- role definitions;
- anchors first;
- position-first full grading;
- pairwise contradiction audit;
- locked/versioned grades;
- biweekly exception review.

CFB may require faster movement for young players because:
- the season is shorter;
- freshmen/sophomores can emerge quickly;
- role changes are more volatile;
- smaller samples can become representative faster than in the NFL.

That does not mean chasing weekly headlines. Changes still require demonstrated football evidence and anchor comparison.

Team/school transfer or depth-chart movement changes identity/eligibility separately from ability grade.

## Locked maintenance principle

The expensive work is the **initial anchor-based calibration**.

After that, the system should normally review a small exception set rather than hundreds of players.

The intended lifecycle is:

**Population → Definitions → Anchors → Full Initial Grade → Pairwise Audit → Lock → Biweekly Exception Scan → Targeted Changes → Local Pairwise Check → Version Log**

This philosophy applies to both NFL and future CFB Wheel grading unless explicitly superseded by a later product decision.
