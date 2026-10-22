# NBA Sports Feud — Editorial Bank Expansion & Audit

**Status:** PR review only. **Do not merge/deploy until explicit “Go live.”**

## Scope and outcome

| Measure | Original testing bank | Proposed |
|---|---:|---:|
| Main Round | 16 | 43 |
| Fast Money | 32 | 61 |
| Total | 48 | 104 |

+27 Main and +29 Fast boards retained; fixed existing NBA historical omissions and added recognizable aliases. No gameplay/scoring/stage/CSS/hosts/other sports edited.

**Editorial triage:** 78 additional-board candidates were considered across editing passes. 22 were rejected for near-duplicate categories, inaccessible Fast Money recall, overly broad answer universes or disputed facts. The other 56 were retained (27 Main + 29 Fast); the original 48 remain as the baseline, with corrections.

**Scoring unchanged:** Main ranked ladder 10/8/7/5/5/4/4/3, Fast ranked ladder 8/7/6/5/4/3/2/1. Main off-board correct answers 2; Fast off-board correct answers 1. Rankings are **editorial predictions of recognition, not survey results.**

## Difficulty gate

**Main Round:** moderate; recent award winners, celebrated Olympic teams, recognizable NBA history, known teams and eras, family ties, mainstream skills. Eight ranked names, with defensible extras. Bounded objective universes (conferences, USA rosters, awards) checked against actual history.

**Fast Money:** general-interest concepts immediately answerable with at least one famous player/team (position, shooting/finishing style, fan-favorite franchise, NBA personalities, decade, shoe brand association). No requirement to memorize a season roster, one Finals lineup, box-score minimum or particular game. Added multiple obvious off-board alternatives for open-ended categories.

## Selection and static audits

- Preserved the same caller API, seed stability, 2 Main + 5 Fast flow, engine and points.
- Replaced cyclic selection with two independent deterministic seeded shuffles and a shared semantic collision-lane guard (same category, closely related skills, awards, era, franchise categories, college, family, etc.).
- Independent JavaScript audit of **20,000** generated packs: **20,000 distinct sequences; zero repeated categories or semantic-lane collisions; zero short packs; every authored question selected at least once.**
- All 104 full answer universes: 8 unique ranked answers, no normalized duplicate canonical names, no canonical/alias duplication identifying different players on the same question, no exact duplicate prompts.
- Regression test added for **6,000 packs**, 7-question variety, eight-answer integrity, nickname matching, objective-universe completeness and current NBA awards/championship facts. Full repository CI is authoritative; no local Git clone was available in the linked workspace.
- Broad-answer categories remain an editorial approximation: continue expanding obvious extras when player reports reveal a valid miss. Avoid claiming a survey or a provably exhaustive subjective universe.

## Official sources used to validate objective claims

- NBA championship history: https://www.nba.com/news/history-nba-champions
- Finals MVP winners through 2026: https://www.nba.com/news/history-finals-mvp-winners
- League MVP and 2026 awards: https://www.nba.com/awards/2026
- Sixth Man: https://www.nba.com/news/history-sixth-man-of-the-year-winners
- Most Improved: https://www.nba.com/news/history-most-improved-award-winners
- NBA 2026 Knicks and Jalen Brunson Finals MVP: https://www.nba.com/news/jalen-brunson-wins-bill-russell-trophy-as-2026-nba-finals-mvp
- 2026 Bam Adebayo 83-point game: https://www.nba.com/news/bam-adebayo-83-point-game
- USA 2008 roster: https://www.usab.com/history/national-team-mens/games-of-the-xxixth-olympiad-2008
- USA 2012 roster: https://www.usab.com/history/national-team-mens/games-of-the-xxxth-olympiad-2012

## Representative Main Round — 10 full ranked boards

| # | Prompt | Eight editorial ranked answers (1 → 8) | Additional valid answers |
|---:|---|---|---:|
| 1 | Name an NBA team in the Eastern Conference. | 1. Boston Celtics; 2. New York Knicks; 3. Chicago Bulls; 4. Miami Heat; 5. Milwaukee Bucks; 6. Cleveland Cavaliers; 7. Philadelphia 76ers; 8. Indiana Pacers | 7 |
| 2 | Name an NBA franchise that has never won an NBA championship. | 1. Los Angeles Clippers; 2. Phoenix Suns; 3. Minnesota Timberwolves; 4. Brooklyn Nets; 5. Orlando Magic; 6. Indiana Pacers; 7. Utah Jazz; 8. Charlotte Hornets | 2 |
| 3 | Name a team that won an NBA championship between 2010 and 2026. | 1. Los Angeles Lakers; 2. Golden State Warriors; 3. Miami Heat; 4. Boston Celtics; 5. Cleveland Cavaliers; 6. Dallas Mavericks; 7. San Antonio Spurs; 8. Milwaukee Bucks | 4 |
| 4 | Name an NBA player who won Sixth Man of the Year. | 1. Jamal Crawford; 2. Lou Williams; 3. James Harden; 4. Manu Ginobili; 5. Jason Terry; 6. Tyler Herro; 7. Naz Reid; 8. J.R. Smith | 26 |
| 5 | Name a player on the USA men's 2008 Olympic basketball team. | 1. Kobe Bryant; 2. LeBron James; 3. Dwyane Wade; 4. Carmelo Anthony; 5. Chris Paul; 6. Dwight Howard; 7. Chris Bosh; 8. Jason Kidd | 4 |
| 6 | Name a famous NBA player who played at Duke. | 1. Kyrie Irving; 2. Jayson Tatum; 3. Zion Williamson; 4. Paolo Banchero; 5. Brandon Ingram; 6. Grant Hill; 7. JJ Redick; 8. RJ Barrett | 14 |
| 7 | Name an NBA player whose father also played in the NBA. | 1. Stephen Curry; 2. Kobe Bryant; 3. Klay Thompson; 4. Jalen Brunson; 5. Bronny James; 6. Domantas Sabonis; 7. Gary Payton II; 8. Austin Rivers | 14 |
| 8 | Name an NBA player famous for scoring in the low post. | 1. Shaquille O'Neal; 2. Hakeem Olajuwon; 3. Tim Duncan; 4. Kareem Abdul-Jabbar; 5. Nikola Jokic; 6. Joel Embiid; 7. Kevin McHale; 8. Charles Barkley | 12 |
| 9 | Name a famous NBA player who went undrafted. | 1. Fred VanVleet; 2. Ben Wallace; 3. Austin Reaves; 4. Alex Caruso; 5. Udonis Haslem; 6. Jeremy Lin; 7. Duncan Robinson; 8. John Starks | 12 |
| 10 | Name a famous retired NBA star who never won an NBA championship. | 1. Charles Barkley; 2. Allen Iverson; 3. Steve Nash; 4. Karl Malone; 5. John Stockton; 6. Patrick Ewing; 7. Reggie Miller; 8. Carmelo Anthony | 13 |

## Representative Fast Money — 15 full ranked boards

| # | Prompt | Eight editorial ranked answers (1 → 8) | Additional valid answers |
|---:|---|---|---:|
| 1 | Name a famous NBA shooting guard. | 1. Michael Jordan; 2. Kobe Bryant; 3. Dwyane Wade; 4. James Harden; 5. Allen Iverson; 6. Devin Booker; 7. Klay Thompson; 8. Anthony Edwards | 13 |
| 2 | Name a famous NBA small forward. | 1. LeBron James; 2. Kevin Durant; 3. Larry Bird; 4. Kawhi Leonard; 5. Jayson Tatum; 6. Scottie Pippen; 7. Jimmy Butler; 8. Carmelo Anthony | 11 |
| 3 | Name an NBA player known for triple-doubles. | 1. Russell Westbrook; 2. Nikola Jokic; 3. LeBron James; 4. Luka Doncic; 5. Oscar Robertson; 6. Magic Johnson; 7. James Harden; 8. Domantas Sabonis | 9 |
| 4 | Name an NBA player famous for rebounding. | 1. Dennis Rodman; 2. Wilt Chamberlain; 3. Shaquille O'Neal; 4. Bill Russell; 5. Dwight Howard; 6. Nikola Jokic; 7. Tim Duncan; 8. Charles Barkley | 10 |
| 5 | Name an NBA player famous for blocking shots. | 1. Victor Wembanyama; 2. Shaquille O'Neal; 3. Dikembe Mutombo; 4. Dwight Howard; 5. Hakeem Olajuwon; 6. Rudy Gobert; 7. Anthony Davis; 8. Chet Holmgren | 10 |
| 6 | Name an NBA player known for hustle and effort. | 1. Dennis Rodman; 2. Draymond Green; 3. Josh Hart; 4. Marcus Smart; 5. Alex Caruso; 6. Jimmy Butler; 7. Jrue Holiday; 8. Patrick Beverley | 8 |
| 7 | Name an NBA player famous for being exceptionally tall. | 1. Victor Wembanyama; 2. Yao Ming; 3. Shaquille O'Neal; 4. Manute Bol; 5. Boban Marjanovic; 6. Tacko Fall; 7. Shawn Bradley; 8. Gheorghe Muresan | 8 |
| 8 | Name an NBA player who has had a signature basketball shoe. | 1. Michael Jordan; 2. LeBron James; 3. Kobe Bryant; 4. Stephen Curry; 5. Kevin Durant; 6. Kyrie Irving; 7. Giannis Antetokounmpo; 8. James Harden | 15 |
| 9 | Name a famous NBA star from the 2020s. | 1. LeBron James; 2. Stephen Curry; 3. Nikola Jokic; 4. Giannis Antetokounmpo; 5. Luka Doncic; 6. Victor Wembanyama; 7. Jayson Tatum; 8. Shai Gilgeous-Alexander | 13 |
| 10 | Name a famous NBA star born outside the United States. | 1. Giannis Antetokounmpo; 2. Nikola Jokic; 3. Luka Doncic; 4. Dirk Nowitzki; 5. Victor Wembanyama; 6. Joel Embiid; 7. Yao Ming; 8. Steve Nash | 26 |
| 11 | Name a famous former NBA player who became a basketball TV analyst. | 1. Charles Barkley; 2. Shaquille O'Neal; 3. Kenny Smith; 4. Reggie Miller; 5. Richard Jefferson; 6. Kendrick Perkins; 7. Grant Hill; 8. Vince Carter | 11 |
| 12 | Name a famous NBA player who played for the Brooklyn Nets. | 1. Kevin Durant; 2. Kyrie Irving; 3. James Harden; 4. Jason Kidd; 5. Vince Carter; 6. Brook Lopez; 7. Mikal Bridges; 8. Deron Williams | 12 |
| 13 | Name a famous NBA player who played for the Minnesota Timberwolves. | 1. Kevin Garnett; 2. Anthony Edwards; 3. Karl-Anthony Towns; 4. Jimmy Butler; 5. Rudy Gobert; 6. Kevin Love; 7. Andrew Wiggins; 8. Zach LaVine | 10 |
| 14 | Name an NBA player famous for making free throws. | 1. Stephen Curry; 2. Kevin Durant; 3. Dirk Nowitzki; 4. Steve Nash; 5. Damian Lillard; 6. Ray Allen; 7. Reggie Miller; 8. Chris Paul | 10 |
| 15 | Name an NBA player famous for making tough layups. | 1. Kyrie Irving; 2. LeBron James; 3. Stephen Curry; 4. Derrick Rose; 5. Ja Morant; 6. Dwyane Wade; 7. Michael Jordan; 8. Tony Parker | 9 |

*The additional accepted answer counts represent explicitly authored off-board correct answers, not the ranked eight, and all retain established off-board points. Every board can be viewed in source by ID. Users do not see this editorial ranking statement in place of the approved game.*
