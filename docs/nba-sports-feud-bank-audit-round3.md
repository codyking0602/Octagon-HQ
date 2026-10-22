# NBA Sports Feud — Editorial Round 3 (review-only)

**Branch only. No merge or production deployment without “Go live.”**

## Result and editorial judgment

| Bank | Starting | Newly retained | Proposed total |
|---|---:|---:|---:|
| Main Round | 54 | +11 | 65 |
| Fast Money | 78 | +27 | 105 |
| **Total** | **132** | **+38** | **170** |

This is **not a 200-question quota**. The current mainstream NBA bank has already captured many obvious player/team/award prompts. A quality-first pass yields 38 new boards (170 proposed overall). They introduce NBA 2K cover stars, Space Jam cast, teammate duos, memorable named NBA eras, trades, draft steals, courtside celebrities, NBA awards as concepts, NBA front-office alumni, and in-arena / game situation associations. The next unfiltered 30+ possibilities were substantially more repetitive or uncertain and were *not* admitted. Main has moderate challenge; Fast answers should come to mind within seconds, particularly food, fan behavior, arenas, officials, fouls, basic basketball moves, All-Star Weekend, and draft night.

**Scoring, 2 Main + 5 Fast flow, 50-second timer, animations, hosts and presentation untouched.** Same main 10/8/7/5/5/4/4/3 and Fast 8/7/6/5/4/3/2/1 ladders, same 2/1 off-board correctness. Ranks are editorial estimates **not survey data**.

## Editorial review, rejected concepts

These were explicitly reviewed and excluded rather than stretched into filler:

- 2024 Canada Olympic roster: too similar to existing three US Olympic roster prompts and 8th-ranked names become too obscure.
- All-time jersey-retirement guesses: valid universe enormous; omission would become unfair strikes.
- NBA player who wore No. 23: no defensible bound; virtually limitless correct responses.
- Number of NBA Finals appearances / top cumulative playoff statistics: specialist thresholds, not Feud-style association.
- Players with Michael Jordan in the Washington Wizards: too narrow, obscure cast.
- ABA-to-NBA veterans: great history, but beyond mainstream audience under time pressure.
- Players who won NCAA and NBA titles: attractive but historical cutoff and universe completeness difficult to guarantee.
- Players who are known to return after an injury: highly subjective and no clear acceptance line.
- Coaches who coached Michael Jordan, Kobe or Shaq: overlap and artificially narrow grouping.
- Team nicknames based on weather: cannot support eight convincing ranked answers.
- NBA jersey retired by multiple franchises: not accessible enough and subject to confusing franchise-history edge cases.
- NBA star with an expensive autograph: nearly any recognizable player; no fair strike boundary.
- NBA career players turned WNBA head coaches: too few famous candidates for eight rankings.
- Players who made a Finals buzzer-beater: fewer clear cases than eight; tying shot vs winning shot is contentious.
- Teams with devoted fan bases: every NBA franchise has defensible examples, making strike grading arbitrary.
- NBA shoe-brand endorsements: heavily overlaps existing signature-shoe board and changes with endorsements.
- Extra Fast Money prompt: NBA team mascots — eight recognizable names would be difficult for average fans.
- Extra Fast Money prompt: NBA catchphrases — countless wordings make time-limited grading too subjective.
- Extra Fast Money prompt: NBA video games — recognizability drops steeply after NBA 2K, Live, Jam and Street.
- Extra Fast Money prompt: NBA free-agency jargon — requires understanding cap mechanisms and contract language.
- Extra Fast Money prompt:NBA on-court pregame rituals — weakly documented subjective associations.
- Extra Fast Money prompt: left-handed shooters — previously rejected as unnatural recall under 50 seconds.
- Extra Fast Money prompt: player tattoos/hairstyles — arbitrary boundary over which features count.
- Extra Fast Money prompt: jersey numbers — unlimited true answers per number; no defensible ranked set.
- Extra Fast Money prompt: winner/loser predictions or reputation hot takes — not factual graded answers.

## Integrity notes and guardrails

- Each retained board includes **8 ranked canonical answers** and additional explicitly accepted answers. Extra lists are **not** automatically exhaustive for subjective prompts; continuing user-observed valid misses is appropriate.
- Duos accept surnames and reversed name order. NBA eras accept “Showtime”, “Lob City”, “Heatles”, “The Process”, and related fan shorthand. Awards accept MVP, DPOY, ROY, MIP and Finals MVP. Basic basketball associations accept everyday equivalents (“Coke” → soda, “rim” → hoop, “bounce twice” → dribble). Existing player nickname aliases remain in place.
- New guards stop duplicate lane choices for pairings, culture, fans, arena experiences, coaching, whistles/fouls, fundamental moves, and major league events; no changes to seeded random-selection implementation or daily determinism.
- Regression gate: 20,000 complete 2-Main + 5-Fast packs, distinct IDs/categories/semantic lanes, every board eventually selected, every canonical + alias token unique per question, no empty packs, and exact ranked ladders. The exact PR-head GitHub Actions outcome is authoritative.
- Cleaned erroneous or misleading candidate answers before PR: undrafted players are **not** “draft steals,” basketball possession arrows are not used by NBA rules, an NBA title winner typically does not cut down nets, the arena rim is another name for the hoop (not a second scored answer), and franchise/duo shorthand cannot count against fans as a strike.

## Factual validation references

- NBA awards and league history: https://www.nba.com/history/awards
- 2026 awards: https://www.nba.com/awards/2026
- Warner Bros original Space Jam cast imagery: https://www.spacejam.com/1996/cmp/jamcentral/photos/nba1.html
- NBA 2K cover chronology: https://www.sportingnews.com/ca/nba/news/nba-2k27-cover-victor-wembanyama-2026-video-game/f19afffba9049517a88dfcfc
- NBA historical news and draft profiles: https://www.nba.com/history
- NBA rulebook: https://official.nba.com/rulebook/

## Main Round: 11 new reviewed boards

| Prompt | Eight ranked answers (editorial recognition order) | Off-board accepted |
|---|---|---:|
| Name an NBA player who has appeared on an NBA 2K cover. | 1. Michael Jordan; 2. Kobe Bryant; 3. LeBron James; 4. Stephen Curry; 5. Shaquille O'Neal; 6. Kevin Durant; 7. Giannis Antetokounmpo; 8. Allen Iverson | 19 |
| Name an NBA player who appeared in either Space Jam movie. | 1. Michael Jordan; 2. LeBron James; 3. Charles Barkley; 4. Anthony Davis; 5. Damian Lillard; 6. Klay Thompson; 7. Patrick Ewing; 8. Larry Bird | 16 |
| Name a famous NBA teammate duo. | 1. Michael Jordan and Scottie Pippen; 2. Shaquille O'Neal and Kobe Bryant; 3. Stephen Curry and Klay Thompson; 4. LeBron James and Dwyane Wade; 5. John Stockton and Karl Malone; 6. Magic Johnson and Kareem Abdul-Jabbar; 7. Tim Duncan and Tony Parker; 8. Jayson Tatum and Jaylen Brown | 12 |
| Name an NBA star whose trade became major basketball news. | 1. Luka Doncic; 2. Anthony Davis; 3. Kevin Durant; 4. Kyrie Irving; 5. James Harden; 6. Damian Lillard; 7. Kawhi Leonard; 8. Carmelo Anthony | 17 |
| Name an NBA player widely remembered as a draft steal. | 1. Nikola Jokic; 2. Manu Ginobili; 3. Draymond Green; 4. Jimmy Butler; 5. Giannis Antetokounmpo; 6. Kawhi Leonard; 7. Isaiah Thomas; 8. Tony Parker | 15 |
| Name a famous nickname for an NBA team, duo, or era. | 1. Showtime Lakers; 2. Splash Brothers; 3. Lob City; 4. Bad Boys Pistons; 5. Big Three Heat; 6. Grit and Grind Grizzlies; 7. Run TMC; 8. Seven Seconds or Less Suns | 9 |
| Name an NBA award given to a player or coach. | 1. Most Valuable Player; 2. Finals MVP; 3. Rookie of the Year; 4. Defensive Player of the Year; 5. Sixth Man of the Year; 6. Most Improved Player; 7. Coach of the Year; 8. Clutch Player of the Year | 7 |
| Name a celebrity famous for attending NBA games courtside. | 1. Spike Lee; 2. Jack Nicholson; 3. Drake; 4. Jay-Z; 5. Kevin Hart; 6. Rihanna; 7. Snoop Dogg; 8. Beyonce | 13 |
| Name a famous NBA star Michael Jordan faced in the playoffs. | 1. Magic Johnson; 2. Larry Bird; 3. Isiah Thomas; 4. Charles Barkley; 5. Karl Malone; 6. Patrick Ewing; 7. Reggie Miller; 8. Shaquille O'Neal | 10 |
| Name a former NBA player who later worked as an NBA team executive. | 1. Jerry West; 2. Magic Johnson; 3. Michael Jordan; 4. Danny Ainge; 5. Pat Riley; 6. Joe Dumars; 7. Isiah Thomas; 8. Larry Bird | 9 |
| Name an NBA team based in a US state that has more than one NBA team. | 1. Los Angeles Lakers; 2. Los Angeles Clippers; 3. Golden State Warriors; 4. New York Knicks; 5. Brooklyn Nets; 6. Dallas Mavericks; 7. Houston Rockets; 8. San Antonio Spurs | 1 |

## Fast Money: 15 representative new boards

| Prompt | Eight ranked answers (editorial recognition order) | Off-board accepted |
|---|---|---:|
| Name something you might buy to eat or drink at an NBA game. | 1. Hot dog; 2. Popcorn; 3. Nachos; 4. Pizza; 5. Soda; 6. Beer; 7. Pretzel; 8. Water | 16 |
| Name something you would see inside an NBA arena during a game. | 1. Basketball court; 2. Fans; 3. Scoreboard; 4. Basketball hoop; 5. Players; 6. Referees; 7. Mascot; 8. Team bench | 15 |
| Name something you might hear at an NBA game. | 1. Crowd cheering; 2. Referee whistle; 3. Buzzer; 4. Music; 5. Announcer; 6. Crowd booing; 7. Fans chanting; 8. Sneakers squeaking | 10 |
| Name something a fan might wear to an NBA game. | 1. Team jersey; 2. Team T-shirt; 3. Team hat; 4. Hoodie; 5. Sneakers; 6. Team jacket; 7. Scarf; 8. Face paint | 10 |
| Name something you might see during halftime at an NBA game. | 1. Dance team; 2. Mascot; 3. Music performance; 4. Fan contest; 5. Shooting game; 6. Interview; 7. Highlights; 8. Kids playing | 10 |
| Name a job someone has at an NBA game besides being a player. | 1. Referee; 2. Coach; 3. Announcer; 4. Security guard; 5. Concession worker; 6. Camera operator; 7. Mascot performer; 8. Trainer | 13 |
| Name a kind of foul an NBA referee might call. | 1. Shooting foul; 2. Charging; 3. Blocking; 4. Reach-in foul; 5. Illegal screen; 6. Holding; 7. Technical foul; 8. Flagrant foul | 10 |
| Name a way an NBA team might turn the ball over. | 1. Bad pass; 2. Ball stolen; 3. Traveling; 4. Double dribble; 5. Stepping out of bounds; 6. Shot-clock violation; 7. Offensive foul; 8. Losing the dribble | 9 |
| Name something an NBA coach might yell during a game. | 1. Defense; 2. Timeout; 3. Rebound; 4. Switch; 5. Box out; 6. Shoot; 7. Pass the ball; 8. Hustle | 12 |
| Name a dribbling move an NBA player might use to get past a defender. | 1. Crossover; 2. Between-the-legs dribble; 3. Behind-the-back dribble; 4. Spin move; 5. Hesitation; 6. In-and-out dribble; 7. Change of pace; 8. Double crossover | 9 |
| Name something a basketball player does when playing defense. | 1. Block a shot; 2. Steal the ball; 3. Guard an opponent; 4. Contest a shot; 5. Box out; 6. Double-team; 7. Stay in front; 8. Close out | 11 |
| Name an event or activity you'd associate with NBA All-Star Weekend. | 1. All-Star Game; 2. Slam Dunk Contest; 3. Three-Point Contest; 4. Skills Challenge; 5. Rising Stars Game; 6. Celebrity Game; 7. Player introductions; 8. Fan festival | 9 |
| Name something you might see during the NBA Draft. | 1. Commissioner; 2. Team hat; 3. Player suit; 4. Handshake; 5. Draft announcement; 6. Family celebrating; 7. TV interviews; 8. Draft stage | 12 |
| Name something an NBA team might do after winning the championship. | 1. Lift the trophy; 2. Championship parade; 3. Spray champagne; 4. Wear championship hats; 5. Confetti; 6. Locker-room celebration; 7. Take team photos; 8. Give interviews | 9 |
| Name something you might see or hear during an NBA TV broadcast. | 1. Score graphic; 2. Play-by-play announcer; 3. Instant replay; 4. Shot clock graphic; 5. Player statistics; 6. Commercials; 7. Crowd shots; 8. Sideline reporter | 12 |


**All new boards remain visible in the named Round 3 source files; sample ranks are editorial ordering rather than fabricated polling.**
