# NBA Average Fan — four-month quality and rotation proposal

**Review-only. Do not merge before owner approval.**

## Content objective and result

Target: 5 NBA Casual plays each month for four months, at **9 questions per run** (two from each of grades 2–5, and one protected Final). The bank now contains **180 authored evergreen questions**, split into **40 questions at each of the four grades and 20 protected Finals**. This is the mathematical inventory necessary for 20 distinct games, not an assurance of identical challenge difficulty across all seeds.

The previous bank of 121 is intact. The addition is an append-only **59 questions**: 7 grade 2, 4 grade 3, 18 grade 4, 20 grade 5, and 10 protected Finals. Existing IDs remain stable. Each addition has a source URL from NBA.com or the NBA's official rulebook. The new subjects include recognizable franchise moves, historic Finals and playoff moments, NBA strategy at deeper tiers, and precise rules. No arbitrary MVP or first-overall-pick lists were introduced.

### Difficulty policy

- **2nd grade:** NBA teams, familiar geography/logos, standard box-score terminology.
- **3rd grade:** mainstream NBA history and basic basketball tactics and game awareness.
- **4th grade:** real basketball actions and recognizable historical series, venues, and NBA moments.
- **5th grade:** meaningful tactical knowledge and distinctive moments with four credible answers; no randomly obscure player statistics.
- **Final:** ten additional landmark moments with identifiable people or teams and defensible choices, not recycled award trivia.

The editorial check includes NBA Millionaire's 240-question locked bank, Sports Feud main and Fast Money including expansion rounds, and NBA Who Am I authored scripts. Candidates that repeated memorable Who Am I clues (e.g. Klay Thompson's 37-point quarter or Vince Carter's 2000 Slam Dunk Contest) were replaced rather than retained to satisfy volume. Source and wording checks should remain part of future additions.

## Selection / replay contract

- Only **owner-only NBA Casual** consumes a rotation slot, **when the user selects a fan and actually starts the game**.
- A rotation slot reserves only 9 question IDs. No fan identity, answers, attempts, full runs, analytics or leaderboard records are captured.
- Question IDs are kept in this browser's `localStorage` under `octagon-hq:nba-average-fan:four-month-rotation:v1`. It survives refreshes and returns on the same browser, but **does not sync across devices/browsers**; clearing site data resets the rotation, and disabled browser storage cannot guarantee uniqueness.
- Exactly 20 games fit in the pool before cycle reset; game 21 starts a fresh rotation where repeats become possible again.
- NBA's date-seeded **Daily-style preview stays fixed per date** and does not reserve Casual question IDs. Nothing is published to official Daily.
- Existing Football/UFC Casual rotation and NBA gameplay visuals, stage, score system, lifelines, fans and money ladder are unchanged.

## Required premerge verification

- Every bank question validates with unique question IDs, one correct answer, distractors and official sources. There is an explicit limit of 45 characters per choice.
- At least three independent seed sequences must complete **20 consecutive NBA Casual games, using 180 distinct question IDs**, with zero board duplicates, two questions in each grade per game, a separate protected Final and no same-board protected-Final named-topic overlap.
- Complete exact-head CI, TypeScript/production build, and phone-layout tests must be green; do not merge until owner approves.
