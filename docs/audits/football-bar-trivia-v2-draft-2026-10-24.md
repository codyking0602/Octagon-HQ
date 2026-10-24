# Football Bar Trivia v2 — draft editorial rebuild (October 24, 2026)

**Source:** `main` 70a33643c2063902722356a478d21b60326f8b48. **State: draft PR only. Do not merge without owner review, fact verification, and green exact-head CI.**

## Proposed future-selectable inventory

| Sport | Authored prior to v2 | Prior archived exclusions | New v2 exclusions | Replaced facts | New Last Call | Future selectable |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| NFL | 262 | 24 | 32 | 26 | 8 | 214 |
| CFB | 262 | 24 | 39 | 29 | 12 | 211 |

The 55 rewritten rows replace original prompts/answers/distractors **only in generated future runs**, preserving IDs and historical stored Daily snapshots. Another 71 weak or overlapping authored rows are excluded from future selection, not deleted. Newly authored Last Call facts have unique IDs.

## Editorial direction

- KEEP existing recognizable championships, rivalries, awards, legendary player moments and compelling football history unless they conflict with exact historical facts.
- REWRITE 26 NFL / 29 CFB questions away from stadium-identification fillers, reversed team trivia and arbitrary broadcast year/administrative trivia, using new independent historical anchors.
- RETIRE 32 NFL / 39 CFB additional repetitive, unsatisfying and hard-to-justify questions. Do not restore these merely to hit a round quota.
- Strengthen Last Call with 8 NFL and 12 CFB iconic plays, postseason moments and memorable college football accomplishments.

## Six-month rotation

The weighted Football Daily schedule has 3 Bar Trivia dates per 27 days, alternating NFL/CFB. October 24, 2026–April 23, 2027 inclusive has 10 appearances per league, or 100 questions each (90 NFL normal bank + 10 special themed). The v3 deterministic publisher replays future lineups from the September 29 launch seed with 184 days of same-league history instead of retaining only three appearances. Question ID and manually curated semantic fact-family keys are both excluded when a fresh candidate is available; historical official stored setups and results remain unchanged. The dedicated December 7 Cowboys–Seahawks board is still honored, with a redundant Thanksgiving question replaced.

This is a **time-window** exclusion rather than a global permanent no-reuse lock: outside the window, prior content may recur. The generator retains its original graceful fallback if a category/round truly runs out. A 182-day deterministic proof test must pass before merge.

## Verification caveats and exact next checks

This draft is a content proposal, **not yet a complete independent historical source certification**. Many surviving prior evergreen questions have only generic `sourceId` without a direct fact-specific source URL. The 55 proposed replacement facts and 20 new Last Call facts are intentionally marked as needing source verification rather than attributing them to an unsupported official article. Attach independent primary-source article URLs and mark verified dates only after actually reading the supporting material. A passing four-choice test does not certify the historical truth or ambiguity of each answer.

- Confirm season-vs-calendar-year wording, Super Bowl participant/opponent references, all championship claims, and school affiliations.
- Check 4 distractors per replacement, including whether a plausible option could also be defensible.
- Check the new source URLs resolve to fact-specific pages; generic league landing pages should not count.
- Test exact PR head: TypeScript, Bar Trivia editorial tests, canonical daily runtime, and 182-day no-repeat schedule; compare to current main before requesting merge.
- Keep all work off main until explicitly authorized. NBA and UFC Bar Trivia are intentionally unchanged apart from the shared optional fact-key support.

## Known limitation

Manual fact-family clustering protects identified same-event and reverse-answer variants, not every possible semantic similarity across other games. Do not equate this with a complete cross-game plagiarism/semantic certification. It does not query actual historical Supabase published boards; the replay is a deterministic candidate generator based on the present bank.

## Per-question reference progress

A first batch of **10** newly authored Last Call facts has been cross-checked against relevant NFL.com or ESPN articles and linked directly in the bank, with the 2026-10-24 review date. The other additions and rewrites retain explicit source-verification status; they must not be treated as fully certified or merged solely because structural CI is green.
