# NBA Average Fan — editorial audit (October 22, 2026)

Status: owner-only NBA Casual and local date-seeded Daily-style preview. **Game mechanics, fans, visual design, and official Daily publication are unchanged.**

## Quality result

- Final bank: **121 vetted evergreen questions** — Grade 2: **33**, Grade 3: **36**, Grade 4: **22**, Grade 5: **20**, protected Final: **10**.
- Compared all 240 locked NBA Millionaire questions, NBA Sports Feud prompt families (including its expansion rounds), and relevant NBA Who Am I identity scripts. Removed **36** existing or drafted factual collisions and thematic repeats rather than adding filler.
- Added **48** verified editorial candidates, covering memorable NBA moments, distinctive franchise history, player identities, and actual basketball rules/strategy. Net growth: **12 questions** from the 109-question baseline.
- Regraded **14** questions to match what an informed but nonexpert fan can reasonably know. Very basic rules now belong in Grades 2–3; more specialist tactical knowledge belongs in Grades 4–5. No artificial quantity quota.
- Ten protected Finals favor recognizable landmark moments and nameable anchors, not yet another straight MVP/draft/championship-winner recall from Millionaire.
- Added **26 NBA-authority source overrides** for historic events in addition to the existing NBA.com historical and Official NBA rulebook references. Correct answers, distractors and short-answer aliases are checked by the NBA question validator. Long multiple-choice answer text is capped by regression test at 45 characters.
- Automated guards compare normalized prompts and same-answer high-confidence wording against NBA Millionaire and identical prompts against Sports Feud. Editorially reviewed additional overlap with Who Am I (script clues) and Sports Feud nickname/era answers. No automatic text comparison can prove that all conceptual overlap has been eliminated; editorial review remains required for every future addition.

## Calibrated difficulty examples

- **2nd:** four 12-minute NBA quarters; an offensive rebound statistic; an NBA bubble city; what the All-Star Dunk Contest is
- **3rd:** Kobe's 81-point game; a pick-and-roll; what a putback is; the Charlotte-era name of Larry Johnson was removed because the identity is already used elsewhere
- **4th:** What a stretch five does; famous Pacers playoff moment; basketball's weak side; a named franchise's prior city
- **5th:** Drop and ICE pick-and-roll coverage; the year the NBA first introduced a three-point line; John Paxson's title-clinching shot; landmark upsets
- **Final:** Craig Ehlo on Michael Jordan's 1989 winner; Kobe-to-Shaq 2000 alley-oop; Kawhi's 2019 Game 7 winner; Damian Lillard's 2014 winner; LeBron's 2016 chasedown block; Tracy McGrady's 13 points in 35 seconds

## Locked boundaries

- Do not change gameplay, scoring, lifelines, fan report-card balance, selection architecture, studio images, stages or transition timing.
- NBA remains owner-only. No session tracking, official Daily publishing, public leaderboards, or automatic current-event feed added.
- No NBA Millionaire, Sports Feud, Who Am I, UFC or Football bank is changed.
- Question quality is the gate. Retire or move a poor/ambiguous question rather than preserving quota, and consult authoritative NBA source pages before adding a fact.
