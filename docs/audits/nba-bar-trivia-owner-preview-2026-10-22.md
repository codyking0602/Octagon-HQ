# NBA Bar Trivia — owner preview editorial review (October 22, 2026)

## Scope and safety

NBA Bar Trivia is a **Daily-only** game. This draft PR adds an owner-gated, browser-only preview at `/nba/bar-trivia?mode=daily`; there is **no NBA Casual entry, official Daily publication, Daily result write, championship score or leaderboard submission**. The existing NFL/CFB/UFC/MLB game loop remains unchanged. NBA reuses its answer/reveal, scoring, Double Round, streak, Last Call, results and mobile UI.

The NBA-specific selection exception eliminates the existing shared selector's **easy question in the first Round 2 slot**. All three NBA Round 2 questions are moderate.

## Surviving question inventory

| Difficulty | Surviving | Needed for 20 official Daily appearances | Shortfall |
|---|---:|---:|---:|
| Round 1 — accessible | 34 | 60 | 26 |
| Round 2 — moderate | 33 | 60 | 27 |
| Round 3 — difficult | 35 | 60 | 25 |
| Last Call | 16 | 20 | 4 |
| **Total** | **118** | **200** | **82** |

The minimum actual full no-repeat capacity is **11 ten-question Daily appearances**. The deterministic appearance index shares a board across users; the same index preserves the same answers and Double Round for replay. Cycles then restart with independently seeded order. These counts are honest quality floors, not launch targets. **Do not enable official Daily scheduling at this point.**

## Representative retained examples (answer in parentheses)

- **Round 1:** Before moving to Sacramento, in which city did the Kings play? (Kansas City). Which team is associated with the Grit and Grind era? (Memphis Grizzlies). Which NBA team has a famous victory bell? (Philadelphia 76ers).
- **Round 2:** Which franchise traded Pau Gasol to the Lakers in 2008? (Memphis Grizzlies). Who led San Antonio alongside Tim Duncan and Tony Parker? (Manu Ginóbili). Which coach guided the 1994 and 1995 Houston championship teams? (Rudy Tomjanovich).
- **Round 3:** Which New York captain unexpectedly appeared in Game 7 of the 1970 Finals despite injury? (Willis Reed). Who hit the Lakers' famous 2000 West finals lob to Shaquille O'Neal? (Not retained due overlap — *see exclusions below*). Which Bulls guard's missed-shot struggle defined 1994 Finals Game 7? (John Starks).
- **Last Call:** Who scored 36 points and made 19 assists in the 1970 Finals closeout? (Walt Frazier). Which Lakers reserve made the deciding late free throws in Game 7 of the 2010 Finals? (Sasha Vujačić).

## Rejection criteria and representative cuts

Authored source rows are reviewed before inclusion. Two stages of editorial retirement cover **116 unique exclusions** after initial row-format screening; malformed input rows are discarded before source files were written. Exact prompt uniqueness alone is insufficient: we compared meaning and answers with NBA Average Fan, NBA Millionaire, and Sports Feud, and screened known NBA historical anchors.

Examples:
- **Exact cross-game facts:** Vancouver Grizzlies-to-Memphis; Rochester Royals-to-Sacramento; Minneapolis Lakers-to-Los Angeles; Fort Wayne Pistons-to-Detroit; Kobe drafted by Charlotte; Steve Kerr's 1997 Finals clincher; Ray Allen's 2013 Finals three; Reggie Miller's 8 points in 9 seconds; the 2002 Robert Horry Kings buzzer-beater; the 2019 Kawhi playoff buzzer-beater; the ABA-NBA 1976 merger.
- **Repeated NBA rules vocabulary:** standard shot clock, rebound, assist, stretch-five, putback, closeout, DNP, and double-dribble facts covered in Average Fan.
- **Within-bank overlap:** Larry Bird's 1987 Detroit inbound steal; Robert Horry's 2005 Finals three; the 1969 losing-team Finals MVP; the 1987 baby skyhook; Warriors' We Believe run.
- **Unreliable/factually wrong source drafts removed before inclusion:** a supposed 2013 Spurs shooter rather than Ray Allen; a 57-point Dominique Wilkins 1988 playoff claim (actual game 47); a 2010 Paul Pierce playoff 50-point claim; a Jerry West–era/quarter mismatch; 1977 Finals MVP incorrectly characterized as a guard.

## Remaining gates

- Automated bank validity, strict NBA difficulty, 11-board uniqueness, deterministic repeatability, and owner write isolation are covered by dedicated tests.
- Individual source URLs currently point to official NBA history/index material, **not always a specific article verifying each fact**. Full per-row primary-source evidence, wider Who Am I/Find Leader/Higher-Lower equivalence review, and owner difficulty review are still necessary before official Daily launch.
- Do not assert 20-appearance coverage, comprehensive semantic deduplication, or production-playable owner preview yet.
