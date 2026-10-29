# Football Bar Trivia — fun-first editorial completion (October 29, 2026)

**Status: DRAFT PR #2304; no main/production/backend edits. Release requires exact-head green verification and owner approval.**

## Trigger: the published October 29 NFL game

The October 29 NFL Daily at 06:00 Central was the active v3 six-month bank, **not** an old fallback. Its ten questions were factual but poorly balanced: two international firsts (France 2026 and London 2007), the near-explicit "Bills Mafia" answer, logo filler, an administrative founding-city question, and a niche kickoff-return "first" as Last Call. The valid 182-day rotation had been mistaken for quality certification.

## Completed question-pool review and disposition

Reviewed the authored NFL/CFB easy, medium, hard, and Last Call source banks, V2 replacements, round overrides, existing editorial retirements, and the present official Daily generator. Prior editorial retirements are preserved. The additional **101** future-only retirements are explicit and reason-coded in `barTriviaFootballQuality20261029.ts`:

- **NFL: 57** additional retirements: answer giveaways, uninteresting "first" footnotes, franchise/name/logo filler, media and administration trivia, weak Last Calls, and selected repeated cross-game facts.
- **CFB: 44** additional retirements: team-nickname decoding, peripheral mascot/venue minutiae, uninteresting firsts, and selected repeated cross-game facts.
- **Nine** question difficulty regrades favor recognizable football moments over administrative arcana. Seven NFL moment questions move into hard; one NFL and one CFB administrative/easy hard question move into medium.
- **Four** new individually sourced hard questions: 2018 Miami Miracle (Kenyan Drake), 2020 Hail Murray (DeAndre Hopkins), Tennessee's 2022 Alabama walk-off kick (Chase McGrath), and LSU's 2019-season title performance (Ja'Marr Chase). These are distinct, player-forward facts rather than placeholder replacements.
- Future-only remaining evergreen inventory calculated from the prior fixed NFL/CFB v3 baselines: **NFL 144** (199 - 57 + 2), **CFB 155** (197 - 44 + 2). The exact playable bank counts must still pass the executable source-of-truth tests at the final head.

**Editorial rule:** a hard question should be hard because it tests memorable football knowledge, not because it asks about obscure administrative business. Keep notable history, championships, rivalry moments, awards and recognizable player feats. Do not delete good older football just for being old.

## Lightweight cross-game check — not another certification project

Looked at currently authored Football Millionaire candidate runs and Average Fan banks plus the Bar Trivia catalogs. Retired direct/near-direct repeats such as Bills/CFB fan identity facts, Devin Hester, Wide Right, Kick Six, Max McGee and several player nicknames where they recurred. **Rejected** proposed new questions about Mecole Hardman's Super Bowl LVIII winning TD (already in Average Fan), Kadarius Toney's Super Bowl LVII punt return (in Millionaire), and Isaiah Bond's fourth-and-31 Iron Bowl catch (in Millionaire). The four accepted replacements did not show those obvious overlaps in the checked question text.

This is a pragmatic anti-rampancy screen, **not** a promise that unrelated games never refer to the same play or player. Minor incidental overlap is acceptable.

## New-question sources

- Kenyan Drake, Miami Miracle: https://www.nfl.com/news/ryan-tannehill-on-miami-miracle-pretty-amazing-0ap3000000997916
- DeAndre Hopkins, Hail Murray: https://www.nfl.com/news/cardinals-wr-deandre-hopkins-on-hail-mary-td-they-were-in-position-it-was-just-a
- Chase McGrath, Tennessee versus Alabama: https://utsports.com/sports/football/roster/chase-mcgrath/14967
- Ja'Marr Chase, LSU-Clemson national championship: https://lsusports.net/news/2020/01/13/lsu-football-national-championship-game-recap

The four source-backed replacement facts each have four distinct distractors, an explanation and verification date, and no answer wording leaked in the stem. Surviving legacy generic-source rows have **not** all been independently primary-source recertified; do not claim that they have.

## Game assembly and scoring

- Maintain **4 easy / 3 medium / 2 hard / 1 Last Call** content difficulty through first six questions, a medium ease-in at Q7 and two hard at Q8/Q9.
- Preserve all existing ten-question scoring rounds, perfect-score denominator, double-round multiplier, wager, reveals and results. A Q7 medium *content* question earns its existing Round 3 points; this avoids a global scoring redesign.
- NFL/CFB remain random from audited pools, **not scripted ten-question runs**.
- The generator uses **recent-safe soft caps** on recognizable "first" prompts (target <=2) and identity/fan-culture trivia (target <=3) only when an unused, history-fresh alternative exists. This matters because recent-repeat protection takes priority.
- UFC, NBA and MLB remain untouched. Dedicated December 7 Cowboys-Seahawks board and older published official boards are preserved.

## Exact-head verification gates

1. TypeScript + affected tests must be green at the **latest PR head**, not a prior commit. Full Validate V2/backend is a release gate when draft is made ready.
2. `barTriviaFootballSixMonth.test.ts`: simulate the 182-day canonical NFL/CFB schedule, ensure unique ID + fact-family keys and 4/3/2/1 content pacing, no repeated first/identity topics above board soft caps when eligible.
3. `barTriviaContent.test.ts`: ensure the larger easy/medium/hard/Last Call pools remain sufficient for the true 10 NFL + 9 CFB appearances. The 2026-12-07 NFL themed board is isolated.
4. Compare the immutable October 29 Supabase published game with the new future-only bank; no grading/results rewriting.
5. No merge or deploy until Cody explicitly says go live. Since other chats are changing main, refresh main and re-verify exact head at that point.

**Known limits:** a topic grouping based on prompt words/category labels cannot prove all semantic uniqueness; deterministic replay is not a byte-for-byte reconstruction of every historically published Supabase board, and scripted static checks cannot prove every player will enjoy every question. These are explicit limits, not hidden certification claims.
