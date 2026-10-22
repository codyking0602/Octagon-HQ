# NFL / CFB / UFC — vetted October 2026 current-event replenishment

Draft staging, **not merged**. Base `fa719561e3fbbc751996cb03b462c3e5e9b052dd`; complementary to audit #2028 (editorial cuts) and #2030 (recency exclusion). 

## Scope and source decisions

The original bank has 35 dated questions, but as of October 22 only 7 have unexpired eligibility: NFL 1, CFB 2, UFC 4. The separate audit #2028 recommends retiring 2 niche UFC questions, so this change adds only **8** independently source-verified, high-recognition stories, not bulk filler.

| Sport | New questions | Context | Difficulty |
| --- | ---: | --- | --- |
| NFL | 3 | Caleb Williams' return against Atlanta; Houston/Jacksonville London finish; Steelers' comeback at Tampa Bay | 1 easy, 2 medium |
| CFB | 3 | Auburn upsetting No. 1 Georgia; BYU beating No. 2 Notre Dame; Florida's road upset of Texas | 1 easy, 2 medium |
| UFC | 2 | Mike Malott knocking out Joaquin Buckley; Jasmine Jasudavicius beating Erin Blanchfield | 1 easy, 1 medium |
| Total | **8** | No niche prelim fighters, throwaway dates or fabricated events | |

Source anchors are recorded with each row: NFL.com October 21 Week 6 awards and NFL Week 6 official recap, Buccaneers team Week 6 report, NCAA.com October 18 Week 7 recap, UFC.com official October 17 Edmonton results and scorecard. All were checked October 22 against the named winners and scores, with distractors chosen for meaningful plausibility. The UFC official event page certifies both outcomes independently of preview stories.

The questions are eligible from October 22, 2026 until November 12, 2026, then expire automatically. This date span is intentionally limited, not a new evergreen or automatic live-news feed. The existing engine's current-event cap and evergreen fallback stay unchanged, and its source URLs/verified metadata are preserved.

## Deliberately not included

- Exact fight seconds, crowd counts, lesser-known Dana White Contender Series fighters, and deep current-event trivia nobody at a sports bar could reasonably know.
- Any other current event whose official score was not independently confirmed.
- Duplicate questions about a single UFC Edmonton main event asking both winner and finishing move; one question per significant bout.

## Verification and publication

The eight questions are kept in a focused source file `barTriviaCurrentEventsOct22.ts` and imported into the existing canonical question bank. Tests confirm unique IDs and answers, plausible unmentioned distractors, source and eligibility windows, and playable ten-question seeded boards across NFL/CFB/UFC.

No previously published server-owned Daily lineup or leaderboard record is rewritten. Before merging this PR with #2028/#2030, rebase the heads onto the latest `main`, resolve any possible cross-branch collisions, run full exact-head CI, and obtain owner approval. The staged questions should not be advertised as “continuously pulled live” news; replenishment remains editorial.
