# Weekly Auction — NFL team-season population and grading audit

## Scope

This locks the **auction-eligible population and existing hidden grading ladder** for the proposed NFL Weekly Auction subject: **Best NFL Team-Seasons Since 2000**.

It does **not** change the live Weekly Auction runtime, board size, bankroll, scoring-team count, bidding rules, or current CFB Superteam.

## Population cut

The initial grading pass covered **293 seasons**. That was intentionally broad for grading, but too broad for the actual auction authority.

The locked auction pool is now **200 team-seasons**.

| Era | Auction-eligible team-seasons |
| --- | ---: |
| 2000–2004 | 30 |
| 2005–2009 | 35 |
| 2010–2014 | 40 |
| 2015–2019 | 40 |
| 2020–2025 | 55 |

Yearly caps:

- 2000–2004: **6 per year**
- 2005–2009: **7 per year**
- 2010–2019: **8 per year**
- 2020–2024: **9 per year**
- 2025: **10**

This keeps older history selective while allowing the engine a broader recent inventory.

## Selection rules

The pool cut does **not** re-grade anything.

Within each season:

1. protect every conference championship participant;
2. protect explicitly documented identity-hook seasons;
3. fill the remaining yearly slots by the already-locked hidden grade.

Recognition can therefore affect **membership**, but it still cannot raise a grade.

Explicit value / identity protections:

- 2000 LAR — Defending-champion Greatest Show on Turf follow-up; one of the era's defining offenses.
- 2001 LV — Tuck Rule postseason team; a highly recognizable Raiders season.
- 2002 ATL — Michael Vick-led Lambeau playoff upset gives the season a lasting identity hook.
- 2002 SF — Jeff Garcia/Terrell Owens team with the 24-point playoff comeback against the Giants.
- 2003 GB — Favre-era playoff team strongly associated with the 4th-and-26 divisional loss.
- 2008 NE — 11-5 Matt Cassel season after Tom Brady's injury; a historically notable non-playoff team.
- 2010 SEA — 7-9 division winner with the Beast Quake playoff upset; an iconic lower-grade season.
- 2011 DEN — Tebow-era 8-8 team with the overtime playoff win over Pittsburgh; an iconic value/trap season.
- 2012 WAS — RGIII rookie-season division champion; one of the most recognizable teams of the early 2010s.
- 2020 CLE — Cleveland's first playoff win in more than two decades makes this 11-5 season historically recognizable.
- 2023 GB — Jordan Love's first playoff team and road upset of Dallas make this 9-8 season a useful modern identity/value candidate.

Examples of why this matters:

- **2010 Seattle** stays in the pool at **74.0** because Beast Quake makes the season historically useful, not because recognition inflated the grade.
- **2011 Denver** stays at **74.0** for the Tebow playoff identity.
- **2008 New England** stays at **85.0** for the Cassel/11-5 identity.
- **2023 Green Bay** stays at **79.0** as a modern recognizable value candidate.

## Grading

The existing **74–100, 0.5-point** ladder remains unchanged for every retained team.

The grading philosophy remains:

- grade the actual team-season, not the franchise brand;
- regular-season quality and scoring dominance are the foundation;
- postseason performance matters but is not an automatic trump card;
- dominant non-champions may grade above weaker champions;
- recognition is membership-only;
- curated neighbor overrides are allowed when the baseline formula materially misstates the season.

No new distribution target was created for the 200-team pool, and grades were **not** changed to force a statistical shape.

## Anchor curve

The previously locked anchors remain unchanged:

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

## Contradiction sanity check

The retained 200-team pool still passes the existing pairwise sanity check across win rate, point differential per game, and postseason depth.

**Dominance contradictions over 1.0 grade point: 0.**

This is a grading-consistency check, not a distribution exercise.

## Runtime boundary

This PR remains calibration only.

Next step:

1. use this fixed **200-team** authority;
2. generate realistic seven-day boards;
3. simulate the actual **five-player** market;
4. compare candidate counts, bankrolls, scoring-team counts, max-win rules, and late-week elasticity;
5. lock mechanics only after the market simulation identifies the most fun format.

No live auction behavior changes here.
