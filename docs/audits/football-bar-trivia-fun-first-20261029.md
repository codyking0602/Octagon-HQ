# Football Bar Trivia — focused quality pass (October 29, 2026)

**Status: DRAFT PR, owner review / exact-head verification pending. No changes to main or production.**

## Why this pass exists

The October 29 NFL Daily published at 06:00 Central from the six-month v3 bank, not an old fallback.
The board included (1) an international first in France, (3) "Bills Mafia" with the
answer telegraphed in the question, (5) the obscure 2007 London game and (8) the
league founding city. The rotation was technically valid but not an enjoyable,
well-balanced football trivia experience. Passing unique-ID and historic-fact checks
is **not** editorial approval.

## Focused changes

- Future selection excludes **43 weak NFL/CFB facts**: 25 NFL, 18 CFB.
  The exclusions group partial-answer giveaways, repetitive/low-interest firsts,
  administrative minutiae, over-simple nickname decoding, and obscure details.
  The original authored records, earlier results and persisted published Daily
  setups are not modified.
- Give NFL/CFB runs **4 easy / 3 medium / 2 hard / 1 Last Call** content pacing.
  Question 4 stays the established easy Round 2 ease-in; Question 7 becomes a
  medium Round 3 ease-in. The **existing round/point/streak/wager calculations
  remain unchanged**, including the Round 3 point value for Question 7.
  UFC, NBA and MLB are not changed.
- Avoid more than **two prompts explicitly containing "first"** in a normal
  generated NFL/CFB Daily. This is deliberately narrow; it is not a blanket
  semantic theorem and doesn't assert all similar topics are deduplicated.
- Retain six-month no-repeat fact keys and the canonical current-event feed.
  Do **not** invent replacement inventory merely to replenish a number.

## Lightweight cross-game duplicate standard for future replacements

When a replacement is genuinely needed, check the distinctive player/event/fact
against the selectable Football Millionaire, Average Fan and existing Bar Trivia
question sources (and other obvious game matches if found). Reject clear near-duplicates;
do not require a multi-day semantic certification of the whole app.
Check a primary NFL, NCAA, team or conference source for the proposed answer,
season/school/team context, and four distractors. Rare incidental overlaps are
acceptable; rampant identical trivia across games is not.

No new authored facts are introduced in this particular pass, so there are no
replacement-specific duplicate or external fact claims to certify.

## Verification before release

1. Full exact-PR-head TypeScript/build, Vitest, backend and Daily publication checks green.
2. `barTriviaFootballSixMonth.test.ts`: 182-day NFL/CFB replay, unique ID/fact keys,
   4/3/2/1 content difficulty, no more than two explicit "first" prompts.
3. Count and category-floor tests confirm removing weak questions leaves adequate
   round-level supply; do not restore weak entries merely to satisfy an old quota.
4. Compare the ten October 29 published questions to the immutable historical
   setup; prior attempts, scores and reveals remain unchanged.
5. Check future generated boards for fresh topic variety. If replay exposes a
   genuinely insufficient pool, introduce a *small* batch of individually sourced,
   recognizable replacements and run the lightweight cross-game check.

**Known limitation:** exact phrase-based firsts protection does not recognize every
possible paraphrase, and algorithmic tests cannot certify entertainment value.
Do not claim comprehensive fact verification or full editorial certification from
these tests alone.
