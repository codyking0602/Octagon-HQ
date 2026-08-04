# Octagon HQ Play Games Improvement Contract

_Last approved: 2026-08-04_

This is the canonical product contract and implementation roadmap for improving Octagon HQ Play and expanding Today’s Challenge beyond Find the Leader.

Read this document before changing any Play game, Today’s Challenge, daily scoring, daily history, streaks, reminders, or leaderboards.

Current implementation owners remain authoritative until a roadmap PR intentionally replaces or extends them. This document records approved direction; it does not mean the roadmap has already been implemented.

## Product objective

The current games are individually complete, but they do not yet operate as one coherent daily-game system.

Today’s Challenge currently uses only Find the Leader because it has all four traits required for an official daily:

1. One exact setup for every player.
2. A clear completion state.
3. A defined score.
4. An immediately understandable winner or leaderboard result.

The approved direction is to preserve Find the Leader as the primary daily game while rotating in Wavelength, Blind Resume, Blind Rank 5, and Keep 4, Cut 4 after each game has a fair official score and sufficient replayability.

Auction and Better Than remain direct challenge games and do not enter Today’s Challenge.

## Current game matrix

| Game | Current result | Daily future | Product role |
| --- | --- | --- | --- |
| Find the Leader | Native score from 1–10 | Yes | Primary official daily |
| Wavelength | Native score from 0–100 | Yes, after content audit | Opinion-calibration daily |
| Blind Resume | Native score from 0–5 | Yes | Hidden résumé daily |
| Blind Rank 5 | Completed ranking only | Yes, after grading and difficulty repair | Blind ordering daily |
| Keep 4, Cut 4 | Completed card only | Yes, after grading and difficulty repair | Resource-allocation daily |
| Better Than | Subjective claim comparison | No | Direct argument challenge |
| Auction | Private final score from 0–100 | No | Flagship strategic challenge |

## Core daily rules

Every official daily game must follow the same contract:

- One exact, versioned setup is shared by all players for the Central-time day.
- The official first completed attempt is immutable.
- Replays never replace the official score.
- Every official result resolves to a normalized 0–100 score.
- Tied scores share rank.
- Completion time is not a tiebreaker.
- Streak credit is earned by completing the official daily, regardless of score.
- Historical results remain pinned to the content and scoring versions used when played.
- Later rating, pool, copy, or formula changes never rewrite prior results.
- Official hidden answers, ratings, future clues, and grading evidence remain private until the relevant reveal boundary.
- Casual and direct-challenge modes remain available and do not write official daily history.

## Approved daily score contract

| Daily game | Native result | Official score |
| --- | ---: | ---: |
| Find the Leader | 1–10 | Native score × 10 |
| Wavelength | 0–100 | Existing distance score |
| Blind Resume | 0–5 | Correct picks × 20 |
| Blind Rank 5 | Ten pairwise ordering comparisons | Correct comparisons × 10 |
| Keep 4, Cut 4 | Sixteen kept-versus-cut comparisons | Correct comparison percentage, rounded consistently |

The UI should preserve the native result where it helps comprehension. Examples:

- Blind Resume: `4/5 · DAILY SCORE 80`
- Blind Rank 5: `8 OF 10 COMPARISONS · DAILY SCORE 80`
- Keep 4, Cut 4: `14 OF 16 COMPARISONS · DAILY SCORE 88`

Do not create a cross-game all-time average until real production score distributions prove that the normalized scores are meaningfully comparable. Daily leaderboards are fair because every player receives the same game and exact setup that day.

# Game-by-game audit and approved direction

## Find the Leader

### Current strengths

- Clearest objective in Play.
- Verified UFC data rather than subjective ratings.
- Natural 1–10 score.
- Immediate win/loss comprehension.
- Strong daily history, streak, and leaderboard behavior.
- Large question bank with recent-definition protection.

### Current weakness

The categories change, but the player always performs the same mechanic: eliminate fighters while leaving the leader standing. Using it every day makes the overall daily experience feel repetitive even when the question changes.

### Approved changes

- Preserve the core engine and presentation.
- Keep Find the Leader as the most common daily game.
- Convert its official score to the shared 0–100 display while retaining the native `/10` result.
- Gradually add genuinely distinct verified categories rather than many near-duplicate year-window variants.
- Preserve all existing Find the Leader history when the generalized daily owner launches.

### Product grade

- Standalone game: A
- Daily suitability: A+
- Required work: minimal adaptation to the generalized daily system

## Blind Resume

### Current strengths

- Strongest overall game design in the current Play catalog.
- Five understandable decisions.
- Hidden identities create real uncertainty.
- Matchups are weighted toward close résumé calls.
- Winners come from the canonical calculated rankings rather than a duplicate Play ranking.
- Native score already exists.

### Current weakness

A five-point scale is coarse when compared visually with Wavelength or future 0–100 games.

### Approved changes

- Preserve the engine and matchup construction.
- Normalize the native result to 0–100 by multiplying correct picks by 20.
- Continue showing the native result.
- Optionally add one compact post-reveal explanation naming the two or three résumé factors that most separated the fighters.
- Do not turn each reveal into a long Intelligence report.

### Product grade

- Standalone game: A+
- Daily suitability: A
- Required work: scoring normalization and daily integration

## Wavelength

### Current strengths

- Excellent core concept.
- Four adaptive clues create a visible path toward the hidden number.
- Existing 0–100 score is immediately compatible with daily leaderboards.
- Strong challenge comparison because both players can see their full guess paths.

### Current weaknesses

- The clue pool is too small for long-term replayability.
- The current pool mixes fighters, skills, personalities, venues, belts, commentary, history, atmosphere, and UFC culture without a sufficiently explicit calibration standard.
- Some individual ratings do not feel internally consistent.
- The player who approves ratings should not have to learn the hidden answer bank and spoil the game.
- Official hidden targets and future clue evidence need a private competitive boundary.

### Approved changes

- Expand the calibrated clue bank to at least 250 items before full daily launch, with 300 as the preferred target.
- Use an explicit private 1–100 rubric:
  - 1–10: disastrous or essentially worthless
  - 20–30: clearly poor
  - 40–45: below average
  - 50: average UFC level
  - 60–70: clearly good
  - 75–85: excellent
  - 90–95: historically elite
  - 96–100: nearly unimprovable
- Independently grade items more than once.
- Flag large internal disagreements for rewrite, removal, or focused review.
- Keep Cody away from the completed answer key wherever practical.
- Add recent-item, recent-category, and exact-clue repetition protection.
- Version the clue catalog and scoring evidence.
- Keep official targets, ratings, and unrevealed clues private until completion.
- Preserve casual replay and exact direct challenges.

### Product grade

- Standalone game today: B
- Potential after audit: A+
- Daily suitability today: B−
- Required work: major content expansion, calibration, privacy, and repetition protection

## Blind Rank 5

### Current strengths

- Excellent blind-decision concept.
- Easy to understand and fast to play.
- Locked placements create tension.
- Multiple category packs support replayability.

### Confirmed current weakness

The existing generator is too orderly. It deliberately builds a top anchor, strong option, middle option, trap option, and wildcard. A true bad fighter is available only through a 10% wildcard path, and the lineup is capped at one bad fighter.

That creates many boards that can be correctly sorted by recognizing broad quality tiers. Winning too often reduces tension.

The current Play fighter pool is also too top-heavy because it primarily consists of ranked fighters, with very few true low-end Play-only fighters.

### Approved pool changes

- Expand the separate Play fighter pool to approximately 150–200 UFC fighters.
- Do not add these fighters to the main GOAT rankings merely to support games.
- Give non-ranked Play fighters reviewed internal ratings or broad tier evidence only.
- Keep the main rankings UFC-only and calculated through their existing canonical owner.

### Approved lineup shapes

Replace the predictable staircase with a versioned mix of lineup shapes:

- Balanced: a broad ladder similar to the current game.
- Top-heavy: several elite or great fighters competing for limited high slots.
- Bottom-heavy: multiple below-average or bad fighters competing for low slots.
- Middle cluster: five fighters close enough that every placement is dangerous.
- Chaos: one obvious anchor with several volatile low or middle options.

A below-average or bad fighter should appear on roughly 60–70% of boards. Two low-end fighters should appear regularly. A true bad fighter does not need to appear every time, but it must be materially more common than the current 10% wildcard path.

### Approved score

Five fighters create ten pairwise ordering comparisons.

- Award ten points for every correctly ordered pair.
- Maximum score: 100.
- Fighters within an approved small rating tolerance may be treated as defensible in either order.
- The result screen should show the canonical order, broad tiers, correct comparison count, and normalized score.
- Do not expose private future lineups or unnecessary exact rating evidence before completion.

### Product grade

- Concept: A
- Current execution: B−
- Daily suitability after repair: A−
- Required work: pool expansion, generator redesign, grading, and result presentation

## Keep 4, Cut 4

### Current strengths

- Strong locked-decision tension.
- Exact four/four constraint creates meaningful resource pressure.
- Fourteen category concepts provide broad casual replay value.
- Direct challenges are naturally comparable.

### Current weaknesses

- The current generator uses another broad tier staircase rather than concentrating difficulty around the fourth/fifth-place cutoff.
- Low-end surprises are too uncommon.
- The completed result is a card, not an official judgment.
- Highly subjective categories are not equally suitable for an official daily.

### Approved generation changes

Build lineups around the cutoff:

- Two relatively clear keeps.
- Two relatively clear cuts.
- Four fighters near the bubble.

The player should frequently regret filling a Keep slot too early because later fighters remain plausible. Versioned lineup shapes may still introduce top-heavy, bottom-heavy, or chaos variants, but the fourth/fifth decision boundary should remain the main difficulty owner.

### Approved daily categories

Initial official daily eligibility should favor defensible categories:

- UFC Careers
- All UFC Careers
- Former Champions
- Divisional careers
- Hardest to Beat at Their Peak
- Most Complete Fighter
- Best Finisher

The following remain casual until their ratings receive a Wavelength-style audit:

- Biggest UFC What-If
- Action Fighters
- UFC Star Power
- Cult & Chaos

### Approved score

Four kept fighters compared with four cut fighters create sixteen kept-versus-cut comparisons.

- Score the percentage of comparisons where the kept fighter has the stronger canonical rating.
- Use one consistent rounding rule.
- Show both the normalized score and the number of model top-four fighters retained.
- Apply a defensible tolerance for nearly tied ratings.

Example result:

- `3 OF MODEL TOP 4 KEPT`
- `14 OF 16 COMPARISONS CORRECT`
- `DAILY SCORE 88`

### Product grade

- Concept: A−
- Current execution: B
- Daily suitability after repair: B+
- Required work: cutoff-focused generation, category eligibility, grading, and result presentation

## Better Than

### Approved role

Better Than remains an unscored direct argument challenge.

The game intentionally compares claim size, overlap, shared names, and disputed names without declaring one list objectively correct. Adding a model winner would damage the product.

### Approved future improvements

- Featured one-tap claims.
- Random claim generator.
- Suggested claim sizes.
- Popular group claims.
- Rematches using the same target with another comparison lens.
- Reduced setup friction without removing the current custom builder.

Better Than does not enter Today’s Challenge.

## Auction

### Approved role

Auction remains the flagship strategic direct challenge.

It already has private server-owned content, private grading, final 0–100 scores, a winner or true tie, participant identity, and collection comparison.

### Approved future improvement

Add a complete vertical auction log showing every item, both bids, winner, charged amount, and final placement. The current latest-round and final-collection views do not fully communicate how the result happened.

Auction does not enter Today’s Challenge.

# Approved Today’s Challenge rotation

After all eligible games are ready, use a deterministic twenty-day cycle:

| Game | Days per cycle | Share |
| --- | ---: | ---: |
| Find the Leader | 8 | 40% |
| Blind Resume | 5 | 25% |
| Wavelength | 3 | 15% |
| Blind Rank 5 | 2 | 10% |
| Keep 4, Cut 4 | 2 | 10% |

Rotation rules:

- No game appears on consecutive days.
- The schedule is deterministic and versioned.
- Every player receives the same official game and exact setup for that Central-time day.
- A future weight change creates a new schedule version and does not rewrite prior days.
- Find the Leader remains the default fallback only when the canonical daily owner cannot materialize another approved setup before publication. A fallback must be recorded as explicit daily evidence, not silently selected through a second route.

# Canonical ownership requirements

The implementation must preserve the project standard:

> One owner. One purpose. Small diff. Focused test. Exact-head green. Then merge.

Required ownership boundaries:

- `src/features/play/playRegistry.ts` remains the visible game catalog and capability declaration owner unless one roadmap PR intentionally replaces that contract.
- Existing casual game engines remain the casual generation owners.
- One generalized official Today’s Challenge owner must own daily schedule selection, exact setup identity, content/scoring versions, first-attempt result persistence, and official leaderboard projection.
- `FindLeaderHistoryProvider` must not remain a competing second official-daily history owner after generalized history launches. Existing data must migrate or project through the new canonical owner.
- Supabase owns authenticated cross-device official daily state.
- Browser local state may support signed-out casual play but must not masquerade as a global official leaderboard.
- Official hidden answers and grading data must not be shipped in browser payloads before reveal.
- Do not create a second leaderboard repository, second daily scheduler, second reminder path, duplicate score store, or local-storage fallback beside the canonical owner.
- Direct profile challenges continue through the existing Challenge Center owners.
- Auction retains its existing private server owners and is not folded into the normal daily scoring system.

# Implementation roadmap

The complete approved plan is **nine PRs including this documentation PR**.

After this documentation PR, **eight implementation PRs remain**.

Each PR must start from current `main`, preserve existing owners, include focused tests, and require the exact final head to pass typecheck, the full test suite, and the production build. Backend PRs also require genuine Supabase verification and fresh-database proofs. User-facing PRs require exact-head phone review where appropriate.

## PR 1 — Canonical documentation

Purpose:

- Add this product contract and roadmap.
- Link it from the root project continuation instructions.
- Make the approved decisions discoverable in future chats.

Scope:

- Documentation only.
- No runtime or scoring change.

## PR 2 — Versioned official score contract

Purpose:

- Define one typed normalized 0–100 official result contract before changing daily rotation.

Scope:

- Add versioned score/result interfaces.
- Add adapters for existing Find the Leader, Wavelength, and Blind Resume native scores.
- Preserve native result display.
- Define tolerance and rounding contracts for later Blind Rank and Keep/Cut graders without yet changing those games.
- Add focused contract tests.
- Do not launch multi-game daily behavior.

## PR 3 — Wavelength catalog, calibration, and privacy

Purpose:

- Make Wavelength deep enough and consistent enough for official daily use.

Scope:

- Establish one canonical versioned clue catalog owner.
- Expand toward at least 250 calibrated items, preferably 300.
- Apply the approved rubric and independent-review process.
- Remove, rewrite, or quarantine disputed items.
- Add recent item/category/clue protection.
- Establish the private official target and clue-reveal boundary.
- Preserve casual and challenge replay behavior.
- Add catalog-quality, distribution, privacy, and deterministic-round tests.

This PR may require Codex or another isolated implementation task because Cody should not receive the completed hidden answer key.

## PR 4 — Expanded Play fighter pool and rating owner

Purpose:

- Add the low-end and middle-tier UFC depth needed by Blind Rank and Keep/Cut without polluting the main GOAT rankings.

Scope:

- Expand the Play-only fighter pool toward 150–200 total eligible fighters.
- Add reviewed internal career/category rating or tier evidence for non-ranked Play fighters.
- Preserve canonical ranking ownership for the ranked 80.
- Add identity, duplicate, UFC-only, category-coverage, and distribution tests.
- Do not yet change the Blind Rank or Keep/Cut gameplay algorithms.

## PR 5 — Blind Rank difficulty and official grading

Purpose:

- Make Blind Rank genuinely dangerous and produce a fair official score.

Scope:

- Replace the predictable staircase with approved versioned lineup shapes.
- Increase below-average and bad-fighter pressure.
- Use the expanded Play pool.
- Add pairwise grading with approved tie tolerance.
- Add canonical-order and score reveal.
- Preserve exact direct challenges and casual replay.
- Add deterministic simulations proving lineup-shape and low-end distribution targets.

## PR 6 — Keep 4, Cut 4 difficulty and official grading

Purpose:

- Center the game on the fourth/fifth-place cutoff and produce a fair official score.

Scope:

- Rebuild lineup generation around clear keeps, clear cuts, and bubble fighters.
- Add versioned lineup-shape variation.
- Restrict initial daily eligibility to defensible categories.
- Add sixteen-comparison grading, top-four retention, tolerance, and result reveal.
- Preserve subjective casual categories and direct challenges.
- Add deterministic cutoff-quality and score tests.

## PR 7 — Generalized Today’s Challenge backend

Purpose:

- Replace the Find-Leader-specific official daily state with one canonical multi-game backend owner.

Scope:

- Versioned Central-time daily schedule.
- Exact daily game and setup identity.
- Content and scoring version snapshots.
- Private setup/grading evidence.
- Immutable first official attempt.
- Replay isolation.
- Generalized daily history and streak projection.
- Guarded daily leaderboard projection.
- Explicit legacy migration or compatibility projection for all existing Find the Leader history.
- No UI rotation launch yet.

This is the primary backend and migration PR and requires complete fresh-database and production-backend verification.

## PR 8 — Multi-game Today’s Challenge frontend

Purpose:

- Connect the existing Play experience to the generalized backend without adding competing game owners.

Scope:

- Dynamic Today’s Challenge hero.
- Route adapters for all five eligible daily games.
- Shared official-result presentation.
- Generalized daily history, streak, leaderboard, replay, and completion states.
- Preserve casual All Games entries and direct challenges.
- Generalize reminder eligibility from Find the Leader to the current official daily.
- Phone-test every eligible daily type and existing Find the Leader history.

The rotation remains feature-gated or pinned during this PR until exact-head product review is complete.

## PR 9 — Rotation launch and release proof

Purpose:

- Activate the approved twenty-day rotation safely and prove the complete release path.

Scope:

- Enable the 40/25/15/10/10 deterministic schedule.
- Enforce no consecutive same-game days.
- Confirm official first-attempt persistence across every game type.
- Confirm tied leaderboard ranks and no time tiebreaker.
- Confirm streak and reminder behavior.
- Confirm no historical Find the Leader regression.
- Confirm official hidden evidence is absent from browser payloads.
- Deploy the exact final head through canonical GitHub Actions owners.
- Verify the exact live deployment SHA and production behavior.

This should be a narrow activation and proof PR, not another feature-building PR.

# Completion definition

The roadmap is complete only when all of the following are true in production:

- Today’s Challenge rotates among the five approved games at the documented weights.
- No game appears on consecutive days.
- Every daily returns a fair 0–100 official score.
- Official first attempts are immutable and cross-device.
- Replays remain available but unofficial.
- Daily leaderboards work for every eligible game.
- Streaks and reminders follow the current daily rather than Find the Leader specifically.
- Existing Find the Leader history is preserved exactly.
- Wavelength has a large, calibrated, private answer bank.
- Blind Rank regularly creates difficult low-end, clustered, and chaotic boards.
- Keep/Cut centers difficulty around the four/four cutoff.
- Better Than remains subjective and unscored.
- Auction remains a separate private strategic challenge.
- Exact production deployment evidence matches the intended final commit.

# Explicit non-goals

- Do not add Auction or Better Than to Today’s Challenge.
- Do not add Play-only fighters to the GOAT rankings solely to support games.
- Do not manually alter canonical GOAT ranks or OVRs.
- Do not create a second daily scheduler, history store, leaderboard repository, reminder owner, or grading path.
- Do not expose private official answers merely to simplify the frontend.
- Do not rewrite historical results when content or rating versions change.
- Do not combine all eight remaining implementation phases into one giant PR.
