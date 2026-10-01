# Weekly Auction — NFL team-season population and grading audit

## Scope

This locks the **population and hidden grading ladder only** for the proposed NFL Weekly Auction subject: **Best NFL Team-Seasons Since 2000**.

It does **not** change the live Weekly Auction runtime, board size, bankroll, scoring-team count, bidding rules, or current CFB Superteam.

## Population

Locked population: **293 team-seasons**, 2000–2025.

| Era | Team-seasons |
| --- | ---: |
| 2000–2004 | 34 |
| 2005–2009 | 47 |
| 2010–2014 | 65 |
| 2015–2019 | 61 |
| 2020–2025 | 86 |

The population follows the project-wide Weekly Auction rule that **membership and grading are separate decisions**.

### Older-era membership

The pre-2010 bar is intentionally higher.

- 2000–2004: Super Bowl or conference-title participants, 13+ win teams, 12+ win teams with strong scoring dominance, plus a very small set of explicit identity hooks.
- 2005–2009: the above bar broadens to include 12+ win teams, 11+ win playoff teams, and 10+ win teams with a playoff victory.
- Recognition hooks are documented, not inferred from franchise prestige.

Explicit identity-hook additions:

- 2000 LAR — Defending-champion Greatest Show on Turf follow-up; one of the era's defining offenses.
- 2001 LV — Tuck Rule postseason team; a highly recognizable Raiders season.
- 2002 ATL — Michael Vick-led Lambeau playoff upset gives the season a lasting identity hook.
- 2002 SF — Jeff Garcia/Terrell Owens team with the 24-point playoff comeback against the Giants.
- 2003 GB — Favre-era playoff team strongly associated with the 4th-and-26 divisional loss.
- 2008 NE — 11-5 Matt Cassel season after Tom Brady's injury; a historically notable non-playoff team.

### Modern membership

From 2010 onward, the field is intentionally much broader:

- every playoff team;
- every 10+ win non-playoff team.

That creates enough Core / Lower / Wildcard inventory for auction strategy without turning modern NFL history into an arbitrary recognition test.

## Grading philosophy

The hidden scale is **74–100 in 0.5-point increments**.

Grade the **actual team-season**, not the franchise brand.

Evidence priority:

1. Regular-season win rate.
2. Era-neutral scoring dominance (point differential per game).
3. Postseason depth and championship result.
4. Full-season consistency and neighbor placement.
5. Curated context for historically exceptional profiles where the baseline formula materially under- or overstates actual team quality.

A title matters, but it is not an automatic trump card. The ladder intentionally allows dominant non-champions to outrank weaker champions.

Recognition is **membership-only**. It never raises the grade after admission.

## Reproducible baseline

The provisional grade is:

- 76
- plus 32 × (win rate − .500)
- plus 0.5 × point differential per game, bounded from −3 to +6
- plus postseason credit:
  - Super Bowl champion: +6
  - Super Bowl runner-up: +3
  - Conference Championship Game: +1.5
  - Other playoff win: +0.5
  - Playoff berth / missed playoffs: +0

Then round to the nearest 0.5 and clamp to 74–100.

The formula is a calibration baseline, **not** the product grade by itself. A neighbor audit applies explicit overrides when the formula misstates the season.

## Locked distribution

| Grade band | Team-seasons |
| --- | ---: |
| 95–100 | 24 |
| 90–94.5 | 67 |
| 85–89.5 | 75 |
| 80–84.5 | 90 |
| 74–79.5 | 37 |

- Minimum: **74**
- 25th percentile: **82.5**
- Median: **86.5**
- 75th percentile: **90.5**
- Maximum: **100**
- Mean: **86.42**

## Anchor curve

- 2007 New England — **100.0**
- 2004 New England — **99.5**
- 2013 Seattle — **99.0**
- 2016 New England — **99.0**
- 2024 Philadelphia — **98.5**
- 2025 Seattle — **98.5**
- 2000 Baltimore — **98.0**
- 2002 Tampa Bay — **97.5**
- 2015 Carolina — **97.0**
- 2010 Green Bay — **94.5**
- 2019 Baltimore — **93.5**
- 2023 Kansas City — **91.0**
- 2007 New York Giants — **88.5**
- 2011 New York Giants — **86.0**
- 2008 Arizona — **84.5**
- 2010 Seattle — **74.0**

The curve deliberately demonstrates the product rule: championship outcome matters, but actual season quality still controls the grade.

## Neighbor / contradiction audit

A full pairwise check was run on win rate, point differential per game, and postseason depth.

A contradiction is defined as a team-season that is at least as strong on all three dimensions, strictly stronger on at least one, but graded more than 1.0 point below the dominated season.

**Contradictions found: 0.**

## Card metadata

Every row already carries the concise presentation tag requested for the future auction card, for example:

- `16-0 · Super Bowl Runner-Up`
- `12-4 · Super Bowl Champion`
- `11-5 · Missed Playoffs`

The exact Sports-Reference / Pro-Football-Reference URL binding is intentionally left for the presentation/source-link pass, not guessed in this grading artifact.

## Runtime boundary

This PR is calibration only.

Next step after approval:

1. consume this fixed population and hidden ladder;
2. generate realistic seven-day boards;
3. simulate the actual **five-player** market across candidate counts, bankrolls, scoring-team counts, max-win rules, and late-week elasticity;
4. lock mechanics only after the market simulation identifies the best format.

No live auction behavior changes here.
