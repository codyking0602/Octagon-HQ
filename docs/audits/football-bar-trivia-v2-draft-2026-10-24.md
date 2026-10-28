# Football Bar Trivia v2 — draft editorial rebuild (October 24, 2026)

**Source:** Football Bar Trivia V2 curation integrated into PR #2123, using the latest approved v22 Daily calendar. **Release gate:** validate the exact integration head and production activation before considering the update live.

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

The approved v22 Football Daily rotation has 3 Bar Trivia dates per 28 days, alternating NFL/CFB. October 25, 2026–April 24, 2027 inclusive covers 10 NFL and 9 CFB appearances, or 190 distinct questions in total. The v3 deterministic publisher replays future lineups from the September 29 launch seed with 184 days of same-league history instead of retaining only three appearances. Question ID and manually curated semantic fact-family keys are both excluded when a fresh candidate is available; historical official stored setups and results remain unchanged. The dedicated December 7 Cowboys–Seahawks board is still honored, with a redundant Thanksgiving question replaced.

This is a **time-window** exclusion rather than a global permanent no-reuse lock: outside the window, prior content may recur. The generator retains its original graceful fallback if a category/round truly runs out. A 182-day deterministic proof test must pass before merge.

## Verification caveats and exact next checks

The 55 NFL/CFB rewritten questions now carry individual claim-specific source URLs, unique source IDs, and 2026-10-25 verification dates, documented directly alongside each replacement in `barTriviaFootballRewritesV2.ts`. These references span official NFL/team coverage, college athletic departments, the College Football Playoff, Heisman Trust, and supporting historical reference records. All 20 newly authored Last Call questions also carry article-level citations. Some surviving *preexisting* evergreen questions still retain generic source metadata, so this source audit **does not certify every historical question in the original bank**. Independent source reviews should continue for those legacy rows.

- Confirm season-vs-calendar-year wording, Super Bowl participant/opponent references, all championship claims, and school affiliations.
- Check 4 distractors per replacement, including whether a plausible option could also be defensible.
- Check the new source URLs resolve to fact-specific pages; generic league landing pages should not count.
- Test exact PR head: TypeScript, Bar Trivia editorial tests, canonical daily runtime, and 182-day no-repeat schedule; compare to current main before requesting merge.
- Preserve the UFC Bar Trivia V3 curation integrated in PR #2123, including strict recent exclusion, while retaining Football fact-key exclusions and already published content.

## Known limitation

Manual fact-family clustering protects identified same-event and reverse-answer variants, not every possible semantic similarity across other games. Do not equate this with a complete cross-game plagiarism/semantic certification. It does not query actual historical Supabase published boards; the replay is a deterministic candidate generator based on the present bank.

## Per-question reference progress

All **20 newly authored Last Call facts** retain their 2026-10-24 references. All **55 replacement facts** now include per-row source URLs and 2026-10-25 verification markers, independently checked against the stated NFL/college historical records. This provenance gate is covered by `barTriviaFootballSixMonth.test.ts`; broader legacy-bank editorial quality remains a separate ongoing limitation.
