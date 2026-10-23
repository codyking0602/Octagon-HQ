# NBA Sports Feud: four-month guaranteed no-repeat rotation + Round 4 editorial audit

## Scope / release contract

**Baseline:** 65 Main + 105 Fast = 170 live. **New:** +6 Main and +25 Fast = **71 Main + 130 Fast = 201**. Do not inflate toward 225–250 at the cost of borderline questions. Gameplay, stages, timers, scoring, hosts, animations, Daily mode, Football/UFC, and other NBA games remain unchanged.

Five complete Casual games each month × four months = **20 games = 40 distinct Main and 100 distinct Fast Money boards**. The new bank has **31 spare Main and 30 spare Fast** after those 20 games.

Casual play reserves a complete two-Main/five-Fast pack to the logged-in player **before the first question is shown**. Reservation is atomic, account-scoped, and cross-device, using authenticated Supabase RPC and a row lock. Exiting midway counts as consuming the questions. Two simultaneously opened sessions cannot reserve the same board: the second rereads and tries again. The server will not permit clearing history until 20 reservations have occurred, and the client refuses to start with repeated questions before that floor. After that, a new cycle begins **only if no legal unseen pack remains**. Failed storage calls refuse to start a new casual board, rather than silently serving duplicates.

**Daily preview** still uses its original explicit date seed, does **not** touch the per-player rotation table and does not submit a score. Owner preview still does not submit Daily/leaderboard scores.

## Editorial outcome

No additional "name a star who played for this franchise" variants. Fast Money stays obvious, quick and broad: passes, timeouts, bench, mascots, fan chants, giveaways, jersey details, injured players, media, travel, offseason, autograph items, press room, coaching, and championship rings.

Main Round emphasizes NCAA champions, historic NBA title winners, national-team identities, familiar NBA rivalries, *The Last Dance*, and recognizable personal style.

We deliberately rejected additional candidates including individual jersey numbers (uncapped answer universe), 60-point and 50-point scorer prompts (too similar to existing 70-point question), new single-season Finals rosters, additional Duke/Kentucky-style school lists, extra franchise-alumni prompts, national-team roster year puzzles, coach technical jargon, historical ABA-player trivia, media-personality claims without an objective basis, and obscure All-Star weekend side events.

Ranking order is a recognition-first editorial judgment **not a survey result**. All new boards have eight ranked canonical answers and off-board valid answers; alias handling includes common player spellings, team-rivalry reversal, passage terms, slang, chant normalization, and short fan responses. Existing graded off-board scores untouched.

## Required checks

- Exact total: 71 Main, 130 Fast, 201.
- All 201 question prompts and identities unique; eight distinct ranked answers and non-conflicting aliases.
- 20,000 ordinary seven-question pack seeds (existing audit) plus 100 independent players × 20 repeat-free Casual games (new regression).
- The new automated test checks semantic lanes within **all 2,000 complete seven-question games**.
- New SQL security contract: authentication, user-scoped access, row locking, atomic reserve, locked reset before 20 games.
- Exact-head full Validate V2 (typecheck, production build, eight complete test shards, provider and phone verification) before merge; production verification afterward.

## Main Round: six editorial boards

| Question | Eight ranked answers (editorial recognition order) | Explicit extra answers |
|---|---|---:|
| Name a famous NBA player who represented a country other than the United States in international basketball. | 1. Nikola Jokic; 2. Luka Doncic; 3. Giannis Antetokounmpo; 4. Victor Wembanyama; 5. Dirk Nowitzki; 6. Pau Gasol; 7. Manu Ginobili; 8. Yao Ming | 25 |
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
| Name a reason an NBA player might miss a game. | 1. Ankle injury; 2. Knee injury; 3. Illness; 4. Suspension; 5. Rest; 6. Personal reasons; 7. Back injury; 8. Concussion | 11 |
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

