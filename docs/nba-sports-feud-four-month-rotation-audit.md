# NBA Sports Feud: four-month Daily-only no-repeat rotation + Round 4 editorial audit

## Correct product scope
NBA Sports Feud is a **Daily Challenge only**. There is no public or owner Casual variant. The owner-only preview remains a non-scoring playback harness until NBA Daily publishing is connected; the rest of the approved game, hosts, animations, timers, scoring, and editorial bank are unchanged.

**Bank:** 65 Main + 105 Fast before Round 4; +6 Main and +25 Fast = **71 Main + 130 Fast = 201**. Quality-first stopped short of a forced 225/250 quota.

**Daily selection contract:** five Feud appearances/month × four months = 20 official Daily Feud slots. Each appearance publishes one immutable shared pack (2 Main + 5 Fast); all players receive exactly the same pack for that appearance. The 20 successive appearances consume 40 distinct Main and 100 distinct Fast prompts, leaving 31 Main and 30 Fast spare. After 20 appearances the next cycle can use previously selected content. This is **not** a per-player Casual history; Daily previews/replays of the same appearance deliberately show the identical pack.

`buildNbaSportsFeudDailyPack(appearanceIndex)` enforces this guarantee using deterministic cycle-seeded exclusions. The **appearanceIndex is the zero-based count of published NBA Sports Feud Daily appearances**, not the calendar-day number and not a user's play count. A future NBA Daily publisher must derive that index from its approved schedule and pass it to the pack builder. NBA Daily has not yet been publicly published; do not infer a cadence, date, or server-authoritative score from the owner preview.

The deployed Casual-only reservation from migration 202612310320 is retired in migration 202612310321: both authenticated RPC privileges revoked, no client code path, historical owner-preview rows retained rather than deleted. No per-player storage is needed for Daily content selection.

## Editorial outcome
No additional franchise-alumni fillers or year-guessing puzzles. Fast Money is immediate and recognizable; Main Round allows NBA championships, NCAA champions, international stars, rivalry teams, *The Last Dance*, and iconic player looks. Ranked answers reflect editorial fan recognition, **not real survey results**. Each board retains eight ranked answers and broad defensible off-board variants with fan-language aliases.

Rejected candidates included obscure year/roster facts, repetitive school and superstar-team prompts, specialist numerical thresholds, unbounded jersey puzzles, tenuous celebrity claims and niche technical coaching jargon.

## Verification
- 71 Main, 130 Fast; eight ranked canonical answers plus audited extra answers
- 20,000 baseline complete seven-question bank simulations
- Eight independent consecutive 20-appearance Daily windows: 40 distinct Main and 100 distinct Fast per cycle, zero repeats
- Seven distinct semantic lanes per appearance, deterministic cross-user same-slot selection
- No Casual CTA, no Casual client reservation or API privileges
- PR-head full Validate V2 before merge; production delivery after merge

## Main Round: six editorial boards

| Question | Eight ranked answers (editorial recognition order) | Explicit extra answers |
|---|---|---:|
| Name a famous NBA player who represented a country other than the United States in international basketball. | 1. Nikola Jokic; 2. Luka Doncic; 3. Giannis Antetokounmpo; 4. Victor Wembanyama; 5. Dirk Nowitzki; 6. Pau Gasol; 7. Manu Ginobili; 8. Yao Ming | 24 |
| Name an NBA player who also won the NCAA men's basketball national championship. | 1. Michael Jordan; 2. Magic Johnson; 3. Kareem Abdul-Jabbar; 4. Carmelo Anthony; 5. Anthony Davis; 6. Kemba Walker; 7. Jalen Brunson; 8. Bill Russell | 15 |
| Name an NBA player who won at least three NBA championships. | 1. Michael Jordan; 2. LeBron James; 3. Kobe Bryant; 4. Stephen Curry; 5. Shaquille O'Neal; 6. Tim Duncan; 7. Magic Johnson; 8. Larry Bird | 24 |
| Name two NBA teams with a famous rivalry. | 1. Los Angeles Lakers and Boston Celtics; 2. Chicago Bulls and Detroit Pistons; 3. Golden State Warriors and Cleveland Cavaliers; 4. New York Knicks and Indiana Pacers; 5. New York Knicks and Miami Heat; 6. Dallas Mavericks and San Antonio Spurs; 7. Boston Celtics and Miami Heat; 8. Los Angeles Lakers and Los Angeles Clippers | 11 |
| Name an NBA player featured in The Last Dance documentary. | 1. Michael Jordan; 2. Scottie Pippen; 3. Dennis Rodman; 4. Kobe Bryant; 5. Magic Johnson; 6. Larry Bird; 7. Charles Barkley; 8. Patrick Ewing | 14 |
| Name an NBA player famous for a distinctive hairstyle or beard. | 1. Dennis Rodman; 2. James Harden; 3. Allen Iverson; 4. Ben Wallace; 5. Steven Adams; 6. Jimmy Butler; 7. Jarrett Allen; 8. Ja Morant | 14 |

## Fast Money: 13 sample editorial boards

| Question | Eight ranked answers (editorial recognition order) | Explicit extra answers |
|---|---|---:|
| Name a kind of pass an NBA player might throw. | 1. Bounce pass; 2. Chest pass; 3. No-look pass; 4. Overhead pass; 5. Behind-the-back pass; 6. Alley-oop pass; 7. Outlet pass; 8. Lob pass | 12 |
| Name something an NBA player might put in a gym bag. | 1. Basketball shoes; 2. Jersey; 3. Water bottle; 4. Towel; 5. Headphones; 6. Socks; 7. Phone; 8. Shorts | 12 |
| Name something NBA fans might chant during a game. | 1. Defense; 2. MVP; 3. Let's go team; 4. Airball; 5. Ref you suck; 6. Beat LA; 7. Three; 8. We want more | 6 |
| Name a reason an NBA player might miss a game. | 1. Injury; 2. Illness; 3. Suspension; 4. Rest; 5. Personal reasons; 6. Concussion; 7. Family emergency; 8. Travel issue | 12 |
| Name something an NBA player might do after hitting a big shot. | 1. Raise arms; 2. High-five teammates; 3. Flex; 4. Yell; 5. Fist pump; 6. Point to crowd; 7. Dance; 8. Chest bump | 11 |
| Name an offensive basketball play an NBA team might run. | 1. Pick-and-roll; 2. Fast break; 3. Isolation; 4. Post-up; 5. Alley-oop; 6. Give-and-go; 7. Backdoor cut; 8. Drive-and-kick | 8 |
| Name something NBA players might do on a road trip. | 1. Fly on team plane; 2. Stay in a hotel; 3. Eat together; 4. Practice; 5. Watch film; 6. Sleep; 7. Play video games; 8. Travel by bus | 10 |
| Name something an NBA coach might watch for during game-film review. | 1. Bad defense; 2. Turnovers; 3. Missed shots; 4. Pick-and-roll coverage; 5. Opposing star; 6. Rebounding; 7. Ball movement; 8. Matchups | 10 |
| Name a way NBA fans can follow games without being in the arena. | 1. Watch on TV; 2. Stream the game; 3. Check live scores; 4. Watch highlights; 5. Follow social media; 6. Listen on radio; 7. Use the NBA app; 8. Read sports news | 8 |
| Name something a retired NBA player might do for a career. | 1. Coach; 2. TV analyst; 3. Start a business; 4. General manager; 5. Own a team; 6. Podcast; 7. Invest; 8. Charity work | 10 |
| Name something an NBA rookie might have to adjust to. | 1. Faster game speed; 2. Long season; 3. Travel; 4. Veteran players; 5. Media attention; 6. Learning playbook; 7. Pressure; 8. New teammates | 10 |
| Name something you might find at an NBA watch party. | 1. TV; 2. Pizza; 3. Friends; 4. Team jerseys; 5. Drinks; 6. Cheering fans; 7. Snacks; 8. Team decorations | 10 |
| Name something NBA players might do after the final buzzer. | 1. Shake hands; 2. Hug teammates; 3. Talk to reporters; 4. Head to locker room; 5. Celebrate a win; 6. High-five opponents; 7. Shower; 8. Cool down | 10 |

The complete set of 25 new Fast Money boards and extra aliases is in `src/features/nba/nbaSportsFeudExpansionRound4Fast.ts` and `nbaSportsFeudExpansionRound4Aliases.ts`.

## Factual references

- NBA championship history: https://www.nba.com/news/history-nba-champions
- International representation: https://www.nba.com/news/nba-vs-world-players-feature-all-star-2023
- NCAA Division I men's championships: https://www.ncaa.com/history/basketball-men/d1
- NBA historical events and The Last Dance interview context: https://www.nba.com/news/the-last-dance-documentary

