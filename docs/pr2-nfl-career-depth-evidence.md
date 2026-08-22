# Football PR2 — NFL career depth evidence

This is a focused evidence note for the NFL comparison-depth pass. The canonical product/content contract remains `docs/football-games-roadmap.md`, and the canonical comparison-rating owner remains `src/features/back-room/footballRankFiveModel.ts`.

## Review cutoff

NFL career ratings in PR2 are reviewed through the completed 2025 NFL season.

## Review method

Each NFL career pack was reviewed against its versioned rubric in `footballContentContract.ts`, using factual career resumes, era/context, whole-pool calibration, and pairwise sanity checks.

Pro Football Reference career leaderboards and Hall of Fame Monitor pages were used as factual evidence inputs for career production, efficiency, awards, longevity, and historical standing. They are evidence sources, not a replacement formula for the category rubric.

## Low-end calibration

The expanded pools intentionally use recognizable failed or short careers rather than obscure filler. Examples include:

- Ryan Leaf — 4–17 as a starter, 14 TD / 36 INT.
- Trent Richardson — No. 3 pick, 2,032 rushing yards, 3.3 yards per carry.
- Montee Ball — 731 NFL rushing yards.
- Justin Blackmon — No. 5 pick, 1,280 receiving yards in 20 games.
- Corey Coleman — No. 15 pick, 789 receiving yards.
- N'Keal Harry — first-round pick, 714 receiving yards.
- Matt Patricia — 13–29–1 as Detroit head coach.
- Urban Meyer — 2–11 as Jacksonville head coach.
- Hue Jackson — 11–44–1 as an NFL head coach, including 3–36–1 in Cleveland.

The purpose is not to punish draft busts for draft position. Draft position makes the low-end subject recognizable; the rating is based on the NFL career that actually happened.

## Ownership

No second ratings provider was added. Blind Rank 5 and Keep 4 / Cut 4 continue to consume the same canonical Football comparison pool. The factual-stat owner remains deferred to roadmap PR5.
