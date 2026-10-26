# Upcoming themed Daily editorial — spoiler-free release checklist

This check covers only the two upcoming, **unpublished** football-themed Daily editions. It does not alter past published days, player attempts, result proofs, Daily rotation, NBA, UFC, scoring, or backend schema.

## Editorial rules
- Prefer modern, recognizable football anchors over pre-2000 trivia that only historical specialists can identify.
- Keep a recognizable opening and increase specificity and challenge by later rounds **where the game has a difficulty ladder**.
- Preserve Cowboy Bar Trivia's 3 easy + 3 medium + 3 hard + 1 Last Call structure. The most specific clue belongs in Last Call, not the first rounds. Difficulty is editorial judgement, not a measured player solve rate.
- For Longhorn Sports Feud, preserve 2 Main + 5 Fast Money prompts and eight scored examples per prompt; **do not impose an artificial escalating order** on a rapid free-response format. Prioritize familiar recent-era top answers, include broad appropriate off-board answers, retain the rivalry and Texas identity, and avoid treating modern synonymous answers as wrong.
- Ensure four distinct choices and only one correct answer per Cowboys question; no exact shared **correct answer** with the already-played October 26 themed Millionaire board. Distinct facts avoid same-question retreads.
- Add sport-specific primary URLs directly to the Bar Trivia content where that field is supported.

## Verification evidence
- Repo selectors already route Nov. 27 to the Texas-themed **Sports Feud** and Dec. 7 to the Cowboys-themed **Bar Trivia**; no production Daily setups existed for either date at the pre-edit read.
- Bar Trivia updated with question-level links to official Cowboys reports and the Pro Football Hall of Fame, using source-supported 2014–2023 highlights for harder rounds.
- Texas answer pools bounded to contemporary playing careers and notable 2005+ seasons. Cross-checked recent Texas players against the University of Texas all-time NFL draft ledger, 2024/2025 draft indexes, and official 2016, 2022 and College Football Playoff result sources.
- Existing integration tests confirm the two dates' league and game selection, full game shape, grading aliases, score-source links, and that October 26 Millionaire remains unchanged. Exact future PR head tests and production verification still must pass before release.
- These checks support reasonable modern difficulty progression; **they are not proof of 100% individual-player satisfaction or calibrated statistical difficulty**.

Source anchors (editorial only; do not display upcoming question text in release notes):
- https://www.dallascowboys.com/news/game-recap-cowboys-win-tough-battle-41-35
- https://www.dallascowboys.com/news/game-recap-cowboys-win-wild-card-game-24-22
- https://www.dallascowboys.com/news/cowboys-overcome-miscues-run-over-seattle-for-5th-win-358606
- https://www.dallascowboys.com/news/daron-bland-on-record-setting-int-wasn-t-gonna-be-denied
- https://texaslonghorns.com/sports/2013/7/21/FB_0721132335
- https://texaslonghorns.com/news/2025/4/23/football-2025-nfl-draft-index
- https://texaslonghorns.com/news/2016/9/5/football-defeats-no-10-notre-dame-50-47-in-2-ot-thriller
- https://texaslonghorns.com/news/2022/9/10/football-longhorns-edged-20-17-by-no-1-alabama

**No content previews or answers belong in the PR description, user-facing release notes, or notification text.**
